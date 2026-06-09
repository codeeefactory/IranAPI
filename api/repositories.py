from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.utils.text import slugify
from pymongo import ASCENDING, DESCENDING
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError

from .mongo import get_database, next_id


def normalize_username(value: str) -> str:
    return value.strip().lower()


def normalize_email(value: str) -> str:
    return value.strip().lower()


def normalize_tag(value: str) -> str:
    return value.strip().lower()


def normalize_tags(values: list[str] | tuple[str, ...] | None) -> tuple[list[str], list[str]]:
    cleaned: list[str] = []
    normalized: list[str] = []
    seen: set[str] = set()

    for value in values or []:
        raw = str(value).strip()
        if not raw:
            continue
        lowered = normalize_tag(raw)
        if lowered in seen:
            continue
        seen.add(lowered)
        cleaned.append(raw)
        normalized.append(lowered)

    return cleaned, normalized


def quantize_decimal(value: Decimal | int | float | str | None, places: str = "0.01") -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal(places), rounding=ROUND_HALF_UP)


def format_decimal(value: Decimal | int | float | str | None, places: str = "0.01") -> str:
    return format(quantize_decimal(value, places), "f")


def unique_slug(
    collection: Collection,
    source_value: str,
    *,
    max_length: int = 160,
    current_id: int | None = None,
) -> str:
    base_slug = slugify(source_value, allow_unicode=True).strip("-")[:max_length]
    if not base_slug:
        base_slug = "item"

    slug = base_slug
    index = 2
    while True:
        query: dict[str, Any] = {"slug": slug}
        if current_id is not None:
            query["_id"] = {"$ne": current_id}
        if not collection.find_one(query, {"_id": 1}):
            return slug
        suffix = f"-{index}"
        slug = f"{base_slug[: max_length - len(suffix)]}{suffix}"
        index += 1


@dataclass(slots=True)
class MongoUser:
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    date_joined: Any
    is_active: bool
    is_staff: bool = False
    is_superuser: bool = False

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def pk(self) -> int:
        return self.id


class MongoRepository:
    def __init__(self):
        self.db = get_database()
        self.users = self.db["users"]
        self.categories = self.db["categories"]
        self.apis = self.db["apis"]
        self.pricing_plans = self.db["pricing_plans"]
        self.subscription_plans = self.db["subscription_plans"]
        self.documentations = self.db["documentations"]
        self.api_endpoints = self.db["api_endpoints"]
        self.access_grants = self.db["access_grants"]
        self.user_subscriptions = self.db["user_subscriptions"]
        self.subscription_checkouts = self.db["subscription_checkouts"]
        self.api_ratings = self.db["api_ratings"]
        self.api_usage = self.db["api_usage"]
        self.sessions = self.db["sessions"]
        self.legacy_tokens = self.db["legacy_tokens"]
        self.organizations = self.db["organizations"]

    def build_mongo_user(self, user_doc: dict[str, Any]) -> MongoUser:
        return MongoUser(
            id=int(user_doc["_id"]),
            username=user_doc["username"],
            email=user_doc.get("email", ""),
            first_name=user_doc.get("first_name", ""),
            last_name=user_doc.get("last_name", ""),
            date_joined=user_doc.get("date_joined"),
            is_active=bool(user_doc.get("is_active", True)),
            is_staff=bool(user_doc.get("is_staff", False)),
            is_superuser=bool(user_doc.get("is_superuser", False)),
        )

    def _find_user(self, query: dict[str, Any]) -> dict[str, Any] | None:
        return self.users.find_one(query)

    def get_user_by_id(self, user_id: int) -> dict[str, Any] | None:
        return self._find_user({"_id": int(user_id)})

    def get_user_by_username(self, username: str) -> dict[str, Any] | None:
        return self._find_user({"username_normalized": normalize_username(username)})

    def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        normalized = normalize_email(email)
        if not normalized:
            return None
        return self._find_user({"email_normalized": normalized})

    def validate_unique_user_fields(
        self,
        *,
        username: str | None = None,
        email: str | None = None,
        current_user_id: int | None = None,
    ) -> None:
        if username:
            existing = self.get_user_by_username(username)
            if existing and existing["_id"] != current_user_id:
                raise ValueError("این نام کاربری قبلاً ثبت شده است.")

        if email is not None:
            normalized_email = normalize_email(email)
            if normalized_email:
                existing = self.get_user_by_email(normalized_email)
                if existing and existing["_id"] != current_user_id:
                    raise ValueError("این ایمیل قبلاً ثبت شده است.")

    def create_user(
        self,
        *,
        username: str,
        password: str,
        email: str = "",
        first_name: str = "",
        last_name: str = "",
    ) -> dict[str, Any]:
        self.validate_unique_user_fields(username=username, email=email)

        now = timezone.now()
        document: dict[str, Any] = {
            "_id": next_id("users"),
            "username": username.strip(),
            "username_normalized": normalize_username(username),
            "email": email.strip(),
            "first_name": first_name.strip(),
            "last_name": last_name.strip(),
            "password_hash": make_password(password),
            "is_active": True,
            "is_staff": False,
            "is_superuser": False,
            "date_joined": now,
            "last_login": now,
            "created_at": now,
            "updated_at": now,
            "profile": {
                "phone": "",
                "company": "",
                "bio": "",
                "avatar": None,
                "api_key": None,
                "created_at": now,
                "updated_at": now,
            },
        }

        normalized_email = normalize_email(email)
        if normalized_email:
            document["email_normalized"] = normalized_email

        self.users.insert_one(document)
        return document

    def authenticate_user(self, username: str, password: str) -> dict[str, Any] | None:
        user_doc = self.get_user_by_username(username)
        if not user_doc:
            return None
        if not check_password(password, user_doc["password_hash"]):
            return None
        if not user_doc.get("is_active", True):
            return None

        now = timezone.now()
        self.users.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"last_login": now, "updated_at": now}},
        )
        user_doc["last_login"] = now
        return user_doc

    def update_user(self, user_id: int, data: dict[str, Any]) -> dict[str, Any]:
        user_doc = self.get_user_by_id(user_id)
        if not user_doc:
            raise LookupError("User not found.")

        email = data.get("email", user_doc.get("email", ""))
        self.validate_unique_user_fields(email=email, current_user_id=user_id)

        updates: dict[str, Any] = {"updated_at": timezone.now()}
        unsets: dict[str, Any] = {}

        for field in ("first_name", "last_name"):
            if field in data:
                updates[field] = (data.get(field) or "").strip()

        if "email" in data:
            updates["email"] = (data.get("email") or "").strip()
            normalized_email = normalize_email(updates["email"])
            if normalized_email:
                updates["email_normalized"] = normalized_email
            else:
                unsets["email_normalized"] = ""

        operation: dict[str, Any] = {"$set": updates}
        if unsets:
            operation["$unset"] = unsets

        self.users.update_one({"_id": user_id}, operation)
        return self.get_user_by_id(user_id) or user_doc

    def update_profile(self, user_id: int, data: dict[str, Any]) -> dict[str, Any]:
        user_doc = self.get_user_by_id(user_id)
        if not user_doc:
            raise LookupError("User not found.")

        profile_updates: dict[str, Any] = {
            "profile.updated_at": timezone.now(),
            "updated_at": timezone.now(),
        }
        for field in ("phone", "company", "bio"):
            if field in data:
                profile_updates[f"profile.{field}"] = (data.get(field) or "").strip()

        if "avatar" in data:
            profile_updates["profile.avatar"] = data.get("avatar") or None

        self.users.update_one({"_id": user_id}, {"$set": profile_updates})
        return self.get_user_by_id(user_id) or user_doc

    def rotate_api_key(self, user_id: int) -> dict[str, Any]:
        for _ in range(10):
            candidate = f"iapi_{secrets.token_hex(20)}"
            try:
                self.users.update_one(
                    {"_id": user_id},
                    {
                        "$set": {
                            "profile.api_key": candidate,
                            "profile.updated_at": timezone.now(),
                            "updated_at": timezone.now(),
                        }
                    },
                )
                user_doc = self.get_user_by_id(user_id)
                if user_doc:
                    return user_doc
            except DuplicateKeyError:
                continue
        raise RuntimeError("Could not generate a unique API key.")

    def create_session(self, user_id: int) -> str:
        session_id = secrets.token_urlsafe(32)
        now = timezone.now()
        self.sessions.insert_one(
            {
                "_id": session_id,
                "user_id": int(user_id),
                "created_at": now,
                "last_seen_at": now,
                "expires_at": now + timedelta(seconds=settings.SESSION_COOKIE_AGE),
            }
        )
        return session_id

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        if not session_id:
            return None

        now = timezone.now()
        session_doc = self.sessions.find_one({"_id": session_id, "expires_at": {"$gt": now}})
        if not session_doc:
            return None

        self.sessions.update_one(
            {"_id": session_id},
            {
                "$set": {
                    "last_seen_at": now,
                    "expires_at": now + timedelta(seconds=settings.SESSION_COOKIE_AGE),
                }
            },
        )
        return session_doc

    def session_user(self, session_id: str) -> dict[str, Any] | None:
        session_doc = self.get_session(session_id)
        if not session_doc:
            return None
        user_doc = self.get_user_by_id(session_doc["user_id"])
        if not user_doc or not user_doc.get("is_active", True):
            self.delete_session(session_id)
            return None
        return user_doc

    def delete_session(self, session_id: str) -> None:
        if session_id:
            self.sessions.delete_one({"_id": session_id})

    def create_or_get_legacy_token(self, user_id: int) -> str:
        token_doc = self.legacy_tokens.find_one({"user_id": int(user_id)})
        if token_doc:
            return str(token_doc["_id"])

        token = secrets.token_hex(20)
        self.legacy_tokens.insert_one(
            {
                "_id": token,
                "user_id": int(user_id),
                "created_at": timezone.now(),
            }
        )
        return token

    def delete_legacy_tokens_for_user(self, user_id: int) -> None:
        self.legacy_tokens.delete_many({"user_id": int(user_id)})

    def get_user_for_token(self, token: str) -> dict[str, Any] | None:
        if not token:
            return None

        token_doc = self.legacy_tokens.find_one({"_id": token})
        if not token_doc:
            return None
        return self.get_user_by_id(token_doc["user_id"])

    def category_counts(self) -> dict[int, int]:
        results = self.apis.aggregate(
            [
                {"$match": {"status": "active", "category_id": {"$ne": None}}},
                {"$group": {"_id": "$category_id", "count": {"$sum": 1}}},
            ]
        )
        return {int(item["_id"]): int(item["count"]) for item in results if item["_id"] is not None}

    def list_categories(self, *, search: str | None = None, ordering: str | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {}
        if search:
            regex = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"name": regex},
                {"name_en": regex},
                {"description": regex},
            ]

        categories = list(self.categories.find(query))
        counts = self.category_counts()
        for category in categories:
            category["active_apis_count"] = counts.get(int(category["_id"]), 0)

        reverse = False
        ordering_field = ordering or "name"
        if ordering_field.startswith("-"):
            reverse = True
            ordering_field = ordering_field[1:]

        allowed = {"name", "created_at", "active_apis_count"}
        if ordering_field not in allowed:
            ordering_field = "name"
            reverse = False

        categories.sort(key=lambda item: (item.get(ordering_field) or 0, item.get("name", "")))
        if reverse:
            categories.reverse()

        return categories

    def get_category_by_slug(self, slug: str) -> dict[str, Any] | None:
        category = self.categories.find_one({"slug": slug})
        if category:
            category["active_apis_count"] = self.category_counts().get(int(category["_id"]), 0)
        return category

    def get_categories_by_ids(self, category_ids: list[int]) -> dict[int, dict[str, Any]]:
        if not category_ids:
            return {}
        return {
            int(category["_id"]): category
            for category in self.categories.find({"_id": {"$in": list({int(value) for value in category_ids})}})
        }

    def _api_query(
        self,
        *,
        category_slug: str | None = None,
        featured: bool | None = None,
        popular: bool | None = None,
        tag: str | None = None,
        search: str | None = None,
        include_inactive: bool = False,
    ) -> dict[str, Any]:
        query: dict[str, Any] = {}

        if not include_inactive:
            query["status"] = "active"

        if category_slug:
            category = self.get_category_by_slug(category_slug)
            if not category:
                return {"_id": {"$exists": False}}
            query["category_id"] = int(category["_id"])

        if featured is not None:
            query["is_featured"] = bool(featured)

        if popular is not None:
            query["is_popular"] = bool(popular)

        if tag:
            query["tags_normalized"] = normalize_tag(tag)

        if search:
            regex = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"name": regex},
                {"name_en": regex},
                {"description": regex},
                {"short_description": regex},
            ]

        return query

    def _api_sort(self, ordering: str | None) -> list[tuple[str, int]]:
        if not ordering:
            return [("is_featured", DESCENDING), ("is_popular", DESCENDING), ("name", ASCENDING)]

        field = ordering
        direction = ASCENDING
        if field.startswith("-"):
            field = field[1:]
            direction = DESCENDING

        allowed = {"created_at", "updated_at", "name", "views_count", "rating"}
        if field not in allowed:
            return [("is_featured", DESCENDING), ("is_popular", DESCENDING), ("name", ASCENDING)]
        return [(field, direction), ("name", ASCENDING)]

    def list_apis(
        self,
        *,
        category_slug: str | None = None,
        featured: bool | None = None,
        popular: bool | None = None,
        tag: str | None = None,
        search: str | None = None,
        ordering: str | None = None,
        include_inactive: bool = False,
        created_by_user_id: int | None = None,
    ) -> list[dict[str, Any]]:
        query = self._api_query(
            category_slug=category_slug,
            featured=featured,
            popular=popular,
            tag=tag,
            search=search,
            include_inactive=include_inactive,
        )
        if created_by_user_id is not None:
            query["created_by_user_id"] = int(created_by_user_id)
        return list(self.apis.find(query).sort(self._api_sort(ordering)))

    def get_api_by_slug(self, slug: str, *, include_inactive: bool = False) -> dict[str, Any] | None:
        query: dict[str, Any] = {"slug": slug}
        if not include_inactive:
            query["status"] = "active"
        return self.apis.find_one(query)

    def increment_api_views(self, api_id: int) -> dict[str, Any] | None:
        self.apis.update_one(
            {"_id": int(api_id)},
            {"$inc": {"views_count": 1}, "$set": {"updated_at": timezone.now()}},
        )
        return self.apis.find_one({"_id": int(api_id)})

    def get_pricing_plans_by_api_ids(self, api_ids: list[int], *, active_only: bool = True) -> dict[int, list[dict[str, Any]]]:
        if not api_ids:
            return {}
        query: dict[str, Any] = {"api_id": {"$in": list({int(value) for value in api_ids})}}
        if active_only:
            query["is_active"] = True

        plans_by_api: dict[int, list[dict[str, Any]]] = {}
        for plan in self.pricing_plans.find(query).sort([("price", ASCENDING), ("name", ASCENDING)]):
            plans_by_api.setdefault(int(plan["api_id"]), []).append(plan)
        return plans_by_api

    def get_pricing_plans_by_ids(self, plan_ids: list[int]) -> dict[int, dict[str, Any]]:
        if not plan_ids:
            return {}
        return {
            int(plan["_id"]): plan
            for plan in self.pricing_plans.find({"_id": {"$in": list({int(value) for value in plan_ids})}})
        }

    def list_pricing_plans(self, *, api_slug: str | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"is_active": True}
        if api_slug:
            query["api_slug"] = api_slug
        return list(self.pricing_plans.find(query).sort([("price", ASCENDING), ("name", ASCENDING)]))

    def list_subscription_plans(self, *, active_only: bool = True) -> list[dict[str, Any]]:
        query: dict[str, Any] = {}
        if active_only:
            query["is_active"] = True
        return list(self.subscription_plans.find(query).sort([("sort_order", ASCENDING), ("price", ASCENDING)]))

    def get_subscription_plan_by_id(self, plan_id: int, *, active_only: bool = True) -> dict[str, Any] | None:
        query: dict[str, Any] = {"_id": int(plan_id)}
        if active_only:
            query["is_active"] = True
        return self.subscription_plans.find_one(query)

    def get_current_subscription(self, user_id: int) -> dict[str, Any] | None:
        return self.user_subscriptions.find_one(
            {"user_id": int(user_id), "status": "active"},
            sort=[("created_at", DESCENDING)],
        )

    def get_subscription_by_id(self, *, user_id: int, subscription_id: int) -> dict[str, Any] | None:
        return self.user_subscriptions.find_one({"_id": int(subscription_id), "user_id": int(user_id)})

    def create_subscription_checkout(self, *, user_id: int, plan_id: int) -> tuple[dict[str, Any], dict[str, Any]]:
        plan = self.get_subscription_plan_by_id(plan_id)
        if not plan:
            raise LookupError("Subscription plan not found.")

        now = timezone.now()
        amount = float(plan.get("price", 0) or 0)
        checkout_id = next_id("subscription_checkouts")
        while self.subscription_checkouts.find_one({"_id": checkout_id}, {"_id": 1}):
            checkout_id = next_id("subscription_checkouts")
        checkout = {
            "_id": checkout_id,
            "user_id": int(user_id),
            "subscription_plan_id": int(plan["_id"]),
            "status": "pending",
            "amount": amount,
            "currency": plan.get("currency", "IRR"),
            "gateway": "manual",
            "reference": f"chk_{checkout_id}",
            "created_at": now,
            "updated_at": now,
            "expires_at": now + timedelta(minutes=30),
            "confirmed_at": None,
        }
        self.subscription_checkouts.insert_one(checkout)
        return checkout, plan

    def get_subscription_checkout(self, *, user_id: int, checkout_id: int) -> tuple[dict[str, Any], dict[str, Any]] | tuple[None, None]:
        checkout = self.subscription_checkouts.find_one({"_id": int(checkout_id), "user_id": int(user_id)})
        if not checkout:
            return None, None
        if checkout.get("status") == "pending" and checkout.get("expires_at") and checkout["expires_at"] <= timezone.now():
            now = timezone.now()
            self.subscription_checkouts.update_one(
                {"_id": int(checkout_id), "status": "pending"},
                {"$set": {"status": "expired", "updated_at": now}},
            )
            checkout = self.subscription_checkouts.find_one({"_id": int(checkout_id), "user_id": int(user_id)}) or checkout
        plan = self.get_subscription_plan_by_id(checkout["subscription_plan_id"], active_only=False)
        return checkout, plan

    def cancel_subscription_checkout(self, *, user_id: int, checkout_id: int) -> tuple[dict[str, Any], dict[str, Any]]:
        checkout, plan = self.get_subscription_checkout(user_id=user_id, checkout_id=checkout_id)
        if not checkout or not plan:
            raise LookupError("Subscription checkout not found.")
        if checkout.get("status") != "pending":
            raise ValueError("Only pending checkouts can be canceled.")

        now = timezone.now()
        self.subscription_checkouts.update_one(
            {"_id": int(checkout_id), "user_id": int(user_id), "status": "pending"},
            {"$set": {"status": "canceled", "updated_at": now, "canceled_at": now}},
        )
        checkout = self.subscription_checkouts.find_one({"_id": int(checkout_id), "user_id": int(user_id)}) or checkout
        return checkout, plan

    def confirm_subscription_checkout(self, *, user_id: int, checkout_id: int) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
        checkout, plan = self.get_subscription_checkout(user_id=user_id, checkout_id=checkout_id)
        if not checkout or not plan:
            raise LookupError("Subscription checkout not found.")
        if checkout.get("status") == "paid":
            subscription = self.get_subscription_by_id(
                user_id=user_id,
                subscription_id=int(checkout.get("subscription_id") or 0),
            )
            if not subscription:
                raise LookupError("Subscription checkout has no active subscription.")
            return checkout, subscription, plan
        if checkout.get("status") != "pending":
            raise ValueError("Checkout is not payable.")
        if checkout.get("expires_at") and checkout["expires_at"] <= timezone.now():
            self.subscription_checkouts.update_one(
                {"_id": int(checkout_id)},
                {"$set": {"status": "expired", "updated_at": timezone.now()}},
            )
            raise ValueError("Checkout has expired.")

        subscription, plan = self.subscribe_user(user_id=user_id, plan_id=int(plan["_id"]))
        now = timezone.now()
        self.subscription_checkouts.update_one(
            {"_id": int(checkout_id)},
            {
                "$set": {
                    "status": "paid",
                    "subscription_id": int(subscription["_id"]),
                    "confirmed_at": now,
                    "updated_at": now,
                }
            },
        )
        checkout = self.subscription_checkouts.find_one({"_id": int(checkout_id)}) or checkout
        return checkout, subscription, plan

    def subscribe_user(self, *, user_id: int, plan_id: int) -> tuple[dict[str, Any], dict[str, Any]]:
        plan = self.get_subscription_plan_by_id(plan_id)
        if not plan:
            raise LookupError("Subscription plan not found.")

        now = timezone.now()
        interval_days = int(plan.get("interval_days", 30) or 30)
        self.user_subscriptions.update_many(
            {"user_id": int(user_id), "status": "active"},
            {"$set": {"status": "canceled", "canceled_at": now, "updated_at": now}},
        )
        subscription_id = next_id("user_subscriptions")
        while self.user_subscriptions.find_one({"_id": subscription_id}, {"_id": 1}):
            subscription_id = next_id("user_subscriptions")

        subscription = {
            "_id": subscription_id,
            "user_id": int(user_id),
            "subscription_plan_id": int(plan["_id"]),
            "status": "active",
            "starts_at": now,
            "renews_at": now + timedelta(days=interval_days),
            "ends_at": None,
            "created_at": now,
            "updated_at": now,
        }
        self.user_subscriptions.insert_one(subscription)
        return subscription, plan

    def get_documentations_by_api_ids(self, api_ids: list[int], *, active_only: bool = True) -> dict[int, list[dict[str, Any]]]:
        if not api_ids:
            return {}
        query: dict[str, Any] = {"api_id": {"$in": list({int(value) for value in api_ids})}}
        if active_only:
            query["is_active"] = True

        docs_by_api: dict[int, list[dict[str, Any]]] = {}
        for document in self.documentations.find(query).sort([("order", ASCENDING), ("title", ASCENDING)]):
            docs_by_api.setdefault(int(document["api_id"]), []).append(document)
        return docs_by_api

    def list_documentations(self, *, api_slug: str | None = None, search: str | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"is_active": True}
        if api_slug:
            query["api_slug"] = api_slug
        if search:
            regex = {"$regex": search, "$options": "i"}
            query["$or"] = [{"title": regex}, {"slug": regex}, {"content": regex}, {"api_slug": regex}]
        return list(self.documentations.find(query).sort([("order", ASCENDING), ("title", ASCENDING)]))

    def get_endpoints_by_api_ids(self, api_ids: list[int], *, active_only: bool = True) -> dict[int, list[dict[str, Any]]]:
        if not api_ids:
            return {}
        query: dict[str, Any] = {"api_id": {"$in": list({int(value) for value in api_ids})}}
        if active_only:
            query["is_active"] = True

        endpoints_by_api: dict[int, list[dict[str, Any]]] = {}
        for endpoint in self.api_endpoints.find(query).sort([("group", ASCENDING), ("order", ASCENDING), ("path", ASCENDING)]):
            endpoints_by_api.setdefault(int(endpoint["api_id"]), []).append(endpoint)
        return endpoints_by_api

    def list_endpoints(self, *, api_slug: str | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"is_active": True}
        if api_slug:
            query["api_slug"] = api_slug
        return list(self.api_endpoints.find(query).sort([("group", ASCENDING), ("order", ASCENDING), ("path", ASCENDING)]))

    def pricing_min_map(self, api_ids: list[int]) -> dict[int, str]:
        if not api_ids:
            return {}
        results = self.pricing_plans.aggregate(
            [
                {"$match": {"api_id": {"$in": list({int(value) for value in api_ids})}, "is_active": True}},
                {"$group": {"_id": "$api_id", "min_price": {"$min": "$price"}}},
            ]
        )
        return {int(item["_id"]): format_decimal(item["min_price"]) for item in results}

    def list_similar_apis(self, slug: str, *, include_inactive: bool = False) -> tuple[dict[str, Any] | None, list[dict[str, Any]]]:
        api_doc = self.get_api_by_slug(slug, include_inactive=include_inactive)
        if not api_doc:
            return None, []

        tags = api_doc.get("tags_normalized", [])
        query: dict[str, Any] = {"_id": {"$ne": api_doc["_id"]}}
        if not include_inactive:
            query["status"] = "active"

        candidates = list(
            self.apis.find(
                {
                    **query,
                    "$or": [
                        {"category_id": api_doc.get("category_id")},
                        {"tags_normalized": {"$in": tags or ["__never__"]}},
                    ],
                }
            )
        )

        def similarity_score(candidate: dict[str, Any]) -> float:
            score = 0.0
            if api_doc.get("category_id") and candidate.get("category_id") == api_doc.get("category_id"):
                score += 3
            score += len(set(tags) & set(candidate.get("tags_normalized", [])))
            if candidate.get("is_popular"):
                score += 1
            return score

        ranked = sorted(
            (candidate for candidate in candidates if similarity_score(candidate) > 0),
            key=lambda candidate: (
                -similarity_score(candidate),
                -float(candidate.get("rating", 0)),
                -int(candidate.get("views_count", 0)),
                candidate.get("name", ""),
            ),
        )
        return api_doc, ranked[:5]

    def rate_api(self, *, user_id: int, api_id: int, value: int) -> tuple[dict[str, Any], bool]:
        now = timezone.now()
        created = False
        existing = self.api_ratings.find_one({"user_id": int(user_id), "api_id": int(api_id)})

        if existing:
            self.api_ratings.update_one(
                {"_id": existing["_id"]},
                {"$set": {"value": int(value), "updated_at": now}},
            )
        else:
            created = True
            document = {
                "_id": next_id("api_ratings"),
                "user_id": int(user_id),
                "api_id": int(api_id),
                "value": int(value),
                "created_at": now,
                "updated_at": now,
            }
            try:
                self.api_ratings.insert_one(document)
            except DuplicateKeyError:
                created = False
                self.api_ratings.update_one(
                    {"user_id": int(user_id), "api_id": int(api_id)},
                    {"$set": {"value": int(value), "updated_at": now}},
                )

        aggregate = list(
            self.api_ratings.aggregate(
                [
                    {"$match": {"api_id": int(api_id)}},
                    {
                        "$group": {
                            "_id": "$api_id",
                            "average": {"$avg": "$value"},
                            "count": {"$sum": 1},
                        }
                    },
                ]
            )
        )
        average = aggregate[0]["average"] if aggregate else 0
        count = aggregate[0]["count"] if aggregate else 0

        self.apis.update_one(
            {"_id": int(api_id)},
            {
                "$set": {
                    "rating": float(format_decimal(average)),
                    "rating_count": int(count),
                    "updated_at": now,
                }
            },
        )
        rating_doc = self.api_ratings.find_one({"user_id": int(user_id), "api_id": int(api_id)})
        return rating_doc or {"value": int(value)}, created

    def list_access_grants(self, user_id: int) -> list[dict[str, Any]]:
        return list(self.access_grants.find({"user_id": int(user_id)}).sort([("created_at", DESCENDING)]))

    def list_organizations(self, user_id: int) -> list[dict[str, Any]]:
        return list(self.organizations.find({"owner_user_id": int(user_id)}).sort([("created_at", DESCENDING)]))

    def create_organization(self, *, user_id: int, name: str, region: str) -> dict[str, Any]:
        document = self.build_organization_document(
            {
                "owner_user_id": int(user_id),
                "name": name,
                "region": region,
                "status": "active",
            }
        )
        self.organizations.insert_one(document)
        return document

    def get_access_grants_by_ids(self, grant_ids: list[int]) -> dict[int, dict[str, Any]]:
        if not grant_ids:
            return {}
        return {
            int(grant["_id"]): grant
            for grant in self.access_grants.find({"_id": {"$in": list({int(value) for value in grant_ids})}})
        }

    def list_usage(
        self,
        user_id: int,
        *,
        api_id: int | None = None,
        source: str | None = None,
        search: str | None = None,
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"user_id": int(user_id)}
        if api_id is not None:
            query["api_id"] = int(api_id)
        if source:
            query["source"] = source
        if search:
            regex = {"$regex": search, "$options": "i"}
            query["$or"] = [{"method": regex}, {"path": regex}, {"source": regex}]
        return list(self.api_usage.find(query).sort([("last_used", DESCENDING), ("created_at", DESCENDING)]))

    def record_caller_usage(
        self,
        *,
        user_id: int,
        api_doc: dict[str, Any],
        method: str,
        path: str,
        status_code: int,
        latency_ms: int,
        response_size: int,
    ) -> dict[str, Any]:
        grant = self.access_grants.find_one(
            {"user_id": int(user_id), "api_id": int(api_doc["_id"]), "status": "active"},
            sort=[("created_at", DESCENDING)],
        )
        usage = self.build_usage_document(
            {
                "user_id": int(user_id),
                "api_id": int(api_doc["_id"]),
                "access_grant_id": int(grant["_id"]) if grant else None,
                "source": "caller",
                "requests_count": 1,
                "method": method.upper(),
                "path": path,
                "status_code": int(status_code),
                "latency_ms": int(latency_ms),
                "response_size": int(response_size),
            }
        )
        self.api_usage.insert_one(usage)
        return usage

    def usage_stats(self, user_id: int) -> dict[str, Any]:
        usage_docs = self.list_usage(user_id)
        recent_threshold = timezone.now() - timedelta(days=30)
        recent_usage = [item for item in usage_docs if item.get("last_used") and item["last_used"] >= recent_threshold]
        api_ids = [int(item["api_id"]) for item in usage_docs if item.get("api_id") is not None]
        api_map = self.get_apis_by_ids(api_ids)

        ranked = sorted(
            usage_docs,
            key=lambda item: (
                -int(item.get("requests_count", 0)),
                api_map.get(int(item["api_id"]), {}).get("name", ""),
            ),
        )

        return {
            "total_requests": sum(int(item.get("requests_count", 0)) for item in usage_docs),
            "active_apis": len(usage_docs),
            "recent_usage_count": len(recent_usage),
            "recent_requests": sum(int(item.get("requests_count", 0)) for item in recent_usage),
            "top_apis": [
                {
                    "name": api_map.get(int(item["api_id"]), {}).get("name", ""),
                    "slug": api_map.get(int(item["api_id"]), {}).get("slug", ""),
                    "requests_count": int(item.get("requests_count", 0)),
                }
                for item in ranked[:5]
            ],
        }

    def get_apis_by_ids(self, api_ids: list[int]) -> dict[int, dict[str, Any]]:
        if not api_ids:
            return {}
        return {
            int(api_doc["_id"]): api_doc
            for api_doc in self.apis.find({"_id": {"$in": list({int(value) for value in api_ids})}})
        }

    def build_category_document(self, payload: dict[str, Any], *, current_id: int | None = None) -> dict[str, Any]:
        now = timezone.now()
        document = {
            "_id": current_id or next_id("categories"),
            "name": payload.get("name", "").strip(),
            "name_en": payload.get("name_en", "").strip(),
            "description": payload.get("description", "").strip(),
            "icon": payload.get("icon", "").strip(),
            "color": payload.get("color", "#2563eb").strip() or "#2563eb",
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }
        document["slug"] = payload.get("slug") or unique_slug(
            self.categories,
            document["name_en"] or document["name"] or "category",
            max_length=120,
            current_id=current_id,
        )
        return document

    def build_api_document(self, payload: dict[str, Any], *, current_id: int | None = None) -> dict[str, Any]:
        now = timezone.now()
        tags, tags_normalized = normalize_tags(payload.get("tags") or [])
        document = {
            "_id": current_id or next_id("apis"),
            "name": payload.get("name", "").strip(),
            "name_en": payload.get("name_en", "").strip(),
            "description": payload.get("description", "").strip(),
            "short_description": payload.get("short_description", "").strip(),
            "category_id": payload.get("category_id"),
            "base_url": payload.get("base_url", "").strip(),
            "documentation_url": payload.get("documentation_url", "").strip(),
            "logo": payload.get("logo", "").strip(),
            "banner": payload.get("banner", "").strip(),
            "status": payload.get("status", "active"),
            "is_featured": bool(payload.get("is_featured", False)),
            "is_popular": bool(payload.get("is_popular", False)),
            "views_count": int(payload.get("views_count", 0)),
            "rating": float(payload.get("rating", 0) or 0),
            "rating_count": int(payload.get("rating_count", 0)),
            "tags": tags,
            "tags_normalized": tags_normalized,
            "canonical_version": payload.get("canonical_version", "v1").strip() or "v1",
            "rapidapi_listing_url": payload.get("rapidapi_listing_url", "").strip(),
            "rapidapi_package_slug": payload.get("rapidapi_package_slug", "").strip(),
            "public_auth_scheme": payload.get("public_auth_scheme", "api_key"),
            "support_url": payload.get("support_url", "").strip(),
            "publication_status": payload.get("publication_status", "draft"),
            "created_by_user_id": payload.get("created_by_user_id"),
            "created_by_username": payload.get("created_by_username"),
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }
        document["slug"] = payload.get("slug") or unique_slug(
            self.apis,
            document["name_en"] or document["name"] or "api",
            max_length=160,
            current_id=current_id,
        )
        return document

    def build_pricing_plan_document(
        self,
        payload: dict[str, Any],
        *,
        current_id: int | None = None,
    ) -> dict[str, Any]:
        now = timezone.now()
        return {
            "_id": current_id or next_id("pricing_plans"),
            "api_id": payload.get("api_id"),
            "api_slug": payload.get("api_slug", ""),
            "api_rapidapi_listing_url": payload.get("api_rapidapi_listing_url", ""),
            "name": payload.get("name", "").strip(),
            "plan_type": payload.get("plan_type", "basic"),
            "price": float(payload.get("price", 0) or 0),
            "currency": payload.get("currency", "IRR"),
            "requests_per_month": payload.get("requests_per_month"),
            "requests_per_day": payload.get("requests_per_day"),
            "features": [str(item).strip() for item in payload.get("features") or [] if str(item).strip()],
            "is_popular": bool(payload.get("is_popular", False)),
            "is_active": bool(payload.get("is_active", True)),
            "rapidapi_plan_slug": payload.get("rapidapi_plan_slug", "").strip(),
            "is_listed_on_rapidapi": bool(payload.get("is_listed_on_rapidapi", False)),
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }

    def build_subscription_plan_document(self, payload: dict[str, Any], *, current_id: int | None = None) -> dict[str, Any]:
        now = timezone.now()
        return {
            "_id": current_id or next_id("subscription_plans"),
            "name": payload.get("name", "").strip(),
            "slug": payload.get("slug") or unique_slug(
                self.subscription_plans,
                payload.get("name", "") or "subscription-plan",
                max_length=120,
                current_id=current_id,
            ),
            "description": payload.get("description", "").strip(),
            "plan_type": payload.get("plan_type", "starter"),
            "price": float(payload.get("price", 0) or 0),
            "currency": payload.get("currency", "IRR"),
            "interval": payload.get("interval", "month"),
            "interval_days": int(payload.get("interval_days", 30) or 30),
            "api_publish_limit": payload.get("api_publish_limit"),
            "included_requests": payload.get("included_requests"),
            "features": [str(item).strip() for item in payload.get("features") or [] if str(item).strip()],
            "is_popular": bool(payload.get("is_popular", False)),
            "is_active": bool(payload.get("is_active", True)),
            "sort_order": int(payload.get("sort_order", 100)),
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }

    def build_documentation_document(
        self,
        payload: dict[str, Any],
        *,
        current_id: int | None = None,
    ) -> dict[str, Any]:
        now = timezone.now()
        document = {
            "_id": current_id or next_id("documentations"),
            "api_id": payload.get("api_id"),
            "api_slug": payload.get("api_slug", ""),
            "title": payload.get("title", "").strip(),
            "content": payload.get("content", ""),
            "order": int(payload.get("order", 0)),
            "is_active": bool(payload.get("is_active", True)),
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }
        document["slug"] = payload.get("slug") or unique_slug(
            self.documentations,
            document["title"] or "documentation",
            max_length=160,
            current_id=current_id,
        )
        return document

    def build_endpoint_document(
        self,
        payload: dict[str, Any],
        *,
        current_id: int | None = None,
    ) -> dict[str, Any]:
        now = timezone.now()
        method = str(payload.get("method", "GET")).upper()
        path = str(payload.get("path", "/")).strip() or "/"
        if not path.startswith("/"):
            path = f"/{path}"
        return {
            "_id": current_id or next_id("api_endpoints"),
            "api_id": payload.get("api_id"),
            "api_slug": payload.get("api_slug", ""),
            "method": method,
            "path": path,
            "name": payload.get("name", "").strip() or f"{method} {path}",
            "summary": payload.get("summary", "").strip(),
            "group": payload.get("group", "General").strip() or "General",
            "request_schema": payload.get("request_schema") or {},
            "response_schema": payload.get("response_schema") or {},
            "sample_request": payload.get("sample_request") or {},
            "sample_response": payload.get("sample_response") or {"ok": True},
            "requires_auth": bool(payload.get("requires_auth", True)),
            "is_active": bool(payload.get("is_active", True)),
            "order": int(payload.get("order", 0)),
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }

    def build_access_grant_document(self, payload: dict[str, Any], *, current_id: int | None = None) -> dict[str, Any]:
        now = timezone.now()
        return {
            "_id": current_id or next_id("access_grants"),
            "user_id": payload.get("user_id"),
            "api_id": payload.get("api_id"),
            "pricing_plan_id": payload.get("pricing_plan_id"),
            "source": payload.get("source", "manual"),
            "status": payload.get("status", "pending"),
            "external_subscription_id": payload.get("external_subscription_id", "").strip(),
            "external_customer_id": payload.get("external_customer_id", "").strip(),
            "starts_at": payload.get("starts_at"),
            "ends_at": payload.get("ends_at"),
            "requests_per_day": payload.get("requests_per_day"),
            "requests_per_month": payload.get("requests_per_month"),
            "metadata": payload.get("metadata") or {},
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }

    def build_organization_document(self, payload: dict[str, Any], *, current_id: int | None = None) -> dict[str, Any]:
        now = timezone.now()
        document = {
            "_id": current_id or next_id("organizations"),
            "owner_user_id": int(payload.get("owner_user_id")),
            "name": payload.get("name", "").strip(),
            "region": payload.get("region", "ir-tehran-1").strip() or "ir-tehran-1",
            "status": payload.get("status", "active"),
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }
        document["slug"] = payload.get("slug") or unique_slug(
            self.organizations,
            document["name"] or "organization",
            max_length=120,
            current_id=current_id,
        )
        return document

    def build_rating_document(self, payload: dict[str, Any], *, current_id: int | None = None) -> dict[str, Any]:
        now = timezone.now()
        return {
            "_id": current_id or next_id("api_ratings"),
            "user_id": payload.get("user_id"),
            "api_id": payload.get("api_id"),
            "value": int(payload.get("value", 0)),
            "created_at": payload.get("created_at", now),
            "updated_at": payload.get("updated_at", now),
        }

    def build_usage_document(self, payload: dict[str, Any], *, current_id: int | None = None) -> dict[str, Any]:
        now = timezone.now()
        return {
            "_id": current_id or next_id("api_usage"),
            "user_id": payload.get("user_id"),
            "api_id": payload.get("api_id"),
            "access_grant_id": payload.get("access_grant_id"),
            "source": payload.get("source", "manual"),
            "requests_count": int(payload.get("requests_count", 0)),
            "last_used": payload.get("last_used", now),
            "created_at": payload.get("created_at", now),
            "external_event_id": payload.get("external_event_id", "").strip(),
            "window_started_at": payload.get("window_started_at"),
            "window_ended_at": payload.get("window_ended_at"),
            "method": payload.get("method", ""),
            "path": payload.get("path", ""),
            "status_code": payload.get("status_code"),
            "latency_ms": payload.get("latency_ms"),
            "response_size": payload.get("response_size"),
        }
