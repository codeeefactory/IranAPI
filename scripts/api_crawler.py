from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from http.cookiejar import CookieJar
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from api.seed import QA_DEMO_PASSWORD


BASE_URL = "http://127.0.0.1:8000"


@dataclass
class CrawlResponse:
    status: int
    headers: dict[str, str]
    body: Any


class ApiCrawler:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.cookies = CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({}),
            urllib.request.HTTPCookieProcessor(self.cookies),
        )
        self.visited: set[tuple[str, str]] = set()

    def csrf_token(self) -> str | None:
        for cookie in self.cookies:
            if cookie.name == "csrftoken":
                return cookie.value
        return None

    def request(
        self,
        method: str,
        actual_path: str,
        *,
        schema_path: str | None = None,
        data: dict[str, Any] | None = None,
        expected_status: int | None = 200,
    ) -> CrawlResponse:
        url = actual_path if actual_path.startswith("http") else f"{self.base_url}{actual_path}"
        payload = None
        headers = {"Accept": "application/json"}

        if data is not None:
            payload = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
            csrf_token = self.csrf_token()
            if csrf_token:
                headers["X-CSRFToken"] = csrf_token

        request = urllib.request.Request(url=url, data=payload, headers=headers, method=method)

        try:
            response = self.opener.open(request, timeout=20)
        except urllib.error.HTTPError as exc:
            response = exc

        status = response.status
        raw_body = response.read().decode("utf-8")
        headers_dict = {key: value for key, value in response.headers.items()}
        try:
            body: Any = json.loads(raw_body) if raw_body else None
        except json.JSONDecodeError:
            body = raw_body

        if expected_status is not None and status != expected_status:
            raise AssertionError(f"{method} {actual_path} returned {status}, expected {expected_status}. Body: {body}")

        self.visited.add((method.upper(), schema_path or actual_path))
        return CrawlResponse(status=status, headers=headers_dict, body=body)


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def expect_error_envelope(response: CrawlResponse, *, code: str | None = None) -> None:
    expect(isinstance(response.body, dict) and "error" in response.body, f"Expected error envelope, got {response.body}")
    if code is not None:
        expect(response.body["error"].get("code") == code, f"Expected error code {code}, got {response.body}")
        expect(bool(response.body["error"].get("request_id")), "Expected request_id in error payload.")


def wait_for_server(base_url: str, timeout_seconds: int = 30) -> None:
    started_at = time.time()
    health_url = f"{base_url.rstrip('/')}/api/v1/system/health/"
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    while time.time() - started_at < timeout_seconds:
        try:
            with opener.open(health_url, timeout=5) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(1)

    raise AssertionError(f"Backend did not become healthy at {health_url} within {timeout_seconds} seconds.")


def legacy_paths(api_slug: str, category_slug: str) -> list[tuple[str, str, int]]:
    return [
        ("GET", "/api/apis/", 200),
        ("GET", f"/api/apis/{api_slug}/", 200),
        ("GET", f"/api/apis/{api_slug}/similar/", 200),
        ("GET", "/api/categories/", 200),
        ("GET", f"/api/categories/{category_slug}/", 200),
        ("GET", f"/api/categories/{category_slug}/apis/", 200),
        ("GET", "/api/pricing-plans/", 200),
        ("GET", "/api/documentations/", 200),
        ("POST", "/api/profile/me/generate-api-key/", 403),
    ]


def main() -> int:
    base_url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("QA_API_BASE_URL") or BASE_URL
    wait_for_server(base_url)
    crawler = ApiCrawler(base_url)

    health = crawler.request("GET", "/api/v1/system/health/", schema_path="/api/v1/system/health/")
    expect(health.body["status"] == "ok", "Health endpoint did not report ok.")

    schema = crawler.request("GET", "/api/v1/schema/openapi.json", schema_path="/api/v1/schema/openapi.json")
    expect(isinstance(schema.body, dict) and "paths" in schema.body, "OpenAPI schema is missing paths.")
    schema_paths = set(schema.body["paths"].keys())

    session = crawler.request("GET", "/api/v1/auth/session/", schema_path="/api/v1/auth/session/")
    expect(session.body["authenticated"] is False, "Anonymous session should not be authenticated.")
    social_providers = crawler.request(
        "GET",
        "/api/v1/auth/social/providers/",
        schema_path="/api/v1/auth/social/providers/",
    )
    expect("providers" in social_providers.body, "Social provider registry should be discoverable.")
    social_start = crawler.request(
        "GET",
        "/api/v1/auth/social/google/start/",
        schema_path="/api/v1/auth/social/{provider}/start/",
        expected_status=503,
    )
    expect(social_start.body.get("provider", {}).get("slug") == "google", "Disabled provider response should name provider.")

    categories = crawler.request("GET", "/api/v1/catalog/categories/", schema_path="/api/v1/catalog/categories/")
    apis = crawler.request("GET", "/api/v1/catalog/apis/?ordering=-rating", schema_path="/api/v1/catalog/apis/")
    plans = crawler.request("GET", "/api/v1/catalog/pricing-plans/", schema_path="/api/v1/catalog/pricing-plans/")
    subscription_plans = crawler.request(
        "GET",
        "/api/v1/catalog/subscription-plans/",
        schema_path="/api/v1/catalog/subscription-plans/",
    )
    docs = crawler.request("GET", "/api/v1/catalog/documentations/", schema_path="/api/v1/catalog/documentations/")

    expect(categories.body["count"] >= 3, "Expected seeded categories for crawler validation.")
    expect(apis.body["count"] >= 3, "Expected seeded APIs for crawler validation.")
    expect(plans.body["count"] >= 3, "Expected seeded pricing plans for crawler validation.")
    expect(subscription_plans.body["count"] >= 3, "Expected seeded subscription plans for crawler validation.")
    expect(docs.body["count"] >= 3, "Expected seeded documentation pages for crawler validation.")

    first_api = apis.body["results"][0]
    first_category = categories.body["results"][0]
    first_api_slug = first_api["slug"]
    first_category_slug = first_category["slug"]
    first_tag = first_api["tags"][0]

    crawler.request(
        "GET",
        f"/api/v1/catalog/apis/{first_api_slug}/",
        schema_path="/api/v1/catalog/apis/{slug}/",
    )
    crawler.request(
        "GET",
        f"/api/v1/catalog/apis/{first_api_slug}/similar/",
        schema_path="/api/v1/catalog/apis/{slug}/similar/",
    )
    crawler.request(
        "GET",
        f"/api/v1/catalog/apis/{first_api_slug}/plans/",
        schema_path="/api/v1/catalog/apis/{slug}/plans/",
    )
    crawler.request(
        "GET",
        f"/api/v1/catalog/apis/{first_api_slug}/docs/",
        schema_path="/api/v1/catalog/apis/{slug}/docs/",
    )
    endpoints = crawler.request(
        "GET",
        f"/api/v1/catalog/apis/{first_api_slug}/endpoints/",
        schema_path="/api/v1/catalog/apis/{slug}/endpoints/",
    )
    expect(endpoints.body["count"] >= 1, "Expected seeded endpoint reference records.")
    crawler.request(
        "GET",
        f"/api/v1/catalog/apis/?tag={urllib.parse.quote(first_tag)}",
        schema_path="/api/v1/catalog/apis/",
    )
    crawler.request(
        "GET",
        f"/api/v1/catalog/apis/?search={urllib.parse.quote(first_api['name'])}",
        schema_path="/api/v1/catalog/apis/",
    )
    crawler.request(
        "GET",
        f"/api/v1/catalog/categories/{first_category_slug}/",
        schema_path="/api/v1/catalog/categories/{slug}/",
    )
    crawler.request(
        "GET",
        f"/api/v1/catalog/categories/{first_category_slug}/apis/",
        schema_path="/api/v1/catalog/categories/{slug}/apis/",
    )

    protected = crawler.request("GET", "/api/v1/account/user/", schema_path="/api/v1/account/user/", expected_status=403)
    expect_error_envelope(protected)

    unique_suffix = str(int(time.time()))
    crawler.request("GET", "/api/v1/auth/session/", schema_path="/api/v1/auth/session/")
    registration = crawler.request(
        "POST",
        "/api/v1/auth/register/",
        schema_path="/api/v1/auth/register/",
        expected_status=201,
        data={
            "username": f"qa-user-{unique_suffix}",
            "email": f"qa-user-{unique_suffix}@example.com",
            "password": QA_DEMO_PASSWORD,
            "password_confirm": QA_DEMO_PASSWORD,
            "first_name": "QA",
            "last_name": "Crawler",
        },
    )
    expect(registration.body["authenticated"] is True, "Registration should authenticate the new user.")
    crawler.request("POST", "/api/v1/auth/logout/", schema_path="/api/v1/auth/logout/", expected_status=200)

    invalid_login = crawler.request(
        "POST",
        "/api/v1/auth/login/",
        schema_path="/api/v1/auth/login/",
        expected_status=400,
        data={"username": "demo-dev", "password": "incorrect-password"},
    )
    expect_error_envelope(invalid_login, code="validation_error")

    crawler.request("GET", "/api/v1/auth/session/", schema_path="/api/v1/auth/session/")
    login = crawler.request(
        "POST",
        "/api/v1/auth/login/",
        schema_path="/api/v1/auth/login/",
        data={"username": "demo-dev", "password": QA_DEMO_PASSWORD},
    )
    expect(login.body["authenticated"] is True, "Demo login should authenticate successfully.")

    user = crawler.request("GET", "/api/v1/account/user/", schema_path="/api/v1/account/user/")
    profile = crawler.request("GET", "/api/v1/account/profile/", schema_path="/api/v1/account/profile/")
    access = crawler.request("GET", "/api/v1/account/access/", schema_path="/api/v1/account/access/")
    current_subscription = crawler.request(
        "GET",
        "/api/v1/account/subscription/",
        schema_path="/api/v1/account/subscription/",
    )
    usage = crawler.request("GET", "/api/v1/account/usage/", schema_path="/api/v1/account/usage/")
    usage_stats = crawler.request("GET", "/api/v1/account/usage/stats/", schema_path="/api/v1/account/usage/stats/")

    expect(user.body["username"] == "demo-dev", f"Unexpected current user payload: {user.body}")
    expect(bool(profile.body["company"]), "Profile should include seeded company details.")
    expect(access.body["count"] >= 2, "Expected seeded access grants.")
    expect(current_subscription.body["subscription"]["status"] == "active", "Expected active seeded subscription.")
    expect(usage.body["count"] >= 2, "Expected seeded usage items.")
    expect(usage_stats.body["total_requests"] > 0, "Usage stats should aggregate seeded requests.")

    growth_plan = next((plan for plan in subscription_plans.body["results"] if plan["slug"] == "growth"), None)
    expect(growth_plan is not None, "Expected Growth subscription plan.")
    checkout = crawler.request(
        "POST",
        "/api/v1/account/subscription/",
        schema_path="/api/v1/account/subscription/",
        expected_status=201,
        data={"plan_id": growth_plan["id"]},
    )
    expect(checkout.body["checkout"]["status"] == "pending", "Subscription checkout should start as pending.")
    confirm = crawler.request(
        "POST",
        f"/api/v1/account/subscription/checkout/{checkout.body['checkout']['id']}/confirm/",
        schema_path="/api/v1/account/subscription/checkout/{checkout_id}/confirm/",
    )
    expect(confirm.body["checkout"]["status"] == "paid", "Checkout confirmation should mark invoice paid.")
    expect(confirm.body["subscription"]["plan"]["slug"] == "growth", "Checkout confirmation should activate Growth.")

    update_user = crawler.request(
        "PATCH",
        "/api/v1/account/user/",
        schema_path="/api/v1/account/user/",
        data={"first_name": "کیفیت", "last_name": "سنج", "email": "demo-dev@iranapi.local"},
    )
    expect(update_user.body["user"]["first_name"] == "کیفیت", "User update did not persist.")

    update_profile = crawler.request(
        "PATCH",
        "/api/v1/account/profile/",
        schema_path="/api/v1/account/profile/",
        data={"company": "IranAPI QA Lab", "bio": "Updated by API crawler."},
    )
    expect(update_profile.body["profile"]["company"] == "IranAPI QA Lab", "Profile update did not persist.")

    rating = crawler.request(
        "POST",
        f"/api/v1/catalog/apis/{first_api_slug}/ratings/",
        schema_path="/api/v1/catalog/apis/{slug}/ratings/",
        data={"rating": 4},
    )
    expect(rating.body["rating_count"] >= 2, "Rating count should stay aggregated after update.")

    for method, path, expected_status in legacy_paths(first_api_slug, first_category_slug):
        response = crawler.request(method, path, expected_status=expected_status)
        if expected_status == 200:
            expect(response.headers.get("X-API-Deprecated") == "true", f"Expected deprecation header for {path}")
        else:
            expect_error_envelope(response, code="permission_denied")

    crawler.request("POST", "/api/v1/auth/logout/", schema_path="/api/v1/auth/logout/", expected_status=200)

    expected_visited = {
        ("GET", "/api/v1/system/health/"),
        ("GET", "/api/v1/schema/openapi.json"),
        ("GET", "/api/v1/auth/session/"),
        ("GET", "/api/v1/auth/social/providers/"),
        ("GET", "/api/v1/auth/social/{provider}/start/"),
        ("POST", "/api/v1/auth/register/"),
        ("POST", "/api/v1/auth/login/"),
        ("POST", "/api/v1/auth/logout/"),
        ("GET", "/api/v1/catalog/categories/"),
        ("GET", "/api/v1/catalog/apis/"),
        ("GET", "/api/v1/catalog/apis/{slug}/"),
        ("GET", "/api/v1/catalog/apis/{slug}/similar/"),
        ("GET", "/api/v1/catalog/apis/{slug}/plans/"),
        ("GET", "/api/v1/catalog/apis/{slug}/docs/"),
        ("GET", "/api/v1/catalog/apis/{slug}/endpoints/"),
        ("POST", "/api/v1/catalog/apis/{slug}/ratings/"),
        ("GET", "/api/v1/catalog/pricing-plans/"),
        ("GET", "/api/v1/catalog/subscription-plans/"),
        ("GET", "/api/v1/catalog/documentations/"),
        ("GET", "/api/v1/account/user/"),
        ("PATCH", "/api/v1/account/user/"),
        ("GET", "/api/v1/account/profile/"),
        ("PATCH", "/api/v1/account/profile/"),
        ("GET", "/api/v1/account/access/"),
        ("GET", "/api/v1/account/subscription/"),
        ("POST", "/api/v1/account/subscription/"),
        ("POST", "/api/v1/account/subscription/checkout/{checkout_id}/confirm/"),
        ("GET", "/api/v1/account/usage/"),
        ("GET", "/api/v1/account/usage/stats/"),
        ("GET", "/api/v1/catalog/categories/{slug}/"),
        ("GET", "/api/v1/catalog/categories/{slug}/apis/"),
    }
    missing_paths = sorted(path for path in schema_paths if ("GET", path) not in crawler.visited and ("POST", path) not in crawler.visited and ("PATCH", path) not in crawler.visited)
    expect(not missing_paths, f"Schema paths not exercised by crawler: {missing_paths}")
    expect(expected_visited.issubset(crawler.visited), f"Critical paths were not covered: {sorted(expected_visited - crawler.visited)}")

    print("API crawler passed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as exc:
        print(f"API crawler failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
