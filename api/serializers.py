from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from typing import Any
from .models import Category, API, PricingPlan, Documentation, UserProfile, APIUsage
from .repositories import MongoUser, format_decimal


def mask_secret(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 10:
        return "*" * len(value)
    return f"{value[:6]}...{value[-4:]}"


def serialize_category_summary(category: dict[str, Any] | None) -> dict[str, Any] | None:
    if not category:
        return None
    return {
        "id": int(category["_id"]),
        "name": category.get("name", ""),
        "name_en": category.get("name_en", ""),
        "slug": category.get("slug", ""),
        "description": category.get("description", ""),
        "icon": category.get("icon", ""),
        "color": category.get("color", "#2563eb"),
        "apis_count": int(category.get("active_apis_count", 0)),
        "created_at": category.get("created_at"),
        "updated_at": category.get("updated_at"),
    }


serialize_category = serialize_category_summary


def build_session_payload(user_doc: dict[str, Any] | MongoUser | None) -> dict[str, Any]:
    return {
        "authenticated": bool(user_doc),
        "user": serialize_user(user_doc),
        "profile": serialize_profile(user_doc),
    }


class CategorySerializer(serializers.ModelSerializer):
    apis_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'name_en', 'slug', 'description', 'icon', 'color', 'apis_count', 'created_at', 'updated_at']
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_apis_count(self, obj):
        return obj.apis.filter(status='active').count()


class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = ['id', 'name', 'plan_type', 'price', 'currency', 'requests_per_month', 
                  'requests_per_day', 'features', 'is_popular', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class DocumentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documentation
        fields = ['id', 'title', 'slug', 'content', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['slug', 'created_at', 'updated_at']


def serialize_rapidapi(api_doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "canonical_version": api_doc.get("canonical_version", "v1"),
        "listing_url": api_doc.get("rapidapi_listing_url", ""),
        "package_slug": api_doc.get("rapidapi_package_slug", ""),
        "public_auth_scheme": api_doc.get("public_auth_scheme", "api_key"),
        "support_url": api_doc.get("support_url", ""),
        "publication_status": api_doc.get("publication_status", "draft"),
    }


def serialize_pricing_plan(plan: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(plan["_id"]),
        "api_slug": plan.get("api_slug", ""),
        "api_rapidapi_listing_url": plan.get("api_rapidapi_listing_url", ""),
        "name": plan.get("name", ""),
        "plan_type": plan.get("plan_type", "basic"),
        "price": format_decimal(plan.get("price", 0)),
        "currency": plan.get("currency", "IRR"),
        "requests_per_month": plan.get("requests_per_month"),
        "requests_per_day": plan.get("requests_per_day"),
        "features": plan.get("features", []),
        "is_popular": bool(plan.get("is_popular", False)),
        "is_active": bool(plan.get("is_active", True)),
        "rapidapi_plan_slug": plan.get("rapidapi_plan_slug", ""),
        "is_listed_on_rapidapi": bool(plan.get("is_listed_on_rapidapi", False)),
        "created_at": plan.get("created_at"),
        "updated_at": plan.get("updated_at"),
    }


def serialize_subscription_plan(plan: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(plan["_id"]),
        "name": plan.get("name", ""),
        "slug": plan.get("slug", ""),
        "description": plan.get("description", ""),
        "plan_type": plan.get("plan_type", "starter"),
        "price": format_decimal(plan.get("price", 0)),
        "currency": plan.get("currency", "IRR"),
        "interval": plan.get("interval", "month"),
        "interval_days": int(plan.get("interval_days", 30)),
        "api_publish_limit": plan.get("api_publish_limit"),
        "included_requests": plan.get("included_requests"),
        "features": plan.get("features", []),
        "is_popular": bool(plan.get("is_popular", False)),
        "is_active": bool(plan.get("is_active", True)),
        "created_at": plan.get("created_at"),
        "updated_at": plan.get("updated_at"),
    }


def serialize_user_subscription(subscription: dict[str, Any] | None, plan: dict[str, Any] | None) -> dict[str, Any] | None:
    if not subscription or not plan:
        return None
    return {
        "id": int(subscription["_id"]),
        "status": subscription.get("status", "active"),
        "plan": serialize_subscription_plan(plan),
        "starts_at": subscription.get("starts_at"),
        "renews_at": subscription.get("renews_at"),
        "ends_at": subscription.get("ends_at"),
        "created_at": subscription.get("created_at"),
        "updated_at": subscription.get("updated_at"),
    }


def serialize_subscription_checkout(checkout: dict[str, Any], plan: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(checkout["_id"]),
        "status": checkout.get("status", "pending"),
        "amount": format_decimal(checkout.get("amount", 0)),
        "currency": checkout.get("currency", "IRR"),
        "gateway": checkout.get("gateway", "manual"),
        "reference": checkout.get("reference", ""),
        "plan": serialize_subscription_plan(plan),
        "created_at": checkout.get("created_at"),
        "updated_at": checkout.get("updated_at"),
        "expires_at": checkout.get("expires_at"),
        "confirmed_at": checkout.get("confirmed_at"),
    }


def serialize_documentation(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(document["_id"]),
        "api_slug": document.get("api_slug", ""),
        "title": document.get("title", ""),
        "slug": document.get("slug", ""),
        "content": document.get("content", ""),
        "order": int(document.get("order", 0)),
        "is_active": bool(document.get("is_active", True)),
        "created_at": document.get("created_at"),
        "updated_at": document.get("updated_at"),
    }


def serialize_api_endpoint(endpoint: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(endpoint["_id"]),
        "api_slug": endpoint.get("api_slug", ""),
        "method": endpoint.get("method", "GET"),
        "path": endpoint.get("path", "/"),
        "name": endpoint.get("name", ""),
        "summary": endpoint.get("summary", ""),
        "group": endpoint.get("group", "General"),
        "request_schema": endpoint.get("request_schema", {}),
        "response_schema": endpoint.get("response_schema", {}),
        "sample_request": endpoint.get("sample_request", {}),
        "sample_response": endpoint.get("sample_response", {}),
        "requires_auth": bool(endpoint.get("requires_auth", True)),
        "is_active": bool(endpoint.get("is_active", True)),
        "created_at": endpoint.get("created_at"),
        "updated_at": endpoint.get("updated_at"),
    }


def serialize_api_list(
    api_doc: dict[str, Any],
    *,
    category: dict[str, Any] | None,
    pricing_from: str | None,
) -> dict[str, Any]:
    return {
        "id": int(api_doc["_id"]),
        "name": api_doc.get("name", ""),
        "name_en": api_doc.get("name_en", ""),
        "slug": api_doc.get("slug", ""),
        "short_description": api_doc.get("short_description", ""),
        "category": serialize_category_summary(category),
        "logo": api_doc.get("logo", ""),
        "status": api_doc.get("status", "active"),
        "is_featured": bool(api_doc.get("is_featured", False)),
        "is_popular": bool(api_doc.get("is_popular", False)),
        "rating": format_decimal(api_doc.get("rating", 0)),
        "rating_count": int(api_doc.get("rating_count", 0)),
        "views_count": int(api_doc.get("views_count", 0)),
        "tags": api_doc.get("tags", []),
        "pricing_from": pricing_from,
        "rapidapi": serialize_rapidapi(api_doc),
        "created_at": api_doc.get("created_at"),
        "updated_at": api_doc.get("updated_at"),
    }


def serialize_api_detail(
    api_doc: dict[str, Any],
    *,
    category: dict[str, Any] | None,
    pricing_plans: list[dict[str, Any]],
    documentations: list[dict[str, Any]],
    endpoints: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    return {
        **serialize_api_list(
            api_doc,
            category=category,
            pricing_from=format_decimal(min((plan.get("price", 0) for plan in pricing_plans), default=0))
            if pricing_plans
            else None,
        ),
        "description": api_doc.get("description", ""),
        "base_url": api_doc.get("base_url", ""),
        "documentation_url": api_doc.get("documentation_url", ""),
        "banner": api_doc.get("banner", ""),
        "pricing_plans": [serialize_pricing_plan(plan) for plan in pricing_plans],
        "documentations": [serialize_documentation(document) for document in documentations],
        "endpoints": [serialize_api_endpoint(endpoint) for endpoint in endpoints or []],
        "created_by_username": api_doc.get("created_by_username"),
    }


def serialize_user(user: dict[str, Any] | MongoUser | None) -> dict[str, Any] | None:
    if not user:
        return None

    if isinstance(user, MongoUser):
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "date_joined": user.date_joined,
        }

    return {
        "id": int(user["_id"]),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "date_joined": user.get("date_joined"),
    }


def serialize_profile(user_doc: dict[str, Any] | MongoUser | None) -> dict[str, Any] | None:
    if not user_doc or isinstance(user_doc, MongoUser):
        return None

    profile = user_doc.get("profile", {})
    return {
        "id": int(user_doc["_id"]),
        "user": serialize_user(user_doc),
        "phone": profile.get("phone", ""),
        "company": profile.get("company", ""),
        "bio": profile.get("bio", ""),
        "avatar": profile.get("avatar"),
        "api_key": mask_secret(profile.get("api_key")),
        "api_key_preview": mask_secret(profile.get("api_key")),
        "has_api_key": bool(profile.get("api_key")),
        "created_at": profile.get("created_at"),
        "updated_at": profile.get("updated_at"),
    }


def serialize_access_grant(
    grant: dict[str, Any],
    *,
    api_doc: dict[str, Any] | None,
    pricing_plan: dict[str, Any] | None,
    category: dict[str, Any] | None,
    pricing_from: str | None,
) -> dict[str, Any]:
    return {
        "id": int(grant["_id"]),
        "api": serialize_api_list(api_doc, category=category, pricing_from=pricing_from) if api_doc else None,
        "pricing_plan": serialize_pricing_plan(pricing_plan) if pricing_plan else None,
        "source": grant.get("source", "manual"),
        "status": grant.get("status", "pending"),
        "external_subscription_id": grant.get("external_subscription_id", ""),
        "starts_at": grant.get("starts_at"),
        "ends_at": grant.get("ends_at"),
        "requests_per_day": grant.get("requests_per_day"),
        "requests_per_month": grant.get("requests_per_month"),
        "metadata": grant.get("metadata", {}),
        "created_at": grant.get("created_at"),
        "updated_at": grant.get("updated_at"),
    }


def serialize_usage_item(
    usage: dict[str, Any],
    *,
    api_doc: dict[str, Any] | None,
    access_grant: dict[str, Any] | None,
    pricing_plan: dict[str, Any] | None,
    category: dict[str, Any] | None,
    pricing_from: str | None,
) -> dict[str, Any]:
    serialized_grant = (
        serialize_access_grant(
            access_grant,
            api_doc=api_doc,
            pricing_plan=pricing_plan,
            category=category,
            pricing_from=pricing_from,
        )
        if access_grant
        else None
    )
    return {
        "id": int(usage["_id"]),
        "api": serialize_api_list(api_doc, category=category, pricing_from=pricing_from) if api_doc else None,
        "access_grant": serialized_grant,
        "pricing_plan": serialize_pricing_plan(pricing_plan) if pricing_plan else None,
        "source": usage.get("source", "manual"),
        "requests_count": int(usage.get("requests_count", 0)),
        "last_used": usage.get("last_used"),
        "created_at": usage.get("created_at"),
        "window_started_at": usage.get("window_started_at"),
        "window_ended_at": usage.get("window_ended_at"),
        "method": usage.get("method", ""),
        "path": usage.get("path", ""),
        "status_code": usage.get("status_code"),
        "latency_ms": usage.get("latency_ms"),
        "response_size": usage.get("response_size"),
    }


class APISummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    category = CategorySerializer(read_only=True)

    class Meta:
        model = API
        fields = ['id', 'name', 'name_en', 'slug', 'short_description', 'category', 
                  'logo', 'status', 'is_featured', 'is_popular', 'rating', 
                  'rating_count', 'tags', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'phone', 'company', 'bio', 'avatar', 'api_key', 'created_at', 'updated_at']
        read_only_fields = ['api_key', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "رمزهای عبور مطابقت ندارند"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Handle email - convert empty string/None to empty string
        email = validated_data.get('email')
        if not email or email.strip() == '':
            email = ''
        
        # Handle first_name and last_name
        first_name = validated_data.get('first_name', '') or ''
        last_name = validated_data.get('last_name', '') or ''
        
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=email,
                password=validated_data['password'],
                first_name=first_name,
                last_name=last_name,
            )
        except Exception as e:
            # Log the error for debugging
            import sys
            print(f"Error creating user: {e}", file=sys.stderr)
            print(f"Data: username={validated_data['username']}, email={email}", file=sys.stderr)
            raise
        # Create profile with default values (all fields allow blank=True)
        UserProfile.objects.create(
            user=user,
            phone='',
            company='',
            bio='',
            avatar=None,
            api_key=None
        )
        return user


class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=1, max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "رمزهای عبور مطابقت ندارند"})
        return attrs


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError('نام کاربری و رمز عبور الزامی است')
        return attrs


class APIUsageSerializer(serializers.ModelSerializer):
    api = APISummarySerializer(read_only=True)

    class Meta:
        model = APIUsage
        fields = ['id', 'api', 'requests_count', 'last_used', 'created_at']
        read_only_fields = ['created_at']

class APIReleaseSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=160)
    base_url = serializers.URLField()
    documentation_url = serializers.URLField(required=False, allow_blank=True)
    auth_scheme = serializers.ChoiceField(
        choices=["api-key", "api_key", "bearer", "oauth2", "basic", "none"],
        default="api-key",
    )
    category = serializers.CharField(max_length=120, required=False, allow_blank=True)
    tags = serializers.ListField(
        child=serializers.CharField(max_length=40),
        required=False,
        allow_empty=True,
    )
    description = serializers.CharField()

    def validate(self, attrs):
        attrs["name"] = attrs["name"].strip()
        attrs["documentation_url"] = attrs.get("documentation_url", "").strip()
        attrs["category"] = attrs.get("category", "").strip()
        attrs["description"] = attrs["description"].strip()
        attrs["tags"] = [str(tag).strip() for tag in attrs.get("tags", []) if str(tag).strip()]
        if attrs["auth_scheme"] == "api-key":
            attrs["auth_scheme"] = "api_key"
        return attrs


class SubscriptionCheckoutSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(min_value=1)


class UserUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)


class UserProfileUpdateSerializer(serializers.Serializer):
    phone = serializers.CharField(required=False, allow_blank=True)
    company = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.URLField(required=False, allow_null=True, allow_blank=True)


class RatingSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)


class CallerRequestSerializer(serializers.Serializer):
    api_slug = serializers.SlugField(max_length=160)
    endpoint_id = serializers.IntegerField(required=False, min_value=1)
    method = serializers.ChoiceField(choices=["GET", "POST", "PUT", "PATCH", "DELETE"], default="GET")
    path = serializers.CharField(max_length=500, required=False, allow_blank=True)
    body = serializers.JSONField(required=False)

    def validate(self, attrs):
        attrs["method"] = attrs.get("method", "GET").upper()
        attrs["path"] = (attrs.get("path") or "").strip()
        return attrs
