import { expect, Page, test } from "@playwright/test";

const demoPassword = "StrongPass123!";
const trackedOrigins = [
  process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:5173",
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

  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") issues.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    const failureText = request.failure()?.errorText || "unknown";
    if (failureText.includes("ERR_ABORTED")) return;
    if (isTrackedUrl(request.url())) issues.push(`requestfailed: ${request.method()} ${request.url()} ${failureText}`);
  });
  page.on("response", (response) => {
    const url = response.url();
    if (!isTrackedUrl(url) || url.endsWith("/favicon.ico")) return;
    if (response.status() >= 400 && !url.includes("/api/v1/account/user/")) {
      issues.push(`response: ${response.status()} ${url}`);
    }
  });

  return issues;
}

async function expectCleanRuntime(issues: string[]) {
  expect(
    issues.filter(
      (issue) =>
        !issue.includes("/api/v1/catalog/apis/speech-gateway/") &&
        !issue.includes("Failed to load resource: the server responded with a status of 404") &&
        !(issue.includes("response: 404") && issue.includes("/api/v1/")),
    ),
    issues.join("\n"),
  ).toEqual([]);
}

async function gotoApp(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

async function expectCurrentAppShell(page: Page) {
  await expect(page.locator("main#main")).toBeVisible();
  await expect(page.getByRole("link", { name: "iran api", exact: true })).toBeVisible();
}

async function logoutThroughResponsiveHeader(page: Page) {
  const desktopLogout = page.locator('button[aria-label="logout"]');
  if (await desktopLogout.isVisible()) {
    await desktopLogout.click();
    return;
  }
  const mobileMenu = page.locator('button[aria-controls="mobile-nav"]');
  if ((await mobileMenu.getAttribute("aria-expanded")) !== "true") await mobileMenu.click();
  await page.locator("#mobile-nav button").filter({ hasText: /logout/i }).click();
}

test("public crawler validates navigation, metadata, and core CTAs", async ({ page }) => {
  const issues = monitorPage(page);

  await gotoApp(page, "/");
  await expect(page).toHaveTitle(/IranAPI/);
  await expectCurrentAppShell(page);
  await expect(page.locator("main#main")).toContainText(`curl ${new URL(page.url()).origin}/api/v1/catalog/apis/`);
  await expect(page.locator("main#main")).not.toContainText("http://localhost:8000");

  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toBeTruthy();
  expect(description).not.toContain("40,000");

  const mobileMenu = page.locator('button[aria-controls="mobile-nav"]');
  if (await mobileMenu.isVisible()) {
    await mobileMenu.focus();
    await expect(mobileMenu).toBeFocused();
    await mobileMenu.click();
    await expect(mobileMenu).toHaveAttribute("aria-expanded", "true");
  }
  await page.locator('a[href="/browse"]:visible').first().click();
  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.locator("main#main")).toContainText("browse the registry");

  await expect(page.locator("#api-search")).toBeVisible();

  await gotoApp(page, "/api/speech-gateway");
  await expect(page).toHaveURL(/\/api\/speech-gateway$/);
  await expect(page.locator("pre").first()).toBeVisible();
  await expect(page.getByText("// endpoints")).toBeVisible();
  await expect(page.getByText("// response")).toBeVisible();
  await expect(page.locator("main#main")).not.toContainText("http://localhost:8000");

  await gotoApp(page, "/pricing");
  await expect(page).toHaveTitle(/IranAPI/);
  await gotoApp(page, "/payment?subscription=growth");
  await expect(page).toHaveURL(/\/payment\?subscription=growth$/);
  await expect(page.getByRole("button", { name: "./signin_to_continue" })).toBeVisible();

  await gotoApp(page, "/documentation");
  await expect(page.locator("section#quickstart")).toBeVisible();

  await gotoApp(page, "/terms");
  await expect(page.locator("main#main")).toContainText("terms of service");

  await gotoApp(page, "/privacy");
  await expect(page.locator("main#main")).toContainText("privacy implementation notes");

  await gotoApp(page, "/this-route-does-not-exist");
  await expect(page).toHaveURL(/\/$/);
  await expectCurrentAppShell(page);

  await expectCleanRuntime(issues);
});

test("authenticated crawler validates register, login, dashboard forms, rating, and logout", async ({ page }) => {
  test.setTimeout(150_000);
  const backendSession = await page.request.get("/api/v1/auth/session/");
  test.skip(!backendSession.ok(), "IranAPI backend unavailable; authenticated flow requires live MongoDB backend");
  const issues = monitorPage(page);
  const uniqueSuffix = `${process.env.LIVE_E2E_RUN_ID || "live-e2e"}-${test.info().project.name}-${Date.now()}`;

  await gotoApp(page, "/signup");
  await expect(page.locator("main#main")).toContainText("iranapi account create");

  await page.locator("#first_name").fill("QA");
  await page.locator("#last_name").fill("Crawler");
  await page.locator("#username").fill(uniqueSuffix);
  await page.locator("#email").fill(`${uniqueSuffix}@example.com`);
  await page.locator("#password").fill(demoPassword);
  await page.locator("#password_confirm").fill(demoPassword);
  await page.locator('button[type="submit"]').first().click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("main")).toContainText(`${uniqueSuffix}@example.com`);

  await logoutThroughResponsiveHeader(page);
  await expect(page.locator('header a[href="/signin"]:visible').first()).toBeVisible();

  await gotoApp(page, "/signin");
  await page.locator("#username").fill(uniqueSuffix);
  await page.locator("#password").fill(demoPassword);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("main")).toContainText(`${uniqueSuffix}@example.com`);
  await expect(page.locator("main")).toContainText("requests");
  await expect(page.locator("main")).toContainText("account subscription");

  await gotoApp(page, "/init");
  await expect(page.locator("main#main")).toContainText("Project starter");
  await page.locator("#init-project-name").fill(`QA Starter ${uniqueSuffix}`);
  await page.locator("#init-package").fill(`qa-starter-${uniqueSuffix}`);
  await page.locator("#init-language").selectOption("javascript");
  await page.getByRole("button", { name: "./init_project" }).click();
  await expect(page.locator("main#main")).toContainText("initialized qa-starter");
  await expect(page.getByRole("button", { name: "package.json" })).toBeVisible();

  await gotoApp(page, "/org/organizations/create");
  await page.locator("#org-name").fill(`QA Organization ${uniqueSuffix}`);
  await page.locator("#org-region").selectOption("eu-frankfurt-1");
  await page.getByRole("button", { name: "./provision" }).click();
  await expect(page.getByRole("status")).toContainText("provisioned");

  await gotoApp(page, "/studio");
  await expect(page.locator("#studio-api option").first()).toBeAttached();
  await page.locator("#studio-flow").fill(`qa-flow-${uniqueSuffix}`);
  await page.locator("#studio-region").selectOption("ir-mashhad-1");
  await page.getByRole("button", { name: "./deploy" }).click();
  await expect(page.getByRole("status")).toContainText("deployed");

  await gotoApp(page, "/payment?subscription=growth");
  await expect(page).toHaveURL(/\/payment\?subscription=growth$/);
  await page.getByRole("button", { name: "./confirm_manual_checkout" }).click();
  await expect(page.getByRole("link", { name: "./subscription_active" })).toBeVisible();

  await gotoApp(page, "/release");
  const apiName = `${uniqueSuffix}-release`;
  const fixtureOrigin = `https://example.dev/${encodeURIComponent(uniqueSuffix)}`;
  await page.locator("form input").nth(0).fill(apiName);
  await page.locator("form input").nth(1).fill(`${fixtureOrigin}/v1`);
  await page.locator("form input").nth(2).fill(`${fixtureOrigin}/docs`);
  await page.locator("form input").nth(3).fill("QA");
  await page.locator("form input").nth(4).fill("qa, release");
  await page.locator("form textarea").fill("Published by the Playwright crawler and visible in Explore.");
  await page.getByRole("button", { name: /publish/ }).click();
  await expect(page.getByRole("link", { name: "view listing" }).first()).toBeVisible();
  await page.getByRole("link", { name: "view listing" }).first().click();
  expect(new URL(page.url()).pathname).toBe(`/api/${apiName}`);
  await expect(page.locator("h1")).toContainText(apiName);

  await gotoApp(page, "/dashboard");
  await page.getByRole("textbox", { name: "--first-name" }).fill("Runtime");
  await page.locator('button[type="submit"]').nth(0).click();
  await expect(page.getByRole("textbox", { name: "--first-name" })).toHaveValue("Runtime");

  await page.getByRole("textbox", { name: "--company" }).fill("IranAPI QA Lab");
  await page.getByRole("textbox", { name: "--bio" }).fill("Dashboard profile updated by the Playwright crawler.");
  await page.locator('button[type="submit"]').first().click();
  await expect(page.getByRole("textbox", { name: "--company" })).toHaveValue("IranAPI QA Lab");

  await gotoApp(page, "/browse");
  await page.locator('main a[href^="/api/"]').first().click();
  await expect(page).toHaveURL(/\/api\/.+/);
  await page.getByRole("button", { name: "rate 4 stars" }).click();

  await logoutThroughResponsiveHeader(page);
  await expect(page.locator('header a[href="/signin"]:visible').first()).toBeVisible();
  await gotoApp(page, "/dashboard");
  await expect(page.locator("main")).toContainText("// not authenticated");

  await expectCleanRuntime(issues);
});
