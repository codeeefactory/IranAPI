# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crawl.spec.ts >> authenticated crawler validates register, login, dashboard forms, rating, and logout
- Location: e2e\crawl.spec.ts:125:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: locator('#company')
Expected pattern: /IranAPI/
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" with timeout 5000ms
  - waiting for locator('#company')

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
              - link "demo-dev" [ref=e61]:
                - /url: /dashboard
                - img
                - generic [ref=e62]: demo-dev
              - button "خروج" [ref=e63]:
                - img
      - main [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e67]: داشبورد همگام با تجربه اصلی IranAPI
            - generic [ref=e68]:
              - heading "کشف، اتصال و پایش APIها در همان جریان وب‌سایت" [level=1] [ref=e69]
              - paragraph [ref=e70]: همین داده‌هایی که در خانه و صفحه کشف می‌بینید، اینجا با وضعیت حساب، دسترسی‌ها، کلید API و مصرف شما ترکیب شده است.
            - search [ref=e71]:
              - generic [ref=e72]:
                - img [ref=e73]
                - textbox "جست‌وجوی API در داشبورد" [ref=e76]
              - button "نمایش" [ref=e77]:
                - text: نمایش
                - img
            - generic [ref=e78]:
              - generic [ref=e79]:
                - img [ref=e80]
                - text: ۳ API فعال
              - generic [ref=e82]:
                - img [ref=e83]
                - text: ۳ دسته‌بندی
              - generic [ref=e86]:
                - img [ref=e87]
                - text: ۱۴٬۹۱۰ درخواست حساب
          - generic [ref=e90]:
            - generic [ref=e91]:
              - img [ref=e93]
              - generic [ref=e96]:
                - paragraph [ref=e97]: توسعه‌دهنده
                - paragraph [ref=e98]: demo-dev@iranapi.local
            - generic [ref=e99]:
              - generic [ref=e100]:
                - paragraph [ref=e101]: درخواست‌ها
                - paragraph [ref=e102]: ۱۴٬۹۱۰
              - generic [ref=e103]:
                - paragraph [ref=e104]: APIهای فعال
                - paragraph [ref=e105]: ۲
            - generic [ref=e106]:
              - paragraph [ref=e107]: Starter
              - paragraph [ref=e108]: اشتراک فعلی فضای کاری
        - region "IranAPI pages synced into one marketplace UX" [ref=e109]:
          - generic [ref=e110]:
            - generic [ref=e111]:
              - generic [ref=e112]: RapidAPI-inspired
              - generic [ref=e113]:
                - heading "IranAPI pages synced into one marketplace UX" [level=2] [ref=e114]
                - paragraph [ref=e115]: "Inspired by RapidAPI patterns, but branded and worded for IranAPI: discovery, subscriptions, endpoint tests, snippets, Studio publishing, and analytics share one product surface."
              - generic [ref=e116]:
                - link "API Hub" [ref=e117]:
                  - /url: /browse
                - link "Studio" [ref=e118]:
                  - /url: /studio
            - generic [ref=e119]:
              - generic [ref=e120]:
                - generic [ref=e121]:
                  - img [ref=e122]
                  - paragraph [ref=e125]: IranAPI Hub discovery
                  - img [ref=e126]
                - paragraph [ref=e129]: Search, categories, ratings, popularity, provider identity, and listing readiness stay visible in IranAPI.
              - generic [ref=e130]:
                - generic [ref=e131]:
                  - img [ref=e132]
                  - paragraph [ref=e135]: Endpoint testing
                  - img [ref=e136]
                - paragraph [ref=e139]: Each API detail keeps method, path, request body, response preview, and browser-run feedback together.
              - generic [ref=e140]:
                - generic [ref=e141]:
                  - img [ref=e142]
                  - paragraph [ref=e146]: Code snippets
                  - img [ref=e147]
                - paragraph [ref=e150]: cURL, JavaScript, TypeScript, Python, Node, PHP, Go, C#, Java, and Ruby snippets share one endpoint source.
              - generic [ref=e151]:
                - generic [ref=e152]:
                  - img [ref=e153]
                  - paragraph [ref=e155]: Plans and quotas
                  - img [ref=e156]
                - paragraph [ref=e159]: Free, freemium, paid, monthly or daily quotas, plan features, and activation status map into pricing cards.
              - generic [ref=e160]:
                - generic [ref=e161]:
                  - img [ref=e162]
                  - paragraph [ref=e164]: Analytics loop
                  - img [ref=e165]
                - paragraph [ref=e168]: Dashboard and Studio surfaces expose requests, active APIs, usage signals, endpoint checks, and search insights.
        - generic [ref=e169]:
          - generic [ref=e170]:
            - generic [ref=e171]:
              - paragraph [ref=e172]: داده‌های همگام
              - heading "APIهای پیشنهادی همان کاتالوگ سایت" [level=2] [ref=e173]
              - paragraph [ref=e174]: کارت‌ها از همان منبع صفحه کشف تغذیه می‌شوند و وضعیت، احراز هویت، قیمت و سلامت عملیاتی را یکپارچه نشان می‌دهند.
            - link "دیدن همه APIها" [ref=e175]:
              - /url: /browse
          - generic [ref=e176]:
            - generic [ref=e177]:
              - generic [ref=e178]:
                - generic [ref=e179]:
                  - generic [ref=e180]: هوش مصنوعی
                  - generic [ref=e181]:
                    - img [ref=e182]
                    - text: فعال
                - heading "درگاه گفتار" [level=3] [ref=e185]
              - generic [ref=e186]:
                - paragraph [ref=e187]: پردازش گفتار، متن و زیرنویس با تاخیر پایین.
                - generic [ref=e188]:
                  - generic "وضعیت عملیاتی سرویس" [ref=e189]: پایدار
                  - generic [ref=e191]:
                    - img [ref=e192]
                    - text: API Key
                  - generic [ref=e195]: GET
                - generic [ref=e196]:
                  - generic [ref=e197]:
                    - paragraph [ref=e198]: امتیاز
                    - paragraph [ref=e199]: "4.50"
                  - generic [ref=e200]:
                    - paragraph [ref=e201]: شروع قیمت
                    - paragraph [ref=e202]: ۷۹۰٬۰۰۰ IRR
                - link "مشاهده جزئیات و مستندات" [ref=e203]:
                  - /url: /api/speech-gateway
            - generic [ref=e204]:
              - generic [ref=e205]:
                - generic [ref=e206]:
                  - generic [ref=e207]: فین‌تک
                  - generic [ref=e208]:
                    - img [ref=e209]
                    - text: فعال
                - heading "هاب پرداخت" [level=3] [ref=e212]
              - generic [ref=e213]:
                - paragraph [ref=e214]: پرداخت و گزارش‌گیری مالی برای تیم‌های فین‌تک.
                - generic [ref=e215]:
                  - generic "وضعیت عملیاتی سرویس" [ref=e216]: پایدار
                  - generic [ref=e218]:
                    - img [ref=e219]
                    - text: API Key
                  - generic [ref=e222]: GET
                - generic [ref=e223]:
                  - generic [ref=e224]:
                    - paragraph [ref=e225]: امتیاز
                    - paragraph [ref=e226]: "0.00"
                  - generic [ref=e227]:
                    - paragraph [ref=e228]: شروع قیمت
                    - paragraph [ref=e229]: ۵۹۰٬۰۰۰ IRR
                - link "مشاهده جزئیات و مستندات" [ref=e230]:
                  - /url: /api/payments-hub
        - generic [ref=e231]:
          - generic [ref=e232]:
            - heading "کلید و نمونه اتصال" [level=3] [ref=e234]:
              - img [ref=e235]
              - text: کلید و نمونه اتصال
            - generic [ref=e238]:
              - code [ref=e239]: No key generated
              - generic [ref=e240]:
                - button "ساخت کلید" [ref=e241]:
                  - img
                  - text: ساخت کلید
                - button "کپی نمونه" [ref=e242]:
                  - img
                  - text: کپی نمونه
              - generic [ref=e243]:
                - text: console
                - code [ref=e244]: "curl --request GET \\ --url \"https://api.iranapi.com/v1/health\" \\ --header \"X-IranAPI-Key: <IRANAPI_API_KEY>\""
          - generic [ref=e245]:
            - heading "دسترسی‌ها و دسته‌ها" [level=3] [ref=e247]:
              - img [ref=e248]
              - text: دسترسی‌ها و دسته‌ها
            - generic [ref=e251]:
              - generic [ref=e252]:
                - link "فین‌تک ۱" [ref=e253]:
                  - /url: /browse?category=fintech
                  - generic [ref=e254]: فین‌تک
                  - generic [ref=e255]: ۱
                - link "نقشه و مکان ۱" [ref=e256]:
                  - /url: /browse?category=location
                  - generic [ref=e257]: نقشه و مکان
                  - generic [ref=e258]: ۱
                - link "هوش مصنوعی ۱" [ref=e259]:
                  - /url: /browse?category=ai-services
                  - generic [ref=e260]: هوش مصنوعی
                  - generic [ref=e261]: ۱
              - generic [ref=e262]:
                - link "درگاه گفتار active" [ref=e263]:
                  - /url: /api/speech-gateway
                  - generic [ref=e264]: درگاه گفتار
                  - generic [ref=e265]: active
                - link "مسیریاب ژئو active" [ref=e266]:
                  - /url: /api/geo-routes
                  - generic [ref=e267]: مسیریاب ژئو
                  - generic [ref=e268]: active
      - contentinfo [ref=e269]:
        - generic [ref=e270]:
          - generic [ref=e271]:
            - paragraph [ref=e272]:
              - img [ref=e273]
              - text: IranAPI
            - paragraph [ref=e279]: یک کنسول فارسی و انگلیسی برای کشف API، مقایسه پلن‌ها، خواندن مستندات و مدیریت دسترسی از ایده تا اتصال پایدار.
            - generic [ref=e280]:
              - generic [ref=e281]:
                - img [ref=e282]
                - text: v1 live
              - generic [ref=e289]:
                - img [ref=e290]
                - text: telemetry-ready
          - generic [ref=e292]:
            - paragraph [ref=e293]: دسترسی سریع
            - generic [ref=e294]:
              - link "کشف APIها" [ref=e295]:
                - /url: /browse
              - link "مستندات" [ref=e296]:
                - /url: /documentation
              - link "قیمت‌گذاری" [ref=e297]:
                - /url: /pricing
          - generic [ref=e298]:
            - paragraph [ref=e299]: اعتماد و سیاست‌ها
            - generic [ref=e300]:
              - link "شرایط استفاده" [ref=e301]:
                - /url: /terms
              - link "حریم خصوصی" [ref=e302]:
                - /url: /privacy
```

# Test source

```ts
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
  83  |   await expect(page.locator("main#main-content").last()).toContainText("API در این دسته");
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
> 155 |   await expect(page.locator("#company")).toHaveValue(/IranAPI/);
      |                                          ^ Error: expect(locator).toHaveValue(expected) failed
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
  184 |   await expect(page.locator("#first_name")).toHaveValue("راستی‌آزمایی");
  185 | 
  186 |   await page.locator("#company").fill("IranAPI QA Lab");
  187 |   await page.locator("#bio").fill("Dashboard profile updated by the Playwright crawler.");
  188 |   await page.locator('button[type="submit"]').nth(1).click();
  189 |   await expect(page.locator("#company")).toHaveValue("IranAPI QA Lab");
  190 | 
  191 |   await gotoApp(page, "/browse");
  192 |   await page.locator('main a[href^="/api/"]').first().click();
  193 |   await expect(page).toHaveURL(/\/api\/.+/);
  194 |   await page.getByRole("button", { name: "4" }).click();
  195 | 
  196 |   await page.getByRole("button", { name: "خروج" }).click();
  197 |   await gotoApp(page, "/dashboard");
  198 |   await expect(page).toHaveURL(/\/signin$/);
  199 | 
  200 |   await expectCleanRuntime(issues);
  201 | });
  202 | 
```