import importlib
from datetime import timedelta
from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from django.utils import timezone
from rest_framework.test import APISimpleTestCase

from .apps import ApiConfig
from . import mongo
from .mongo import reset_database
from .repositories import MongoRepository
from .security import redact_secrets
from .seed import seed_sample_data


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

        with patch.object(mongo, "_indexes_ready", False):
            with patch("api.mongo.get_client") as mock_get_client:
                mongo.ensure_indexes(fake_database)

        mock_get_client.assert_not_called()
        self.assertTrue(fake_database["users"].index_calls)


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


class MongoApiTests(APISimpleTestCase):
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
        self.assertIn("sessionid", response.cookies)
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
        self.assertIn("sessionid", response.cookies)

        current = self.client.get("/api/v1/account/user/")
        self.assertEqual(current.status_code, 200)
        self.assertEqual(current.data["username"], "ali")

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

    def test_social_auth_providers_are_discoverable(self):
        response = self.client.get("/api/v1/auth/social/providers/")

        self.assertEqual(response.status_code, 200)
        provider_slugs = {provider["slug"] for provider in response.data["providers"]}
        self.assertIn("google", provider_slugs)
        self.assertIn("github", provider_slugs)

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

        usage_response = self.client.get("/api/v1/account/usage/")
        stats_response = self.client.get("/api/v1/account/usage/stats/")

        self.assertEqual(usage_response.status_code, 200)
        self.assertEqual(usage_response.data["count"], 2)
        filtered = self.client.get(f"/api/v1/account/usage/?api={self.api['slug']}&source=rapidapi_sync")
        self.assertEqual(filtered.status_code, 200)
        self.assertEqual(filtered.data["count"], 1)
        self.assertEqual(filtered.data["results"][0]["api"]["slug"], self.api["slug"])
        self.assertEqual(stats_response.status_code, 200)
        self.assertEqual(stats_response.data["total_requests"], 272)
        self.assertEqual(stats_response.data["active_apis"], 2)
        self.assertEqual(stats_response.data["top_apis"][0]["slug"], self.api["slug"])

    def test_caller_execute_records_usage_history(self):
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
        self.assertEqual(response.data["usage"]["source"], "studio")
        self.assertEqual(response.data["usage"]["method"], "FLOW")
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
        self.assertTrue(response.data["profile"]["has_api_key"])
        self.assertTrue(response.data["profile"]["api_key_preview"].startswith("iapi_"))

        user_doc = self.repository.get_user_by_id(int(self.user["_id"]))
        raw_key = user_doc["profile"]["api_key"]
        self.assertTrue(raw_key.startswith("iapi_"))
        self.assertNotEqual(response.data["profile"]["api_key"], raw_key)
        self.assertNotIn(raw_key, str(response.data))

    def test_rotate_api_key_requires_authentication(self):
        response = self.client.post("/api/v1/account/api-key/rotate/", format="json")

        self.assertIn(response.status_code, {401, 403})

    def test_profile_masks_stored_api_key(self):
        user_doc = self.repository.rotate_api_key(int(self.user["_id"]))
        raw_key = user_doc["profile"]["api_key"]
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
        self.assertIn("/api/v1/account/studio/flows/", response.data["paths"])
        docs_params = response.data["paths"]["/api/v1/catalog/documentations/"]["get"]["parameters"]
        self.assertIn("search", {param["name"] for param in docs_params})

    def test_site_metadata_routes(self):
        robots = self.client.get("/robots.txt")
        sitemap = self.client.get("/sitemap.xml")

        self.assertEqual(robots.status_code, 200)
        self.assertIn("Sitemap:", robots.content.decode("utf-8"))
        self.assertEqual(sitemap.status_code, 200)
        self.assertIn('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', sitemap.content.decode("utf-8"))
        self.assertIn(f"/api/{self.api['slug']}", sitemap.content.decode("utf-8"))

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
