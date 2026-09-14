from __future__ import annotations

from typing import Any

from django.utils import timezone

from .repositories import MongoRepository


PERSIAN_API_SLUGS = (
    "neshan-maps",
    "kavenegar-sms",
    "zarinpal-payment-gateway",
    "arvancloud-cdn",
)


CATEGORY_SPECS = (
    {
        "slug": "fintech",
        "name": "فین‌تک",
        "name_en": "Fintech",
        "description": "سرویس‌های پرداخت، بانکداری و عملیات مالی برای کسب‌وکارهای ایرانی.",
        "icon": "wallet",
        "color": "#0f766e",
    },
    {
        "slug": "location",
        "name": "نقشه و مکان",
        "name_en": "Location",
        "description": "نقشه، مسیریابی، ژئوکدینگ و سرویس‌های مکان‌محور ایران.",
        "icon": "map",
        "color": "#7c3aed",
    },
    {
        "slug": "communications",
        "name": "ارتباطات",
        "name_en": "Communications",
        "description": "سرویس‌های پیامک، اعلان و ارتباط با کاربران ایرانی.",
        "icon": "message-square",
        "color": "#ea580c",
    },
    {
        "slug": "cloud-infrastructure",
        "name": "زیرساخت ابری",
        "name_en": "Cloud Infrastructure",
        "description": "سرویس‌های ابری، شبکه توزیع محتوا، DNS و امنیت.",
        "icon": "cloud",
        "color": "#0891b2",
    },
)


API_SPECS = (
    {
        "slug": "neshan-maps",
        "category_slug": "location",
        "name": "نقشه نشان",
        "name_en": "Neshan Maps",
        "description": (
            "وب‌سرویس ایرانی نقشه نشان برای جست‌وجوی فارسی مکان‌ها، مسیریابی با ترافیک، "
            "ژئوکدینگ و دریافت تقسیمات کشوری. استفاده عملی نیازمند Service API Key از پنل نشان است."
        ),
        "short_description": "جست‌وجوی فارسی مکان، مسیریابی و ژئوکدینگ برای ایران.",
        "base_url": "https://api.neshan.org",
        "documentation_url": "https://platform.neshan.org/docs",
        "support_url": "https://platform.neshan.org/panel/tickets",
        "tags": ["نقشه", "مسیریابی", "ژئوکدینگ", "ایران", "فارسی"],
        "is_featured": True,
        "is_popular": True,
        "canonical_version": "v4",
        "public_auth_scheme": "api_key",
        "documentation": {
            "slug": "neshan-authentication",
            "title": "اتصال به وب‌سرویس‌های نشان",
            "content": (
                "کلید سرویس را از پنل نشان دریافت کنید و در هدر `Api-Key` بفرستید. "
                "کلید را در متغیر محیطی سمت سرور نگه دارید؛ آن را در کد، نمونه درخواست یا مرورگر قرار ندهید. "
                "فعال‌سازی هر سرویس و محدودیت مصرف را در پنل provider بررسی کنید."
            ),
        },
        "endpoints": (
            {
                "method": "GET",
                "path": "/v3/search",
                "name": "جست‌وجوی مکان‌مبنا",
                "summary": "جست‌وجوی عبارت فارسی نزدیک یک نقطه مرجع.",
                "group": "Location Search",
                "sample_request": {
                    "headers": {"Api-Key": "<NESHAN_SERVICE_KEY>"},
                    "query": {
                        "term": "تهران، میدان تجریش",
                        "lat": 35.807,
                        "lng": 51.4288,
                    },
                },
                "sample_response": {
                    "count": 1,
                    "items": [{"title": "میدان تجریش", "location": {"x": 51.4288, "y": 35.807}}],
                },
                "order": 1,
            },
            {
                "method": "GET",
                "path": "/v4/direction",
                "name": "مسیریابی با ترافیک",
                "summary": "محاسبه مسیر، زمان و مسافت با داده ترافیک زنده.",
                "group": "Routing",
                "sample_request": {
                    "headers": {"Api-Key": "<NESHAN_SERVICE_KEY>"},
                    "query": {
                        "type": "car",
                        "origin": "35.7208,51.4323",
                        "destination": "35.6703,51.2984",
                    },
                },
                "sample_response": {
                    "routes": [{"legs": [{"distance": {"value": 1820}, "duration": {"value": 487}}]}]
                },
                "order": 2,
            },
        ),
    },
    {
        "slug": "kavenegar-sms",
        "category_slug": "communications",
        "name": "پیامک کاوه‌نگار",
        "name_en": "Kavenegar SMS",
        "description": (
            "REST API ایرانی کاوه‌نگار برای ارسال پیامک تکی و الگوهای OTP و پیگیری وضعیت پیام. "
            "فراخوانی واقعی نیازمند API Key حساب کاوه‌نگار و خط ارسال معتبر است."
        ),
        "short_description": "ارسال پیامک فارسی، OTP و گزارش وضعیت تحویل.",
        "base_url": "https://api.kavenegar.com/v1",
        "documentation_url": "https://kavenegar.com/rest.html",
        "support_url": "https://kavenegar.com/contact.html",
        "tags": ["پیامک", "OTP", "اعلان", "ایران", "فارسی"],
        "is_featured": True,
        "is_popular": True,
        "canonical_version": "v1",
        "public_auth_scheme": "api_key",
        "documentation": {
            "slug": "kavenegar-authentication",
            "title": "احراز هویت کاوه‌نگار",
            "content": (
                "در API کاوه‌نگار کلید در بخش `{api_key}` مسیر قرار می‌گیرد. مقدار واقعی را فقط از secret manager "
                "یا متغیر محیطی سرور بخوانید. برای OTP از الگوی تأییدشده حساب خود استفاده کنید."
            ),
        },
        "endpoints": (
            {
                "method": "POST",
                "path": "/{api_key}/sms/send.json",
                "name": "ارسال پیامک",
                "summary": "ارسال یک پیامک به شماره گیرنده ایرانی.",
                "group": "SMS",
                "sample_request": {
                    "path": {"api_key": "<KAVENEGAR_API_KEY>"},
                    "form": {"receptor": "09121234567", "sender": "10004346", "message": "سلام از ایران API"},
                },
                "sample_response": {
                    "return": {"status": 200, "message": "تایید شد"},
                    "entries": [{"messageid": 123456, "status": 1, "statustext": "در صف ارسال"}],
                },
                "order": 1,
            },
            {
                "method": "POST",
                "path": "/{api_key}/verify/lookup.json",
                "name": "ارسال کد تأیید",
                "summary": "ارسال OTP با template تأییدشده کاوه‌نگار.",
                "group": "Verify",
                "sample_request": {
                    "path": {"api_key": "<KAVENEGAR_API_KEY>"},
                    "form": {"receptor": "09121234567", "token": "123456", "template": "verify"},
                },
                "sample_response": {
                    "return": {"status": 200, "message": "تایید شد"},
                    "entries": [{"messageid": 123457, "status": 1}],
                },
                "order": 2,
            },
        ),
    },
    {
        "slug": "zarinpal-payment-gateway",
        "category_slug": "fintech",
        "name": "درگاه پرداخت زرین‌پال",
        "name_en": "ZarinPal Payment Gateway",
        "description": (
            "API درگاه پرداخت زرین‌پال برای ساخت درخواست پرداخت و تأیید تراکنش پس از callback. "
            "فراخوانی واقعی به Merchant ID فعال و رعایت چرخه انتقال کاربر به درگاه نیاز دارد."
        ),
        "short_description": "ساخت و تأیید پرداخت ریالی با درگاه زرین‌پال.",
        "base_url": "https://api.zarinpal.com",
        "documentation_url": "https://docs.zarinpal.com/paymentGateway/",
        "support_url": "https://www.zarinpal.com/contact.html",
        "tags": ["پرداخت", "فین‌تک", "تراکنش", "ریال", "ایران"],
        "is_featured": True,
        "is_popular": True,
        "canonical_version": "v4",
        "public_auth_scheme": "merchant_id",
        "documentation": {
            "slug": "zarinpal-payment-flow",
            "title": "چرخه پرداخت زرین‌پال",
            "content": (
                "ابتدا `payment/request` را فقط از backend فراخوانی کنید. سپس کاربر را با Authority به درگاه ببرید. "
                "بعد از callback، وضعیت URL را کافی ندانید و همان مبلغ و Authority را با `payment/verify` تأیید کنید. "
                "Merchant ID باید secret سمت سرور بماند."
            ),
        },
        "endpoints": (
            {
                "method": "POST",
                "path": "/pg/v4/payment/request.json",
                "name": "ساخت درخواست پرداخت",
                "summary": "ایجاد Authority برای انتقال کاربر به درگاه.",
                "group": "Payment",
                "sample_request": {
                    "merchant_id": "<ZARINPAL_MERCHANT_ID>",
                    "amount": 100000,
                    "currency": "IRR",
                    "description": "پرداخت سفارش ۱۲۳۴",
                    "callback_url": "https://example.com/payments/zarinpal/callback",
                },
                "sample_response": {"data": {"code": 100, "authority": "A000000000000000000000000000000001"}, "errors": []},
                "order": 1,
            },
            {
                "method": "POST",
                "path": "/pg/v4/payment/verify.json",
                "name": "تأیید پرداخت",
                "summary": "اعتبارسنجی نهایی تراکنش پس از بازگشت کاربر.",
                "group": "Payment",
                "sample_request": {
                    "merchant_id": "<ZARINPAL_MERCHANT_ID>",
                    "amount": 100000,
                    "authority": "A000000000000000000000000000000001",
                },
                "sample_response": {"data": {"code": 100, "ref_id": 123456789, "card_pan": "621986******1234"}, "errors": []},
                "order": 2,
            },
        ),
    },
    {
        "slug": "arvancloud-cdn",
        "category_slug": "cloud-infrastructure",
        "name": "CDN ابر آروان",
        "name_en": "ArvanCloud CDN",
        "description": (
            "API شبکه توزیع محتوا و DNS ابر آروان برای مدیریت دامنه، تنظیمات cache و پاک‌سازی cache. "
            "فراخوانی واقعی نیازمند API Key ماشین با scope حداقلی است."
        ),
        "short_description": "مدیریت دامنه، cache و تنظیمات CDN ابر آروان.",
        "base_url": "https://napi.arvancloud.ir/cdn/4.0",
        "documentation_url": "https://www.arvancloud.ir/api/cdn/4.0",
        "support_url": "https://panel.arvancloud.ir/support/tickets",
        "tags": ["ابر", "CDN", "DNS", "کش", "ایران"],
        "is_featured": False,
        "is_popular": True,
        "canonical_version": "4.0",
        "public_auth_scheme": "api_key",
        "documentation": {
            "slug": "arvancloud-authentication",
            "title": "دسترسی امن به API ابر آروان",
            "content": (
                "API Key ماشین را با کمترین scope لازم بسازید و طبق مستند provider در هدر `Authorization` بفرستید. "
                "کلید را commit نکنید. پاک‌سازی cache عملیات واقعی است؛ دامنه و scope کلید را پیش از اجرا کنترل کنید."
            ),
        },
        "endpoints": (
            {
                "method": "GET",
                "path": "/domains",
                "name": "فهرست دامنه‌ها",
                "summary": "دریافت دامنه‌های CDN حساب.",
                "group": "Domains",
                "sample_request": {
                    "headers": {"Authorization": "apikey <ARVANCLOUD_API_KEY>"},
                    "query": {"page": 1, "per_page": 20},
                },
                "sample_response": {"data": [{"domain": "example.ir", "status": "active"}], "meta": {"current_page": 1}},
                "order": 1,
            },
            {
                "method": "POST",
                "path": "/domains/{domain}/caching/purge",
                "name": "پاک‌سازی cache",
                "summary": "پاک‌سازی cache دامنه یا URLهای انتخابی.",
                "group": "Caching",
                "sample_request": {
                    "headers": {"Authorization": "apikey <ARVANCLOUD_API_KEY>"},
                    "path": {"domain": "example.ir"},
                    "body": {"purge": "all"},
                },
                "sample_response": {"message": "عملیات پاک‌سازی cache ثبت شد."},
                "order": 2,
            },
        ),
    },
)


def _ensure_document(collection, query: dict[str, Any], document: dict[str, Any]) -> dict[str, Any]:
    existing = collection.find_one(query)
    if existing:
        update = {key: value for key, value in document.items() if key not in {"_id", "created_at"}}
        collection.update_one({"_id": existing["_id"]}, {"$set": update})
        return collection.find_one({"_id": existing["_id"]}) or existing
    collection.insert_one(document)
    return document


def seed_persian_api_catalog(
    repository: MongoRepository,
    *,
    owner: dict[str, Any] | None = None,
    now=None,
) -> dict[str, int]:
    """Insert curated Iranian provider metadata without making external requests."""
    now = now or timezone.now()
    categories_by_slug: dict[str, dict[str, Any]] = {}

    for spec in CATEGORY_SPECS:
        category = _ensure_document(
            repository.categories,
            {"slug": spec["slug"]},
            repository.build_category_document({**spec, "created_at": now, "updated_at": now}),
        )
        categories_by_slug[spec["slug"]] = category

    api_count = 0
    documentation_count = 0
    endpoint_count = 0
    for spec in API_SPECS:
        category = categories_by_slug[spec["category_slug"]]
        api_payload = {
            key: value
            for key, value in spec.items()
            if key not in {"category_slug", "documentation", "endpoints"}
        }
        api_doc = _ensure_document(
            repository.apis,
            {"slug": spec["slug"]},
            repository.build_api_document(
                {
                    **api_payload,
                    "category_id": int(category["_id"]),
                    "status": "active",
                    "publication_status": "published",
                    "rapidapi_package_slug": "",
                    "rapidapi_listing_url": "",
                    "created_by_user_id": int(owner["_id"]) if owner else None,
                    "created_by_username": owner["username"] if owner else "IranAPI",
                    "created_at": now,
                    "updated_at": now,
                }
            ),
        )
        api_count += 1

        documentation = spec["documentation"]
        _ensure_document(
            repository.documentations,
            {"api_slug": api_doc["slug"], "slug": documentation["slug"]},
            repository.build_documentation_document(
                {
                    **documentation,
                    "api_id": int(api_doc["_id"]),
                    "api_slug": api_doc["slug"],
                    "order": 1,
                    "is_active": True,
                    "created_at": now,
                    "updated_at": now,
                }
            ),
        )
        documentation_count += 1

        for endpoint in spec["endpoints"]:
            _ensure_document(
                repository.api_endpoints,
                {"api_slug": api_doc["slug"], "method": endpoint["method"], "path": endpoint["path"]},
                repository.build_endpoint_document(
                    {
                        **endpoint,
                        "api_id": int(api_doc["_id"]),
                        "api_slug": api_doc["slug"],
                        "requires_auth": True,
                        "is_active": True,
                        "created_at": now,
                        "updated_at": now,
                    }
                ),
            )
            endpoint_count += 1

    return {
        "categories": len(CATEGORY_SPECS),
        "apis": api_count,
        "documentations": documentation_count,
        "endpoints": endpoint_count,
    }
