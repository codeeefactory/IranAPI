# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-health.spec.ts >> page health >> /studio renders nonblank page
- Location: e2e\page-health.spec.ts:21:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/studio", waiting until "networkidle"

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
          - paragraph: Endpointها مرتب شدند؛ یکی هم قهوه خواست.
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
            - generic [ref=e66]:
              - generic [ref=e67]:
                - generic [ref=e68]: ورود امن
                - generic [ref=e69]: Account Access
              - generic [ref=e70]:
                - paragraph [ref=e71]: حساب توسعه‌دهنده
                - heading "ورود به حساب IranAPI" [level=3] [ref=e72]
                - paragraph [ref=e73]: از این حساب برای مدیریت پروفایل، دسترسی‌های ثبت‌شده، کلیدهای امن و تاریخچه مصرف استفاده می‌کنید.
            - generic [ref=e74]:
              - generic [ref=e75]: برای ادامه، ابتدا وارد حساب خود شوید. بعد از ورود به صفحه قبلی برمی‌گردید.
              - generic [ref=e76]:
                - generic [ref=e79]: ورود سریع شبکه‌ای
                - note [ref=e81]: OAuth در این محیط هنوز تنظیم نشده است. برای تست ورود و ثبت‌نام از نام کاربری و رمز عبور استفاده کنید.
                - generic [ref=e82]:
                  - button "Google تنظیم نشده" [disabled]:
                    - img
                    - text: Google
                    - generic:
                      - img
                      - text: تنظیم نشده
                  - button "GitHub تنظیم نشده" [disabled]:
                    - img
                    - text: GitHub
                    - generic:
                      - img
                      - text: تنظیم نشده
                  - button "Microsoft تنظیم نشده" [disabled]:
                    - img
                    - text: Microsoft
                    - generic:
                      - img
                      - text: تنظیم نشده
                  - button "LinkedIn تنظیم نشده" [disabled]:
                    - img
                    - text: LinkedIn
                    - generic:
                      - img
                      - text: تنظیم نشده
              - generic [ref=e83]:
                - generic [ref=e84]:
                  - generic [ref=e85]: ورود امن
                  - generic [ref=e86]: نشست محافظت‌شده
                - generic [ref=e87]:
                  - generic [ref=e88]: نام کاربری
                  - textbox "نام کاربری" [ref=e89]
                - generic [ref=e90]:
                  - generic [ref=e91]: رمز عبور
                  - textbox "رمز عبور" [ref=e92]
                - button "ورود به داشبورد" [ref=e93]:
                  - img
                  - text: ورود به داشبورد
              - paragraph [ref=e94]:
                - text: حساب ندارید؟
                - link "ساخت حساب" [ref=e95]:
                  - /url: /signup
          - generic [ref=e96]:
            - generic [ref=e98]:
              - generic [ref=e99]:
                - paragraph [ref=e100]:
                  - img [ref=e101]
                  - text: داشبورد آماده مدیریت
                - paragraph [ref=e106]: پس از ورود می‌توانید پروفایل، مصرف، دسترسی‌های فعال و اشتراک‌ها را در یک نگاه بررسی کنید.
              - generic [ref=e107]:
                - paragraph [ref=e108]:
                  - img [ref=e109]
                  - text: نشست امن
                - paragraph [ref=e112]: ورود با نشست محافظت‌شده انجام می‌شود و رابط فقط داده‌های موردنیاز حساب شما را دریافت می‌کند.
              - generic [ref=e113]:
                - paragraph [ref=e114]:
                  - img [ref=e115]
                  - text: نقش‌ها و دسترسی‌های روشن
                - paragraph [ref=e118]: حساب پرتال از دسترسی مصرفی APIها جداست و هر دسترسی از داشبورد قابل پیگیری است.
            - generic [ref=e120]:
              - paragraph [ref=e121]: حساب نمونه برای QA
              - paragraph [ref=e122]: اگر در محیط محلی با داده نمونه کار می‌کنید، این حساب در فرآیند seed ساخته می‌شود و داشبورد را با داده واقعی‌تر باز می‌کند.
              - generic [ref=e123]:
                - generic [ref=e124]:
                  - code [ref=e125]: "username: demo-dev"
                  - code [ref=e126]: "password: StrongPass123!"
                - button "پر کردن حساب نمونه" [ref=e127]:
                  - img
                  - text: پر کردن حساب نمونه
      - contentinfo [ref=e128]:
        - generic [ref=e129]:
          - generic [ref=e130]:
            - paragraph [ref=e131]:
              - img [ref=e132]
              - text: IranAPI
            - paragraph [ref=e138]: یک کنسول فارسی و انگلیسی برای کشف API، مقایسه پلن‌ها، خواندن مستندات و مدیریت دسترسی از ایده تا اتصال پایدار.
            - generic [ref=e139]:
              - generic [ref=e140]:
                - img [ref=e141]
                - text: v1 live
              - generic [ref=e148]:
                - img [ref=e149]
                - text: telemetry-ready
          - generic [ref=e151]:
            - paragraph [ref=e152]: دسترسی سریع
            - generic [ref=e153]:
              - link "کشف APIها" [ref=e154]:
                - /url: /browse
              - link "مستندات" [ref=e155]:
                - /url: /documentation
              - link "قیمت‌گذاری" [ref=e156]:
                - /url: /pricing
          - generic [ref=e157]:
            - paragraph [ref=e158]: اعتماد و سیاست‌ها
            - generic [ref=e159]:
              - link "شرایط استفاده" [ref=e160]:
                - /url: /terms
              - link "حریم خصوصی" [ref=e161]:
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