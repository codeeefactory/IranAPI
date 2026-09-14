import importlib
import base64
import hashlib
import socket
import zipfile
from datetime import timedelta
from io import BytesIO, StringIO
from tempfile import TemporaryDirectory
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.test import APIClient, APISimpleTestCase

from .apps import ApiConfig
from . import mongo
from .caller import (
    CallerResult,
    CallerUpstreamError,
    prepare_provider_request,
    prepare_public_request,
    resolve_public_addresses,
)
from .models import API, Category, PricingPlan
from .mongo import reset_database
from .repositories import MongoRepository, format_decimal, normalize_tags
from .project_analysis import ProjectArchiveError, analyze_project_archive
from .project_deployer import _generated_dockerfile, process_next_deployment
from .project_templates import build_project_files, normalize_language
from .security import redact_secrets
from .seed import seed_sample_data
from .serializers import mask_secret, serialize_profile


def project_zip(files: dict[str, str], name: str = "project.zip") -> SimpleUploadedFile:
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path, content in files.items():
            archive.writestr(path, content)
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="application/zip")


class _FakeCollection:
    def __init__(self):
        self.index_calls = []

    def create_index(self, *args, **kwargs):
        self.index_calls.append((args, kwargs))


class _NonBooleanDatabase:
    def __init__(self):
        self.collections = {}

    def __bool__(self):
        raise NotImplementedError("Database objects do not implement truth value testing.")

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = _FakeCollection()
        return self.collections[name]


class MongoIndexTests(SimpleTestCase):
    def test_ensure_indexes_accepts_explicit_database_object(self):
        fake_database = _NonBooleanDatabase()

        mongo._indexed_databases.clear()
        with patch("api.mongo.get_client") as mock_get_client:
            mongo.ensure_indexes(fake_database)

        mock_get_client.assert_not_called()
        self.assertTrue(fake_database["users"].index_calls)


class DocumentPersistenceTests(TestCase):
    def setUp(self):
        reset_database()

    def tearDown(self):
        mongo.close_database()

    def test_documents_survive_database_reopen(self):
        database = mongo.get_database()
        now = timezone.now()
        database["apis"].insert_one({"_id": 41, "slug": "durable-api", "created_at": now})

        mongo.close_database()
        persisted = mongo.get_database()["apis"].find_one({"slug": "durable-api"})

        self.assertEqual(persisted["_id"], 41)
        expected = now.replace(microsecond=(now.microsecond // 1000) * 1000)
        self.assertEqual(persisted["created_at"], expected)

    def test_counter_survives_reopen_and_explicit_ids(self):
        database = mongo.get_database()
        database["apis"].insert_one({"_id": 8, "slug": "existing-api"})

        mongo.close_database()

        self.assertEqual(mongo.next_id("apis"), 9)


class AppConfigTests(SimpleTestCase):
    @override_settings(AUTO_SEED_SAMPLE_DATA=True)
    def test_ready_skips_sample_seed_during_management_checks(self):
        config = ApiConfig("api", importlib.import_module("api"))

        with patch("api.apps.sys.argv", ["manage.py", "check"]):
            with patch("api.seed.seed_sample_data") as mock_seed_sample_data:
                config.ready()

        mock_seed_sample_data.assert_not_called()


class SecurityRedactionTests(SimpleTestCase):
    def test_redacts_sensitive_keys_and_inline_tokens(self):
        payload = {
            "password": "StrongPass123!",
            "nested": {"api_key": "iapi_0123456789abcdef0123456789abcdef01234567"},
            "message": "Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456",
        }

        redacted = redact_secrets(payload)

        self.assertNotIn("StrongPass123!", str(redacted))
        self.assertNotIn("iapi_0123456789abcdef0123456789abcdef01234567", str(redacted))
        self.assertNotIn("abcdefghijklmnopqrstuvwxyz123456", str(redacted))

    def test_redacts_derived_api_key_material(self):
        payload = {
            "api_key_hash": "pbkdf2_sha256$secret-hash",
            "api_key_fingerprint": "a" * 64,
            "password_confirm": "StrongPass123!",
        }

        redacted = redact_secrets(payload)

        self.assertEqual(set(redacted.values()), {"[REDACTED]"})


class CallerSecurityTests(SimpleTestCase):
    def test_prepare_public_request_accepts_external_url_headers_query_and_body(self):
        prepared = prepare_public_request(
            url="https://api.example.com:8443/v1/items?existing=yes",
            method="POST",
            headers={"Authorization": "Bearer user-supplied", "X-Api-Key": "secret"},
            query={"page": 2},
            body={"name": "sample"},
        )

        self.assertEqual(prepared.scheme, "https")
        self.assertEqual(prepared.hostname, "api.example.com")
        self.assertEqual(prepared.port, 8443)
        self.assertEqual(prepared.target, "/v1/items?existing=yes&page=2")
        self.assertEqual(prepared.headers["Host"], "api.example.com:8443")
        self.assertEqual(prepared.headers["Authorization"], "Bearer user-supplied")
        self.assertEqual(prepared.body, b'{"name":"sample"}')

    def test_prepare_public_request_rejects_hop_by_hop_and_host_headers(self):
        for header in ("Host", "Connection", "Transfer-Encoding", "Cookie"):
            with self.subTest(header=header):
                with self.assertRaises(DRFValidationError):
                    prepare_public_request(
                        url="https://api.example.com/v1/items",
                        method="GET",
                        headers={header: "unsafe"},
                    )

    def test_prepare_request_injects_server_credential_and_keeps_destination_fixed(self):
        config = {
            "base_url": "https://api.neshan.org",
            "hostname": "api.neshan.org",
            "credential_env": "NESHAN_SERVICE_KEY",
            "auth": {"type": "header", "name": "Api-Key"},
            "body_encoding": "json",
        }
        endpoint = {"method": "GET", "path": "/v3/search"}

        with patch.dict("os.environ", {"NESHAN_SERVICE_KEY": "server-only-secret"}, clear=False):
            prepared = prepare_provider_request(
                config=config,
                endpoint=endpoint,
                method="GET",
                query={"term": "Tehran", "lat": 35.7, "lng": 51.4},
            )

        self.assertEqual(prepared.hostname, "api.neshan.org")
        self.assertEqual(prepared.target, "/v3/search?term=Tehran&lat=35.7&lng=51.4")
        self.assertEqual(prepared.headers["Api-Key"], "server-only-secret")
        self.assertNotIn("server-only-secret", prepared.target)

    def test_dns_resolution_rejects_private_network_addresses(self):
        private_answer = [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", 443))]

        with patch("api.caller.socket.getaddrinfo", return_value=private_answer):
            with self.assertRaises(CallerUpstreamError):
                resolve_public_addresses("api.neshan.org", 443)

    def test_dns_resolution_retries_transient_failure(self):
        public_answer = [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("8.8.8.8", 443))]

        with patch("api.caller.time.sleep") as mock_sleep, patch(
            "api.caller.socket.getaddrinfo",
            side_effect=[socket.gaierror("temporary"), public_answer],
        ) as mock_getaddrinfo:
            resolved = resolve_public_addresses("api.example.com", 443)

        self.assertEqual(resolved, [(socket.AF_INET, ("8.8.8.8", 443))])
        self.assertEqual(mock_getaddrinfo.call_count, 2)
        mock_sleep.assert_called_once_with(0.1)

    def test_request_rejects_method_not_registered_for_endpoint(self):
        config = {
            "base_url": "https://api.neshan.org",
            "hostname": "api.neshan.org",
            "credential_env": "NESHAN_SERVICE_KEY",
            "auth": {"type": "header", "name": "Api-Key"},
        }

        with patch.dict("os.environ", {"NESHAN_SERVICE_KEY": "server-only-secret"}, clear=False):
            with self.assertRaises(DRFValidationError):
                prepare_provider_request(
                    config=config,
                    endpoint={"method": "GET", "path": "/v3/search"},
                    method="POST",
                )


class HealthCheckTests(APISimpleTestCase):
    @patch("api.views.ping_database", return_value=True)
    def test_health_reports_mongodb_up(self, _ping):
        response = self.client.get("/api/v1/system/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["database"], "up")

    @patch("api.views.ping_database", return_value=False)
    def test_health_returns_503_when_mongodb_ping_fails(self, _ping):
        response = self.client.get("/api/v1/system/health/")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["status"], "unavailable")

    @patch("api.views.ping_database", side_effect=RuntimeError("connection details"))
    def test_health_returns_sanitized_503_when_mongodb_raises(self, _ping):
        response = self.client.get("/api/v1/system/health/")

        self.assertEqual(response.status_code, 503)
        self.assertNotIn("connection details", str(response.data))


class LiveMongoAdminTests(TestCase):
    def setUp(self):
        reset_database()
        self.superuser = User.objects.create_superuser(
            username="root-admin",
            email="admin@example.com",
            password="StrongPass123!",
        )
        self.client.force_login(self.superuser)

    def test_superuser_can_view_and_edit_live_collection(self):
        mongo.get_database()["categories"].insert_one({"_id": 11, "name": "Payments", "slug": "payments"})

        index_response = self.client.get("/admin/api/livedataconsole/")
        update_response = self.client.post(
            "/admin/api/livedataconsole/categories/11/change/",
            {
                "name": "Fintech",
                "name_en": "Fintech",
                "slug": "fintech",
                "description": "Payment services",
                "icon": "credit-card",
                "color": "#16a34a",
            },
        )
        stored = mongo.get_database()["categories"].find_one({"_id": 11})

        self.assertEqual(index_response.status_code, 200)
        self.assertEqual(update_response.status_code, 302)
        self.assertEqual(stored["name"], "Fintech")
        self.assertEqual(stored["color"], "#16a34a")
        self.assertEqual(stored["_id"], 11)

    def test_superuser_can_add_api_with_friendly_fields_and_category_choice(self):
        mongo.get_database()["categories"].insert_one({"_id": 11, "name": "Payments", "slug": "payments"})

        form_response = self.client.get("/admin/api/livedataconsole/apis/add/")
        create_response = self.client.post(
            "/admin/api/livedataconsole/apis/add/",
            {
                "name": "Example Pay",
                "name_en": "Example Pay",
                "description": "Payment API",
                "short_description": "Payments",
                "category_id": "11",
                "base_url": "https://api.example.com",
                "status": "active",
                "publication_status": "published",
                "public_auth_scheme": "api_key",
                "canonical_version": "v1",
                "tags": "payments\niran",
                "is_featured": "on",
            },
        )
        stored = mongo.get_database()["apis"].find_one({"slug": "example-pay"})

        self.assertEqual(form_response.status_code, 200)
        self.assertContains(form_response, "Example Pay", count=0)
        self.assertContains(form_response, "Payments [#11]")
        self.assertNotContains(form_response, 'name="document"')
        self.assertEqual(create_response.status_code, 302)
        self.assertEqual(stored["category_id"], 11)
        self.assertEqual(stored["tags"], ["payments", "iran"])
        self.assertTrue(stored["is_featured"])

    def test_endpoint_form_syncs_api_slug_and_parses_nested_json(self):
        mongo.get_database()["apis"].insert_one(
            {"_id": 22, "name": "Weather", "name_en": "Weather", "slug": "weather", "status": "active"}
        )

        response = self.client.post(
            "/admin/api/livedataconsole/api_endpoints/add/",
            {
                "api_id": "22",
                "method": "GET",
                "path": "/forecast/{city}",
                "name": "Forecast",
                "summary": "City forecast",
                "group": "Weather",
                "request_schema": '{"type":"object"}',
                "response_schema": "{}",
                "sample_request": '{"path":{"city":"Tehran"}}',
                "sample_response": '{"temperature":24}',
                "requires_auth": "on",
                "is_active": "on",
                "order": "1",
            },
        )
        stored = mongo.get_database()["api_endpoints"].find_one({"api_slug": "weather"})

        self.assertEqual(response.status_code, 302)
        self.assertEqual(stored["api_id"], 22)
        self.assertEqual(stored["path"], "/forecast/{city}")
        self.assertEqual(stored["sample_response"], {"temperature": 24})

    def test_every_editable_collection_has_typed_add_form(self):
        editable = {
            "categories",
            "apis",
            "pricing_plans",
            "subscription_plans",
            "documentations",
            "api_endpoints",
            "access_grants",
            "user_subscriptions",
            "subscription_checkouts",
            "organizations",
            "studio_flows",
            "api_projects",
        }

        for collection in editable:
            with self.subTest(collection=collection):
                response = self.client.get(f"/admin/api/livedataconsole/{collection}/add/")
                self.assertEqual(response.status_code, 200)
                self.assertNotContains(response, 'name="document"')
                self.assertContains(response, '<form method="post"', html=False)

    def test_every_live_collection_is_a_native_admin_section(self):
        sections = {
            "categoriessection": "categories",
            "apissection": "apis",
            "pricingplanssection": "pricing_plans",
            "subscriptionplanssection": "subscription_plans",
            "documentationssection": "documentations",
            "apiendpointssection": "api_endpoints",
            "accessgrantssection": "access_grants",
            "usersubscriptionssection": "user_subscriptions",
            "subscriptioncheckoutssection": "subscription_checkouts",
            "organizationssection": "organizations",
            "studioflowssection": "studio_flows",
            "apiprojectssection": "api_projects",
            "apiusagesection": "api_usage",
        }

        admin_home = self.client.get("/admin/")
        live_dashboard = self.client.get("/admin/api/livedataconsole/")

        for model_name, collection in sections.items():
            with self.subTest(collection=collection):
                list_url = f"/admin/api/{model_name}/"
                self.assertContains(admin_home, list_url)
                self.assertContains(live_dashboard, list_url)
                self.assertEqual(self.client.get(list_url).status_code, 200)

                add_response = self.client.get(f"{list_url}add/")
                expected_status = 404 if collection == "api_usage" else 200
                self.assertEqual(add_response.status_code, expected_status)

    def test_native_category_section_can_add_and_edit_document(self):
        create_response = self.client.post(
            "/admin/api/categoriessection/add/",
            {
                "name": "Payments",
                "name_en": "Payments",
                "slug": "payments",
                "description": "Payment services",
                "icon": "credit-card",
                "color": "#16a34a",
            },
        )
        stored = mongo.get_database()["categories"].find_one({"slug": "payments"})

        self.assertEqual(create_response.status_code, 302)
        self.assertRedirects(
            create_response,
            f"/admin/api/categoriessection/{stored['_id']}/change/",
            fetch_redirect_response=False,
        )

        update_response = self.client.post(
            f"/admin/api/categoriessection/{stored['_id']}/change/",
            {
                "name": "Fintech",
                "name_en": "Fintech",
                "slug": "fintech",
                "description": "Financial services",
                "icon": "landmark",
                "color": "#22c55e",
            },
        )

        self.assertEqual(update_response.status_code, 302)
        self.assertEqual(
            mongo.get_database()["categories"].find_one({"_id": stored["_id"]})["name"],
            "Fintech",
        )

    def test_read_only_collection_cannot_be_added_or_deleted(self):
        mongo.get_database()["api_usage"].insert_one({"_id": 12, "request_count": 1})

        add_response = self.client.get("/admin/api/livedataconsole/api_usage/add/")
        delete_response = self.client.post("/admin/api/livedataconsole/api_usage/12/delete/")

        self.assertEqual(add_response.status_code, 404)
        self.assertEqual(delete_response.status_code, 404)
        self.assertIsNotNone(mongo.get_database()["api_usage"].find_one({"_id": 12}))

    def test_staff_non_superuser_cannot_open_live_collection(self):
        staff = User.objects.create_user("staff", password="StrongPass123!", is_staff=True)
        self.client.force_login(staff)

        response = self.client.get("/admin/api/livedataconsole/categories/")

        self.assertEqual(response.status_code, 403)


class DeveloperAdminPermissionTests(TestCase):
    def setUp(self):
        reset_database()
        self.repository = MongoRepository()
        self.password = "StrongPass123!"
        self.developer = self.repository.create_user(
            username="api-developer",
            password=self.password,
            email="developer@example.com",
            account_type="api_developer",
        )
        self.other_developer = self.repository.create_user(
            username="other-developer",
            password=self.password,
            email="other@example.com",
            account_type="api_developer",
        )
        self.category = self.repository.build_category_document({"name": "Developer APIs", "name_en": "Developer APIs"})
        self.repository.categories.insert_one(self.category)
        self.own_api = self.repository.build_api_document(
            {
                "name": "Owned Weather",
                "name_en": "Owned Weather",
                "description": "Owned API",
                "base_url": "https://weather.example.com",
                "category_id": int(self.category["_id"]),
                "created_by_user_id": int(self.developer["_id"]),
                "created_by_username": self.developer["username"],
            }
        )
        self.other_api = self.repository.build_api_document(
            {
                "name": "Other Payments",
                "name_en": "Other Payments",
                "description": "Other API",
                "base_url": "https://payments.example.com",
                "category_id": int(self.category["_id"]),
                "created_by_user_id": int(self.other_developer["_id"]),
                "created_by_username": self.other_developer["username"],
            }
        )
        self.repository.apis.insert_many([self.own_api, self.other_api])
        self.assertTrue(self.client.login(username=self.developer["username"], password=self.password))

    def tearDown(self):
        mongo.close_database()

    def api_form_data(self, *, name="Developer Search"):
        return {
            "name": name,
            "name_en": name,
            "slug": "developer-search",
            "description": "Search API managed by its developer.",
            "short_description": "Developer search",
            "category_id": str(self.category["_id"]),
            "base_url": "https://search.example.com",
            "status": "active",
            "publication_status": "draft",
            "public_auth_scheme": "api_key",
            "canonical_version": "v1",
        }

    def test_developer_sees_only_owned_api_sections_and_documents(self):
        api_list = self.client.get("/admin/api/apissection/")
        category_list = self.client.get("/admin/api/categoriessection/")
        other_change = self.client.get(f"/admin/api/apissection/{self.other_api['_id']}/change/")

        self.assertEqual(api_list.status_code, 200)
        self.assertContains(api_list, "Owned Weather")
        self.assertNotContains(api_list, "Other Payments")
        self.assertEqual(category_list.status_code, 403)
        self.assertEqual(other_change.status_code, 403)

    def test_developer_can_create_edit_and_delete_only_owned_api(self):
        create = self.client.post("/admin/api/apissection/add/", self.api_form_data())
        created = self.repository.apis.find_one({"slug": "developer-search"})

        self.assertEqual(create.status_code, 302)
        self.assertEqual(created["created_by_user_id"], int(self.developer["_id"]))
        self.assertEqual(created["created_by_username"], self.developer["username"])

        update = self.client.post(
            f"/admin/api/apissection/{created['_id']}/change/",
            self.api_form_data(name="Developer Search Updated"),
        )
        self.assertEqual(update.status_code, 302)
        self.assertEqual(self.repository.apis.find_one({"_id": created["_id"]})["name"], "Developer Search Updated")

        delete = self.client.post(f"/admin/api/apissection/{created['_id']}/delete/")
        self.assertEqual(delete.status_code, 302)
        self.assertIsNone(self.repository.apis.find_one({"_id": created["_id"]}))

    def test_developer_endpoint_form_accepts_only_owned_api(self):
        endpoint_payload = {
            "api_id": str(self.own_api["_id"]),
            "method": "GET",
            "path": "/forecast",
            "name": "Forecast",
            "summary": "Forecast endpoint",
            "group": "Weather",
            "request_schema": "{}",
            "response_schema": "{}",
            "sample_request": "{}",
            "sample_response": '{"ok": true}',
            "requires_auth": "on",
            "is_active": "on",
            "order": "0",
        }
        own_create = self.client.post("/admin/api/apiendpointssection/add/", endpoint_payload)
        foreign_create = self.client.post(
            "/admin/api/apiendpointssection/add/",
            {**endpoint_payload, "api_id": str(self.other_api["_id"]), "path": "/forbidden"},
        )

        self.assertEqual(own_create.status_code, 302)
        self.assertEqual(foreign_create.status_code, 200)
        self.assertIsNotNone(self.repository.api_endpoints.find_one({"api_id": int(self.own_api["_id"])}))
        self.assertIsNone(self.repository.api_endpoints.find_one({"path": "/forbidden"}))


class SerializationUtilityTests(SimpleTestCase):
    def test_mask_secret_handles_empty_short_and_long_values(self):
        self.assertIsNone(mask_secret(None))
        self.assertEqual(mask_secret("short"), "*****")
        self.assertEqual(mask_secret("iapi_0123456789abcdef"), "iapi_0...cdef")

    def test_serialize_profile_prefers_api_key_preview_and_never_raw_secret(self):
        user_doc = {
            "_id": 7,
            "username": "demo",
            "email": "demo@example.com",
            "profile": {
                "phone": "",
                "company": "IranAPI",
                "bio": "",
                "avatar": None,
                "api_key": "iapi_0123456789abcdef",
                "api_key_hash": "pbkdf2_sha256$hash",
                "api_key_preview": "iapi_0...cdef",
            },
        }

        serialized = serialize_profile(user_doc)

        self.assertEqual(serialized["api_key"], "iapi_0...cdef")
        self.assertTrue(serialized["has_api_key"])
        self.assertNotIn("0123456789abcdef", str(serialized))


class RepositoryUtilityTests(SimpleTestCase):
    def test_normalize_tags_trims_deduplicates_and_preserves_display_text(self):
        display_tags, normalized_tags = normalize_tags([" Speech ", "speech", "", "Text", "TEXT "])

        self.assertEqual(display_tags, ["Speech", "Text"])
        self.assertEqual(normalized_tags, ["speech", "text"])

    def test_format_decimal_rounds_half_up_for_money_strings(self):
        self.assertEqual(format_decimal("12.345"), "12.35")
        self.assertEqual(format_decimal(None), "0.00")


class ModelFieldTests(TestCase):
    def test_unicode_slug_generation_keeps_persian_names_unique(self):
        first = Category.objects.create(name="پرداخت")
        second = Category.objects.create(name="پرداخت")

        self.assertEqual(first.slug, "پرداخت")
        self.assertEqual(second.slug, "پرداخت-2")
        first.full_clean()

    def test_category_color_requires_full_hex_value(self):
        category = Category(name="Payments", color="green")

        with self.assertRaises(ValidationError):
            category.full_clean()

    def test_api_rating_must_stay_in_range(self):
        api = API(name="Gateway", description="Payment API", base_url="https://api.example.com", rating=6)

        with self.assertRaises(ValidationError):
            api.full_clean()

    def test_pricing_request_limits_cannot_be_negative(self):
        api = API.objects.create(name="Gateway", description="Payment API", base_url="https://api.example.com")
        plan = PricingPlan(api=api, name="Starter", requests_per_day=-1)

        with self.assertRaises(ValidationError):
            plan.full_clean()

    def test_pricing_price_and_currency_are_validated(self):
        api = API.objects.create(name="Gateway", description="Payment API", base_url="https://api.example.com")
        negative_price = PricingPlan(api=api, name="Starter", price=-1)
        bad_currency = PricingPlan(api=api, name="Starter", currency="irr")

        with self.assertRaises(ValidationError):
            negative_price.full_clean()
        with self.assertRaises(ValidationError):
            bad_currency.full_clean()


class InstalledAppsTests(SimpleTestCase):
    def test_admin_theme_apps_keep_required_order_and_unique_entries(self):
        apps = list(settings.INSTALLED_APPS)

        self.assertEqual(len(apps), len(set(apps)))
        self.assertIn("whitenoise.runserver_nostatic", apps)
        self.assertIn("rest_framework.authtoken", apps)
        self.assertIn("IranAPIBackend.apps.MongoAdminConfig", apps)
        self.assertLess(apps.index("jazzmin"), apps.index("IranAPIBackend.apps.MongoAdminConfig"))


class SecurityConfigurationTests(SimpleTestCase):
    def test_browser_security_headers_and_cookie_defaults_are_enabled(self):
        self.assertIn("api.middleware.SecurityHeadersMiddleware", settings.MIDDLEWARE)
        self.assertEqual(settings.X_FRAME_OPTIONS, "DENY")
        self.assertTrue(settings.SECURE_CONTENT_TYPE_NOSNIFF)
        self.assertTrue(settings.SESSION_COOKIE_HTTPONLY)
        self.assertEqual(settings.SESSION_COOKIE_SAMESITE, "Lax")
        self.assertEqual(settings.CSRF_COOKIE_SAMESITE, "Lax")
        self.assertIn("script-src 'self'", settings.CONTENT_SECURITY_POLICY)
        self.assertIn("frame-ancestors 'none'", settings.CONTENT_SECURITY_POLICY)

    def test_nginx_disables_legacy_tls_and_version_tokens(self):
        config = (settings.BASE_DIR / "api-hub-express" / "nginx.conf").read_text(encoding="utf-8")

        self.assertIn("ssl_protocols TLSv1.2 TLSv1.3;", config)
        self.assertIn("server_tokens off;", config)
        self.assertIn("Content-Security-Policy", config)
        self.assertIn("X-Content-Type-Options", config)
        self.assertIn("location ~ ^/api/", config)
        self.assertIn("proxy_set_header Host $http_host;", config)
        self.assertIn("proxy_hide_header Content-Security-Policy;", config)
        self.assertNotIn("location /api/ {", config)


class ProjectArchiveAnalysisTests(SimpleTestCase):
    def test_generates_deployable_starters_for_requested_languages(self):
        expected_entrypoints = {
            "java": "src/main/java/dev/iranapi/IranApiApplication.java",
            "javascript": "server.js",
            "typescript": "src/server.ts",
            "python": "main.py",
            "cpp": "src/main.cpp",
            "csharp": "Program.cs",
        }
        for language, entrypoint in expected_entrypoints.items():
            with self.subTest(language=language):
                files = build_project_files(
                    {
                        "language": language,
                        "package_name": "demo-api",
                        "base_url": "https://example.com/v1",
                        "include_docker": True,
                    }
                )
                paths = {item["path"] for item in files}
                self.assertIn(entrypoint, paths)
                self.assertIn("Dockerfile", paths)
        self.assertEqual(normalize_language("js"), "javascript")
        self.assertEqual(normalize_language("ts"), "typescript")
        self.assertEqual(normalize_language("c++"), "cpp")

    def test_detects_all_managed_languages_and_routes(self):
        projects = {
            "java": {
                "pom.xml": "<artifactId>demo</artifactId>",
                "src/DemoApplication.java": '@GetMapping("/health") public String health() { return "ok"; }',
            },
            "javascript": {
                "package.json": '{"dependencies":{"express":"latest"}}',
                "server.js": 'const app = require("express")(); app.get("/health", () => {});',
            },
            "typescript": {
                "package.json": '{"dependencies":{"express":"latest"}}',
                "tsconfig.json": "{}",
                "src/server.ts": 'app.post("/jobs", () => {});',
            },
            "python": {
                "requirements.txt": "fastapi",
                "main.py": 'from fastapi import FastAPI\napp=FastAPI()\n@app.get("/health")\ndef health(): return {}',
            },
            "cpp": {
                "CMakeLists.txt": "project(demo)",
                "main.cpp": 'CROW_ROUTE(app, "/health")([]{});',
            },
            "csharp": {
                "Demo.csproj": '<Project Sdk="Microsoft.NET.Sdk.Web" />',
                "Program.cs": 'app.MapGet("/health", () => "ok");',
            },
        }

        for expected, files in projects.items():
            with self.subTest(language=expected):
                analysis = analyze_project_archive(project_zip(files))
                self.assertEqual(analysis["language"], expected)
                self.assertTrue(analysis["deployment"]["ready"])
                self.assertGreaterEqual(len(analysis["routes"]), 1)

    def test_rejects_path_traversal(self):
        archive = project_zip({"../main.py": "print('unsafe')"})
        with self.assertRaisesRegex(ProjectArchiveError, "unsafe file path"):
            analyze_project_archive(archive)

    def test_blocks_archives_with_hard_coded_credentials(self):
        archive = project_zip(
            {
                "requirements.txt": "fastapi\nuvicorn\n",
                "main.py": (
                    "from fastapi import FastAPI\n"
                    "app = FastAPI()\n"
                    "bot_token = '1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk'\n"
                ),
            }
        )

        analysis = analyze_project_archive(archive)

        self.assertFalse(analysis["deployment"]["ready"])
        self.assertEqual(analysis["security"]["secret_findings"][0]["type"], "telegram_bot_token")
        self.assertNotIn("1234567890:", str(analysis))


class ProjectDeploymentWorkerTests(SimpleTestCase):
    def test_managed_dockerfiles_cover_java_gradle_csharp_binding_and_cpp_layout(self):
        java = _generated_dockerfile({"language": "java", "deployment": {"port": 8080}})
        csharp = _generated_dockerfile({"language": "csharp", "deployment": {"port": 5090}})
        cpp = _generated_dockerfile(
            {
                "language": "cpp",
                "deployment": {"port": 8080, "start_command": "./build/server"},
            }
        )

        self.assertIn("gradle bootJar", java)
        self.assertIn("mvn -DskipTests package", java)
        self.assertIn("ENV SERVER_PORT=8080", java)
        self.assertIn("ENV ASPNETCORE_URLS=http://0.0.0.0:5090", csharp)
        self.assertIn("COPY --from=build /src/build /app/build", cpp)

    class FakeRepository:
        def __init__(self):
            self.deployment = {"_id": 44, "slug": "worker-test", "status": "building"}
            self.updated = None

        def claim_next_project_deployment(self):
            deployment, self.deployment = self.deployment, None
            return deployment

        def update_project_deployment(self, deployment_id, **fields):
            self.updated = {"_id": deployment_id, "slug": "worker-test", **fields}
            return self.updated

    def test_worker_marks_successful_docker_deployment_live(self):
        repository = self.FakeRepository()
        with patch(
            "api.project_deployer.deploy_project",
            return_value={"status": "deployed", "deployment_url": "http://localhost:49152"},
        ):
            result = process_next_deployment(repository)
        self.assertEqual(result["status"], "deployed")
        self.assertEqual(result["deployment_url"], "http://localhost:49152")

    def test_worker_records_build_failure(self):
        repository = self.FakeRepository()
        with patch("api.project_deployer.deploy_project", side_effect=RuntimeError("image build failed")):
            result = process_next_deployment(repository)
        self.assertEqual(result["status"], "failed")
        self.assertIn("image build failed", result["failure_reason"])


class MongoApiTests(APISimpleTestCase):
    databases = {"default"}

    def setUp(self):
        reset_database()
        self.repository = MongoRepository()

        self.user = self.repository.create_user(
            username="ali",
            password="StrongPass123!",
            email="ali@example.com",
            first_name="Ali",
            last_name="Rezaei",
        )
        self.other_user = self.repository.create_user(
            username="mina",
            password="StrongPass123!",
            email="mina@example.com",
            first_name="Mina",
            last_name="Karimi",
        )

        self.category = self.repository.build_category_document(
            {
                "name": "هوش مصنوعی",
                "name_en": "ai",
                "description": "AI APIs",
            }
        )
        self.repository.categories.insert_one(self.category)

        self.api = self.repository.build_api_document(
            {
                "name": "سرویس گفتار",
                "name_en": "speech-api",
                "description": "Speech service",
                "short_description": "Real-time speech APIs",
                "category_id": int(self.category["_id"]),
                "base_url": "https://example.com/speech",
                "documentation_url": "https://example.com/speech/docs",
                "logo": "https://example.com/speech.png",
                "status": "active",
                "is_featured": True,
                "is_popular": True,
                "tags": ["voice", "speech"],
                "created_by_user_id": int(self.user["_id"]),
                "created_by_username": self.user["username"],
                "publication_status": "published",
                "rapidapi_listing_url": "https://rapidapi.com/example/speech",
                "rapidapi_package_slug": "speech",
                "support_url": "https://example.com/support",
            }
        )
        self.repository.apis.insert_one(self.api)

        self.other_api = self.repository.build_api_document(
            {
                "name": "سرویس تبدیل متن",
                "name_en": "text-api",
                "description": "Text APIs",
                "short_description": "Text utilities",
                "category_id": int(self.category["_id"]),
                "base_url": "https://example.com/text",
                "logo": "https://example.com/text.png",
                "status": "active",
                "is_popular": True,
                "tags": ["speech", "text"],
            }
        )
        self.repository.apis.insert_one(self.other_api)

        self.hidden_api = self.repository.build_api_document(
            {
                "name": "پنهان",
                "name_en": "hidden-api",
                "description": "Hidden API",
                "short_description": "Hidden",
                "base_url": "https://example.com/hidden",
                "logo": "https://example.com/hidden.png",
                "status": "inactive",
            }
        )
        self.repository.apis.insert_one(self.hidden_api)

        self.plan = self.repository.build_pricing_plan_document(
            {
                "api_id": int(self.api["_id"]),
                "api_slug": self.api["slug"],
                "api_rapidapi_listing_url": self.api["rapidapi_listing_url"],
                "name": "Pro",
                "plan_type": "pro",
                "price": 490000,
                "currency": "IRR",
                "requests_per_month": 10000,
                "requests_per_day": 500,
                "features": ["Priority support"],
                "is_popular": True,
                "is_active": True,
                "rapidapi_plan_slug": "pro",
                "is_listed_on_rapidapi": True,
            }
        )
        self.repository.pricing_plans.insert_one(self.plan)

        self.documentation = self.repository.build_documentation_document(
            {
                "api_id": int(self.api["_id"]),
                "api_slug": self.api["slug"],
                "title": "شروع سریع",
                "content": "Run this API first",
                "order": 1,
                "is_active": True,
            }
        )
        self.repository.documentations.insert_one(self.documentation)

        self.endpoint = self.repository.build_endpoint_document(
            {
                "api_id": int(self.api["_id"]),
                "api_slug": self.api["slug"],
                "method": "POST",
                "path": "/speech/transcriptions",
                "name": "Create transcription",
                "summary": "Create a speech transcription.",
                "group": "Speech",
                "sample_request": {"audio_url": "https://example.com/audio.wav", "language": "fa-IR"},
                "sample_response": {"text": "سلام دنیا", "confidence": 0.98},
                "order": 1,
                "is_active": True,
            }
        )
        self.repository.api_endpoints.insert_one(self.endpoint)

        self.grant = self.repository.build_access_grant_document(
            {
                "user_id": int(self.user["_id"]),
                "api_id": int(self.api["_id"]),
                "pricing_plan_id": int(self.plan["_id"]),
                "source": "rapidapi",
                "status": "active",
                "external_subscription_id": "sub_123",
                "requests_per_day": 500,
                "requests_per_month": 10000,
                "metadata": {"tier": "pro"},
            }
        )
        self.repository.access_grants.insert_one(self.grant)

        self.usage = self.repository.build_usage_document(
            {
                "user_id": int(self.user["_id"]),
                "api_id": int(self.api["_id"]),
                "access_grant_id": int(self.grant["_id"]),
                "source": "rapidapi_sync",
                "requests_count": 240,
                "window_started_at": timezone.now(),
                "window_ended_at": timezone.now(),
            }
        )
        self.repository.api_usage.insert_one(self.usage)

        self.other_usage = self.repository.build_usage_document(
            {
                "user_id": int(self.user["_id"]),
                "api_id": int(self.other_api["_id"]),
                "source": "manual",
                "requests_count": 32,
                "window_started_at": timezone.now(),
                "window_ended_at": timezone.now(),
            }
        )
        self.repository.api_usage.insert_one(self.other_usage)

    def authenticate_with_token(self, user_document):
        token = self.repository.create_or_get_legacy_token(int(user_document["_id"]))
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def test_register_creates_session_and_profile(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "sara",
                "email": "sara@example.com",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
                "first_name": "Sara",
                "last_name": "Ahmadi",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["authenticated"])
        self.assertIsNotNone(response.data["profile"])
        self.assertIn("iranapi_session", response.cookies)
        self.assertIsNotNone(self.repository.get_user_by_username("sara"))

    def test_register_rejects_duplicate_identity_and_password_mismatch(self):
        duplicate = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "ali",
                "email": "fresh@example.com",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
            },
            format="json",
        )
        mismatch = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "fresh",
                "email": "fresh@example.com",
                "password": "StrongPass123!",
                "password_confirm": "DifferentPass123!",
            },
            format="json",
        )

        self.assertEqual(duplicate.status_code, 400)
        self.assertEqual(duplicate.data["error"]["code"], "validation_error")
        self.assertEqual(mismatch.status_code, 400)
        self.assertEqual(mismatch.data["error"]["code"], "validation_error")

    def test_session_login_and_current_user(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "ali", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["authenticated"])
        self.assertIn("iranapi_session", response.cookies)

        current = self.client.get("/api/v1/account/user/")
        self.assertEqual(current.status_code, 200)
        self.assertEqual(current.data["username"], "ali")

    def test_cli_browser_authorization_exchanges_pkce_code_once(self):
        verifier = "browser-login-verifier-0123456789-abcdefghijklmnopqrstuvwxyz"
        challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
        login = self.client.post(
            "/api/v1/auth/login/",
            {"username": "ali", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)

        authorization = self.client.post(
            "/api/v1/auth/cli/authorize/",
            {
                "callback_url": "http://127.0.0.1:43123/callback",
                "state": "browser-login-state-0123456789",
                "code_challenge": challenge,
            },
            format="json",
        )
        self.assertEqual(authorization.status_code, 200)
        redirect = urlsplit(authorization.data["redirect_url"])
        code = parse_qs(redirect.query)["code"][0]

        token_client = APIClient()
        exchange = token_client.post(
            "/api/v1/auth/cli/token/",
            {"code": code, "code_verifier": verifier},
            format="json",
        )
        repeated = token_client.post(
            "/api/v1/auth/cli/token/",
            {"code": code, "code_verifier": verifier},
            format="json",
        )

        self.assertEqual(exchange.status_code, 200)
        self.assertEqual(exchange.data["user"]["username"], "ali")
        self.assertTrue(exchange.data["token"])
        self.assertEqual(repeated.status_code, 400)

    def test_cli_browser_authorization_rejects_non_loopback_callback(self):
        self.client.post(
            "/api/v1/auth/login/",
            {"username": "ali", "password": "StrongPass123!"},
            format="json",
        )
        response = self.client.post(
            "/api/v1/auth/cli/authorize/",
            {
                "callback_url": "https://attacker.example/callback",
                "state": "browser-login-state-0123456789",
                "code_challenge": "A" * 43,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_api_developer_registration_creates_admin_and_api_sessions(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "developer-sara",
                "email": "developer@example.com",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
                "account_type": "api_developer",
            },
            format="json",
        )

        user_doc = self.repository.get_user_by_username("developer-sara")
        django_user = User.objects.get(username="developer-sara")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["account_type"], "api_developer")
        self.assertTrue(response.data["user"]["is_staff"])
        self.assertEqual(user_doc["account_type"], "api_developer")
        self.assertTrue(user_doc["is_staff"])
        self.assertTrue(django_user.is_staff)
        self.assertFalse(django_user.is_superuser)
        self.assertIn("iranapi_session", response.cookies)
        self.assertIn("sessionid", response.cookies)

        admin = self.client.get("/admin/")
        self.assertEqual(admin.status_code, 200)

        self.client.post("/api/v1/auth/logout/", format="json")
        admin_after_logout = self.client.get("/admin/")
        self.assertEqual(admin_after_logout.status_code, 302)
        self.assertIn("/admin/login/", admin_after_logout["Location"])

    def test_session_logout_clears_session_and_blocks_dashboard_routes(self):
        login = self.client.post(
            "/api/v1/auth/login/",
            {"username": "ali", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)

        logout = self.client.post("/api/v1/auth/logout/", format="json")
        session = self.client.get("/api/v1/auth/session/")
        private_route = self.client.get("/api/v1/account/usage/stats/")

        self.assertEqual(logout.status_code, 200)
        self.assertEqual(session.status_code, 200)
        self.assertFalse(session.data["authenticated"])
        self.assertIn(private_route.status_code, {401, 403})
        self.assertEqual(private_route.data["error"]["code"], "not_authenticated")

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "ali", "password": "WrongPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"]["code"], "validation_error")
        self.assertEqual(response.data["error"]["message"], "نام کاربری یا رمز عبور اشتباه است.")
        self.assertNotIn("ErrorDetail", response.data["error"]["message"])

    def test_social_auth_providers_are_discoverable(self):
        response = self.client.get("/api/v1/auth/social/providers/")

        self.assertEqual(response.status_code, 200)
        provider_slugs = {provider["slug"] for provider in response.data["providers"]}
        self.assertIn("google", provider_slugs)
        self.assertIn("github", provider_slugs)

    def test_social_auth_start_rejects_disabled_provider(self):
        response = self.client.get("/api/v1/auth/social/google/start/")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"]["code"], "social_provider_disabled")

    def test_social_auth_start_rejects_unknown_provider(self):
        response = self.client.get("/api/v1/auth/social/missing/start/")

        self.assertEqual(response.status_code, 404)

    @override_settings(
        SOCIAL_AUTH_PROVIDERS={
            "github": {
                "label": "GitHub",
                "enabled": True,
                "auth_url": "https://github.com/login/oauth/authorize?client_id=abc",
            }
        }
    )
    def test_social_auth_start_redirects_enabled_provider(self):
        response = self.client.get("/api/v1/auth/social/github/start/?next=/dashboard")

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response["Location"],
            "https://github.com/login/oauth/authorize?client_id=abc&state=%2Fdashboard",
        )

    def test_legacy_login_returns_token(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "ali", "password": "StrongPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["username"], "ali")

    def test_public_catalog_routes_include_legacy_notice(self):
        response = self.client.get("/api/apis/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["X-API-Deprecated"], "true")
        self.assertEqual(response.data["meta"]["deprecated"]["canonical_path"], "/api/v1/catalog/apis/")

    def test_owned_catalog_requires_auth_and_limits_results_to_current_user(self):
        anonymous = self.client.get("/api/v1/catalog/apis/?owned=true")
        self.authenticate_with_token(self.user)
        owned = self.client.get("/api/v1/catalog/apis/?owned=true")

        self.assertIn(anonymous.status_code, {401, 403})
        self.assertEqual(owned.status_code, 200)
        self.assertEqual(owned.data["count"], 1)
        self.assertEqual(owned.data["results"][0]["slug"], self.api["slug"])

    def test_api_detail_increments_views(self):
        response = self.client.get(f"/api/v1/catalog/apis/{self.api['slug']}/")
        self.assertEqual(response.status_code, 200)

        refreshed = self.repository.get_api_by_slug(self.api["slug"], include_inactive=True)
        self.assertEqual(refreshed["views_count"], 1)
        self.assertEqual(len(response.data["pricing_plans"]), 1)
        self.assertEqual(len(response.data["documentations"]), 1)
        self.assertEqual(len(response.data["endpoints"]), 1)
        self.assertEqual(response.data["endpoints"][0]["path"], "/speech/transcriptions")

    def test_api_endpoint_list(self):
        response = self.client.get(f"/api/v1/catalog/apis/{self.api['slug']}/endpoints/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["method"], "POST")
        self.assertEqual(response.data["results"][0]["sample_response"]["confidence"], 0.98)

    def test_documentation_list_filters_by_api_and_search(self):
        api_response = self.client.get(f"/api/v1/catalog/documentations/?api={self.api['slug']}")
        search_response = self.client.get("/api/v1/catalog/documentations/?search=Run")
        empty_response = self.client.get("/api/v1/catalog/documentations/?search=missing")

        self.assertEqual(api_response.status_code, 200)
        self.assertEqual(api_response.data["count"], 1)
        self.assertEqual(api_response.data["results"][0]["api_slug"], self.api["slug"])
        self.assertEqual(search_response.status_code, 200)
        self.assertEqual(search_response.data["count"], 1)
        self.assertEqual(search_response.data["results"][0]["title"], "شروع سریع")
        self.assertEqual(empty_response.status_code, 200)
        self.assertEqual(empty_response.data["count"], 0)

    def test_rate_api_creates_then_updates_single_rating(self):
        self.authenticate_with_token(self.user)

        first = self.client.post(
            f"/api/v1/catalog/apis/{self.api['slug']}/ratings/",
            {"rating": 5},
            format="json",
        )
        second = self.client.post(
            f"/api/v1/catalog/apis/{self.api['slug']}/ratings/",
            {"rating": 3},
            format="json",
        )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertTrue(first.data["created"])
        self.assertFalse(second.data["created"])
        self.assertEqual(self.repository.api_ratings.count_documents({"api_id": int(self.api["_id"])}), 1)

        refreshed = self.repository.get_api_by_slug(self.api["slug"], include_inactive=True)
        self.assertEqual(refreshed["rating_count"], 1)
        self.assertEqual(f"{refreshed['rating']:.2f}", "3.00")

    def test_bearer_token_auth_and_private_cache_headers(self):
        token = self.repository.create_or_get_legacy_token(int(self.user["_id"]))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get("/api/v1/account/user/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "ali")
        self.assertEqual(response["Cache-Control"], "no-store, max-age=0")
        self.assertEqual(response["Pragma"], "no-cache")

    def test_usage_stats_and_list(self):
        self.authenticate_with_token(self.user)
        duplicate_usage = self.repository.build_usage_document(
            {
                "user_id": int(self.user["_id"]),
                "api_id": int(self.api["_id"]),
                "source": "caller",
                "requests_count": 7,
            }
        )
        self.repository.api_usage.insert_one(duplicate_usage)

        usage_response = self.client.get("/api/v1/account/usage/")
        stats_response = self.client.get("/api/v1/account/usage/stats/")

        self.assertEqual(usage_response.status_code, 200)
        self.assertEqual(usage_response.data["count"], 3)
        filtered = self.client.get(f"/api/v1/account/usage/?api={self.api['slug']}&source=rapidapi_sync")
        self.assertEqual(filtered.status_code, 200)
        self.assertEqual(filtered.data["count"], 1)
        self.assertEqual(filtered.data["results"][0]["api"]["slug"], self.api["slug"])
        self.assertEqual(stats_response.status_code, 200)
        self.assertEqual(stats_response.data["total_requests"], 279)
        self.assertEqual(stats_response.data["active_apis"], 2)
        self.assertEqual(stats_response.data["top_apis"][0]["slug"], self.api["slug"])
        self.assertEqual(stats_response.data["top_apis"][0]["requests_count"], 247)

    @override_settings(CALLER_PROVIDERS={"speech-api": {"base_url": "https://provider.example"}})
    @patch(
        "api.views.execute_provider_request",
        return_value=CallerResult(
            status_code=200,
            latency_ms=84,
            body={"confidence": 0.98},
            response_size=19,
            content_type="application/json",
        ),
    )
    def test_caller_execute_records_usage_history(self, mock_execute_provider_request):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/caller/",
            {
                "api_slug": self.api["slug"],
                "endpoint_id": int(self.endpoint["_id"]),
                "method": "POST",
                "body": {"audio_url": "https://example.com/audio.wav"},
            },
            format="json",
        )
        usage_response = self.client.get(f"/api/v1/account/usage/?api={self.api['slug']}&source=caller")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status_code"], 200)
        self.assertEqual(response.data["body"]["confidence"], 0.98)
        self.assertEqual(response.data["usage"]["source"], "caller")
        self.assertEqual(response.data["usage"]["method"], "POST")
        self.assertEqual(usage_response.status_code, 200)
        self.assertEqual(usage_response.data["count"], 1)
        self.assertEqual(usage_response.data["results"][0]["path"], "/speech/transcriptions")
        mock_execute_provider_request.assert_called_once()

    @patch(
        "api.views.execute_public_request",
        return_value=CallerResult(
            status_code=200,
            latency_ms=31,
            body={"todo": "public"},
            response_size=17,
            content_type="application/json",
        ),
    )
    def test_anonymous_user_can_call_any_public_api(self, mock_execute_public_request):
        response = self.client.post(
            "/api/v1/public/caller/",
            {
                "url": "https://api.example.com/v1/todos",
                "method": "GET",
                "headers": {"X-Api-Key": "visitor-key"},
                "query": {"page": 2},
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["body"], {"todo": "public"})
        self.assertEqual(response.data["region"], "public-direct")
        self.assertIsNone(response.data["usage"])
        self.assertEqual(self.repository.api_usage.count_documents({"source": "caller"}), 0)
        mock_execute_public_request.assert_called_once_with(
            url="https://api.example.com/v1/todos",
            method="GET",
            headers={"X-Api-Key": "visitor-key"},
            body=None,
            query={"page": 2},
        )

    @patch("api.views.execute_provider_request")
    def test_anonymous_user_cannot_use_server_managed_catalog_credentials(self, mock_execute_provider_request):
        response = self.client.post(
            "/api/v1/public/caller/",
            {
                "api_slug": self.api["slug"],
                "endpoint_id": int(self.endpoint["_id"]),
                "method": "POST",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        mock_execute_provider_request.assert_not_called()

    def test_caller_execute_rejects_missing_endpoint_without_recording_usage(self):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/caller/",
            {"api_slug": self.api["slug"], "endpoint_id": 9999, "method": "GET"},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.repository.api_usage.count_documents({"source": "caller"}), 0)

    def test_caller_execute_rejects_unregistered_path_without_recording_usage(self):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/caller/",
            {"api_slug": self.api["slug"], "path": "/admin/metadata", "method": "GET"},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.repository.api_usage.count_documents({"source": "caller"}), 0)

    @patch("api.views.execute_provider_request")
    def test_caller_execute_requires_active_access_grant(self, mock_execute_provider_request):
        self.repository.access_grants.delete_one({"_id": int(self.grant["_id"])})
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/caller/",
            {
                "api_slug": self.api["slug"],
                "endpoint_id": int(self.endpoint["_id"]),
                "method": "POST",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(self.repository.api_usage.count_documents({"source": "caller"}), 0)
        mock_execute_provider_request.assert_not_called()

    @patch("api.views.execute_provider_request")
    def test_caller_execute_rejects_expired_access_grant(self, mock_execute_provider_request):
        self.repository.access_grants.update_one(
            {"_id": int(self.grant["_id"])},
            {"$set": {"ends_at": timezone.now() - timedelta(seconds=1)}},
        )
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/caller/",
            {
                "api_slug": self.api["slug"],
                "endpoint_id": int(self.endpoint["_id"]),
                "method": "POST",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        mock_execute_provider_request.assert_not_called()

    def test_caller_execute_fails_closed_for_provider_without_server_config(self):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/caller/",
            {
                "api_slug": self.api["slug"],
                "endpoint_id": int(self.endpoint["_id"]),
                "method": "POST",
                "body": {"audio_url": "https://example.com/audio.wav"},
            },
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "caller_provider_not_configured")
        self.assertEqual(self.repository.api_usage.count_documents({"source": "caller"}), 0)

    def test_studio_flow_deploy_lists_and_records_usage(self):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/studio/flows/",
            {
                "name": "payment confirm",
                "api_slug": self.api["slug"],
                "region": "ir-tehran-1",
                "nodes": [
                    {"type": "trigger", "label": "POST /webhook"},
                    {"type": "api_call", "label": "speech-api"},
                    {"type": "notify", "label": "send sms"},
                ],
            },
            format="json",
        )
        listing = self.client.get("/api/v1/account/studio/flows/")
        usage_response = self.client.get(f"/api/v1/account/usage/?api={self.api['slug']}&source=studio")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["flow"]["status"], "deployed")
        self.assertEqual(response.data["flow"]["node_count"], 3)
        self.assertGreaterEqual(response.data["flow"]["latency_ms"], 1)
        self.assertEqual(response.data["usage"]["source"], "studio")
        self.assertEqual(response.data["usage"]["method"], "FLOW")
        self.assertEqual(response.data["usage"]["latency_ms"], response.data["flow"]["latency_ms"])
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(listing.data["results"][0]["slug"], response.data["flow"]["slug"])
        self.assertEqual(usage_response.status_code, 200)
        self.assertEqual(usage_response.data["count"], 1)

    def test_studio_flow_deploy_requires_authentication(self):
        response = self.client.post(
            "/api/v1/account/studio/flows/",
            {
                "name": "no auth flow",
                "api_slug": self.api["slug"],
                "nodes": [{"type": "trigger", "label": "POST /webhook"}],
            },
            format="json",
        )

        self.assertIn(response.status_code, {401, 403})
        self.assertEqual(self.repository.studio_flows.count_documents({}), 0)

    def test_project_init_lists_backend_languages_and_generates_files(self):
        self.authenticate_with_token(self.user)

        catalog = self.client.get("/api/v1/account/projects/init/")
        response = self.client.post(
            "/api/v1/account/projects/init/",
            {
                "project_name": "Speech Starter",
                "package_name": "speech-starter",
                "language": "python",
                "api_slug": self.api["slug"],
                "include_docker": True,
            },
            format="json",
        )

        self.assertEqual(catalog.status_code, 200)
        self.assertIn("python", {language["slug"] for language in catalog.data["supported_languages"]})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["project"]["language"], "python")
        self.assertEqual(response.data["project"]["api_slug"], self.api["slug"])
        paths = {file["path"] for file in response.data["project"]["files"]}
        self.assertIn("main.py", paths)
        self.assertIn("Dockerfile", paths)
        self.assertIn("README.md", paths)
        self.assertEqual(self.repository.api_projects.count_documents({"user_id": int(self.user["_id"])}), 1)

    def test_project_init_accepts_unknown_language_as_custom_template(self):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/projects/init/",
            {
                "project_name": "Nim Starter",
                "language": "nim",
                "include_docker": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["project"]["language"], "custom")
        paths = {file["path"] for file in response.data["project"]["files"]}
        self.assertIn("HTTP.md", paths)
        self.assertNotIn("Dockerfile", paths)

    def test_project_init_requires_authentication(self):
        response = self.client.post(
            "/api/v1/account/projects/init/",
            {"project_name": "No Auth Starter", "language": "node"},
            format="json",
        )

        self.assertIn(response.status_code, {401, 403})
        self.assertEqual(self.repository.api_projects.count_documents({}), 0)

    def test_project_archive_analysis_and_deployment(self):
        self.authenticate_with_token(self.user)
        source = {
            "package.json": '{"scripts":{"start":"node dist/server.js"},"dependencies":{"express":"latest"}}',
            "tsconfig.json": "{}",
            "src/server.ts": 'app.get("/health", () => ({ ok: true }));',
        }

        analysis_response = self.client.post(
            "/api/v1/account/projects/analyze/",
            {"archive": project_zip(source, "typescript-api.zip")},
            format="multipart",
        )
        with TemporaryDirectory() as archive_root, override_settings(PROJECT_ARCHIVE_ROOT=archive_root):
            deployment_response = self.client.post(
                "/api/v1/account/projects/deployments/",
                {
                    "archive": project_zip(source, "typescript-api.zip"),
                    "project_name": "TypeScript API",
                    "region": "ir-tehran-1",
                },
                format="multipart",
            )
            listing = self.client.get("/api/v1/account/projects/deployments/")
            detail = self.client.get(
                f"/api/v1/account/projects/deployments/{deployment_response.data['deployment']['slug']}/"
            )

        self.assertEqual(analysis_response.status_code, 200)
        self.assertEqual(analysis_response.data["analysis"]["language"], "typescript")
        self.assertEqual(deployment_response.status_code, 202)
        self.assertEqual(deployment_response.data["deployment"]["status"], "queued")
        self.assertEqual(deployment_response.data["deployment"]["language"], "typescript")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["deployment"]["slug"], deployment_response.data["deployment"]["slug"])
        stored = self.repository.project_deployments.find_one({"user_id": int(self.user["_id"])})
        self.assertIsNotNone(stored)

    @override_settings(PROJECT_DEPLOYMENT_ENABLED=False)
    def test_project_deployment_fails_fast_when_worker_capability_is_unavailable(self):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/account/projects/deployments/",
            {
                "archive": project_zip({"main.py": "print('hello')"}),
                "project_name": "Unavailable Worker",
                "region": "ir-tehran-1",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "deployment_capability_unavailable")
        self.assertIn("Docker build worker", response.data["error"]["message"])
        self.assertEqual(self.repository.project_deployments.count_documents({}), 0)

    def test_project_archive_endpoints_require_authentication(self):
        response = self.client.post(
            "/api/v1/account/projects/analyze/",
            {"archive": project_zip({"main.py": "print('hello')"})},
            format="multipart",
        )
        self.assertIn(response.status_code, {401, 403})
        self.assertEqual(self.repository.project_deployments.count_documents({}), 0)

    def test_account_user_and_profile_patch_crud_operations(self):
        self.authenticate_with_token(self.user)

        user_response = self.client.patch(
            "/api/v1/account/user/",
            {
                "email": "ali.updated@example.com",
                "first_name": "Ali Updated",
                "last_name": "Rezaei Updated",
            },
            format="json",
        )
        profile_response = self.client.patch(
            "/api/v1/account/profile/",
            {
                "phone": "+989121234567",
                "company": "IranAPI QA",
                "bio": "Building and testing dashboard APIs.",
                "avatar": "https://example.com/avatar.png",
            },
            format="json",
        )

        self.assertEqual(user_response.status_code, 200)
        self.assertEqual(user_response.data["user"]["email"], "ali.updated@example.com")
        self.assertEqual(user_response.data["user"]["first_name"], "Ali Updated")
        self.assertEqual(profile_response.status_code, 200)
        self.assertEqual(profile_response.data["profile"]["phone"], "+989121234567")
        self.assertEqual(profile_response.data["profile"]["company"], "IranAPI QA")
        self.assertEqual(profile_response.data["profile"]["avatar"], "https://example.com/avatar.png")

        stored = self.repository.get_user_by_id(int(self.user["_id"]))
        self.assertEqual(stored["email_normalized"], "ali.updated@example.com")
        self.assertEqual(stored["profile"]["company"], "IranAPI QA")

    def test_account_user_patch_rejects_duplicate_email(self):
        self.authenticate_with_token(self.user)

        response = self.client.patch(
            "/api/v1/account/user/",
            {"email": self.other_user["email"]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"]["code"], "validation_error")

    def test_access_grants_list(self):
        self.authenticate_with_token(self.user)

        response = self.client.get("/api/v1/account/access/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["api"]["slug"], self.api["slug"])
        self.assertEqual(response.data["results"][0]["pricing_plan"]["rapidapi_plan_slug"], "pro")

    def test_organization_create_and_list(self):
        self.authenticate_with_token(self.user)

        create = self.client.post(
            "/api/v1/account/organizations/",
            {"name": "Acme Payments", "region": "ir-mashhad-1"},
            format="json",
        )
        listing = self.client.get("/api/v1/account/organizations/")

        self.assertEqual(create.status_code, 201)
        self.assertEqual(create.data["organization"]["name"], "Acme Payments")
        self.assertEqual(create.data["organization"]["region"], "ir-mashhad-1")
        self.assertEqual(create.data["organization"]["status"], "active")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(listing.data["results"][0]["slug"], create.data["organization"]["slug"])
        self.assertEqual(self.repository.organizations.count_documents({"owner_user_id": int(self.user["_id"])}), 1)

    def test_organization_create_requires_authentication(self):
        response = self.client.post(
            "/api/v1/account/organizations/",
            {"name": "No Auth Org", "region": "ir-tehran-1"},
            format="json",
        )

        self.assertIn(response.status_code, {401, 403})
        self.assertEqual(self.repository.organizations.count_documents({}), 0)

    def test_subscription_plans_and_checkout_flow(self):
        plan = self.repository.build_subscription_plan_document(
            {
                "name": "Growth",
                "slug": "growth",
                "description": "Publish more APIs with dashboard usage limits.",
                "plan_type": "growth",
                "price": 1490000,
                "currency": "IRR",
                "interval": "month",
                "interval_days": 30,
                "api_publish_limit": 15,
                "included_requests": 250000,
                "features": ["Priority review"],
                "is_popular": True,
                "is_active": True,
                "sort_order": 1,
            }
        )
        self.repository.subscription_plans.insert_one(plan)
        self.repository.user_subscriptions.insert_one(
            {
                "_id": 1,
                "user_id": int(self.user["_id"]),
                "subscription_plan_id": int(plan["_id"]),
                "status": "active",
                "starts_at": timezone.now(),
                "renews_at": timezone.now(),
                "ends_at": None,
                "created_at": timezone.now(),
                "updated_at": timezone.now(),
            }
        )
        self.authenticate_with_token(self.user)

        plans = self.client.get("/api/v1/catalog/subscription-plans/")
        empty_current = self.client.get("/api/v1/account/subscription/")
        checkout = self.client.post(
            "/api/v1/account/subscription/",
            {"plan_id": int(plan["_id"])},
            format="json",
        )
        confirm = self.client.post(
            f"/api/v1/account/subscription/checkout/{checkout.data['checkout']['id']}/confirm/",
            format="json",
        )
        current = self.client.get("/api/v1/account/subscription/")

        self.assertEqual(plans.status_code, 200)
        self.assertEqual(plans.data["count"], 1)
        self.assertEqual(plans.data["results"][0]["slug"], "growth")
        self.assertEqual(empty_current.status_code, 200)
        self.assertEqual(empty_current.data["subscription"]["plan"]["slug"], "growth")
        self.assertEqual(checkout.status_code, 201)
        self.assertEqual(checkout.data["checkout"]["status"], "pending")
        self.assertEqual(checkout.data["checkout"]["plan"]["slug"], "growth")
        self.assertEqual(confirm.status_code, 200)
        self.assertEqual(confirm.data["checkout"]["status"], "paid")
        self.assertEqual(confirm.data["subscription"]["plan"]["slug"], "growth")
        self.assertNotEqual(confirm.data["subscription"]["id"], 1)
        self.assertEqual(current.status_code, 200)
        self.assertEqual(current.data["subscription"]["status"], "active")
        self.assertEqual(current.data["subscription"]["plan"]["api_publish_limit"], 15)

    def test_subscription_checkout_detail_cancel_and_idempotent_confirm(self):
        plan = self.repository.build_subscription_plan_document(
            {
                "name": "Scale",
                "slug": "scale",
                "description": "Team subscription.",
                "plan_type": "scale",
                "price": 2490000,
                "currency": "IRR",
                "interval": "month",
                "interval_days": 30,
                "api_publish_limit": None,
                "included_requests": 1000000,
                "features": ["SLA"],
                "is_active": True,
            }
        )
        self.repository.subscription_plans.insert_one(plan)
        self.authenticate_with_token(self.user)

        checkout = self.client.post(
            "/api/v1/account/subscription/",
            {"plan_id": int(plan["_id"])},
            format="json",
        )
        checkout_id = checkout.data["checkout"]["id"]
        detail = self.client.get(f"/api/v1/account/subscription/checkout/{checkout_id}/")
        confirm = self.client.post(f"/api/v1/account/subscription/checkout/{checkout_id}/confirm/", format="json")
        confirm_again = self.client.post(f"/api/v1/account/subscription/checkout/{checkout_id}/confirm/", format="json")
        cancel_paid = self.client.delete(f"/api/v1/account/subscription/checkout/{checkout_id}/")

        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["checkout"]["status"], "pending")
        self.assertEqual(confirm.status_code, 200)
        self.assertEqual(confirm_again.status_code, 200)
        self.assertEqual(confirm_again.data["subscription"]["id"], confirm.data["subscription"]["id"])
        self.assertEqual(cancel_paid.status_code, 400)

        second_checkout = self.client.post(
            "/api/v1/account/subscription/",
            {"plan_id": int(plan["_id"])},
            format="json",
        )
        second_checkout_id = second_checkout.data["checkout"]["id"]
        cancel_pending = self.client.delete(f"/api/v1/account/subscription/checkout/{second_checkout_id}/")

        self.assertEqual(cancel_pending.status_code, 200)
        self.assertEqual(cancel_pending.data["checkout"]["status"], "canceled")

    def test_expired_subscription_checkout_cannot_be_confirmed(self):
        plan = self.repository.build_subscription_plan_document(
            {
                "name": "Starter",
                "slug": "starter",
                "description": "Starter subscription.",
                "plan_type": "starter",
                "price": 990000,
                "currency": "IRR",
                "interval": "month",
                "interval_days": 30,
                "api_publish_limit": 3,
                "included_requests": 25000,
                "is_active": True,
            }
        )
        self.repository.subscription_plans.insert_one(plan)
        self.authenticate_with_token(self.user)

        checkout = self.client.post(
            "/api/v1/account/subscription/",
            {"plan_id": int(plan["_id"])},
            format="json",
        )
        checkout_id = checkout.data["checkout"]["id"]
        self.repository.subscription_checkouts.update_one(
            {"_id": checkout_id},
            {"$set": {"expires_at": timezone.now() - timedelta(minutes=1)}},
        )

        detail = self.client.get(f"/api/v1/account/subscription/checkout/{checkout_id}/")
        confirm = self.client.post(f"/api/v1/account/subscription/checkout/{checkout_id}/confirm/", format="json")

        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["checkout"]["status"], "expired")
        self.assertEqual(confirm.status_code, 400)
        self.assertEqual(self.repository.user_subscriptions.count_documents({"user_id": int(self.user["_id"])}), 0)

    def test_subscription_checkout_requires_authentication(self):
        response = self.client.post(
            "/api/v1/account/subscription/",
            {"plan_id": 1},
            format="json",
        )

        self.assertIn(response.status_code, {401, 403})
        self.assertEqual(self.repository.user_subscriptions.count_documents({}), 0)

    def test_generate_api_key_disabled(self):
        self.authenticate_with_token(self.user)

        response = self.client.post("/api/profile/me/generate-api-key/", format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["error"]["code"], "permission_denied")

    def test_rotate_api_key_updates_profile_and_masks_response(self):
        self.authenticate_with_token(self.user)

        response = self.client.post("/api/v1/account/api-key/rotate/", format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "API key rotated.")
        self.assertTrue(response.data["api_key"].startswith("iapi_"))
        self.assertTrue(response.data["profile"]["has_api_key"])
        self.assertTrue(response.data["profile"]["api_key_preview"].startswith("iapi_"))

        user_doc = self.repository.get_user_by_id(int(self.user["_id"]))
        profile = user_doc["profile"]
        self.assertIsNone(profile.get("api_key"))
        self.assertTrue(profile["api_key_hash"].startswith("pbkdf2_"))
        self.assertEqual(len(profile["api_key_fingerprint"]), 64)
        self.assertEqual(profile["api_key_preview"], response.data["profile"]["api_key_preview"])
        self.assertNotEqual(profile["api_key_hash"], response.data["api_key"])
        self.assertNotIn(response.data["api_key"], str(response.data["profile"]))

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['api_key']}")
        authenticated = self.client.get("/api/v1/account/user/")
        self.assertEqual(authenticated.status_code, 200)
        self.assertEqual(authenticated.data["id"], int(self.user["_id"]))

    def test_rotate_api_key_requires_authentication(self):
        response = self.client.post("/api/v1/account/api-key/rotate/", format="json")

        self.assertIn(response.status_code, {401, 403})

    def test_profile_masks_stored_api_key(self):
        user_doc = self.repository.rotate_api_key(int(self.user["_id"]))
        raw_key = user_doc["_api_key_secret"]
        self.authenticate_with_token(user_doc)

        response = self.client.get("/api/v1/account/profile/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["has_api_key"])
        self.assertNotEqual(response.data["api_key"], raw_key)
        self.assertNotIn(raw_key, str(response.data))

    def test_schema_endpoint(self):
        response = self.client.get("/api/v1/schema/openapi.json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["info"]["title"], "IranAPI")
        self.assertIn("/api/v1/catalog/apis/", response.data["paths"])
        self.assertIn("/api/v1/catalog/subscription-plans/", response.data["paths"])
        self.assertIn(f"/api/v1/catalog/apis/{{slug}}/endpoints/", response.data["paths"])
        self.assertIn("/api/v1/account/subscription/", response.data["paths"])
        self.assertIn("/api/v1/account/subscription/checkout/{checkout_id}/", response.data["paths"])
        self.assertIn("/api/v1/account/subscription/checkout/{checkout_id}/confirm/", response.data["paths"])
        self.assertIn("/api/v1/account/organizations/", response.data["paths"])
        self.assertIn("/api/v1/account/api-key/rotate/", response.data["paths"])
        self.assertIn("/api/v1/account/caller/", response.data["paths"])
        self.assertIn("/api/v1/public/caller/", response.data["paths"])
        self.assertIn("/api/v1/account/studio/flows/", response.data["paths"])
        self.assertIn("/api/v1/account/projects/init/", response.data["paths"])
        self.assertIn("/api/v1/account/projects/analyze/", response.data["paths"])
        self.assertIn("/api/v1/account/projects/deployments/", response.data["paths"])
        self.assertIn("/api/v1/account/projects/deployments/{slug}/", response.data["paths"])
        security_schemes = response.data["components"]["securitySchemes"]
        self.assertIn("bearerToken", security_schemes)
        self.assertNotIn("legacyToken", security_schemes)
        self.assertEqual(security_schemes["bearerToken"]["scheme"], "bearer")
        health_responses = response.data["paths"]["/api/v1/system/health/"]["get"]["responses"]
        self.assertIn("503", health_responses)
        docs_params = response.data["paths"]["/api/v1/catalog/documentations/"]["get"]["parameters"]
        self.assertIn("search", {param["name"] for param in docs_params})

    def test_site_metadata_routes(self):
        robots = self.client.get("/robots.txt")
        sitemap = self.client.get("/sitemap.xml")
        robots_body = b"".join(robots.streaming_content) if robots.streaming else robots.content
        sitemap_body = b"".join(sitemap.streaming_content) if sitemap.streaming else sitemap.content

        self.assertEqual(robots.status_code, 200)
        self.assertIn("Sitemap:", robots_body.decode("utf-8"))
        self.assertIn("Disallow: /admin/", robots_body.decode("utf-8"))
        self.assertIn("Disallow: /api/v1/account/", robots_body.decode("utf-8"))
        self.assertEqual(sitemap.status_code, 200)
        self.assertIn('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', sitemap_body.decode("utf-8"))
        self.assertIn(f"/api/{self.api['slug']}", sitemap_body.decode("utf-8"))
        self.assertIn("script-src 'self'", sitemap["Content-Security-Policy"])
        self.assertEqual(sitemap["X-Frame-Options"], "DENY")
        self.assertIn("camera=()", sitemap["Permissions-Policy"])

    def test_cookie_session_requires_csrf_but_token_auth_does_not(self):
        cookie_client = APIClient(enforce_csrf_checks=True)
        session_id = self.repository.create_session(int(self.user["_id"]))
        cookie_client.cookies[settings.MONGO_SESSION_COOKIE_NAME] = session_id

        blocked = cookie_client.post(
            "/api/v1/account/organizations/",
            {"name": "Blocked Org", "region": "ir-tehran-1"},
            format="json",
        )
        self.assertEqual(blocked.status_code, 403)

        session = cookie_client.get("/api/v1/auth/session/")
        csrf_token = session.cookies["csrftoken"].value
        cookie_client.cookies["csrftoken"] = csrf_token
        allowed = cookie_client.post(
            "/api/v1/account/organizations/",
            {"name": "Allowed Org", "region": "ir-tehran-1"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(allowed.status_code, 201)

        token_client = APIClient(enforce_csrf_checks=True)
        token = self.repository.create_or_get_legacy_token(int(self.other_user["_id"]))
        token_client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        token_allowed = token_client.post(
            "/api/v1/account/organizations/",
            {"name": "Token Org", "region": "ir-tehran-1"},
            format="json",
        )
        self.assertEqual(token_allowed.status_code, 201)

    def test_login_requires_csrf_token_issued_by_session_endpoint(self):
        csrf_client = APIClient(enforce_csrf_checks=True)
        payload = {"username": "ali", "password": "StrongPass123!"}

        blocked = csrf_client.post("/api/v1/auth/login/", payload, format="json")
        self.assertEqual(blocked.status_code, 403)

        session = csrf_client.get("/api/v1/auth/session/")
        csrf_token = session.cookies["csrftoken"].value
        csrf_client.cookies["csrftoken"] = csrf_token
        allowed = csrf_client.post(
            "/api/v1/auth/login/",
            payload,
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(allowed.status_code, 200)

    def test_frontend_routes_render_bootstrap_shell(self):
        home = self.client.get("/")
        detail = self.client.get(f"/api/{self.api['slug']}")

        self.assertEqual(home.status_code, 200)
        self.assertIn('id="iranapi-bootstrap-data"', home.content.decode("utf-8"))
        self.assertEqual(detail.status_code, 200)
        detail_html = detail.content.decode("utf-8")
        self.assertIn('id="iranapi-bootstrap-data"', detail_html)
        self.assertIn(self.api["slug"], detail_html)

    def test_tag_filter_excludes_inactive(self):
        response = self.client.get("/api/v1/catalog/apis/?tag=speech")
        self.assertEqual(response.status_code, 200)
        slugs = [item["slug"] for item in response.data["results"]]
        self.assertIn(self.api["slug"], slugs)
        self.assertIn(self.other_api["slug"], slugs)
        self.assertNotIn(self.hidden_api["slug"], slugs)

    def test_authenticated_user_can_release_api_to_public_catalog(self):
        self.authenticate_with_token(self.user)

        release = self.client.post(
            "/api/v1/catalog/apis/",
            {
                "name": "Weather Insights",
                "base_url": "https://weather.example.dev/v1",
                "documentation_url": "https://weather.example.dev/docs",
                "auth_scheme": "api-key",
                "category": "Weather",
                "tags": ["weather", "forecast"],
                "description": "Forecast and severe weather alerts for public dashboards.",
            },
            format="json",
        )
        search = self.client.get("/api/v1/catalog/apis/?search=Weather%20Insights")

        self.assertEqual(release.status_code, 201)
        self.assertEqual(release.data["api"]["status"], "active")
        self.assertEqual(release.data["api"]["rapidapi"]["publication_status"], "published")
        self.assertEqual(release.data["api"]["rapidapi"]["public_auth_scheme"], "api_key")
        self.assertEqual(search.status_code, 200)
        self.assertEqual(search.data["count"], 1)
        self.assertEqual(search.data["results"][0]["slug"], release.data["api"]["slug"])
        self.assertEqual(search.data["results"][0]["category"]["name"], "Weather")

    def test_release_api_normalizes_auth_scheme_tags_and_default_category(self):
        self.authenticate_with_token(self.user)

        response = self.client.post(
            "/api/v1/catalog/apis/",
            {
                "name": "SMS Gateway",
                "base_url": "https://sms.example.dev/v1",
                "auth_scheme": "api-key",
                "tags": [" sms ", "delivery"],
                "description": "Reliable SMS notifications.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["api"]["rapidapi"]["public_auth_scheme"], "api_key")
        self.assertEqual(response.data["api"]["category"]["slug"], "community")
        self.assertEqual(response.data["api"]["tags"], ["sms", "delivery"])

    def test_anonymous_user_cannot_release_api(self):
        response = self.client.post(
            "/api/v1/catalog/apis/",
            {
                "name": "Hidden Release",
                "base_url": "https://hidden.example.dev/v1",
                "description": "Should not be published without authentication.",
            },
            format="json",
        )

        self.assertIn(response.status_code, {401, 403})
        self.assertEqual(self.repository.apis.count_documents({"name": "Hidden Release"}), 0)

    def test_sample_seed_is_idempotent_and_populates_dashboard_data(self):
        reset_database()
        seed_sample_data()
        second_run = seed_sample_data()
        repository = MongoRepository()

        self.assertFalse(second_run["seeded"])
        self.assertGreaterEqual(repository.categories.count_documents({}), 3)
        self.assertGreaterEqual(repository.apis.count_documents({"status": "active"}), 3)
        self.assertIsNotNone(repository.get_user_by_username("demo-dev"))
        self.assertGreaterEqual(repository.access_grants.count_documents({}), 2)
        self.assertGreaterEqual(repository.api_usage.count_documents({}), 2)
        self.assertGreaterEqual(repository.subscription_plans.count_documents({}), 3)
        self.assertGreaterEqual(repository.api_endpoints.count_documents({}), 6)
        self.assertIsNotNone(repository.get_current_subscription(int(repository.get_user_by_username("demo-dev")["_id"])))

    def test_sample_seed_adds_real_iranian_provider_catalog(self):
        reset_database()
        seed_sample_data()
        repository = MongoRepository()

        expected_apis = {
            "neshan-maps": ("location", "https://api.neshan.org", "/v4/direction"),
            "kavenegar-sms": ("communications", "https://api.kavenegar.com/v1", "/{api_key}/sms/send.json"),
            "zarinpal-payment-gateway": ("fintech", "https://api.zarinpal.com", "/pg/v4/payment/request.json"),
            "arvancloud-cdn": ("cloud-infrastructure", "https://napi.arvancloud.ir/cdn/4.0", "/domains"),
        }
        demo_user = repository.get_user_by_username("demo-dev")
        self.assertIsNotNone(demo_user)

        for slug, (category_slug, base_url, endpoint_path) in expected_apis.items():
            api_doc = repository.get_api_by_slug(slug)
            self.assertIsNotNone(api_doc)
            self.assertEqual(api_doc["base_url"], base_url)
            self.assertEqual(api_doc["publication_status"], "published")
            category = repository.get_categories_by_ids([int(api_doc["category_id"])])[int(api_doc["category_id"])]
            self.assertEqual(category["slug"], category_slug)
            self.assertIsNotNone(repository.api_endpoints.find_one({"api_slug": slug, "path": endpoint_path}))
            self.assertIsNotNone(
                repository.access_grants.find_one(
                    {"user_id": int(demo_user["_id"]), "api_id": int(api_doc["_id"]), "status": "active"}
                )
            )

        serialized = self.client.get("/api/v1/catalog/apis/neshan-maps/")
        self.assertEqual(serialized.status_code, 200)
        self.assertEqual(serialized.data["base_url"], "https://api.neshan.org")
        self.assertEqual(len(serialized.data["endpoints"]), 2)

    def test_persian_catalog_management_command_works_without_sample_data(self):
        reset_database()
        output = StringIO()

        call_command("seed_persian_apis", stdout=output)
        repository = MongoRepository()

        expected_slugs = [
            "neshan-maps",
            "kavenegar-sms",
            "zarinpal-payment-gateway",
            "arvancloud-cdn",
        ]
        self.assertEqual(repository.apis.count_documents({"slug": {"$in": expected_slugs}}), 4)
        self.assertIn("4 APIs", output.getvalue())
