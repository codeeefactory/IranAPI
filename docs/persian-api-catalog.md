# کاتالوگ APIهای واقعی ایرانی

این کاتالوگ از backend و بدون قرار دادن کلید واقعی در repository ساخته می‌شود. داده‌های ثبت‌شده شامل URL اصلی provider، لینک مستندات، روش احراز هویت، راهنمای امنیتی و نمونه endpoint است.

## سرویس‌های موجود

| دسته | سرویس | slug | URL پایه |
|---|---|---|---|
| نقشه و مکان | نقشه نشان | `neshan-maps` | `https://api.neshan.org` |
| ارتباطات | پیامک کاوه‌نگار | `kavenegar-sms` | `https://api.kavenegar.com/v1` |
| فین‌تک | درگاه پرداخت زرین‌پال | `zarinpal-payment-gateway` | `https://api.zarinpal.com` |
| زیرساخت ابری | CDN ابر آروان | `arvancloud-cdn` | `https://napi.arvancloud.ir/cdn/4.0` |

## اجرای مرحله‌به‌مرحله

### ۱. ثبت کاتالوگ از backend

```bash
python manage.py seed_persian_apis
```

اجرای دوباره امن است؛ سند تکراری با slug و endpoint یکسان ساخته نمی‌شود.

در اجرای Docker بدون MongoDB خارجی، entrypoint متغیر زیر را فعال می‌کند و کاتالوگ هنگام بالا آمدن همان process ثبت می‌شود:

```text
IRANAPI_AUTO_SEED_SAMPLE_DATA=true
```

### ۲. بررسی دسته‌ها

```bash
curl http://localhost:8000/api/v1/catalog/categories/
```

### ۳. بررسی APIها

```bash
curl "http://localhost:8000/api/v1/catalog/apis/?search=نشان"
curl http://localhost:8000/api/v1/catalog/apis/kavenegar-sms/
curl http://localhost:8000/api/v1/catalog/apis/zarinpal-payment-gateway/endpoints/
curl http://localhost:8000/api/v1/catalog/apis/arvancloud-cdn/docs/
```

### ۴. اتصال واقعی به provider

از لینک `documentation_url` در پاسخ API استفاده کنید، حساب provider بسازید و credential را فقط در secret manager یا متغیر محیطی backend قرار دهید:

```text
NESHAN_SERVICE_KEY=...
KAVENEGAR_API_KEY=...
ZARINPAL_MERCHANT_ID=...
ARVANCLOUD_API_KEY=...
```

Caller اکنون درخواست واقعی را از backend ارسال می‌کند. credential هرگز به frontend یا response برنمی‌گردد. اجرای زنده برای کاربر عادی به access grant فعال همان API نیاز دارد (ادمین مستثنا است). مقصد فقط یکی از چهار provider ثابت بالا است، path و method باید دقیقاً با endpoint ثبت‌شده در catalog یکی باشد، redirect دنبال نمی‌شود، IPهای خصوصی/local مسدودند و timeout و محدودیت حجم request/response اعمال می‌شود.

برای جلوگیری از side effect ناخواسته، ابتدا endpointهای فقط‌خواندنی مثل جست‌وجوی نشان یا فهرست دامنه‌های آروان را تست کنید. ارسال پیامک، ساخت پرداخت و purge کردن cache عملیات واقعی و هزینه‌دار است.

## منابع رسمی

- [مستندات پلتفرم نقشه نشان](https://platform.neshan.org/docs)
- [مستندات REST کاوه‌نگار](https://kavenegar.com/rest.html)
- [مستندات درگاه پرداخت زرین‌پال](https://docs.zarinpal.com/paymentGateway/)
- [مستندات API ابر آروان](https://www.arvancloud.ir/api/cdn/4.0)
