from __future__ import annotations

import json
from typing import Any

from django import forms
from django.utils import timezone

from .mongo import get_database, next_id
from .repositories import MongoRepository


API_STATUS_CHOICES = (
    ("active", "Active"),
    ("inactive", "Inactive"),
    ("beta", "Beta"),
    ("deprecated", "Deprecated"),
)
PUBLICATION_STATUS_CHOICES = (
    ("draft", "Draft"),
    ("published", "Published"),
    ("archived", "Archived"),
)
GENERIC_STATUS_CHOICES = (
    ("pending", "Pending"),
    ("active", "Active"),
    ("inactive", "Inactive"),
    ("canceled", "Canceled"),
    ("expired", "Expired"),
    ("paid", "Paid"),
    ("draft", "Draft"),
    ("deployed", "Deployed"),
    ("failed", "Failed"),
)


class StringListField(forms.CharField):
    """Edit a list as one item per line instead of raw JSON."""

    def prepare_value(self, value):
        if isinstance(value, (list, tuple)):
            return "\n".join(str(item) for item in value)
        return value

    def to_python(self, value):
        value = super().to_python(value)
        if not value:
            return []
        items: list[str] = []
        for line in value.replace(",", "\n").splitlines():
            item = line.strip()
            if item and item not in items:
                items.append(item)
        return items


class PrettyJSONField(forms.JSONField):
    def __init__(self, *args, expected_type: type = dict, **kwargs):
        self.expected_type = expected_type
        kwargs.setdefault("required", False)
        kwargs.setdefault("widget", forms.Textarea(attrs={"rows": 7, "dir": "ltr", "class": "json-field"}))
        super().__init__(*args, **kwargs)

    def prepare_value(self, value):
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False, indent=2)
        return super().prepare_value(value)

    def clean(self, value):
        cleaned = super().clean(value)
        if cleaned in self.empty_values:
            return self.expected_type()
        if not isinstance(cleaned, self.expected_type):
            expected = "object" if self.expected_type is dict else "array"
            raise forms.ValidationError(f"Value must be a JSON {expected}.")
        return cleaned


def relation_field(label: str, collection: str, *, required: bool = True, help_text: str = ""):
    field = forms.TypedChoiceField(
        label=label,
        choices=(),
        coerce=int,
        empty_value=None,
        required=required,
        help_text=help_text,
    )
    field.relation_collection = collection
    return field


def datetime_field(label: str, *, required: bool = False):
    return forms.DateTimeField(
        label=label,
        required=required,
        input_formats=["%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S"],
        widget=forms.DateTimeInput(format="%Y-%m-%dT%H:%M", attrs={"type": "datetime-local"}),
    )


class LiveDocumentForm(forms.Form):
    def __init__(self, *args, document=None, database=None, **kwargs):
        self.document = dict(document or {})
        self.database = database if database is not None else get_database()
        initial = {name: self.document[name] for name in self.base_fields if name in self.document}
        supplied_initial = kwargs.pop("initial", {})
        super().__init__(*args, initial={**initial, **supplied_initial}, **kwargs)
        self._load_relation_choices()

    def _load_relation_choices(self):
        for name, field in self.fields.items():
            collection = getattr(field, "relation_collection", None)
            if not collection:
                continue
            documents = list(self.database[collection].find({}))
            choices = [(str(item["_id"]), _relation_label(collection, item)) for item in documents]
            choices.sort(key=lambda item: item[1].casefold())
            current = self.document.get(name)
            if current is not None and str(current) not in {value for value, _label in choices}:
                choices.append((str(current), f"Missing reference #{current}"))
            if not field.required:
                choices.insert(0, ("", "---------"))
            field.choices = choices

    def to_document(self) -> dict[str, Any]:
        payload = dict(self.document)
        payload.update(self.cleaned_data)

        api_id = payload.get("api_id")
        if api_id:
            api_doc = self.database["apis"].find_one({"_id": int(api_id)})
            if api_doc:
                payload["api_slug"] = api_doc.get("slug", "")
                payload["api_rapidapi_listing_url"] = api_doc.get("rapidapi_listing_url", "")

        creator_id = payload.get("created_by_user_id")
        if creator_id:
            user_doc = self.database["users"].find_one({"_id": int(creator_id)})
            if user_doc:
                payload["created_by_username"] = user_doc.get("username", "")
        return payload


class CategoryForm(LiveDocumentForm):
    name = forms.CharField(label="Name", max_length=160)
    name_en = forms.CharField(label="English name", max_length=160, required=False)
    slug = forms.SlugField(label="Slug", max_length=120, required=False, allow_unicode=True, help_text="Generated from name when empty.")
    description = forms.CharField(label="Description", required=False, widget=forms.Textarea(attrs={"rows": 4}))
    icon = forms.CharField(label="Icon name", max_length=80, required=False)
    color = forms.RegexField(label="Color", regex=r"^#[0-9A-Fa-f]{6}$", initial="#2563eb", help_text="Six-digit hex color, for example #2563eb.")


class ApiForm(LiveDocumentForm):
    name = forms.CharField(label="Name", max_length=200)
    name_en = forms.CharField(label="English name", max_length=200, required=False)
    slug = forms.SlugField(label="Slug", max_length=160, required=False, allow_unicode=True, help_text="Generated when empty.")
    description = forms.CharField(label="Description", widget=forms.Textarea(attrs={"rows": 6}))
    short_description = forms.CharField(label="Short description", max_length=300, required=False, widget=forms.Textarea(attrs={"rows": 3}))
    category_id = relation_field("Category", "categories", required=False)
    base_url = forms.URLField(label="Provider base URL")
    documentation_url = forms.URLField(label="Documentation URL", required=False)
    support_url = forms.URLField(label="Support URL", required=False)
    logo = forms.URLField(label="Logo URL", required=False)
    banner = forms.URLField(label="Banner URL", required=False)
    status = forms.ChoiceField(label="Status", choices=API_STATUS_CHOICES, initial="active")
    publication_status = forms.ChoiceField(label="Publication", choices=PUBLICATION_STATUS_CHOICES, initial="draft")
    public_auth_scheme = forms.ChoiceField(
        label="Public authentication",
        choices=(("api_key", "API key"), ("bearer", "Bearer token"), ("oauth2", "OAuth 2"), ("basic", "Basic auth"), ("none", "None")),
        initial="api_key",
    )
    canonical_version = forms.CharField(label="Version", max_length=40, initial="v1")
    tags = StringListField(label="Tags", required=False, widget=forms.Textarea(attrs={"rows": 4}), help_text="One tag per line or comma-separated.")
    is_featured = forms.BooleanField(label="Featured", required=False)
    is_popular = forms.BooleanField(label="Popular", required=False)
    rapidapi_listing_url = forms.URLField(label="RapidAPI listing URL", required=False)
    rapidapi_package_slug = forms.SlugField(label="RapidAPI package slug", required=False)
    created_by_user_id = relation_field("Owner", "users", required=False)


class PricingPlanForm(LiveDocumentForm):
    api_id = relation_field("API", "apis")
    name = forms.CharField(label="Plan name", max_length=100)
    plan_type = forms.ChoiceField(label="Plan type", choices=(("free", "Free"), ("basic", "Basic"), ("pro", "Pro"), ("enterprise", "Enterprise")), initial="basic")
    price = forms.DecimalField(label="Price", min_value=0, decimal_places=2, initial=0)
    currency = forms.RegexField(label="Currency", regex=r"^[A-Z]{3}$", initial="IRR", help_text="Three-letter ISO code.")
    requests_per_month = forms.IntegerField(label="Requests per month", min_value=0, required=False)
    requests_per_day = forms.IntegerField(label="Requests per day", min_value=0, required=False)
    features = StringListField(label="Features", required=False, widget=forms.Textarea(attrs={"rows": 5}), help_text="One feature per line.")
    is_popular = forms.BooleanField(label="Popular", required=False)
    is_active = forms.BooleanField(label="Active", required=False, initial=True)
    rapidapi_plan_slug = forms.SlugField(label="RapidAPI plan slug", required=False)
    is_listed_on_rapidapi = forms.BooleanField(label="Listed on RapidAPI", required=False)


class SubscriptionPlanForm(LiveDocumentForm):
    name = forms.CharField(label="Plan name", max_length=100)
    slug = forms.SlugField(label="Slug", max_length=120, required=False, help_text="Generated when empty.")
    description = forms.CharField(label="Description", required=False, widget=forms.Textarea(attrs={"rows": 4}))
    plan_type = forms.ChoiceField(label="Plan type", choices=(("starter", "Starter"), ("growth", "Growth"), ("scale", "Scale"), ("enterprise", "Enterprise")), initial="starter")
    price = forms.DecimalField(label="Price", min_value=0, decimal_places=2, initial=0)
    currency = forms.RegexField(label="Currency", regex=r"^[A-Z]{3}$", initial="IRR")
    interval = forms.ChoiceField(label="Billing interval", choices=(("month", "Monthly"), ("year", "Yearly"), ("one_time", "One time")), initial="month")
    interval_days = forms.IntegerField(label="Interval days", min_value=1, initial=30)
    api_publish_limit = forms.IntegerField(label="API publishing limit", min_value=0, required=False)
    included_requests = forms.IntegerField(label="Included requests", min_value=0, required=False)
    features = StringListField(label="Features", required=False, widget=forms.Textarea(attrs={"rows": 5}))
    is_popular = forms.BooleanField(label="Popular", required=False)
    is_active = forms.BooleanField(label="Active", required=False, initial=True)
    sort_order = forms.IntegerField(label="Sort order", initial=100)


class DocumentationForm(LiveDocumentForm):
    api_id = relation_field("API", "apis")
    title = forms.CharField(label="Title", max_length=200)
    slug = forms.SlugField(label="Slug", max_length=160, required=False, allow_unicode=True, help_text="Generated when empty.")
    content = forms.CharField(label="Content", widget=forms.Textarea(attrs={"rows": 14}))
    order = forms.IntegerField(label="Order", min_value=0, initial=0)
    is_active = forms.BooleanField(label="Active", required=False, initial=True)


class EndpointForm(LiveDocumentForm):
    api_id = relation_field("API", "apis")
    method = forms.ChoiceField(label="HTTP method", choices=tuple((value, value) for value in ("GET", "POST", "PUT", "PATCH", "DELETE")), initial="GET")
    path = forms.CharField(label="Path", max_length=500, initial="/", help_text="Path only, for example /v1/search/{id}.")
    name = forms.CharField(label="Name", max_length=200)
    summary = forms.CharField(label="Summary", required=False, widget=forms.Textarea(attrs={"rows": 3}))
    group = forms.CharField(label="Group", max_length=100, initial="General")
    request_schema = PrettyJSONField(label="Request schema", expected_type=dict, initial=dict)
    response_schema = PrettyJSONField(label="Response schema", expected_type=dict, initial=dict)
    sample_request = PrettyJSONField(label="Sample request", expected_type=dict, initial=dict)
    sample_response = PrettyJSONField(label="Sample response", expected_type=dict, initial=lambda: {"ok": True})
    requires_auth = forms.BooleanField(label="Requires authentication", required=False, initial=True)
    is_active = forms.BooleanField(label="Active", required=False, initial=True)
    order = forms.IntegerField(label="Order", min_value=0, initial=0)


class AccessGrantForm(LiveDocumentForm):
    user_id = relation_field("User", "users")
    api_id = relation_field("API", "apis")
    pricing_plan_id = relation_field("Pricing plan", "pricing_plans", required=False)
    source = forms.CharField(label="Source", max_length=80, initial="manual")
    status = forms.ChoiceField(label="Status", choices=GENERIC_STATUS_CHOICES, initial="active")
    external_subscription_id = forms.CharField(label="External subscription ID", max_length=160, required=False)
    external_customer_id = forms.CharField(label="External customer ID", max_length=160, required=False)
    starts_at = datetime_field("Starts at")
    ends_at = datetime_field("Ends at")
    requests_per_day = forms.IntegerField(label="Requests per day", min_value=0, required=False)
    requests_per_month = forms.IntegerField(label="Requests per month", min_value=0, required=False)
    metadata = PrettyJSONField(label="Metadata", expected_type=dict, initial=dict)


class UserSubscriptionForm(LiveDocumentForm):
    user_id = relation_field("User", "users")
    subscription_plan_id = relation_field("Subscription plan", "subscription_plans")
    status = forms.ChoiceField(label="Status", choices=GENERIC_STATUS_CHOICES, initial="active")
    starts_at = datetime_field("Starts at")
    renews_at = datetime_field("Renews at")
    ends_at = datetime_field("Ends at")
    canceled_at = datetime_field("Canceled at")


class SubscriptionCheckoutForm(LiveDocumentForm):
    user_id = relation_field("User", "users")
    subscription_plan_id = relation_field("Subscription plan", "subscription_plans")
    subscription_id = relation_field("Created subscription", "user_subscriptions", required=False)
    status = forms.ChoiceField(label="Status", choices=GENERIC_STATUS_CHOICES, initial="pending")
    amount = forms.DecimalField(label="Amount", min_value=0, decimal_places=2, initial=0)
    currency = forms.RegexField(label="Currency", regex=r"^[A-Z]{3}$", initial="IRR")
    gateway = forms.CharField(label="Gateway", max_length=80, initial="manual")
    reference = forms.CharField(label="Reference", max_length=160, required=False, help_text="Generated when empty.")
    expires_at = datetime_field("Expires at")
    confirmed_at = datetime_field("Confirmed at")
    canceled_at = datetime_field("Canceled at")


class OrganizationForm(LiveDocumentForm):
    owner_user_id = relation_field("Owner", "users")
    name = forms.CharField(label="Organization name", max_length=120)
    slug = forms.SlugField(label="Slug", max_length=120, required=False, help_text="Generated when empty.")
    region = forms.ChoiceField(label="Region", choices=(("ir-tehran-1", "Tehran"), ("ir-mashhad-1", "Mashhad"), ("eu-frankfurt-1", "Frankfurt")), initial="ir-tehran-1")
    status = forms.ChoiceField(label="Status", choices=GENERIC_STATUS_CHOICES, initial="active")


class StudioFlowForm(LiveDocumentForm):
    user_id = relation_field("User", "users")
    api_id = relation_field("API", "apis")
    name = forms.CharField(label="Flow name", max_length=120)
    slug = forms.SlugField(label="Slug", max_length=120, required=False, help_text="Generated when empty.")
    nodes = PrettyJSONField(label="Nodes", expected_type=list, initial=list, help_text="JSON array of flow nodes.")
    region = forms.ChoiceField(label="Region", choices=(("ir-tehran-1", "Tehran"), ("ir-mashhad-1", "Mashhad"), ("eu-frankfurt-1", "Frankfurt")), initial="ir-tehran-1")
    status = forms.ChoiceField(label="Status", choices=GENERIC_STATUS_CHOICES, initial="draft")
    latency_ms = forms.IntegerField(label="Latency (ms)", min_value=0, initial=0)


class ApiProjectForm(LiveDocumentForm):
    user_id = relation_field("User", "users")
    project_name = forms.CharField(label="Project name", max_length=120)
    language = forms.ChoiceField(label="Language", choices=tuple((value, label) for value, label in (("python", "Python"), ("node", "Node.js"), ("go", "Go"), ("php", "PHP"), ("custom", "Custom"))), initial="custom")
    package_name = forms.SlugField(label="Package name", max_length=120, required=False)
    api_id = relation_field("API", "apis", required=False)
    base_url = forms.URLField(label="Base URL", required=False)
    auth_header = forms.CharField(label="Authentication header", max_length=120, initial="X-API-Key")
    include_docker = forms.BooleanField(label="Include Docker", required=False, initial=True)
    files = PrettyJSONField(label="Generated files", expected_type=list, initial=list, help_text="JSON array; normally generated by project workflow.")


class UsageForm(LiveDocumentForm):
    user_id = relation_field("User", "users", required=False)
    api_id = relation_field("API", "apis", required=False)
    access_grant_id = relation_field("Access grant", "access_grants", required=False)
    source = forms.CharField(label="Source", required=False)
    requests_count = forms.IntegerField(label="Requests", min_value=0, required=False)
    last_used = datetime_field("Last used")
    method = forms.CharField(label="Method", required=False)
    path = forms.CharField(label="Path", required=False)
    status_code = forms.IntegerField(label="Status code", required=False)
    latency_ms = forms.IntegerField(label="Latency (ms)", required=False)
    response_size = forms.IntegerField(label="Response size", required=False)


FORM_CLASSES = {
    "categories": CategoryForm,
    "apis": ApiForm,
    "pricing_plans": PricingPlanForm,
    "subscription_plans": SubscriptionPlanForm,
    "documentations": DocumentationForm,
    "api_endpoints": EndpointForm,
    "access_grants": AccessGrantForm,
    "user_subscriptions": UserSubscriptionForm,
    "subscription_checkouts": SubscriptionCheckoutForm,
    "organizations": OrganizationForm,
    "studio_flows": StudioFlowForm,
    "api_projects": ApiProjectForm,
    "api_usage": UsageForm,
}

BUILDER_METHODS = {
    "categories": "build_category_document",
    "apis": "build_api_document",
    "pricing_plans": "build_pricing_plan_document",
    "subscription_plans": "build_subscription_plan_document",
    "documentations": "build_documentation_document",
    "api_endpoints": "build_endpoint_document",
    "access_grants": "build_access_grant_document",
    "organizations": "build_organization_document",
    "studio_flows": "build_studio_flow_document",
    "api_projects": "build_api_project_document",
}


def get_live_document_form(collection: str):
    return FORM_CLASSES[collection]


def build_live_document(collection: str, payload: dict[str, Any], *, current_id=None) -> dict[str, Any]:
    now = timezone.now()
    payload = {**payload, "updated_at": now}
    repository = MongoRepository()
    builder_name = BUILDER_METHODS.get(collection)
    if builder_name:
        document = getattr(repository, builder_name)(payload, current_id=current_id)
        for key, value in payload.items():
            document.setdefault(key, value)
        return document

    document_id = current_id or next_id(collection)
    document = {
        **payload,
        "_id": document_id,
        "created_at": payload.get("created_at", now),
        "updated_at": now,
    }
    if collection == "subscription_checkouts" and not document.get("reference"):
        document["reference"] = f"chk_{document_id}"
    return document


def _relation_label(collection: str, document: dict[str, Any]) -> str:
    document_id = document.get("_id")
    if collection == "users":
        title = document.get("username") or document.get("email") or f"User {document_id}"
    elif collection == "apis":
        title = document.get("name_en") or document.get("name") or document.get("slug") or f"API {document_id}"
    elif collection in {"pricing_plans", "subscription_plans"}:
        title = document.get("name") or document.get("slug") or f"Plan {document_id}"
        if document.get("api_slug"):
            title = f"{title} ({document['api_slug']})"
    elif collection == "user_subscriptions":
        title = f"Subscription {document_id} / user {document.get('user_id', '-')}"
    elif collection == "access_grants":
        title = f"Grant {document_id} / user {document.get('user_id', '-')}"
    else:
        title = document.get("name") or document.get("title") or document.get("slug") or f"Document {document_id}"
    return f"{title} [#{document_id}]"
