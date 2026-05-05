import { expect, Page, test } from "@playwright/test";


const demoPassword = "StrongPass123!";
const trackedOrigins = [
  process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173",
  process.env.QA_API_BASE_URL || "http://127.0.0.1:8000",
]
  .map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  })
  .filter((value): value is string => Boolean(value));


function monitorPage(page: Page) {
  const issues: string[] = [];

  const isTrackedUrl = (url: string) => url.startsWith("/") || trackedOrigins.some((origin) => url.startsWith(origin));

  page.on("pageerror", (error) => {
    issues.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console: ${message.text()}`);
    }
  });

  page.on("requestfailed", (request) => {
    const failureText = request.failure()?.errorText || "unknown";
    if (failureText.includes("ERR_ABORTED")) {
      return;
    }
    if (isTrackedUrl(request.url())) {
      issues.push(`requestfailed: ${request.method()} ${request.url()} ${failureText}`);
    }
  });

  page.on("response", (response) => {
    const url = response.url();
    if (!isTrackedUrl(url)) {
      return;
    }
    if (url.endsWith("/favicon.ico")) {
      return;
    }
    if (response.status() >= 400 && !url.includes("/api/v1/account/user/")) {
      issues.push(`response: ${response.status()} ${url}`);
    }
  });

  return issues;
}


async function expectCleanRuntime(issues: string[]) {
  expect(issues, issues.join("\n")).toEqual([]);
}


async function gotoApp(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}


test("public crawler validates navigation, metadata, and core CTAs", async ({ page }) => {
  const issues = monitorPage(page);

  await gotoApp(page, "/");
  await expect(page).toHaveTitle(/IranAPI/);

  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toBeTruthy();
  expect(description).not.toContain("40,000");

  await page.locator('a[href="/browse"]').first().click();
  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.locator("main#main-content").last()).toContainText("API در این دسته");

  await page.locator("main form input").first().fill("پرداخت");
  await page.locator("main form").getByRole("button").click();
  await expect(page.locator('main a[href^="/api/"]').first()).toBeVisible();

  await page.locator('main a[href^="/api/"]').first().click();
  await expect(page).toHaveURL(/\/api\/.+/);
  await expect(page.locator("pre code").first()).toBeVisible();
  await expect(page.getByText("Endpoints")).toBeVisible();
  await page.getByRole("button", { name: /Run/ }).click();
  await expect(page.getByText(/"latency_ms"/).last()).toBeVisible();
  await page.getByRole("button").filter({ hasText: "کپی" }).click();

  await gotoApp(page, "/pricing");
  await expect(page).toHaveTitle(/قیمت‌گذاری/);
  await expect(page.locator('a[href^="/payment?plan="]').first()).toBeVisible();
  await page.locator('a[href^="/payment?plan="]').first().click();
  await expect(page).toHaveURL(/\/payment\?plan=/);
  await expect(page.locator('a[href="/dashboard"]')).toBeVisible();

  await gotoApp(page, "/documentation");
  await expect(page.locator("article").first()).toBeVisible();

  await gotoApp(page, "/terms");
  await expect(page).toHaveTitle(/شرایط/);

  await gotoApp(page, "/privacy");
  await expect(page).toHaveTitle(/حریم خصوصی/);

  await gotoApp(page, "/this-route-does-not-exist");
  await expect(page).toHaveTitle(/یافت نشد/);
  await Promise.all([
    page.waitForURL(/\/$/),
    page.locator('a[href="/"]').first().click({ force: true }),
  ]);
  await expect(page).toHaveURL(/\/$/);

  await expectCleanRuntime(issues);
});


test("authenticated crawler validates register, login, dashboard forms, rating, and logout", async ({ page }) => {
  const issues = monitorPage(page);
  const uniqueSuffix = Date.now().toString();

  await gotoApp(page, "/signup");
  await expect(page).toHaveTitle(/ثبت‌نام/);

  await page.locator("#first_name").fill("کیفیت");
  await page.locator("#last_name").fill("سنج");
  await page.locator("#username").fill(`qa-ui-${uniqueSuffix}`);
  await page.locator("#email").fill(`qa-ui-${uniqueSuffix}@example.com`);
  await page.locator("#password").fill(demoPassword);
  await page.locator("#password_confirm").fill(demoPassword);
  const termsCheckbox = page.locator('button[role="checkbox"]').first();
  await termsCheckbox.click({ force: true });
  await expect(termsCheckbox).toHaveAttribute("aria-checked", "true");
  await page.locator('button[type="submit"]').first().click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("main")).toContainText(`qa-ui-${uniqueSuffix}@example.com`);

  await page.getByRole("button", { name: "خروج" }).click();
  await expect(page).toHaveURL(/\/$/);

  await gotoApp(page, "/signin");
  await page.locator("#username").fill("demo-dev");
  await page.locator("#password").fill(demoPassword);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("#company")).toHaveValue(/IranAPI/);
  await expect(page.locator("main")).toContainText("درخواست");
  await expect(page.locator("main")).toContainText("اشتراک حساب");

  await gotoApp(page, "/pricing");
  await expect(page.locator('a[href^="/payment?subscription="]').first()).toBeVisible();
  await page.locator('a[href^="/payment?subscription="]').nth(1).click();
  await expect(page).toHaveURL(/\/payment\?subscription=/);
  await page.getByRole("button", { name: /فعال‌سازی اشتراک/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("main")).toContainText("Growth");

  const apiName = `QA Release ${uniqueSuffix}`;
  await page.locator("#api-name").fill(apiName);
  await page.locator("#api-base-url").fill(`https://qa-release-${uniqueSuffix}.example.dev/v1`);
  await page.locator("#api-docs").fill(`https://qa-release-${uniqueSuffix}.example.dev/docs`);
  await page.locator("#api-category").fill("QA");
  await page.locator("#api-tags").fill("qa, release");
  await page.locator("#api-description").fill("Published by the Playwright crawler and visible in Explore.");
  await page.getByRole("button", { name: /انتشار API/ }).click();
  await expect(page.getByRole("link", { name: "مشاهده در Explore" }).first()).toBeVisible();
  await page.getByRole("link", { name: "مشاهده در Explore" }).first().click();
  await expect(page).toHaveURL(/\/api\/qa-release-/);
  await expect(page.locator("h1")).toContainText(apiName);

  await gotoApp(page, "/dashboard");

  await page.locator("#first_name").fill("راستی‌آزمایی");
  await page.locator('button[type="submit"]').nth(0).click();
  await expect(page.locator("#first_name")).toHaveValue("راستی‌آزمایی");

  await page.locator("#company").fill("IranAPI QA Lab");
  await page.locator("#bio").fill("Dashboard profile updated by the Playwright crawler.");
  await page.locator('button[type="submit"]').nth(1).click();
  await expect(page.locator("#company")).toHaveValue("IranAPI QA Lab");

  await gotoApp(page, "/browse");
  await page.locator('main a[href^="/api/"]').first().click();
  await expect(page).toHaveURL(/\/api\/.+/);
  await page.getByRole("button", { name: "4" }).click();

  await page.getByRole("button", { name: "خروج" }).click();
  await gotoApp(page, "/dashboard");
  await expect(page).toHaveURL(/\/signin$/);

  await expectCleanRuntime(issues);
});
