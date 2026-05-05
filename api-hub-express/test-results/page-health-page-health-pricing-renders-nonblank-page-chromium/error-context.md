# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-health.spec.ts >> page health >> /pricing renders nonblank page
- Location: e2e\page-health.spec.ts:21:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/pricing", waiting until "networkidle"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - status "در حال آماده‌سازی IranAPI":
      - generic:
        - generic:
          - paragraph: iranapi://boot-sequence
        - generic:
          - generic:
            - paragraph: Developer Ops Console
            - heading "IranAPI" [level=2]
            - paragraph: همگام‌سازی مستندات، بازار API و داشبورد توسعه‌دهنده
          - generic:
            - generic:
              - code: INIT ROUTER
              - strong: OK
            - generic:
              - code: SCAN API VAULT
              - strong: OK
            - generic:
              - code: MASK SECRETS
              - strong: OK
            - generic:
              - code: ARM UI
              - strong: OK
          - paragraph: کلیدها پشت شیشه ضدکنجکاوی قفل شدند.
    - link "پرش به محتوای اصلی" [ref=e4]:
      - /url: "#main-content"
    - generic [ref=e5]:
      - banner [ref=e6]:
        - generic [ref=e8]:
          - link "IranAPI کنسول API" [ref=e9]:
            - /url: /
            - img [ref=e11]
            - generic [ref=e19]:
              - generic [ref=e20]: IranAPI
              - generic [ref=e21]: کنسول API
          - navigation "ناوبری اصلی" [ref=e22]:
            - link "خانه" [ref=e23]:
              - /url: /
              - img [ref=e24]
              - generic [ref=e27]: خانه
            - link "کشف APIها" [ref=e28]:
              - /url: /browse
              - img [ref=e29]
              - generic [ref=e32]: کشف APIها
            - link "مستندات" [ref=e33]:
              - /url: /documentation
              - img [ref=e34]
              - generic [ref=e36]: مستندات
            - link "قیمت‌گذاری" [ref=e37]:
              - /url: /pricing
              - img [ref=e38]
              - generic [ref=e42]: قیمت‌گذاری
            - link "فراخوان API" [ref=e43]:
              - /url: /caller
              - img [ref=e44]
              - generic [ref=e47]: فراخوان API
            - link "استودیو" [ref=e48]:
              - /url: /studio
              - img [ref=e49]
              - generic [ref=e55]: استودیو
          - generic [ref=e56]:
            - button "زبان" [ref=e57]:
              - img
              - generic [ref=e58]: زبان
            - button "تغییر حالت نمایش" [ref=e59]:
              - img
              - img
              - generic: تغییر تم
            - generic [ref=e60]:
              - link "ورود" [ref=e61]:
                - /url: /signin
              - link "ساخت حساب" [ref=e62]:
                - /url: /signup
                - img
                - text: ساخت حساب
      - main [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - paragraph [ref=e66]: پلن‌ها و ظرفیت‌ها
            - heading "قیمت، سقف مصرف و وضعیت سرویس‌ها را یک‌جا مقایسه کنید" [level=1] [ref=e67]
            - paragraph [ref=e68]: این صفحه اشتراک‌های حساب کاربری و پلن‌های هر API را از بک‌اند نمایش می‌دهد تا هزینه، ظرفیت و آمادگی سرویس‌ها شفاف باشد.
          - generic [ref=e69]:
            - generic [ref=e71]:
              - paragraph [ref=e72]: پلن‌های فعال
              - paragraph [ref=e73]: ۳
            - generic [ref=e75]:
              - paragraph [ref=e76]: APIهای دارای پلن
              - paragraph [ref=e77]: ۳
            - generic [ref=e79]:
              - paragraph [ref=e80]: پلن‌های محبوب
              - paragraph [ref=e81]: ۲
        - region "IranAPI pages synced into one marketplace UX" [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e85]: RapidAPI-inspired
              - generic [ref=e86]:
                - heading "IranAPI pages synced into one marketplace UX" [level=2] [ref=e87]
                - paragraph [ref=e88]: "Inspired by RapidAPI patterns, but branded and worded for IranAPI: discovery, subscriptions, endpoint tests, snippets, Studio publishing, and analytics share one product surface."
              - generic [ref=e89]:
                - link "API Hub" [ref=e90]:
                  - /url: /browse
                - link "Studio" [ref=e91]:
                  - /url: /studio
            - generic [ref=e92]:
              - generic [ref=e93]:
                - generic [ref=e94]:
                  - img [ref=e95]
                  - paragraph [ref=e98]: IranAPI Hub discovery
                  - img [ref=e99]
                - paragraph [ref=e102]: Search, categories, ratings, popularity, provider identity, and listing readiness stay visible in IranAPI.
              - generic [ref=e103]:
                - generic [ref=e104]:
                  - img [ref=e105]
                  - paragraph [ref=e108]: Endpoint testing
                  - img [ref=e109]
                - paragraph [ref=e112]: Each API detail keeps method, path, request body, response preview, and browser-run feedback together.
              - generic [ref=e113]:
                - generic [ref=e114]:
                  - img [ref=e115]
                  - paragraph [ref=e119]: Code snippets
                  - img [ref=e120]
                - paragraph [ref=e123]: cURL, JavaScript, TypeScript, Python, Node, PHP, Go, C#, Java, and Ruby snippets share one endpoint source.
              - generic [ref=e124]:
                - generic [ref=e125]:
                  - img [ref=e126]
                  - paragraph [ref=e128]: Plans and quotas
                  - img [ref=e129]
                - paragraph [ref=e132]: Free, freemium, paid, monthly or daily quotas, plan features, and activation status map into pricing cards.
              - generic [ref=e133]:
                - generic [ref=e134]:
                  - img [ref=e135]
                  - paragraph [ref=e137]: Analytics loop
                  - img [ref=e138]
                - paragraph [ref=e141]: Dashboard and Studio surfaces expose requests, active APIs, usage signals, endpoint checks, and search insights.
        - generic [ref=e142]:
          - generic [ref=e143]:
            - paragraph [ref=e144]: اشتراک توسعه‌دهنده
            - heading "پلن‌های عضویت IranAPI" [level=2] [ref=e145]
            - paragraph [ref=e146]: این پلن‌ها ظرفیت انتشار API، سقف مصرف ماهانه و امکانات داشبورد را برای حساب توسعه‌دهنده مشخص می‌کنند.
          - generic [ref=e147]:
            - generic [ref=e148]:
              - generic [ref=e149]:
                - generic [ref=e151]: starter
                - heading "Starter" [level=3] [ref=e152]
              - generic [ref=e153]:
                - paragraph [ref=e154]: ۰ IRR / ماه
                - paragraph [ref=e155]: برای تیم‌های کوچک که می‌خواهند API منتشر کنند و مصرف پایه را رصد کنند.
                - generic [ref=e156]:
                  - paragraph [ref=e157]: "انتشار API: ۳ API"
                  - paragraph [ref=e158]: "درخواست ماهانه: ۲۵٬۰۰۰"
                - list [ref=e159]:
                  - listitem [ref=e160]: • انتشار ۳ API
                  - listitem [ref=e161]: • داشبورد مصرف
                  - listitem [ref=e162]: • پروفایل توسعه‌دهنده
                - link "انتخاب این اشتراک" [ref=e163]:
                  - /url: /payment?subscription=1
            - generic [ref=e164]:
              - generic [ref=e165]:
                - generic [ref=e166]:
                  - generic [ref=e167]: growth
                  - generic [ref=e168]: محبوب
                - heading "Growth" [level=3] [ref=e169]
              - generic [ref=e170]:
                - paragraph [ref=e171]: ۱٬۴۹۰٬۰۰۰ IRR / ماه
                - paragraph [ref=e172]: برای تیم‌هایی که چند سرویس فعال، گزارش مصرف و اولویت انتشار می‌خواهند.
                - generic [ref=e173]:
                  - paragraph [ref=e174]: "انتشار API: ۱۵ API"
                  - paragraph [ref=e175]: "درخواست ماهانه: ۲۵۰٬۰۰۰"
                - list [ref=e176]:
                  - listitem [ref=e177]: • انتشار ۱۵ API
                  - listitem [ref=e178]: • گزارش مصرف پیشرفته
                  - listitem [ref=e179]: • اولویت بررسی API
                  - listitem [ref=e180]: • پشتیبانی ایمیلی
                - link "انتخاب این اشتراک" [ref=e181]:
                  - /url: /payment?subscription=2
            - generic [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e185]: scale
                - heading "Scale" [level=3] [ref=e186]
              - generic [ref=e187]:
                - paragraph [ref=e188]: ۴٬۹۹۰٬۰۰۰ IRR / ماه
                - paragraph [ref=e189]: برای سازمان‌هایی که انتشار نامحدود، SLA و کنترل عملیاتی نیاز دارند.
                - generic [ref=e190]:
                  - paragraph [ref=e191]: "انتشار API: نامحدود"
                  - paragraph [ref=e192]: "درخواست ماهانه: ۱٬۰۰۰٬۰۰۰"
                - list [ref=e193]:
                  - listitem [ref=e194]: • انتشار نامحدود
                  - listitem [ref=e195]: • SLA اختصاصی
                  - listitem [ref=e196]: • گزارش سازمانی
                  - listitem [ref=e197]: • پشتیبانی اولویت‌دار
                - link "انتخاب این اشتراک" [ref=e198]:
                  - /url: /payment?subscription=3
        - heading "Pricing plans list" [level=2] [ref=e199]
        - generic [ref=e200]:
          - generic [ref=e201]:
            - generic [ref=e202]:
              - generic [ref=e204]: هاب پرداخت
              - heading "Starter Billing" [level=3] [ref=e205]
            - generic [ref=e206]:
              - paragraph [ref=e207]: ۵۹۰٬۰۰۰ IRR
              - generic [ref=e208]:
                - paragraph [ref=e209]: "نوع پلن: basic"
                - paragraph [ref=e210]: "درخواست روزانه: ۱٬۲۰۰"
                - paragraph [ref=e211]: "درخواست ماهانه: ۲۰٬۰۰۰"
                - paragraph [ref=e212]: "وضعیت دسترسی: آماده فعال‌سازی"
              - list [ref=e213]:
                - listitem [ref=e214]: • گزارش تراکنش
                - listitem [ref=e215]: • وب‌هوک پرداخت
                - listitem [ref=e216]: • داشبورد پایه
              - generic [ref=e217]:
                - link "شروع فعال‌سازی" [ref=e218]:
                  - /url: /payment?plan=2
                - link "جزئیات API" [ref=e219]:
                  - /url: /api/payments-hub
          - generic [ref=e220]:
            - generic [ref=e221]:
              - generic [ref=e222]:
                - generic [ref=e223]: درگاه گفتار
                - generic [ref=e224]: محبوب
              - heading "Pro Voice" [level=3] [ref=e225]
            - generic [ref=e226]:
              - paragraph [ref=e227]: ۷۹۰٬۰۰۰ IRR
              - generic [ref=e228]:
                - paragraph [ref=e229]: "نوع پلن: pro"
                - paragraph [ref=e230]: "درخواست روزانه: ۲٬۵۰۰"
                - paragraph [ref=e231]: "درخواست ماهانه: ۵۰٬۰۰۰"
                - paragraph [ref=e232]: "وضعیت دسترسی: آماده فعال‌سازی"
              - list [ref=e233]:
                - listitem [ref=e234]: • پشتیبانی اولویت‌دار
                - listitem [ref=e235]: • نمونه درخواست‌های آماده
                - listitem [ref=e236]: • تحلیل مصرف
              - generic [ref=e237]:
                - link "شروع فعال‌سازی" [ref=e238]:
                  - /url: /payment?plan=1
                - link "جزئیات API" [ref=e239]:
                  - /url: /api/speech-gateway
          - generic [ref=e240]:
            - generic [ref=e241]:
              - generic [ref=e242]:
                - generic [ref=e243]: مسیریاب ژئو
                - generic [ref=e244]: محبوب
              - heading "Team Routing" [level=3] [ref=e245]
            - generic [ref=e246]:
              - paragraph [ref=e247]: ۱٬۲۹۰٬۰۰۰ IRR
              - generic [ref=e248]:
                - paragraph [ref=e249]: "نوع پلن: enterprise"
                - paragraph [ref=e250]: "درخواست روزانه: ۵٬۰۰۰"
                - paragraph [ref=e251]: "درخواست ماهانه: ۱۰۰٬۰۰۰"
                - paragraph [ref=e252]: "وضعیت دسترسی: آماده فعال‌سازی"
              - list [ref=e253]:
                - listitem [ref=e254]: • مسیر چندایستگاهی
                - listitem [ref=e255]: • وب‌هوک رخداد
                - listitem [ref=e256]: • گزارش کیفیت
              - generic [ref=e257]:
                - link "شروع فعال‌سازی" [ref=e258]:
                  - /url: /payment?plan=3
                - link "جزئیات API" [ref=e259]:
                  - /url: /api/geo-routes
      - contentinfo [ref=e260]:
        - generic [ref=e261]:
          - generic [ref=e262]:
            - paragraph [ref=e263]:
              - img [ref=e264]
              - text: IranAPI
            - paragraph [ref=e270]: یک کنسول فارسی و انگلیسی برای کشف API، مقایسه پلن‌ها، خواندن مستندات و مدیریت دسترسی از ایده تا اتصال پایدار.
            - generic [ref=e271]:
              - generic [ref=e272]:
                - img [ref=e273]
                - text: v1 live
              - generic [ref=e280]:
                - img [ref=e281]
                - text: telemetry-ready
          - generic [ref=e283]:
            - paragraph [ref=e284]: دسترسی سریع
            - generic [ref=e285]:
              - link "کشف APIها" [ref=e286]:
                - /url: /browse
              - link "مستندات" [ref=e287]:
                - /url: /documentation
              - link "قیمت‌گذاری" [ref=e288]:
                - /url: /pricing
          - generic [ref=e289]:
            - paragraph [ref=e290]: اعتماد و سیاست‌ها
            - generic [ref=e291]:
              - link "شرایط استفاده" [ref=e292]:
                - /url: /terms
              - link "حریم خصوصی" [ref=e293]:
                - /url: /privacy
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const routes = [
  4  |   "/",
  5  |   "/browse",
  6  |   "/documentation",
  7  |   "/pricing",
  8  |   "/payment",
  9  |   "/signin",
  10 |   "/signup",
  11 |   "/terms",
  12 |   "/privacy",
  13 |   "/dashboard",
  14 |   "/studio",
  15 |   "/org/organizations/create",
  16 |   "/missing-route",
  17 | ];
  18 | 
  19 | test.describe("page health", () => {
  20 |   for (const route of routes) {
  21 |     test(`${route} renders nonblank page`, async ({ page }) => {
  22 |       const errors: string[] = [];
  23 |       page.on("pageerror", (error) => errors.push(error.message));
  24 |       page.on("console", (message) => {
  25 |         if (message.type() === "error") {
  26 |           errors.push(message.text());
  27 |         }
  28 |       });
  29 | 
> 30 |       await page.goto(route, { waitUntil: "networkidle" });
     |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  31 | 
  32 |       const bodyText = (await page.locator("body").innerText()).trim();
  33 |       await expect(page.locator("body")).toBeVisible();
  34 |       expect(bodyText.length).toBeGreaterThan(20);
  35 |       expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
  36 |     });
  37 |   }
  38 | });
  39 | 
```