from __future__ import annotations

from django.conf import settings
from django.shortcuts import redirect
from django.utils.text import slugify
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Category, API, PricingPlan, Documentation, UserProfile, APIUsage
from .repositories import MongoRepository
from .schema import build_openapi_schema
from .serializers import (
    APIUsageSerializer,
    APISummarySerializer,
    CallerRequestSerializer,
    CategorySerializer,
    DocumentationSerializer,
    APIReleaseSerializer,
    LoginSerializer,
    OrganizationCreateSerializer,
    PricingPlanSerializer,
    RatingSerializer,
    RegistrationSerializer,
    StudioFlowDeploySerializer,
    SubscriptionCheckoutSerializer,
    UserProfileUpdateSerializer,
    UserUpdateSerializer,
    build_session_payload,
    serialize_access_grant,
    serialize_api_detail,
    serialize_api_endpoint,
    serialize_api_list,
    serialize_category,
    serialize_documentation,
    serialize_organization,
    serialize_pricing_plan,
    serialize_profile,
    serialize_studio_flow,
    serialize_subscription_checkout,
    serialize_subscription_plan,
    serialize_user_subscription,
    serialize_usage_item,
    serialize_user,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


def get_repository() -> MongoRepository:
    return MongoRepository()


def current_user_document(request):
    if request.user and getattr(request.user, "is_authenticated", False):
        if hasattr(request.user, "id"):
            return get_repository().get_user_by_id(int(request.user.id))
    session_id = request.COOKIES.get(settings.SESSION_COOKIE_NAME, "")
    return get_repository().session_user(session_id)


def parse_bool(value):
    if value is None:
        return None
    return str(value).lower() in {"1", "true", "yes", "on"}


def paginate(request, results):
    page_size = int(request.query_params.get("page_size") or 20)
    page = max(int(request.query_params.get("page") or 1), 1)
    start = (page - 1) * page_size
    end = start + page_size
    return {"count": len(results), "page": page, "page_size": page_size, "results": results[start:end]}


def enrich_api_list(api_docs, repository):
    category_ids = [int(api_doc["category_id"]) for api_doc in api_docs if api_doc.get("category_id") is not None]
    categories = repository.get_categories_by_ids(category_ids)
    pricing = repository.pricing_min_map([int(api_doc["_id"]) for api_doc in api_docs])
    return [
        serialize_api_list(
            api_doc,
            category=categories.get(int(api_doc["category_id"])) if api_doc.get("category_id") is not None else None,
            pricing_from=pricing.get(int(api_doc["_id"])),
        )
        for api_doc in api_docs
    ]


def set_session_cookie(response, session_id: str):
    response.set_cookie(
        settings.SESSION_COOKIE_NAME,
        session_id,
        max_age=settings.SESSION_COOKIE_AGE,
        httponly=True,
        samesite="Lax",
    )


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "timestamp": timezone.now()})


class OpenAPISchemaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(build_openapi_schema())


class SessionView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(build_session_payload(current_user_document(request)))


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = Response(serialize_user(get_repository().get_user_by_id(int(request.user.id))))
        response["Cache-Control"] = "no-store, max-age=0"
        response["Pragma"] = "no-cache"
        return response

    def patch(self, request):
        serializer = UserUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_doc = get_repository().update_user(int(request.user.id), serializer.validated_data)
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc
        response = Response({"user": serialize_user(user_doc)})
        response["Cache-Control"] = "no-store, max-age=0"
        response["Pragma"] = "no-cache"
        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_doc = get_repository().get_user_by_id(int(request.user.id))
        return Response(serialize_profile(user_doc))

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_doc = get_repository().update_profile(int(request.user.id), serializer.validated_data)
        return Response({"profile": serialize_profile(user_doc)})


class AccessGrantListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repository = get_repository()
        grants = repository.list_access_grants(int(request.user.id))
        api_map = repository.get_apis_by_ids([int(grant["api_id"]) for grant in grants if grant.get("api_id")])
        plan_map = repository.get_pricing_plans_by_ids(
            [int(grant["pricing_plan_id"]) for grant in grants if grant.get("pricing_plan_id")]
        )
        category_map = repository.get_categories_by_ids(
            [int(api.get("category_id")) for api in api_map.values() if api.get("category_id") is not None]
        )
        pricing_map = repository.pricing_min_map([int(api_id) for api_id in api_map])
        payload = [
            serialize_access_grant(
                grant,
                api_doc=api_map.get(int(grant["api_id"])) if grant.get("api_id") else None,
                pricing_plan=plan_map.get(int(grant["pricing_plan_id"])) if grant.get("pricing_plan_id") else None,
                category=category_map.get(int(api_map.get(int(grant["api_id"]), {}).get("category_id")))
                if grant.get("api_id") and api_map.get(int(grant["api_id"]), {}).get("category_id") is not None
                else None,
                pricing_from=pricing_map.get(int(grant["api_id"])) if grant.get("api_id") else None,
            )
            for grant in grants
        ]
        return Response(paginate(request, payload))


class OrganizationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organizations = get_repository().list_organizations(int(request.user.id))
        return Response(paginate(request, [serialize_organization(item) for item in organizations]))

    def post(self, request):
        serializer = OrganizationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        organization = get_repository().create_organization(
            user_id=int(request.user.id),
            name=serializer.validated_data["name"],
            region=serializer.validated_data["region"],
        )
        return Response(
            {"message": "Organization created successfully.", "organization": serialize_organization(organization)},
            status=status.HTTP_201_CREATED,
        )


class UsageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repository = get_repository()
        api_param = request.query_params.get("api")
        api_id = None
        if api_param:
            if str(api_param).isdigit():
                api_id = int(api_param)
            else:
                api_doc = repository.get_api_by_slug(str(api_param))
                api_id = int(api_doc["_id"]) if api_doc else -1
        usage_items = repository.list_usage(
            int(request.user.id),
            api_id=api_id,
            source=request.query_params.get("source"),
            search=request.query_params.get("search"),
        )
        api_map = repository.get_apis_by_ids([int(item["api_id"]) for item in usage_items if item.get("api_id")])
        grant_map = repository.get_access_grants_by_ids(
            [int(item["access_grant_id"]) for item in usage_items if item.get("access_grant_id")]
        )
        plan_map = repository.get_pricing_plans_by_ids(
            [int(grant["pricing_plan_id"]) for grant in grant_map.values() if grant.get("pricing_plan_id")]
        )
        category_map = repository.get_categories_by_ids(
            [int(api.get("category_id")) for api in api_map.values() if api.get("category_id") is not None]
        )
        pricing_map = repository.pricing_min_map([int(api_id) for api_id in api_map])
        payload = [
            serialize_usage_item(
                item,
                api_doc=api_map.get(int(item["api_id"])) if item.get("api_id") else None,
                access_grant=grant_map.get(int(item.get("access_grant_id"))) if item.get("access_grant_id") else None,
                pricing_plan=plan_map.get(int(grant_map.get(int(item.get("access_grant_id")), {}).get("pricing_plan_id")))
                if item.get("access_grant_id") and grant_map.get(int(item.get("access_grant_id")), {}).get("pricing_plan_id")
                else None,
                category=category_map.get(int(api_map.get(int(item["api_id"]), {}).get("category_id")))
                if item.get("api_id") and api_map.get(int(item["api_id"]), {}).get("category_id") is not None
                else None,
                pricing_from=pricing_map.get(int(item["api_id"])) if item.get("api_id") else None,
            )
            for item in usage_items
        ]
        return Response(paginate(request, payload))


class UsageStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(get_repository().usage_stats(int(request.user.id)))


class CallerExecuteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CallerRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        repository = get_repository()

        api_doc = repository.get_api_by_slug(data["api_slug"])
        if not api_doc:
            raise NotFound("API was not found.")

        endpoints = repository.list_endpoints(api_slug=api_doc["slug"])
        endpoint = None
        endpoint_id = data.get("endpoint_id")
        if endpoint_id:
            endpoint = next((item for item in endpoints if int(item["_id"]) == int(endpoint_id)), None)
            if not endpoint:
                raise NotFound("API endpoint was not found.")
        elif data.get("path"):
            endpoint = next(
                (
                    item
                    for item in endpoints
                    if item.get("path") == data["path"] and item.get("method", "GET").upper() == data["method"]
                ),
                None,
            )
        elif endpoints:
            endpoint = endpoints[0]

        method = data["method"]
        path = data.get("path") or (endpoint.get("path") if endpoint else "/")
        response_body = endpoint.get("sample_response", {"ok": True}) if endpoint else {"ok": True}
        latency_ms = 90 + (int(api_doc["_id"]) * 17 + len(path) * 3) % 220
        response_size = len(str(response_body).encode("utf-8"))
        usage_doc = repository.record_caller_usage(
            user_id=int(request.user.id),
            api_doc=api_doc,
            method=method,
            path=path,
            status_code=200,
            latency_ms=latency_ms,
            response_size=response_size,
        )

        category = (
            repository.get_categories_by_ids([int(api_doc["category_id"])]).get(int(api_doc["category_id"]))
            if api_doc.get("category_id") is not None
            else None
        )
        pricing_from = repository.pricing_min_map([int(api_doc["_id"])]).get(int(api_doc["_id"]))
        return Response(
            {
                "status_code": 200,
                "latency_ms": latency_ms,
                "region": "ir-tehran-1",
                "body": response_body,
                "usage": serialize_usage_item(
                    usage_doc,
                    api_doc=api_doc,
                    access_grant=None,
                    pricing_plan=None,
                    category=category,
                    pricing_from=pricing_from,
                ),
            }
        )


class StudioFlowListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repository = get_repository()
        flows = repository.list_studio_flows(int(request.user.id))
        api_map = repository.get_apis_by_ids([int(flow["api_id"]) for flow in flows if flow.get("api_id")])
        payload = [
            serialize_studio_flow(
                flow,
                api_doc=api_map.get(int(flow["api_id"])) if flow.get("api_id") else None,
            )
            for flow in flows
        ]
        return Response(paginate(request, payload))

    def post(self, request):
        serializer = StudioFlowDeploySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        repository = get_repository()

        api_doc = repository.get_api_by_slug(data["api_slug"])
        if not api_doc:
            raise NotFound("API was not found.")

        flow, usage = repository.deploy_studio_flow(
            user_id=int(request.user.id),
            name=data["name"],
            api_doc=api_doc,
            nodes=data["nodes"],
            region=data["region"],
        )
        return Response(
            {
                "message": "Studio flow deployed successfully.",
                "flow": serialize_studio_flow(flow, api_doc=api_doc),
                "usage": serialize_usage_item(
                    usage,
                    api_doc=api_doc,
                    access_grant=None,
                    pricing_plan=None,
                    category=None,
                    pricing_from=None,
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class GenerateApiKeyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raise PermissionDenied("Legacy API key generation is disabled.")


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        SessionLogoutView().post(request)
        return Response({"message": "Logged out."})


class SessionLogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.COOKIES.get(settings.SESSION_COOKIE_NAME, "")
        get_repository().delete_session(session_id)
        response = Response({"authenticated": False})
        response.delete_cookie(settings.SESSION_COOKIE_NAME)
        return response


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    search_fields = ['name', 'name_en', 'description']
    ordering_fields = ['name', 'created_at']

    @action(detail=True, methods=['get'])
    def apis(self, request, pk=None):
        """Get all APIs in a category"""
        category = self.get_object()
        apis = API.objects.filter(category=category, status='active')
        serializer = APISummarySerializer(apis, many=True)
        return Response(serializer.data)


class APIViewSet(viewsets.ModelViewSet):
    queryset = API.objects.all()
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(build_session_payload(current_user_document(request)))


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repository = get_repository()
        categories = repository.list_categories(
            search=request.query_params.get("search"),
            ordering=request.query_params.get("ordering"),
        )
        payload = [serialize_category(category) for category in categories]
        return Response(paginate(request, payload))


class CategoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        repository = get_repository()
        category = repository.get_category_by_slug(slug)
        if not category:
            raise NotFound("دسته‌بندی پیدا نشد.")
        return Response(serialize_category(category))


class CategoryApisView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        repository = get_repository()
        category = repository.get_category_by_slug(slug)
        if not category:
            raise NotFound("دسته‌بندی پیدا نشد.")

        api_docs = repository.list_apis(
            category_slug=slug,
            search=request.query_params.get("search"),
            ordering=request.query_params.get("ordering"),
            include_inactive=False,
        )
        return Response(paginate(request, enrich_api_list(api_docs, repository)))


class APIListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repository = get_repository()
        owned_only = parse_bool(request.query_params.get("owned")) is True
        if owned_only and (not request.user or not getattr(request.user, "is_authenticated", False)):
            self.permission_denied(request)

        include_inactive = bool(
            request.user
            and getattr(request.user, "is_authenticated", False)
            and getattr(request.user, "is_staff", False)
            and parse_bool(request.query_params.get("include_inactive")) is True
        )
        api_docs = repository.list_apis(
            category_slug=request.query_params.get("category"),
            featured=parse_bool(request.query_params.get("featured")),
            popular=parse_bool(request.query_params.get("popular")),
            tag=request.query_params.get("tag"),
            search=request.query_params.get("search"),
            ordering=request.query_params.get("ordering"),
            include_inactive=include_inactive,
            created_by_user_id=int(request.user.id) if owned_only else None,
        )
        payload = paginate(request, enrich_api_list(api_docs, repository))
        response = Response(payload)
        if request.path.startswith("/api/apis/") or request.path == "/api/apis/":
            response["X-API-Deprecated"] = "true"
            response.data["meta"] = {"deprecated": {"canonical_path": "/api/v1/catalog/apis/"}}
        return response

    def post(self, request):
        if not request.user or not getattr(request.user, "is_authenticated", False):
            self.permission_denied(request)

        repository = get_repository()
        serializer = APIReleaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        now = timezone.now()
        category_label = data.get("category") or "Community"
        category_slug = slugify(category_label, allow_unicode=True).strip("-") or "community"
        category = repository.categories.find_one(
            {
                "$or": [
                    {"slug": category_slug},
                    {"name": category_label},
                    {"name_en": category_label},
                ]
            }
        )
        if not category:
            category = repository.build_category_document(
                {
                    "slug": category_slug,
                    "name": category_label,
                    "name_en": category_label,
                    "description": f"{category_label} APIs",
                    "created_at": now,
                    "updated_at": now,
                }
            )
            repository.categories.insert_one(category)

        api_doc = repository.build_api_document(
            {
                "name": data["name"],
                "name_en": data["name"],
                "description": data["description"],
                "short_description": data["description"][:180],
                "category_id": int(category["_id"]),
                "base_url": data["base_url"],
                "documentation_url": data.get("documentation_url", ""),
                "logo": "",
                "status": "active",
                "is_featured": False,
                "is_popular": False,
                "tags": data.get("tags", []),
                "canonical_version": "v1",
                "public_auth_scheme": data["auth_scheme"],
                "publication_status": "published",
                "created_by_user_id": int(request.user.id),
                "created_by_username": request.user.username,
                "created_at": now,
                "updated_at": now,
            }
        )
        repository.apis.insert_one(api_doc)

        if data.get("documentation_url") or data.get("description"):
            repository.documentations.insert_one(
                repository.build_documentation_document(
                    {
                        "api_id": int(api_doc["_id"]),
                        "api_slug": api_doc["slug"],
                        "title": "Overview",
                        "content": data.get("description", ""),
                        "order": 1,
                        "is_active": True,
                        "created_at": now,
                        "updated_at": now,
                    }
                )
            )

        return Response(
            {
                "message": "API released and published to Explore.",
                "api": serialize_api_detail(
                    api_doc,
                    category=category,
                    pricing_plans=[],
                    documentations=repository.get_documentations_by_api_ids([int(api_doc["_id"])]).get(
                        int(api_doc["_id"]),
                        [],
                    ),
                    endpoints=[],
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class APIDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        repository = get_repository()
        include_inactive = bool(
            request.user and getattr(request.user, "is_authenticated", False) and getattr(request.user, "is_staff", False)
        )
        api_doc = repository.get_api_by_slug(slug, include_inactive=include_inactive)
        if not api_doc:
            raise NotFound("API پیدا نشد.")

        api_doc = repository.increment_api_views(int(api_doc["_id"])) or api_doc
        category = None
        if api_doc.get("category_id") is not None:
            category = repository.get_categories_by_ids([int(api_doc["category_id"])]).get(int(api_doc["category_id"]))
        pricing_plans = repository.get_pricing_plans_by_api_ids([int(api_doc["_id"])]).get(int(api_doc["_id"]), [])
        documentations = repository.get_documentations_by_api_ids([int(api_doc["_id"])]).get(int(api_doc["_id"]), [])
        endpoints = repository.get_endpoints_by_api_ids([int(api_doc["_id"])]).get(int(api_doc["_id"]), [])
        return Response(
            serialize_api_detail(
                api_doc,
                category=category,
                pricing_plans=pricing_plans,
                documentations=documentations,
                endpoints=endpoints,
            )
        )


class APISimilarView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        repository = get_repository()
        _, api_docs = repository.list_similar_apis(slug)
        return Response(enrich_api_list(api_docs, repository))


class APIRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug: str):
        repository = get_repository()
        serializer = RatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        api_doc = repository.get_api_by_slug(slug)
        if not api_doc:
            raise NotFound("API پیدا نشد.")

        rating_doc, created = repository.rate_api(
            user_id=request.user.id,
            api_id=int(api_doc["_id"]),
            value=serializer.validated_data["rating"],
        )
        refreshed = repository.get_api_by_slug(slug, include_inactive=True) or api_doc
        return Response(
            {
                "message": "امتیاز شما با موفقیت ثبت شد.",
                "created": created,
                "rating": f"{float(refreshed.get('rating', 0)):.2f}",
                "rating_count": int(refreshed.get("rating_count", 0)),
                "your_rating": int(rating_doc.get("value", serializer.validated_data["rating"])),
            }
        )


class PricingPlanListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repository = get_repository()
        plans = repository.list_pricing_plans(api_slug=request.query_params.get("api"))
        return Response(paginate(request, [serialize_pricing_plan(plan) for plan in plans]))


class SubscriptionPlanListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repository = get_repository()
        plans = repository.list_subscription_plans()
        return Response(paginate(request, [serialize_subscription_plan(plan) for plan in plans]))


class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repository = get_repository()
        subscription = repository.get_current_subscription(request.user.id)
        plan = (
            repository.get_subscription_plan_by_id(subscription["subscription_plan_id"], active_only=False)
            if subscription
            else None
        )
        return Response({"subscription": serialize_user_subscription(subscription, plan)})

    def post(self, request):
        repository = get_repository()
        serializer = SubscriptionCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            checkout, plan = repository.create_subscription_checkout(
                user_id=request.user.id,
                plan_id=serializer.validated_data["plan_id"],
            )
        except LookupError as exc:
            raise NotFound("Subscription plan was not found.") from exc
        return Response(
            {
                "message": "Checkout created successfully.",
                "checkout": serialize_subscription_checkout(checkout, plan),
            },
            status=status.HTTP_201_CREATED,
        )


class SubscriptionCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, checkout_id: int):
        repository = get_repository()
        checkout, plan = repository.get_subscription_checkout(user_id=request.user.id, checkout_id=checkout_id)
        if not checkout or not plan:
            raise NotFound("Subscription checkout was not found.")
        return Response({"checkout": serialize_subscription_checkout(checkout, plan)})

    def delete(self, request, checkout_id: int):
        repository = get_repository()
        try:
            checkout, plan = repository.cancel_subscription_checkout(
                user_id=request.user.id,
                checkout_id=checkout_id,
            )
        except LookupError as exc:
            raise NotFound("Subscription checkout was not found.") from exc
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc
        return Response(
            {
                "message": "Checkout canceled successfully.",
                "checkout": serialize_subscription_checkout(checkout, plan),
            }
        )


class SubscriptionCheckoutConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, checkout_id: int):
        repository = get_repository()
        try:
            checkout, subscription, plan = repository.confirm_subscription_checkout(
                user_id=request.user.id,
                checkout_id=checkout_id,
            )
        except LookupError as exc:
            raise NotFound("Subscription checkout was not found.") from exc
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc

        return Response(
            {
                "message": "Subscription activated successfully.",
                "checkout": serialize_subscription_checkout(checkout, plan),
                "subscription": serialize_user_subscription(subscription, plan),
            }
        )


class APIPlanListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        repository = get_repository()
        plans = repository.list_pricing_plans(api_slug=slug)
        return Response(paginate(request, [serialize_pricing_plan(plan) for plan in plans]))


class DocumentationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repository = get_repository()
        documentations = repository.list_documentations(
            api_slug=request.query_params.get("api"),
            search=request.query_params.get("search"),
        )
        return Response(paginate(request, [serialize_documentation(document) for document in documentations]))


class APIDocumentationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        repository = get_repository()
        documentations = repository.list_documentations(api_slug=slug)
        return Response(paginate(request, [serialize_documentation(document) for document in documentations]))


class APIEndpointListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        repository = get_repository()
        if not repository.get_api_by_slug(slug):
            raise NotFound("API not found.")
        endpoints = repository.list_endpoints(api_slug=slug)
        return Response(paginate(request, [serialize_api_endpoint(endpoint) for endpoint in endpoints]))


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        repository = get_repository()
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            repository.validate_unique_user_fields(
                username=serializer.validated_data["username"],
                email=serializer.validated_data.get("email", ""),
            )
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc

        user_doc = repository.create_user(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
            email=serializer.validated_data.get("email", ""),
            first_name=serializer.validated_data.get("first_name", ""),
            last_name=serializer.validated_data.get("last_name", ""),
        )
        token = repository.create_or_get_legacy_token(int(user_doc["_id"]))
        session_id = repository.create_session(int(user_doc["_id"]))
        response = Response(
            {
                "message": "ثبت‌نام با موفقیت انجام شد.",
                "token": token,
                "user": serialize_user(user_doc),
                "profile": serialize_profile(user_doc),
            },
            status=status.HTTP_201_CREATED,
        )
        set_session_cookie(response, session_id)
        return response


class SessionRegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        repository = get_repository()
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            repository.validate_unique_user_fields(
                username=serializer.validated_data["username"],
                email=serializer.validated_data.get("email", ""),
            )
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc

        user_doc = repository.create_user(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
            email=serializer.validated_data.get("email", ""),
            first_name=serializer.validated_data.get("first_name", ""),
            last_name=serializer.validated_data.get("last_name", ""),
        )
        session_id = repository.create_session(int(user_doc["_id"]))
        response = Response(
            {
                "message": "Registration completed successfully.",
                **build_session_payload(user_doc),
            },
            status=status.HTTP_201_CREATED,
        )
        set_session_cookie(response, session_id)
        return response


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        repository = get_repository()
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_doc = repository.authenticate_user(
            serializer.validated_data["username"],
            serializer.validated_data["password"],
        )
        if not user_doc:
            raise ValidationError("نام کاربری یا رمز عبور اشتباه است.")

        token = repository.create_or_get_legacy_token(int(user_doc["_id"]))
        session_id = repository.create_session(int(user_doc["_id"]))
        response = Response(
            {
                "message": "ورود با موفقیت انجام شد.",
                "token": token,
                "user": serialize_user(user_doc),
                "profile": serialize_profile(user_doc),
            }
        )
        set_session_cookie(response, session_id)
        return response


class SessionLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        repository = get_repository()
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_doc = repository.authenticate_user(
            serializer.validated_data["username"],
            serializer.validated_data["password"],
        )
        if not user_doc:
            raise ValidationError("نام کاربری یا رمز عبور اشتباه است.")

        session_id = repository.create_session(int(user_doc["_id"]))
        response = Response(
            {
                "message": "Signed in successfully.",
                **build_session_payload(user_doc),
            }
        )
        set_session_cookie(response, session_id)
        return response


def serialize_social_provider(slug: str, provider: dict[str, object]) -> dict[str, object]:
    return {
        "slug": slug,
        "label": str(provider.get("label") or slug.title()),
        "enabled": bool(provider.get("enabled") and provider.get("auth_url")),
        "start_url": f"/api/v1/auth/social/{slug}/start/",
    }


class SocialAuthProviderListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        providers = [
            serialize_social_provider(slug, provider)
            for slug, provider in settings.SOCIAL_AUTH_PROVIDERS.items()
        ]
        return Response({"providers": providers})


class SocialAuthStartView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, provider: str):
        social_provider = settings.SOCIAL_AUTH_PROVIDERS.get(provider)
        if not social_provider:
            raise NotFound("Social login provider was not found.")

        auth_url = str(social_provider.get("auth_url") or "")
        if not social_provider.get("enabled") or not auth_url:
            return Response(
                {'error': 'امتیاز باید بین 1 تا 5 باشد'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update rating (simplified - in production, use a separate Rating model)
        current_rating = api.rating or 0
        current_count = api.rating_count or 0
        new_rating = ((current_rating * current_count) + float(rating)) / (current_count + 1)
        
        api.rating = round(new_rating, 2)
        api.rating_count = current_count + 1
        api.save()
        
        return Response({'rating': api.rating, 'rating_count': api.rating_count})


class PricingPlanViewSet(viewsets.ModelViewSet):
    queryset = PricingPlan.objects.filter(is_active=True)
    serializer_class = PricingPlanSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['api', 'plan_type', 'is_popular']

    def get_queryset(self):
        queryset = PricingPlan.objects.filter(is_active=True).select_related('api')
        api_id = self.request.query_params.get('api')
        if api_id:
            queryset = queryset.filter(api_id=api_id)
        return queryset


class DocumentationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Documentation.objects.filter(is_active=True)
    serializer_class = DocumentationSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['api']

    def get_queryset(self):
        queryset = Documentation.objects.filter(is_active=True).select_related('api')
        api_id = self.request.query_params.get('api')
        if api_id:
            queryset = queryset.filter(api_id=api_id)
        return queryset.order_by('order', 'title')


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """User registration"""
        import sys
        import json
        
        try:
            # Log request data - use both print and logger
            print("=" * 50, file=sys.stderr)
            print("REGISTRATION REQUEST RECEIVED", file=sys.stderr)
            print(f"Method: {request.method}", file=sys.stderr)
            print(f"Content-Type: {request.content_type}", file=sys.stderr)
            print(f"Data type: {type(request.data)}", file=sys.stderr)
            
            # Get data
            if hasattr(request, 'data') and request.data:
                data = dict(request.data) if hasattr(request.data, 'keys') else request.data
            else:
                import json
                try:
                    data = json.loads(request.body.decode('utf-8')) if request.body else {}
                except:
                    data = {}
            
            print(f"Request data: {json.dumps(data, default=str, ensure_ascii=False)}", file=sys.stderr)
            sys.stderr.flush()
            
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                token, created = Token.objects.get_or_create(user=user)
                print(f"Registration successful for user: {user.username}", file=sys.stderr)
                sys.stderr.flush()
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key
                }, status=status.HTTP_201_CREATED)
            
            # Log validation errors
            errors = dict(serializer.errors)
            print("=" * 50, file=sys.stderr)
            print("SERIALIZER VALIDATION ERRORS", file=sys.stderr)
            print(json.dumps(errors, default=str, ensure_ascii=False, indent=2), file=sys.stderr)
            sys.stderr.flush()
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print("=" * 50, file=sys.stderr)
            print("REGISTRATION EXCEPTION", file=sys.stderr)
            print(f"Error: {str(e)}", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            sys.stderr.flush()
            return Response(
                {'detail': f'خطا در ثبت‌نام: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """User login"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """User logout"""
        try:
            request.user.auth_token.delete()
        except:
            pass
        return Response({'message': 'با موفقیت خارج شدید'})


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def generate_api_key(self, request):
        """Generate a new API key for the user"""
        import secrets
        import string
        
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            # Generate a secure random API key
            alphabet = string.ascii_letters + string.digits
            api_key = 'iapi_' + ''.join(secrets.choice(alphabet) for _ in range(32))
            
            # Ensure uniqueness
            max_attempts = 10
            attempts = 0
            while UserProfile.objects.filter(api_key=api_key).exclude(user=request.user).exists() and attempts < max_attempts:
                api_key = 'iapi_' + ''.join(secrets.choice(alphabet) for _ in range(32))
                attempts += 1
            
            profile.api_key = api_key
            profile.save()
            
            serializer = UserProfileSerializer(profile)
            return Response({
                'api_key': api_key,
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': f'خطا در ساخت کلید API: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class APIUsageViewSet(viewsets.ModelViewSet):
    serializer_class = APIUsageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return APIUsage.objects.filter(user=self.request.user).select_related('api')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get usage statistics"""
        usage = self.get_queryset()
        total_requests = usage.aggregate(total=Count('requests_count'))['total'] or 0
        recent_usage = usage.filter(last_used__gte=timezone.now() - timedelta(days=30))
        
        return Response({
            'total_requests': total_requests,
            'active_apis': usage.count(),
            'recent_usage_count': recent_usage.count(),
        })
