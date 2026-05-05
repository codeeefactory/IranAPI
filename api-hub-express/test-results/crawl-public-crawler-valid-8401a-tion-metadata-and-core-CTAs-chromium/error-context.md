# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crawl.spec.ts >> public crawler validates navigation, metadata, and core CTAs
- Location: e2e\crawl.spec.ts:71:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main#main-content').last()
Expected substring: "API در این دسته"
Received string:    "کشف و انتخابAPIها را با فیلترهای دقیق و نتیجه‌های قابل مقایسه پیدا کنیدنتیجه‌ها بر اساس دسته‌بندی، جست‌وجو و مرتب‌سازی به‌روز نمایش داده می‌شوند تا انتخاب سرویس برای تیم‌های فنی سریع‌تر و مطمئن‌تر شود.جست‌وجوی نام یا کاربرد APIنمایش بر اساسبهترین امتیازپربازدیدترینتازه‌تریننامنمایش نتایجهمه دسته‌هافین‌تک۱نقشه و مکان۱هوش مصنوعی۱RapidAPI-inspiredIranAPI pages synced into one marketplace UXInspired by RapidAPI patterns, but branded and worded for IranAPI: discovery, subscriptions, endpoint tests, snippets, Studio publishing, and analytics share one product surface.API HubStudioIranAPI Hub discoverySearch, categories, ratings, popularity, provider identity, and listing readiness stay visible in IranAPI.Endpoint testingEach API detail keeps method, path, request body, response preview, and browser-run feedback together.Code snippetscURL, JavaScript, TypeScript, Python, Node, PHP, Go, C#, Java, and Ruby snippets share one endpoint source.Plans and quotasFree, freemium, paid, monthly or daily quotas, plan features, and activation status map into pricing cards.Analytics loopDashboard and Studio surfaces expose requests, active APIs, usage signals, endpoint checks, and search insights.برای شروعAPIهای پیشنهادی برای بررسی سریعهوش مصنوعیامتیاز 4.50درگاه گفتارپردازش گفتار، متن و زیرنویس با تاخیر پایین.جزئیات APIفین‌تکامتیاز 0.00هاب پرداختپرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.جزئیات APIنتایج۳ API پیدا شدفین‌تک۱ APIدیدن همهفین‌تکویژههاب پرداختپرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.فعالپایدارAPI KeyGETامتیاز0.00شروع قیمت۵۹۰٬۰۰۰ IRRجزئیات APIنقشه و مکان۱ APIدیدن همهنقشه و مکانمحبوبمسیریاب ژئومکان‌محور، سریع و مناسب پنل‌های عملیاتی.فعالپایدارAPI KeyGETامتیاز4.00شروع قیمت۱٬۲۹۰٬۰۰۰ IRRجزئیات APIهوش مصنوعی۱ APIدیدن همههوش مصنوعیویژهمحبوبدرگاه گفتارپردازش گفتار، متن و زیرنویس با تاخیر پایین.فعالپایدارAPI KeyGETامتیاز4.50شروع قیمت۷۹۰٬۰۰۰ IRRجزئیات API"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('main#main-content').last()
    2 × locator resolved to <main id="main-content" class="container py-16">…</main>
      - unexpected value ""
    7 × locator resolved to <main id="main-content" class="container page-stack">…</main>
      - unexpected value "کشف و انتخابAPIها را با فیلترهای دقیق و نتیجه‌های قابل مقایسه پیدا کنیدنتیجه‌ها بر اساس دسته‌بندی، جست‌وجو و مرتب‌سازی به‌روز نمایش داده می‌شوند تا انتخاب سرویس برای تیم‌های فنی سریع‌تر و مطمئن‌تر شود.جست‌وجوی نام یا کاربرد APIنمایش بر اساسبهترین امتیازپربازدیدترینتازه‌تریننامنمایش نتایجهمه دسته‌هافین‌تک۱نقشه و مکان۱هوش مصنوعی۱RapidAPI-inspiredIranAPI pages synced into one marketplace UXInspired by RapidAPI patterns, but branded and worded for IranAPI: discovery, subscriptions, endpoint tests, snippets, Studio publishing, and analytics share one product surface.API HubStudioIranAPI Hub discoverySearch, categories, ratings, popularity, provider identity, and listing readiness stay visible in IranAPI.Endpoint testingEach API detail keeps method, path, request body, response preview, and browser-run feedback together.Code snippetscURL, JavaScript, TypeScript, Python, Node, PHP, Go, C#, Java, and Ruby snippets share one endpoint source.Plans and quotasFree, freemium, paid, monthly or daily quotas, plan features, and activation status map into pricing cards.Analytics loopDashboard and Studio surfaces expose requests, active APIs, usage signals, endpoint checks, and search insights.برای شروعAPIهای پیشنهادی برای بررسی سریعهوش مصنوعیامتیاز 4.50درگاه گفتارپردازش گفتار، متن و زیرنویس با تاخیر پایین.جزئیات APIفین‌تکامتیاز 0.00هاب پرداختپرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.جزئیات APIنتایج۳ API پیدا شدفین‌تک۱ APIدیدن همهفین‌تکویژههاب پرداختپرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.فعالپایدارAPI KeyGETامتیاز0.00شروع قیمت۵۹۰٬۰۰۰ IRRجزئیات APIنقشه و مکان۱ APIدیدن همهنقشه و مکانمحبوبمسیریاب ژئومکان‌محور، سریع و مناسب پنل‌های عملیاتی.فعالپایدارAPI KeyGETامتیاز4.00شروع قیمت۱٬۲۹۰٬۰۰۰ IRRجزئیات APIهوش مصنوعی۱ APIدیدن همههوش مصنوعیویژهمحبوبدرگاه گفتارپردازش گفتار، متن و زیرنویس با تاخیر پایین.فعالپایدارAPI KeyGETامتیاز4.50شروع قیمت۷۹۰٬۰۰۰ IRRجزئیات API"

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
  1   | import { expect, Page, test } from "@playwright/test";
  2   | 
  3   | 
  4   | const demoPassword = "StrongPass123!";
  5   | const trackedOrigins = [
  6   |   process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173",
  7   |   process.env.QA_API_BASE_URL || "http://127.0.0.1:8000",
  8   | ]
  9   |   .map((value) => {
  10  |     try {
  11  |       return new URL(value).origin;
  12  |     } catch {
  13  |       return null;
  14  |     }
  15  |   })
  16  |   .filter((value): value is string => Boolean(value));
  17  | 
  18  | 
  19  | function monitorPage(page: Page) {
  20  |   const issues: string[] = [];
  21  | 
  22  |   const isTrackedUrl = (url: string) => url.startsWith("/") || trackedOrigins.some((origin) => url.startsWith(origin));
  23  | 
  24  |   page.on("pageerror", (error) => {
  25  |     issues.push(`pageerror: ${error.message}`);
  26  |   });
  27  | 
  28  |   page.on("console", (message) => {
  29  |     if (message.type() === "error") {
  30  |       issues.push(`console: ${message.text()}`);
  31  |     }
  32  |   });
  33  | 
  34  |   page.on("requestfailed", (request) => {
  35  |     const failureText = request.failure()?.errorText || "unknown";
  36  |     if (failureText.includes("ERR_ABORTED")) {
  37  |       return;
  38  |     }
  39  |     if (isTrackedUrl(request.url())) {
  40  |       issues.push(`requestfailed: ${request.method()} ${request.url()} ${failureText}`);
  41  |     }
  42  |   });
  43  | 
  44  |   page.on("response", (response) => {
  45  |     const url = response.url();
  46  |     if (!isTrackedUrl(url)) {
  47  |       return;
  48  |     }
  49  |     if (url.endsWith("/favicon.ico")) {
  50  |       return;
  51  |     }
  52  |     if (response.status() >= 400 && !url.includes("/api/v1/account/user/")) {
  53  |       issues.push(`response: ${response.status()} ${url}`);
  54  |     }
  55  |   });
  56  | 
  57  |   return issues;
  58  | }
  59  | 
  60  | 
  61  | async function expectCleanRuntime(issues: string[]) {
  62  |   expect(issues, issues.join("\n")).toEqual([]);
  63  | }
  64  | 
  65  | 
  66  | async function gotoApp(page: Page, path: string) {
  67  |   await page.goto(path, { waitUntil: "domcontentloaded" });
  68  | }
  69  | 
  70  | 
  71  | test("public crawler validates navigation, metadata, and core CTAs", async ({ page }) => {
  72  |   const issues = monitorPage(page);
  73  | 
  74  |   await gotoApp(page, "/");
  75  |   await expect(page).toHaveTitle(/IranAPI/);
  76  | 
  77  |   const description = await page.locator('meta[name="description"]').getAttribute("content");
  78  |   expect(description).toBeTruthy();
  79  |   expect(description).not.toContain("40,000");
  80  | 
  81  |   await page.locator('a[href="/browse"]').first().click();
  82  |   await expect(page).toHaveURL(/\/browse$/);
> 83  |   await expect(page.locator("main#main-content").last()).toContainText("API در این دسته");
      |                                                          ^ Error: expect(locator).toContainText(expected) failed
  84  | 
  85  |   await page.locator("main form input").first().fill("پرداخت");
  86  |   await page.locator("main form").getByRole("button").click();
  87  |   await expect(page.locator('main a[href^="/api/"]').first()).toBeVisible();
  88  | 
  89  |   await page.locator('main a[href^="/api/"]').first().click();
  90  |   await expect(page).toHaveURL(/\/api\/.+/);
  91  |   await expect(page.locator("pre code").first()).toBeVisible();
  92  |   await expect(page.getByText("Endpoints")).toBeVisible();
  93  |   await page.getByRole("button", { name: /Run/ }).click();
  94  |   await expect(page.getByText(/"latency_ms"/).last()).toBeVisible();
  95  |   await page.getByRole("button").filter({ hasText: "کپی" }).click();
  96  | 
  97  |   await gotoApp(page, "/pricing");
  98  |   await expect(page).toHaveTitle(/قیمت‌گذاری/);
  99  |   await expect(page.locator('a[href^="/payment?plan="]').first()).toBeVisible();
  100 |   await page.locator('a[href^="/payment?plan="]').first().click();
  101 |   await expect(page).toHaveURL(/\/payment\?plan=/);
  102 |   await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
  103 | 
  104 |   await gotoApp(page, "/documentation");
  105 |   await expect(page.locator("article").first()).toBeVisible();
  106 | 
  107 |   await gotoApp(page, "/terms");
  108 |   await expect(page).toHaveTitle(/شرایط/);
  109 | 
  110 |   await gotoApp(page, "/privacy");
  111 |   await expect(page).toHaveTitle(/حریم خصوصی/);
  112 | 
  113 |   await gotoApp(page, "/this-route-does-not-exist");
  114 |   await expect(page).toHaveTitle(/یافت نشد/);
  115 |   await Promise.all([
  116 |     page.waitForURL(/\/$/),
  117 |     page.locator('a[href="/"]').first().click({ force: true }),
  118 |   ]);
  119 |   await expect(page).toHaveURL(/\/$/);
  120 | 
  121 |   await expectCleanRuntime(issues);
  122 | });
  123 | 
  124 | 
  125 | test("authenticated crawler validates register, login, dashboard forms, rating, and logout", async ({ page }) => {
  126 |   const issues = monitorPage(page);
  127 |   const uniqueSuffix = Date.now().toString();
  128 | 
  129 |   await gotoApp(page, "/signup");
  130 |   await expect(page).toHaveTitle(/ثبت‌نام/);
  131 | 
  132 |   await page.locator("#first_name").fill("کیفیت");
  133 |   await page.locator("#last_name").fill("سنج");
  134 |   await page.locator("#username").fill(`qa-ui-${uniqueSuffix}`);
  135 |   await page.locator("#email").fill(`qa-ui-${uniqueSuffix}@example.com`);
  136 |   await page.locator("#password").fill(demoPassword);
  137 |   await page.locator("#password_confirm").fill(demoPassword);
  138 |   const termsCheckbox = page.locator('button[role="checkbox"]').first();
  139 |   await termsCheckbox.click({ force: true });
  140 |   await expect(termsCheckbox).toHaveAttribute("aria-checked", "true");
  141 |   await page.locator('button[type="submit"]').first().click();
  142 | 
  143 |   await expect(page).toHaveURL(/\/dashboard$/);
  144 |   await expect(page.locator("main")).toContainText(`qa-ui-${uniqueSuffix}@example.com`);
  145 | 
  146 |   await page.getByRole("button", { name: "خروج" }).click();
  147 |   await expect(page).toHaveURL(/\/$/);
  148 | 
  149 |   await gotoApp(page, "/signin");
  150 |   await page.locator("#username").fill("demo-dev");
  151 |   await page.locator("#password").fill(demoPassword);
  152 |   await page.locator('button[type="submit"]').click();
  153 | 
  154 |   await expect(page).toHaveURL(/\/dashboard$/);
  155 |   await expect(page.locator("#company")).toHaveValue(/IranAPI/);
  156 |   await expect(page.locator("main")).toContainText("درخواست");
  157 |   await expect(page.locator("main")).toContainText("اشتراک حساب");
  158 | 
  159 |   await gotoApp(page, "/pricing");
  160 |   await expect(page.locator('a[href^="/payment?subscription="]').first()).toBeVisible();
  161 |   await page.locator('a[href^="/payment?subscription="]').nth(1).click();
  162 |   await expect(page).toHaveURL(/\/payment\?subscription=/);
  163 |   await page.getByRole("button", { name: /فعال‌سازی اشتراک/ }).click();
  164 |   await expect(page).toHaveURL(/\/dashboard$/);
  165 |   await expect(page.locator("main")).toContainText("Growth");
  166 | 
  167 |   const apiName = `QA Release ${uniqueSuffix}`;
  168 |   await page.locator("#api-name").fill(apiName);
  169 |   await page.locator("#api-base-url").fill(`https://qa-release-${uniqueSuffix}.example.dev/v1`);
  170 |   await page.locator("#api-docs").fill(`https://qa-release-${uniqueSuffix}.example.dev/docs`);
  171 |   await page.locator("#api-category").fill("QA");
  172 |   await page.locator("#api-tags").fill("qa, release");
  173 |   await page.locator("#api-description").fill("Published by the Playwright crawler and visible in Explore.");
  174 |   await page.getByRole("button", { name: /انتشار API/ }).click();
  175 |   await expect(page.getByRole("link", { name: "مشاهده در Explore" }).first()).toBeVisible();
  176 |   await page.getByRole("link", { name: "مشاهده در Explore" }).first().click();
  177 |   await expect(page).toHaveURL(/\/api\/qa-release-/);
  178 |   await expect(page.locator("h1")).toContainText(apiName);
  179 | 
  180 |   await gotoApp(page, "/dashboard");
  181 | 
  182 |   await page.locator("#first_name").fill("راستی‌آزمایی");
  183 |   await page.locator('button[type="submit"]').nth(0).click();
```