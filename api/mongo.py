from __future__ import annotations

import os
import threading
from datetime import timezone as datetime_timezone
from typing import Any

from bson.codec_options import CodecOptions
from django.conf import settings
from django.db import connections
from pymongo import ASCENDING, DESCENDING, ReturnDocument
from pymongo.database import Database


APPLICATION_COLLECTIONS = (
    "users",
    "categories",
    "apis",
    "pricing_plans",
    "subscription_plans",
    "documentations",
    "api_endpoints",
    "sessions",
    "cli_auth_codes",
    "legacy_tokens",
    "access_grants",
    "api_ratings",
    "api_usage",
    "organizations",
    "studio_flows",
    "api_projects",
    "project_deployments",
    "subscription_checkouts",
    "user_subscriptions",
    "counters",
)

_index_guard = threading.RLock()
_indexed_databases: set[tuple[int, str]] = set()


def get_client():
    """Return Django's process-safe PyMongo client pool."""
    connection = connections["default"]
    connection.ensure_connection()
    return connection.connection


def get_database() -> Database:
    """Return the active database, including Django's isolated test database."""
    connection = connections["default"]
    connection.ensure_connection()
    # Django's backend expects naive UTC values internally and makes them
    # aware in its ORM converter. IranAPI's raw document layer compares
    # timestamps directly, so give only that layer aware UTC datetimes.
    database = connection.database.with_options(
        codec_options=CodecOptions(tz_aware=True, tzinfo=datetime_timezone.utc)
    )
    ensure_indexes(database)
    return database


def ping_database() -> bool:
    return bool(get_client().admin.command("ping").get("ok"))


def close_database() -> None:
    """Close Django's shared MongoClient pool (mainly useful in tests)."""
    connection = connections["default"]
    database_name = str(connection.settings_dict.get("NAME", ""))
    with _index_guard:
        _indexed_databases.discard((os.getpid(), database_name))
    close_pool = getattr(connection, "close_pool", None)
    if close_pool is not None:
        close_pool()


def reset_database() -> None:
    """Clear only IranAPI document collections in an isolated/explicit database."""
    database = get_database()
    database_name = database.name
    is_test_database = database_name.startswith("test_")
    if not (is_test_database or settings.MONGODB_ALLOW_RESET):
        raise RuntimeError(
            "MongoDB reset refused. Use a test_* database or explicitly set "
            "IRANAPI_MONGODB_ALLOW_RESET=true."
        )
    for collection_name in APPLICATION_COLLECTIONS:
        database.drop_collection(collection_name)
    with _index_guard:
        _indexed_databases.discard((os.getpid(), database_name))
    ensure_indexes(database)


def next_id(collection_name: str) -> int:
    """Allocate a durable, cross-process integer id using an atomic counter."""
    if collection_name not in APPLICATION_COLLECTIONS or collection_name == "counters":
        raise ValueError(f"Unknown counter collection: {collection_name}")

    database = get_database()
    latest = database[collection_name].find_one(
        {"_id": {"$type": "number"}},
        projection={"_id": 1},
        sort=[("_id", DESCENDING)],
    )
    if latest:
        database["counters"].update_one(
            {"_id": collection_name},
            {"$max": {"value": int(latest["_id"])}},
            upsert=True,
        )

    counter = database["counters"].find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(counter["value"])


def ensure_indexes(database: Database | Any | None = None) -> None:
    """Create uniqueness, lookup, and expiry indexes idempotently."""
    db = database if database is not None else get_database()
    key = (os.getpid(), str(getattr(db, "name", id(db))))
    with _index_guard:
        if key in _indexed_databases:
            return

        db["users"].create_index("username_normalized", unique=True, name="uq_users_username")
        db["users"].create_index(
            "email_normalized",
            unique=True,
            partialFilterExpression={"email_normalized": {"$gt": ""}},
            name="uq_users_email",
        )
        db["users"].create_index(
            "profile.api_key_fingerprint",
            unique=True,
            partialFilterExpression={"profile.api_key_fingerprint": {"$type": "string"}},
            name="uq_users_api_key_fingerprint",
        )
        db["categories"].create_index("slug", unique=True, name="uq_categories_slug")
        db["apis"].create_index("slug", unique=True, name="uq_apis_slug")
        db["apis"].create_index(
            [("status", ASCENDING), ("is_featured", DESCENDING), ("created_at", DESCENDING)],
            name="ix_apis_catalog",
        )
        db["apis"].create_index([("category_id", ASCENDING), ("status", ASCENDING)], name="ix_apis_category")
        db["apis"].create_index("created_by_user_id", name="ix_apis_owner")
        db["pricing_plans"].create_index("api_id", name="ix_pricing_api")
        db["subscription_plans"].create_index("slug", unique=True, name="uq_subscription_plans_slug")
        db["documentations"].create_index(
            [("api_id", ASCENDING), ("slug", ASCENDING)], unique=True, name="uq_docs_api_slug"
        )
        db["api_endpoints"].create_index(
            [("api_id", ASCENDING), ("method", ASCENDING), ("path", ASCENDING)],
            unique=True,
            name="uq_endpoints_api_method_path",
        )
        db["sessions"].create_index("expires_at", expireAfterSeconds=0, name="ttl_sessions")
        db["sessions"].create_index("user_id", name="ix_sessions_user")
        db["cli_auth_codes"].create_index("expires_at", expireAfterSeconds=0, name="ttl_cli_auth_codes")
        db["legacy_tokens"].create_index("key", unique=True, name="uq_legacy_tokens_key")
        db["legacy_tokens"].create_index("user_id", unique=True, name="uq_legacy_tokens_user")
        db["access_grants"].create_index(
            [("user_id", ASCENDING), ("api_id", ASCENDING)], unique=True, name="uq_grants_user_api"
        )
        db["access_grants"].create_index([("user_id", ASCENDING), ("status", ASCENDING)], name="ix_grants_status")
        db["api_ratings"].create_index(
            [("user_id", ASCENDING), ("api_id", ASCENDING)], unique=True, name="uq_ratings_user_api"
        )
        db["api_usage"].create_index(
            [("user_id", ASCENDING), ("last_used", DESCENDING)], name="ix_usage_user_recent"
        )
        db["api_usage"].create_index(
            "external_event_id",
            unique=True,
            partialFilterExpression={"external_event_id": {"$gt": ""}},
            name="uq_usage_event",
        )
        db["organizations"].create_index(
            [("owner_user_id", ASCENDING), ("slug", ASCENDING)], unique=True, name="uq_org_owner_slug"
        )
        db["studio_flows"].create_index(
            [("user_id", ASCENDING), ("slug", ASCENDING)], unique=True, name="uq_flows_user_slug"
        )
        db["api_projects"].create_index(
            [("user_id", ASCENDING), ("slug", ASCENDING)], unique=True, name="uq_projects_user_slug"
        )
        db["project_deployments"].create_index(
            [("user_id", ASCENDING), ("slug", ASCENDING)], unique=True, name="uq_deployments_user_slug"
        )
        db["project_deployments"].create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)], name="ix_deployments_user_recent"
        )
        db["subscription_checkouts"].create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)], name="ix_checkouts_user_recent"
        )
        db["user_subscriptions"].create_index(
            [("user_id", ASCENDING), ("status", ASCENDING)], name="ix_subscriptions_user_status"
        )
        _indexed_databases.add(key)
