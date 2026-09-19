"""
Django settings for IranAPIBackend project.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/6.0/ref/settings/
"""

import os
import re
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend_static"
PROJECT_ARCHIVE_ROOT = Path(os.getenv("IRANAPI_PROJECT_ARCHIVE_ROOT", str(BASE_DIR / "media" / "project-archives")))
DATA_UPLOAD_MAX_MEMORY_SIZE = 26 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
PROJECT_DEPLOYMENT_PUBLIC_HOST = os.getenv("IRANAPI_PROJECT_DEPLOYMENT_PUBLIC_HOST", "http://localhost")
PROJECT_DEPLOYMENT_BUILD_TIMEOUT_SECONDS = max(
    60, min(int(os.getenv("IRANAPI_PROJECT_DEPLOYMENT_BUILD_TIMEOUT_SECONDS", "900")), 3600)
)
PROJECT_DEPLOYMENT_POLL_SECONDS = max(
    1.0, min(float(os.getenv("IRANAPI_PROJECT_DEPLOYMENT_POLL_SECONDS", "2")), 30.0)
)
PROJECT_DEPLOYMENT_MEMORY = os.getenv("IRANAPI_PROJECT_DEPLOYMENT_MEMORY", "512m")
PROJECT_DEPLOYMENT_CPUS = os.getenv("IRANAPI_PROJECT_DEPLOYMENT_CPUS", "1.0")
PROJECT_DEPLOYMENT_ENABLED = os.getenv("IRANAPI_PROJECT_DEPLOYMENT_ENABLED", "true").lower() in {
    "1",
    "true",
    "yes",
    "on",
}
TEMPLATE_DIRS = [FRONTEND_DIR]


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() in {"1", "true", "yes", "on"}
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-local-development-only")
if not DEBUG and SECRET_KEY == "django-insecure-local-development-only":
    raise RuntimeError("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false.")

AUTO_SEED_SAMPLE_DATA = os.getenv("IRANAPI_AUTO_SEED_SAMPLE_DATA", "false").lower() in {"1", "true", "yes", "on"}

# One MongoDB deployment is the source of truth for Django, catalog, account,
# billing, workflow, and admin data. No runtime SQLite or process-memory store.
MONGODB_URI = os.getenv("IRANAPI_MONGODB_URI", "mongodb://localhost:27017/")
MONGODB_DATABASE = os.getenv("IRANAPI_MONGODB_DATABASE", "iranapi")
MONGODB_SERVER_SELECTION_TIMEOUT_MS = max(
    1000, min(int(os.getenv("IRANAPI_MONGODB_SERVER_SELECTION_TIMEOUT_MS", "5000")), 30000)
)
MONGODB_CONNECT_TIMEOUT_MS = max(
    1000, min(int(os.getenv("IRANAPI_MONGODB_CONNECT_TIMEOUT_MS", "5000")), 30000)
)
MONGODB_ALLOW_RESET = os.getenv("IRANAPI_MONGODB_ALLOW_RESET", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}

# Caller supports public HTTP(S) destinations with DNS/IP validation. Catalog
# mode remains server-owned and requires account access.
CALLER_CONNECT_TIMEOUT_SECONDS = max(1.0, min(float(os.getenv("IRANAPI_CALLER_CONNECT_TIMEOUT", "4")), 10.0))
CALLER_READ_TIMEOUT_SECONDS = max(1.0, min(float(os.getenv("IRANAPI_CALLER_READ_TIMEOUT", "8")), 20.0))
CALLER_MAX_REQUEST_BYTES = max(1024, min(int(os.getenv("IRANAPI_CALLER_MAX_REQUEST_BYTES", "65536")), 262144))
CALLER_MAX_RESPONSE_BYTES = max(4096, min(int(os.getenv("IRANAPI_CALLER_MAX_RESPONSE_BYTES", "524288")), 2097152))
CALLER_PROVIDERS = {
    "neshan-maps": {
        "base_url": "https://api.neshan.org",
        "hostname": "api.neshan.org",
        "credential_env": "NESHAN_SERVICE_KEY",
        "auth": {"type": "header", "name": "Api-Key"},
        "body_encoding": "json",
    },
    "kavenegar-sms": {
        "base_url": "https://api.kavenegar.com/v1",
        "hostname": "api.kavenegar.com",
        "credential_env": "KAVENEGAR_API_KEY",
        "auth": {"type": "path", "placeholder": "api_key"},
        "body_encoding": "form",
    },
    "zarinpal-payment-gateway": {
        "base_url": "https://api.zarinpal.com",
        "hostname": "api.zarinpal.com",
        "credential_env": "ZARINPAL_MERCHANT_ID",
        "auth": {"type": "json_field", "name": "merchant_id"},
        "body_encoding": "json",
    },
    "arvancloud-cdn": {
        "base_url": "https://napi.arvancloud.ir/cdn/4.0",
        "hostname": "napi.arvancloud.ir",
        "credential_env": "ARVANCLOUD_API_KEY",
        "auth": {"type": "header", "name": "Authorization", "prefix": "apikey "},
        "body_encoding": "json",
    },
}

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,::1,backend,0.0.0.0,*",
    ).split(",")
    if host.strip()
]

# Runflare temporary deployment hosts rotate. Keep the platform wildcard and
# exact localhost origins; never pin ad-hoc *.runflare.cloud hostnames here.
CSRF_TRUSTED_ORIGINS = [
    'https://*.runflare.cloud',
]

if DEBUG:
    CSRF_TRUSTED_ORIGINS += [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://frontend:5173",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.MongoSessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'EXCEPTION_HANDLER': 'api.exceptions.exception_handler',
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.getenv('IRANAPI_CALLER_ANON_RATE', '30/hour'),
        'user': os.getenv('IRANAPI_CALLER_USER_RATE', '120/hour'),
    },
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'api.admin_auth.MongoDeveloperBackend',
]

MONGO_SESSION_COOKIE_NAME = os.getenv('IRANAPI_MONGO_SESSION_COOKIE_NAME', 'iranapi_session')

# Social providers are opt-in. Keep credentials and authorization URLs out of
# source control; an empty URL keeps the provider visible but safely disabled.
def _social_provider(label: str, env_name: str) -> dict[str, object]:
    auth_url = os.getenv(env_name, '').strip()
    return {
        'label': label,
        'enabled': bool(auth_url),
        'auth_url': auth_url,
    }


SOCIAL_AUTH_PROVIDERS = {
    'google': _social_provider('Google', 'IRANAPI_GOOGLE_AUTH_URL'),
    'github': _social_provider('GitHub', 'IRANAPI_GITHUB_AUTH_URL'),
}

JAZZMIN_SETTINGS = {
    "site_title": "IranAPI Backend",
    "site_header": "IranAPI",
    "site_brand": "IranAPI",
    "welcome_sign": "IranAPI control console",
    "copyright": "IranAPI",
    "search_model": ["auth.User"],
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": [
        "api.LiveDataConsole",
        "api.CategoriesSection",
        "api.ApisSection",
        "api.PricingPlansSection",
        "api.SubscriptionPlansSection",
        "api.DocumentationsSection",
        "api.ApiEndpointsSection",
        "api.AccessGrantsSection",
        "api.UserSubscriptionsSection",
        "api.SubscriptionCheckoutsSection",
        "api.OrganizationsSection",
        "api.StudioFlowsSection",
        "api.ApiProjectsSection",
        "api.ApiUsageSection",
        "auth",
    ],
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.User": "fas fa-user-shield",
        "auth.Group": "fas fa-layer-group",
        "api.LiveDataConsole": "fas fa-database",
        "api.CategoriesSection": "fas fa-folder-tree",
        "api.ApisSection": "fas fa-plug",
        "api.PricingPlansSection": "fas fa-tags",
        "api.SubscriptionPlansSection": "fas fa-box-open",
        "api.DocumentationsSection": "fas fa-book-open",
        "api.ApiEndpointsSection": "fas fa-route",
        "api.AccessGrantsSection": "fas fa-key",
        "api.UserSubscriptionsSection": "fas fa-user-check",
        "api.SubscriptionCheckoutsSection": "fas fa-credit-card",
        "api.OrganizationsSection": "fas fa-building",
        "api.StudioFlowsSection": "fas fa-project-diagram",
        "api.ApiProjectsSection": "fas fa-code",
        "api.ApiUsageSection": "fas fa-chart-line",
    },
    "topmenu_links": [
        {"name": "Site", "url": "/", "permissions": ["auth.view_user"]},
        {"app": "api"},
    ],
    "custom_css": "api/admin-theme.css",
    "show_ui_builder": False,
    "related_modal_active": True,
}

JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",
    "default_theme_mode": "dark",
    "navbar": "navbar-dark",
    "accent": "accent-success",
    "sidebar": "sidebar-dark-success",
    "brand_colour": "navbar-success",
    "button_classes": {
        "primary": "btn-outline-success",
        "secondary": "btn-outline-info",
        "info": "btn-outline-info",
        "warning": "btn-outline-warning",
        "danger": "btn-outline-danger",
        "success": "btn-outline-success",
    },
    "actions_sticky_top": True,
}


INSTALLED_APPS = [
    "whitenoise.runserver_nostatic",
    "jazzmin",
    "IranAPIBackend.apps.MongoAdminConfig",
    "IranAPIBackend.apps.MongoAuthConfig",
    "IranAPIBackend.apps.MongoContentTypesConfig",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_mongodb_backend",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "api.apps.ApiConfig",
]

MIDDLEWARE = [
    "api.middleware.RequestContextMiddleware",
    "api.middleware.AdminLocalAssetsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "api.middleware.SecurityHeadersMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'IranAPIBackend.urls'

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": TEMPLATE_DIRS,
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = 'IranAPIBackend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django_mongodb_backend",
        "HOST": MONGODB_URI,
        "NAME": MONGODB_DATABASE,
        "OPTIONS": {
            "appname": "IranAPI-Django",
            "connectTimeoutMS": MONGODB_CONNECT_TIMEOUT_MS,
            "serverSelectionTimeoutMS": MONGODB_SERVER_SELECTION_TIMEOUT_MS,
            "uuidRepresentation": "standard",
        },
        "TEST": {"NAME": os.getenv("IRANAPI_MONGODB_TEST_DATABASE", "test_iranapi")},
    }
}

DATABASE_ROUTERS = ["django_mongodb_backend.routers.MongoRouter"]
MIGRATION_MODULES = {
    "admin": "mongo_migrations.admin",
    "auth": "mongo_migrations.auth",
    "contenttypes": "mongo_migrations.contenttypes",
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'fa-ir'

# Keep every Django-generated response explicitly Unicode-safe.
DEFAULT_CHARSET = 'utf-8'

TIME_ZONE = 'Asia/Tehran'

USE_I18N = True

USE_TZ = True

# HTTPS protections are on by default whenever debug mode is disabled. A local
# development server remains usable over plain HTTP.
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False  # SPA reads this value and sends X-CSRFToken.
CSRF_COOKIE_SAMESITE = "Lax"
X_FRAME_OPTIONS = "DENY"

# Trust forwarded HTTPS only when deployment proxy strips client-supplied
# X-Forwarded-Proto and sets its own value.
TRUST_PROXY_SSL_HEADER = os.getenv("IRANAPI_TRUST_PROXY_SSL_HEADER", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}
if TRUST_PROXY_SSL_HEADER:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

CONTENT_SECURITY_POLICY = (
    "default-src 'self'; "
    "base-uri 'self'; "
    "object-src 'none'; "
    "frame-ancestors 'none'; "
    "form-action 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: https:; "
    "font-src 'self' data:; "
    "connect-src 'self'"
)
ADMIN_CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY.replace(
    "script-src 'self'",
    "script-src 'self' 'unsafe-inline'",
).replace(
    "style-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
).replace(
    "font-src 'self' data:",
    "font-src 'self' data: https://fonts.gstatic.com",
)
PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
FRONTEND_ASSETS_DIR = FRONTEND_DIR / "assets"
STATICFILES_DIRS = [("assets", FRONTEND_ASSETS_DIR)] if FRONTEND_ASSETS_DIR.is_dir() else []
WHITENOISE_ROOT = FRONTEND_DIR


def _vite_asset_is_immutable(path, url):
    """Treat Vite's content-hashed assets as immutable across every host."""
    normalized_url = f"/{str(url).lstrip('/')}"
    return normalized_url.startswith("/assets/") and bool(
        re.search(r"-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$", normalized_url)
    )


WHITENOISE_IMMUTABLE_FILE_TEST = _vite_asset_is_immutable

# Default primary key field type
# https://docs.djangoproject.com/en/6.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"
