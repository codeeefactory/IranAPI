# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-health.spec.ts >> page health >> /dashboard renders nonblank page
- Location: e2e\page-health.spec.ts:21:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Failed to load resource: net::ERR_CONNECTION_CLOSED",
+ ]
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
              - generic [ref=e75]:
                - generic [ref=e78]: ورود سریع شبکه‌ای
                - note [ref=e80]: OAuth در این محیط هنوز تنظیم نشده است. برای تست ورود و ثبت‌نام از نام کاربری و رمز عبور استفاده کنید.
                - generic [ref=e81]:
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
              - generic [ref=e82]:
                - generic [ref=e83]:
                  - generic [ref=e84]: ورود امن
                  - generic [ref=e85]: نشست محافظت‌شده
                - generic [ref=e86]:
                  - generic [ref=e87]: نام کاربری
                  - textbox "نام کاربری" [ref=e88]
                - generic [ref=e89]:
                  - generic [ref=e90]: رمز عبور
                  - textbox "رمز عبور" [ref=e91]
                - button "ورود به داشبورد" [ref=e92]:
                  - img
                  - text: ورود به داشبورد
              - paragraph [ref=e93]:
                - text: حساب ندارید؟
                - link "ساخت حساب" [ref=e94]:
                  - /url: /signup
          - generic [ref=e95]:
            - generic [ref=e97]:
              - generic [ref=e98]:
                - paragraph [ref=e99]:
                  - img [ref=e100]
                  - text: داشبورد آماده مدیریت
                - paragraph [ref=e105]: پس از ورود می‌توانید پروفایل، مصرف، دسترسی‌های فعال و اشتراک‌ها را در یک نگاه بررسی کنید.
              - generic [ref=e106]:
                - paragraph [ref=e107]:
                  - img [ref=e108]
                  - text: نشست امن
                - paragraph [ref=e111]: ورود با نشست محافظت‌شده انجام می‌شود و رابط فقط داده‌های موردنیاز حساب شما را دریافت می‌کند.
              - generic [ref=e112]:
                - paragraph [ref=e113]:
                  - img [ref=e114]
                  - text: نقش‌ها و دسترسی‌های روشن
                - paragraph [ref=e117]: حساب پرتال از دسترسی مصرفی APIها جداست و هر دسترسی از داشبورد قابل پیگیری است.
            - generic [ref=e119]:
              - paragraph [ref=e120]: حساب نمونه برای QA
              - paragraph [ref=e121]: اگر در محیط محلی با داده نمونه کار می‌کنید، این حساب در فرآیند seed ساخته می‌شود و داشبورد را با داده واقعی‌تر باز می‌کند.
              - generic [ref=e122]:
                - generic [ref=e123]:
                  - code [ref=e124]: "username: demo-dev"
                  - code [ref=e125]: "password: StrongPass123!"
                - button "پر کردن حساب نمونه" [ref=e126]:
                  - img
                  - text: پر کردن حساب نمونه
      - contentinfo [ref=e127]:
        - generic [ref=e128]:
          - generic [ref=e129]:
            - paragraph [ref=e130]:
              - img [ref=e131]
              - text: IranAPI
            - paragraph [ref=e137]: یک کنسول فارسی و انگلیسی برای کشف API، مقایسه پلن‌ها، خواندن مستندات و مدیریت دسترسی از ایده تا اتصال پایدار.
            - generic [ref=e138]:
              - generic [ref=e139]:
                - img [ref=e140]
                - text: v1 live
              - generic [ref=e147]:
                - img [ref=e148]
                - text: telemetry-ready
          - generic [ref=e150]:
            - paragraph [ref=e151]: دسترسی سریع
            - generic [ref=e152]:
              - link "کشف APIها" [ref=e153]:
                - /url: /browse
              - link "مستندات" [ref=e154]:
                - /url: /documentation
              - link "قیمت‌گذاری" [ref=e155]:
                - /url: /pricing
          - generic [ref=e156]:
            - paragraph [ref=e157]: اعتماد و سیاست‌ها
            - generic [ref=e158]:
              - link "شرایط استفاده" [ref=e159]:
                - /url: /terms
              - link "حریم خصوصی" [ref=e160]:
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
  33 |       await expect(page.locator("body")).toBeVisible();
  34 |       expect(bodyText.length).toBeGreaterThan(20);
> 35 |       expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
     |                                                                    ^ Error: expect(received).toEqual(expected) // deep equality
  36 |     });
  37 |   }
  38 | });
  39 | 
```