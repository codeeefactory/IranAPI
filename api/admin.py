from typing import Any

from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.shortcuts import redirect, render
from django.urls import path, reverse
from pymongo.errors import DuplicateKeyError

from .admin_forms import build_live_document, get_live_document_form
from .models import (
    AccessGrantsSection,
    ApiEndpointsSection,
    ApiProjectsSection,
    ApiUsageSection,
    ApisSection,
    CategoriesSection,
    DocumentationsSection,
    LiveDataConsole,
    OrganizationsSection,
    PricingPlansSection,
    StudioFlowsSection,
    SubscriptionCheckoutsSection,
    SubscriptionPlansSection,
    UserSubscriptionsSection,
)
from .mongo import get_database


LIVE_COLLECTIONS = {
    "categories": "دسته‌بندی‌ها",
    "apis": "APIها",
    "pricing_plans": "پلن‌های قیمت API",
    "subscription_plans": "پلن‌های اشتراک",
    "documentations": "مستندات",
    "api_endpoints": "Endpointها",
    "access_grants": "دسترسی‌ها",
    "user_subscriptions": "اشتراک کاربران",
    "subscription_checkouts": "پرداخت‌های اشتراک",
    "organizations": "سازمان‌ها",
    "studio_flows": "Flowهای Studio",
    "api_projects": "پروژه‌های تولیدشده",
    "api_usage": "مصرف API",
}

READ_ONLY_COLLECTIONS = {"api_usage"}
DEVELOPER_COLLECTIONS = {"apis", "pricing_plans", "documentations", "api_endpoints"}

COLLECTION_SECTION_MODELS = {
    CategoriesSection: "categories",
    ApisSection: "apis",
    PricingPlansSection: "pricing_plans",
    SubscriptionPlansSection: "subscription_plans",
    DocumentationsSection: "documentations",
    ApiEndpointsSection: "api_endpoints",
    AccessGrantsSection: "access_grants",
    UserSubscriptionsSection: "user_subscriptions",
    SubscriptionCheckoutsSection: "subscription_checkouts",
    OrganizationsSection: "organizations",
    StudioFlowsSection: "studio_flows",
    ApiProjectsSection: "api_projects",
    ApiUsageSection: "api_usage",
}
COLLECTION_SECTION_BY_NAME = {collection: model for model, collection in COLLECTION_SECTION_MODELS.items()}


def _developer_document(request):
    user = getattr(request, "user", None)
    if not user or not user.is_active or not user.is_staff or user.is_superuser:
        return None
    return get_database()["users"].find_one(
        {"username_normalized": str(user.username).strip().casefold(), "account_type": "api_developer"}
    )


def _has_collection_access(request, collection: str | None = None) -> bool:
    if getattr(getattr(request, "user", None), "is_superuser", False):
        return True
    developer = _developer_document(request)
    return bool(developer and (collection is None or collection in DEVELOPER_COLLECTIONS))


def _owned_api_documents(developer: dict[str, Any]) -> list[dict[str, Any]]:
    return list(
        get_database()["apis"].find(
            {"created_by_user_id": int(developer["_id"])},
            {"_id": 1, "slug": 1, "name": 1, "name_en": 1},
        )
    )


def _collection_scope(request, collection: str) -> dict[str, Any]:
    if getattr(request.user, "is_superuser", False):
        return {}
    developer = _developer_document(request)
    if not developer or collection not in DEVELOPER_COLLECTIONS:
        raise PermissionDenied
    if collection == "apis":
        return {"created_by_user_id": int(developer["_id"])}
    owned_apis = _owned_api_documents(developer)
    return {
        "$or": [
            {"api_id": {"$in": [int(api_doc["_id"]) for api_doc in owned_apis]}},
            {"api_slug": {"$in": [str(api_doc.get("slug") or "") for api_doc in owned_apis]}},
        ]
    }


@admin.register(LiveDataConsole)
class LiveDataConsoleAdmin(admin.ModelAdmin):
    change_list_template = "admin/live_data/index.html"
    collection_name: str | None = None

    def has_module_permission(self, request):
        return _has_collection_access(request, self.collection_name)

    def has_view_permission(self, request, obj=None):
        return _has_collection_access(request, self.collection_name)

    def has_add_permission(self, request):
        return bool(
            self.collection_name
            and self.collection_name not in READ_ONLY_COLLECTIONS
            and _has_collection_access(request, self.collection_name)
        )

    def has_change_permission(self, request, obj=None):
        return _has_collection_access(request, self.collection_name)

    def has_delete_permission(self, request, obj=None):
        return bool(
            self.collection_name not in READ_ONLY_COLLECTIONS
            and _has_collection_access(request, self.collection_name)
        )

    def get_urls(self):
        if self.collection_name:
            return admin.ModelAdmin.get_urls(self)
        urls = super().get_urls()
        custom_urls = [
            path(
                "<slug:collection>/",
                self.admin_site.admin_view(self.collection_view),
                name="api_livedataconsole_collection",
            ),
            path(
                "<slug:collection>/add/",
                self.admin_site.admin_view(self.document_add_view),
                name="api_livedataconsole_add",
            ),
            path(
                "<slug:collection>/<str:document_id>/change/",
                self.admin_site.admin_view(self.document_change_view),
                name="api_livedataconsole_change",
            ),
            path(
                "<slug:collection>/<str:document_id>/delete/",
                self.admin_site.admin_view(self.document_delete_view),
                name="api_livedataconsole_delete",
            ),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        self._require_access(request, self.collection_name)
        if self.collection_name:
            return self.collection_view(request, self.collection_name)

        database = get_database()
        collections = [
            {
                "slug": slug,
                "label": label,
                "count": database[slug].count_documents(_collection_scope(request, slug)),
                "read_only": slug in READ_ONLY_COLLECTIONS,
                "url": _section_url(slug, "changelist"),
            }
            for slug, label in LIVE_COLLECTIONS.items()
            if _has_collection_access(request, slug)
        ]
        context = {
            **self.admin_site.each_context(request),
            "title": "کنسول داده زنده IranAPI",
            "collections": collections,
            "opts": self.model._meta,
        }
        return render(request, self.change_list_template, context)

    def collection_view(self, request, collection):
        self._require_access(request, collection)
        label = _collection_label(collection)
        documents = list(get_database()[collection].find(_collection_scope(request, collection)).sort([("_id", -1)]))
        rows = [
            {
                "id": document.get("_id"),
                "title": _document_title(document),
                "status": document.get("status") or ("active" if document.get("is_active") else ""),
                "updated_at": document.get("updated_at") or document.get("created_at"),
                "change_url": self._change_url(collection, document.get("_id")),
                "delete_url": self._delete_url(collection, document.get("_id")),
            }
            for document in documents
        ]
        context = {
            **self.admin_site.each_context(request),
            "title": label,
            "collection": collection,
            "rows": rows,
            "read_only": collection in READ_ONLY_COLLECTIONS,
            "add_url": self._add_url(collection),
            "index_url": reverse("admin:api_livedataconsole_changelist"),
            "opts": self.model._meta,
        }
        return render(request, "admin/live_data/collection.html", context)

    def document_add_view(self, request, collection):
        self._require_access(request, collection)
        _collection_label(collection)
        if collection in READ_ONLY_COLLECTIONS:
            raise Http404
        initial = {}
        return self._document_form_view(request, collection, None, initial)

    def document_change_view(self, request, collection, document_id):
        self._require_access(request, collection)
        _collection_label(collection)
        document = _get_document(collection, document_id)
        self._require_document_access(request, collection, document)
        return self._document_form_view(request, collection, document_id, document)

    def _document_form_view(self, request, collection, document_id, initial):
        read_only = collection in READ_ONLY_COLLECTIONS
        form_class = get_live_document_form(collection)
        form = form_class(
            request.POST or None,
            document=initial,
            database=get_database(),
        )
        developer = _developer_document(request)
        if developer:
            if collection == "apis":
                form.fields.pop("created_by_user_id", None)
            elif "api_id" in form.fields:
                owned_apis = _owned_api_documents(developer)
                form.fields["api_id"].choices = [
                    (str(api_doc["_id"]), _document_title(api_doc)) for api_doc in owned_apis
                ]
        if read_only:
            for field in form.fields.values():
                field.disabled = True
        if request.method == "POST" and not read_only and form.is_valid():
            payload = form.to_document()
            if developer and collection == "apis":
                payload["created_by_user_id"] = int(developer["_id"])
                payload["created_by_username"] = developer["username"]
            document = build_live_document(
                collection,
                payload,
                current_id=_document_id(document_id) if document_id is not None else None,
            )
            try:
                if document_id is None:
                    get_database()[collection].insert_one(document)
                    saved_id = document["_id"]
                else:
                    current = _get_document(collection, document_id)
                    document["_id"] = current["_id"]
                    get_database()[collection].replace_one({"_id": current["_id"]}, document)
                    saved_id = current["_id"]
            except (DuplicateKeyError, TypeError, ValueError) as exc:
                form.add_error(None, str(exc))
            else:
                messages.success(request, "سند زنده ذخیره شد.")
                return redirect(self._change_url(collection, saved_id))

        context = {
            **self.admin_site.each_context(request),
            "title": f"{LIVE_COLLECTIONS[collection]} / {'افزودن' if document_id is None else document_id}",
            "collection": collection,
            "document_id": document_id,
            "form": form,
            "read_only": read_only,
            "collection_url": self._collection_url(collection),
            "delete_url": (
                self._delete_url(collection, document_id)
                if document_id is not None and not read_only
                else None
            ),
            "opts": self.model._meta,
        }
        return render(request, "admin/live_data/edit.html", context)

    def document_delete_view(self, request, collection, document_id):
        self._require_access(request, collection)
        _collection_label(collection)
        if collection in READ_ONLY_COLLECTIONS:
            raise Http404
        document = _get_document(collection, document_id)
        self._require_document_access(request, collection, document)
        if request.method == "POST":
            _delete_document(collection, document)
            messages.success(request, "سند زنده حذف شد.")
            return redirect(self._collection_url(collection))
        context = {
            **self.admin_site.each_context(request),
            "title": "تأیید حذف سند زنده",
            "collection": collection,
            "document": document,
            "collection_url": self._collection_url(collection),
            "opts": self.model._meta,
        }
        return render(request, "admin/live_data/delete.html", context)

    def add_view(self, request, form_url="", extra_context=None):
        if not self.collection_name:
            raise Http404
        return self.document_add_view(request, self.collection_name)

    def change_view(self, request, object_id, form_url="", extra_context=None):
        if not self.collection_name:
            raise Http404
        return self.document_change_view(request, self.collection_name, object_id)

    def delete_view(self, request, object_id, extra_context=None):
        if not self.collection_name:
            raise Http404
        return self.document_delete_view(request, self.collection_name, object_id)

    def _collection_url(self, collection):
        if self.collection_name:
            return _section_url(collection, "changelist")
        return reverse("admin:api_livedataconsole_collection", args=[collection])

    def _add_url(self, collection):
        if self.collection_name:
            return _section_url(collection, "add")
        return reverse("admin:api_livedataconsole_add", args=[collection])

    def _change_url(self, collection, document_id):
        if self.collection_name:
            return _section_url(collection, "change", document_id)
        return reverse("admin:api_livedataconsole_change", args=[collection, document_id])

    def _delete_url(self, collection, document_id):
        if self.collection_name:
            return _section_url(collection, "delete", document_id)
        return reverse("admin:api_livedataconsole_delete", args=[collection, document_id])

    @staticmethod
    def _require_access(request, collection=None):
        if not _has_collection_access(request, collection):
            raise PermissionDenied

    @staticmethod
    def _require_document_access(request, collection, document):
        if getattr(request.user, "is_superuser", False):
            return
        scope = {**_collection_scope(request, collection), "_id": document["_id"]}
        if not get_database()[collection].find_one(scope, {"_id": 1}):
            raise PermissionDenied


class CollectionSectionAdmin(LiveDataConsoleAdmin):
    change_list_template = "admin/live_data/collection.html"


for section_model, collection_name in COLLECTION_SECTION_MODELS.items():
    section_admin = type(
        f"{section_model.__name__}Admin",
        (CollectionSectionAdmin,),
        {"collection_name": collection_name, "__module__": __name__},
    )
    admin.site.register(section_model, section_admin)


def _section_url(collection: str, action: str, document_id=None):
    model = COLLECTION_SECTION_BY_NAME[collection]
    route_name = f"admin:{model._meta.app_label}_{model._meta.model_name}_{action}"
    return reverse(route_name, args=[document_id] if document_id is not None else None)


def _collection_label(collection: str) -> str:
    if collection not in LIVE_COLLECTIONS:
        raise Http404
    return LIVE_COLLECTIONS[collection]


def _document_id(value: str):
    try:
        return int(value)
    except (TypeError, ValueError):
        return value


def _get_document(collection: str, document_id: str) -> dict[str, Any]:
    document = get_database()[collection].find_one({"_id": _document_id(document_id)})
    if not document:
        raise Http404
    return document


def _document_title(document: dict[str, Any]) -> str:
    for field in ("name", "title", "project_name", "slug", "path", "source"):
        if document.get(field):
            return str(document[field])
    return f"سند {document.get('_id')}"


def _delete_document(collection: str, document: dict[str, Any]):
    database = get_database()
    document_id = document["_id"]
    if collection == "apis":
        for related in ("pricing_plans", "documentations", "api_endpoints", "access_grants", "api_ratings"):
            database[related].delete_many({"api_id": document_id})
    elif collection == "categories":
        database["apis"].update_many({"category_id": document_id}, {"$set": {"category_id": None}})
    database[collection].delete_one({"_id": document_id})
