# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-health.spec.ts >> page health >> /browse renders nonblank page
- Location: e2e\page-health.spec.ts:21:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/browse", waiting until "networkidle"

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
          - paragraph: داشبورد در حالت نئون کم‌مصرف گرم شد.
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
            - paragraph [ref=e66]: کشف و انتخاب
            - heading "APIها را با فیلترهای دقیق و نتیجه‌های قابل مقایسه پیدا کنید" [level=1] [ref=e67]
            - paragraph [ref=e68]: نتیجه‌ها بر اساس دسته‌بندی، جست‌وجو و مرتب‌سازی به‌روز نمایش داده می‌شوند تا انتخاب سرویس برای تیم‌های فنی سریع‌تر و مطمئن‌تر شود.
          - generic [ref=e70]:
            - search [ref=e71]:
              - generic [ref=e72]:
                - generic [ref=e73]: جست‌وجوی نام یا کاربرد API
                - generic [ref=e74]:
                  - img [ref=e75]
                  - textbox "جست‌وجوی نام یا کاربرد API" [ref=e78]:
                    - /placeholder: مثلا پرداخت، نقشه، پیامک، هوش مصنوعی
              - generic [ref=e79]:
                - generic [ref=e80]: نمایش بر اساس
                - combobox "نمایش بر اساس" [ref=e81]:
                  - option "بهترین امتیاز" [selected]
                  - option "پربازدیدترین"
                  - option "تازه‌ترین"
                  - option "نام"
              - button "نمایش نتایج" [ref=e83]
            - generic [ref=e84]:
              - button "همه دسته‌ها" [ref=e85]
              - button "فین‌تک ۱" [ref=e86]:
                - text: فین‌تک
                - generic [ref=e87]: ۱
              - button "نقشه و مکان ۱" [ref=e88]:
                - text: نقشه و مکان
                - generic [ref=e89]: ۱
              - button "هوش مصنوعی ۱" [ref=e90]:
                - text: هوش مصنوعی
                - generic [ref=e91]: ۱
        - region "IranAPI pages synced into one marketplace UX" [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]:
              - generic [ref=e95]: RapidAPI-inspired
              - generic [ref=e96]:
                - heading "IranAPI pages synced into one marketplace UX" [level=2] [ref=e97]
                - paragraph [ref=e98]: "Inspired by RapidAPI patterns, but branded and worded for IranAPI: discovery, subscriptions, endpoint tests, snippets, Studio publishing, and analytics share one product surface."
              - generic [ref=e99]:
                - link "API Hub" [ref=e100]:
                  - /url: /browse
                - link "Studio" [ref=e101]:
                  - /url: /studio
            - generic [ref=e102]:
              - generic [ref=e103]:
                - generic [ref=e104]:
                  - img [ref=e105]
                  - paragraph [ref=e108]: IranAPI Hub discovery
                  - img [ref=e109]
                - paragraph [ref=e112]: Search, categories, ratings, popularity, provider identity, and listing readiness stay visible in IranAPI.
              - generic [ref=e113]:
                - generic [ref=e114]:
                  - img [ref=e115]
                  - paragraph [ref=e118]: Endpoint testing
                  - img [ref=e119]
                - paragraph [ref=e122]: Each API detail keeps method, path, request body, response preview, and browser-run feedback together.
              - generic [ref=e123]:
                - generic [ref=e124]:
                  - img [ref=e125]
                  - paragraph [ref=e129]: Code snippets
                  - img [ref=e130]
                - paragraph [ref=e133]: cURL, JavaScript, TypeScript, Python, Node, PHP, Go, C#, Java, and Ruby snippets share one endpoint source.
              - generic [ref=e134]:
                - generic [ref=e135]:
                  - img [ref=e136]
                  - paragraph [ref=e138]: Plans and quotas
                  - img [ref=e139]
                - paragraph [ref=e142]: Free, freemium, paid, monthly or daily quotas, plan features, and activation status map into pricing cards.
              - generic [ref=e143]:
                - generic [ref=e144]:
                  - img [ref=e145]
                  - paragraph [ref=e147]: Analytics loop
                  - img [ref=e148]
                - paragraph [ref=e151]: Dashboard and Studio surfaces expose requests, active APIs, usage signals, endpoint checks, and search insights.
        - generic [ref=e152]:
          - generic [ref=e153]:
            - paragraph [ref=e154]: برای شروع
            - heading "APIهای پیشنهادی برای بررسی سریع" [level=2] [ref=e155]
          - generic [ref=e156]:
            - generic [ref=e158]:
              - generic [ref=e159]:
                - generic [ref=e160]: هوش مصنوعی
                - generic [ref=e161]: امتیاز 4.50
              - generic [ref=e162]:
                - heading "درگاه گفتار" [level=3] [ref=e163]
                - paragraph [ref=e164]: پردازش گفتار، متن و زیرنویس با تاخیر پایین.
              - link "جزئیات API" [ref=e165]:
                - /url: /api/speech-gateway
            - generic [ref=e167]:
              - generic [ref=e168]:
                - generic [ref=e169]: فین‌تک
                - generic [ref=e170]: امتیاز 0.00
              - generic [ref=e171]:
                - heading "هاب پرداخت" [level=3] [ref=e172]
                - paragraph [ref=e173]: پرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.
              - link "جزئیات API" [ref=e174]:
                - /url: /api/payments-hub
        - generic [ref=e175]:
          - generic [ref=e177]:
            - heading "نتایج" [level=2] [ref=e178]
            - paragraph [ref=e179]: ۳ API پیدا شد
          - generic [ref=e180]:
            - region "فین‌تک" [ref=e181]:
              - generic [ref=e182]:
                - generic [ref=e183]:
                  - heading "فین‌تک" [level=3] [ref=e184]
                  - paragraph [ref=e185]: ۱ API
                - button "دیدن همه" [ref=e186]
              - generic [ref=e188]:
                - generic [ref=e189]:
                  - generic [ref=e190]:
                    - generic [ref=e191]: فین‌تک
                    - generic [ref=e193]: ویژه
                  - heading "هاب پرداخت" [level=3] [ref=e194]
                - generic [ref=e195]:
                  - paragraph [ref=e196]: پرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.
                  - generic [ref=e197]:
                    - generic [ref=e198]:
                      - img [ref=e199]
                      - text: فعال
                    - generic "وضعیت عملیاتی سرویس" [ref=e202]: پایدار
                    - generic [ref=e204]:
                      - img [ref=e205]
                      - text: API Key
                    - generic [ref=e208]: GET
                  - generic [ref=e209]:
                    - generic [ref=e210]:
                      - paragraph [ref=e211]: امتیاز
                      - paragraph [ref=e212]: "0.00"
                    - generic [ref=e213]:
                      - paragraph [ref=e214]: شروع قیمت
                      - paragraph [ref=e215]: ۵۹۰٬۰۰۰ IRR
                  - link "جزئیات API" [ref=e216]:
                    - /url: /api/payments-hub
            - region "نقشه و مکان" [ref=e217]:
              - generic [ref=e218]:
                - generic [ref=e219]:
                  - heading "نقشه و مکان" [level=3] [ref=e220]
                  - paragraph [ref=e221]: ۱ API
                - button "دیدن همه" [ref=e222]
              - generic [ref=e224]:
                - generic [ref=e225]:
                  - generic [ref=e226]:
                    - generic [ref=e227]: نقشه و مکان
                    - generic [ref=e229]: محبوب
                  - heading "مسیریاب ژئو" [level=3] [ref=e230]
                - generic [ref=e231]:
                  - paragraph [ref=e232]: مکان‌محور، سریع و مناسب پنل‌های عملیاتی.
                  - generic [ref=e233]:
                    - generic [ref=e234]:
                      - img [ref=e235]
                      - text: فعال
                    - generic "وضعیت عملیاتی سرویس" [ref=e238]: پایدار
                    - generic [ref=e240]:
                      - img [ref=e241]
                      - text: API Key
                    - generic [ref=e244]: GET
                  - generic [ref=e245]:
                    - generic [ref=e246]:
                      - paragraph [ref=e247]: امتیاز
                      - paragraph [ref=e248]: "4.00"
                    - generic [ref=e249]:
                      - paragraph [ref=e250]: شروع قیمت
                      - paragraph [ref=e251]: ۱٬۲۹۰٬۰۰۰ IRR
                  - link "جزئیات API" [ref=e252]:
                    - /url: /api/geo-routes
            - region "هوش مصنوعی" [ref=e253]:
              - generic [ref=e254]:
                - generic [ref=e255]:
                  - heading "هوش مصنوعی" [level=3] [ref=e256]
                  - paragraph [ref=e257]: ۱ API
                - button "دیدن همه" [ref=e258]
              - generic [ref=e260]:
                - generic [ref=e261]:
                  - generic [ref=e262]:
                    - generic [ref=e263]: هوش مصنوعی
                    - generic [ref=e264]:
                      - generic [ref=e265]: ویژه
                      - generic [ref=e266]: محبوب
                  - heading "درگاه گفتار" [level=3] [ref=e267]
                - generic [ref=e268]:
                  - paragraph [ref=e269]: پردازش گفتار، متن و زیرنویس با تاخیر پایین.
                  - generic [ref=e270]:
                    - generic [ref=e271]:
                      - img [ref=e272]
                      - text: فعال
                    - generic "وضعیت عملیاتی سرویس" [ref=e275]: پایدار
                    - generic [ref=e277]:
                      - img [ref=e278]
                      - text: API Key
                    - generic [ref=e281]: GET
                  - generic [ref=e282]:
                    - generic [ref=e283]:
                      - paragraph [ref=e284]: امتیاز
                      - paragraph [ref=e285]: "4.50"
                    - generic [ref=e286]:
                      - paragraph [ref=e287]: شروع قیمت
                      - paragraph [ref=e288]: ۷۹۰٬۰۰۰ IRR
                  - link "جزئیات API" [ref=e289]:
                    - /url: /api/speech-gateway
      - contentinfo [ref=e290]:
        - generic [ref=e291]:
          - generic [ref=e292]:
            - paragraph [ref=e293]:
              - img [ref=e294]
              - text: IranAPI
            - paragraph [ref=e300]: یک کنسول فارسی و انگلیسی برای کشف API، مقایسه پلن‌ها، خواندن مستندات و مدیریت دسترسی از ایده تا اتصال پایدار.
            - generic [ref=e301]:
              - generic [ref=e302]:
                - img [ref=e303]
                - text: v1 live
              - generic [ref=e310]:
                - img [ref=e311]
                - text: telemetry-ready
          - generic [ref=e313]:
            - paragraph [ref=e314]: دسترسی سریع
            - generic [ref=e315]:
              - link "کشف APIها" [ref=e316]:
                - /url: /browse
              - link "مستندات" [ref=e317]:
                - /url: /documentation
              - link "قیمت‌گذاری" [ref=e318]:
                - /url: /pricing
          - generic [ref=e319]:
            - paragraph [ref=e320]: اعتماد و سیاست‌ها
            - generic [ref=e321]:
              - link "شرایط استفاده" [ref=e322]:
                - /url: /terms
              - link "حریم خصوصی" [ref=e323]:
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