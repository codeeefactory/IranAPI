# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-health.spec.ts >> page health >> / renders nonblank page
- Location: e2e\page-health.spec.ts:21:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('body')
Expected: visible
Received: undefined

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('body')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
  - generic [ref=e3]:
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
            - generic [ref=e66]: هاب API برای تیم‌های محصول، داده و توسعه
            - generic [ref=e67]:
              - heading "API مناسب را سریع پیدا کنید، مطمئن مقایسه کنید و بی‌دردسر متصل شوید" [level=1] [ref=e68]
              - paragraph [ref=e69]: IranAPI فهرست سرویس‌ها، مستندات، قیمت‌گذاری و وضعیت دسترسی را کنار هم می‌آورد تا تیم شما بدون جست‌وجوی پراکنده، API درست را انتخاب و مدیریت کند.
            - generic [ref=e70]:
              - link "کشف APIها" [ref=e71]:
                - /url: /browse
                - text: کشف APIها
                - img
              - link "مطالعه مستندات" [ref=e72]:
                - /url: /documentation
            - generic [ref=e73]:
              - generic [ref=e74]:
                - img [ref=e75]
                - text: ۳ API فعال
              - generic [ref=e77]:
                - img [ref=e78]
                - text: ۳ دسته‌بندی
              - generic [ref=e81]:
                - img [ref=e82]
                - text: داده یکپارچه، مستندات روشن، دسترسی قابل پیگیری
          - generic [ref=e85]:
            - img "نمای تصویری کنسول توسعه‌دهنده برای مدیریت APIها" [ref=e88]
            - generic [ref=e89]:
              - generic [ref=e90]: ساخته‌شده برای تصمیم‌های روزمره تیم فنی
              - heading "از انتخاب سرویس تا مدیریت دسترسی، همه چیز در یک جریان ساده" [level=2] [ref=e91]
            - generic [ref=e92]:
              - generic [ref=e93]:
                - paragraph [ref=e94]: جست‌وجوی سریع و قابل اعتماد
                - paragraph [ref=e95]: سرویس‌ها با دسته‌بندی، جست‌وجو و مرتب‌سازی روشن نمایش داده می‌شوند تا گزینه مناسب زودتر پیدا شود.
              - generic [ref=e96]:
                - paragraph [ref=e97]: مستندات و قیمت‌گذاری کنار هم
                - paragraph [ref=e98]: جزئیات فنی، پلن‌ها و وضعیت آماده‌بودن هر API در یک صفحه دیده می‌شود تا مقایسه کوتاه‌تر شود.
              - generic [ref=e99]:
                - paragraph [ref=e100]: داشبورد آماده برای عملیات
                - paragraph [ref=e101]: دسترسی‌ها، اشتراک‌ها و مصرف سرویس‌ها در یک کنسول قابل پیگیری می‌ماند.
        - region "IranAPI pages synced into one marketplace UX" [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]:
              - generic [ref=e105]: RapidAPI-inspired
              - generic [ref=e106]:
                - heading "IranAPI pages synced into one marketplace UX" [level=2] [ref=e107]
                - paragraph [ref=e108]: "Inspired by RapidAPI patterns, but branded and worded for IranAPI: discovery, subscriptions, endpoint tests, snippets, Studio publishing, and analytics share one product surface."
              - generic [ref=e109]:
                - link "API Hub" [ref=e110]:
                  - /url: /browse
                - link "Studio" [ref=e111]:
                  - /url: /studio
            - generic [ref=e112]:
              - generic [ref=e113]:
                - generic [ref=e114]:
                  - img [ref=e115]
                  - paragraph [ref=e118]: IranAPI Hub discovery
                  - img [ref=e119]
                - paragraph [ref=e122]: Search, categories, ratings, popularity, provider identity, and listing readiness stay visible in IranAPI.
              - generic [ref=e123]:
                - generic [ref=e124]:
                  - img [ref=e125]
                  - paragraph [ref=e128]: Endpoint testing
                  - img [ref=e129]
                - paragraph [ref=e132]: Each API detail keeps method, path, request body, response preview, and browser-run feedback together.
              - generic [ref=e133]:
                - generic [ref=e134]:
                  - img [ref=e135]
                  - paragraph [ref=e139]: Code snippets
                  - img [ref=e140]
                - paragraph [ref=e143]: cURL, JavaScript, TypeScript, Python, Node, PHP, Go, C#, Java, and Ruby snippets share one endpoint source.
              - generic [ref=e144]:
                - generic [ref=e145]:
                  - img [ref=e146]
                  - paragraph [ref=e148]: Plans and quotas
                  - img [ref=e149]
                - paragraph [ref=e152]: Free, freemium, paid, monthly or daily quotas, plan features, and activation status map into pricing cards.
              - generic [ref=e153]:
                - generic [ref=e154]:
                  - img [ref=e155]
                  - paragraph [ref=e157]: Analytics loop
                  - img [ref=e158]
                - paragraph [ref=e161]: Dashboard and Studio surfaces expose requests, active APIs, usage signals, endpoint checks, and search insights.
        - generic [ref=e162]:
          - generic [ref=e164]:
            - paragraph [ref=e165]: APIهای قابل بررسی
            - paragraph [ref=e166]: ۳
          - generic [ref=e168]:
            - paragraph [ref=e169]: دسته‌بندی‌ها
            - paragraph [ref=e170]: ۳
          - generic [ref=e172]:
            - paragraph [ref=e173]: الگوی دسترسی
            - paragraph [ref=e174]: IranAPI Vault
        - generic [ref=e175]:
          - generic [ref=e176]:
            - paragraph [ref=e177]: دسته‌های پرکاربرد
            - heading "از حوزه‌ای شروع کنید که به محصول شما نزدیک‌تر است" [level=2] [ref=e178]
            - paragraph [ref=e179]: دسته‌ها برای اسکن سریع بازار API چیده شده‌اند؛ از پرداخت و داده تا ارتباطات و هوش مصنوعی.
          - generic [ref=e180]:
            - generic [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e184]: Fintech
                - generic [ref=e185]: ۱ سرویس
              - generic [ref=e186]:
                - heading "فین‌تک" [level=3] [ref=e187]
                - paragraph [ref=e188]: سرویس‌های پرداخت، اعتبارسنجی و گزارش‌های تراکنشی برای تجربه‌های مالی.
              - link "دیدن APIهای این دسته" [ref=e189]:
                - /url: /browse?category=fintech
            - generic [ref=e191]:
              - generic [ref=e192]:
                - generic [ref=e193]: Location
                - generic [ref=e194]: ۱ سرویس
              - generic [ref=e195]:
                - heading "نقشه و مکان" [level=3] [ref=e196]
                - paragraph [ref=e197]: مسیر‌یابی، ژئوکدینگ و تحلیل مکان برای محصولات مبتنی بر موقعیت.
              - link "دیدن APIهای این دسته" [ref=e198]:
                - /url: /browse?category=location
            - generic [ref=e200]:
              - generic [ref=e201]:
                - generic [ref=e202]: AI Services
                - generic [ref=e203]: ۱ سرویس
              - generic [ref=e204]:
                - heading "هوش مصنوعی" [level=3] [ref=e205]
                - paragraph [ref=e206]: سرویس‌های پردازش متن، صوت و بینایی ماشین برای تیم‌های محصول و داده.
              - link "دیدن APIهای این دسته" [ref=e207]:
                - /url: /browse?category=ai-services
        - generic [ref=e208]:
          - generic [ref=e209]:
            - generic [ref=e210]:
              - paragraph [ref=e211]: پیشنهادهای شروع
              - heading "APIهایی که ارزش بررسی سریع دارند" [level=2] [ref=e212]
            - link "دیدن همه APIها" [ref=e213]:
              - /url: /browse
          - generic [ref=e214]:
            - generic [ref=e215]:
              - generic [ref=e216]:
                - generic [ref=e217]:
                  - generic [ref=e218]: هوش مصنوعی
                  - generic [ref=e219]: محبوب
                - heading "درگاه گفتار" [level=3] [ref=e220]
              - generic [ref=e221]:
                - paragraph [ref=e222]: پردازش گفتار، متن و زیرنویس با تاخیر پایین.
                - generic [ref=e223]:
                  - generic [ref=e224]:
                    - paragraph [ref=e225]: امتیاز
                    - paragraph [ref=e226]: "4.50"
                  - generic [ref=e227]:
                    - paragraph [ref=e228]: شروع قیمت
                    - paragraph [ref=e229]: ۷۹۰٬۰۰۰ IRR
                - link "مشاهده جزئیات و مستندات" [ref=e230]:
                  - /url: /api/speech-gateway
            - generic [ref=e231]:
              - generic [ref=e232]:
                - generic [ref=e234]: فین‌تک
                - heading "هاب پرداخت" [level=3] [ref=e235]
              - generic [ref=e236]:
                - paragraph [ref=e237]: پرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.
                - generic [ref=e238]:
                  - generic [ref=e239]:
                    - paragraph [ref=e240]: امتیاز
                    - paragraph [ref=e241]: "0.00"
                  - generic [ref=e242]:
                    - paragraph [ref=e243]: شروع قیمت
                    - paragraph [ref=e244]: ۵۹۰٬۰۰۰ IRR
                - link "مشاهده جزئیات و مستندات" [ref=e245]:
                  - /url: /api/payments-hub
        - generic [ref=e246]:
          - generic [ref=e248]:
            - img [ref=e249]
            - heading "تصمیم‌گیری سریع‌تر" [level=3] [ref=e251]
            - paragraph [ref=e252]: از جست‌وجوی اولیه تا انتخاب پلن و خواندن مستندات، مسیرها کوتاه و قابل پیش‌بینی هستند.
          - generic [ref=e254]:
            - img [ref=e255]
            - heading "اطلاعات قابل اتکا" [level=3] [ref=e258]
            - paragraph [ref=e259]: متادیتای سرویس، روش احراز هویت و وضعیت انتشار با ساختاری یکدست نمایش داده می‌شود.
          - generic [ref=e261]:
            - img [ref=e262]
            - heading "پیشنهادهای مرتبط‌تر" [level=3] [ref=e263]
            - paragraph [ref=e264]: APIهای برجسته، دسته‌های نزدیک و سرویس‌های مشابه کمک می‌کنند انتخاب بعدی واضح‌تر باشد.
      - contentinfo [ref=e265]:
        - generic [ref=e266]:
          - generic [ref=e267]:
            - paragraph [ref=e268]:
              - img [ref=e269]
              - text: IranAPI
            - paragraph [ref=e275]: یک کنسول فارسی و انگلیسی برای کشف API، مقایسه پلن‌ها، خواندن مستندات و مدیریت دسترسی از ایده تا اتصال پایدار.
            - generic [ref=e276]:
              - generic [ref=e277]:
                - img [ref=e278]
                - text: v1 live
              - generic [ref=e285]:
                - img [ref=e286]
                - text: telemetry-ready
          - generic [ref=e288]:
            - paragraph [ref=e289]: دسترسی سریع
            - generic [ref=e290]:
              - link "کشف APIها" [ref=e291]:
                - /url: /browse
              - link "مستندات" [ref=e292]:
                - /url: /documentation
              - link "قیمت‌گذاری" [ref=e293]:
                - /url: /pricing
          - generic [ref=e294]:
            - paragraph [ref=e295]: اعتماد و سیاست‌ها
            - generic [ref=e296]:
              - link "شرایط استفاده" [ref=e297]:
                - /url: /terms
              - link "حریم خصوصی" [ref=e298]:
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
  30 |       await page.goto(route, { waitUntil: "networkidle" });
  31 | 
  32 |       const bodyText = (await page.locator("body").innerText()).trim();
> 33 |       await expect(page.locator("body")).toBeVisible();
     |                                          ^ Error: expect(locator).toBeVisible() failed
  34 |       expect(bodyText.length).toBeGreaterThan(20);
  35 |       expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
  36 |     });
  37 |   }
  38 | });
  39 | 
```