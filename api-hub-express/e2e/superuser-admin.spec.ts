import { expect, test } from "@playwright/test";

const username = process.env.ADMIN_E2E_USERNAME;
const password = process.env.ADMIN_E2E_PASSWORD;
const fixtureSlug = `${process.env.LIVE_E2E_RUN_ID || "live-e2e"}-${Date.now()}-admin-category`;
const fixtureName = `\u062f\u0633\u062a\u0647 \u0622\u0632\u0645\u0627\u06cc\u0634\u06cc ${fixtureSlug}`;
const fixtureDescription = "\u0645\u062d\u062a\u0648\u0627\u06cc \u0641\u0627\u0631\u0633\u06cc \u0648 Unicode \u0628\u0631\u0627\u06cc \u0622\u0632\u0645\u0648\u0646 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0632\u0646\u062f\u0647";
const editedDescription = "\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0645\u0648\u0641\u0642 \u0645\u062d\u062a\u0648\u0627\u06cc \u0641\u0627\u0631\u0633\u06cc \u2713";

test("superuser can inspect every admin collection and complete Unicode CRUD", async ({ page }) => {
  test.skip(!username || !password, "Set ADMIN_E2E_USERNAME and ADMIN_E2E_PASSWORD to run destructive live-admin CRUD");
  test.setTimeout(240_000);
  const issues: string[] = [];
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !/Failed to load resource: net::/.test(message.text()) && !/fonts\.(googleapis|gstatic)\.com/.test(message.text())) {
      issues.push(`console: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    // Admin templates may reference optional Google Fonts; the console is
    // intentionally self-hosted and remains fully usable when that CDN is
    // unavailable in CI/offline environments.
    if (!/^https:\/\//.test(request.url())) {
      issues.push(`requestfailed: ${request.method()} ${request.url()}`);
    }
  });
  page.on("response", (response) => {
    if (response.url().includes("/admin/") && response.status() >= 400) issues.push(`response: ${response.status()} ${response.url()}`);
  });

  await page.goto("/admin/login/?next=/admin/", { waitUntil: "domcontentloaded" });
  await page.locator('[name="username"]').fill(username!);
  await page.locator('[name="password"]').fill(password!);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/$/);
  await expect(page.locator("body")).toContainText(username!);

  const sidebarLinks = await page.locator('a[href^="/admin/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => (link as HTMLAnchorElement).getAttribute("href")).filter(Boolean))] as string[],
  );
  expect(sidebarLinks.length).toBeGreaterThanOrEqual(13);
  for (const href of sidebarLinks) {
    const response = await page.goto(href, { waitUntil: "domcontentloaded" });
    expect(response?.status(), href).toBeLessThan(400);
    await expect(page.locator("body"), href).toBeVisible();
    await expect(page.locator("body"), href).not.toContainText("Server Error (500)");
    const addLink = page.locator("a.addlink").first();
    if (await addLink.isVisible()) {
      const addResponse = await page.goto(await addLink.getAttribute("href") || "", { waitUntil: "domcontentloaded" });
      expect(addResponse?.status(), `${href} add`).toBeLessThan(400);
      await expect(page.locator("form").first()).toBeVisible();
    }
  }

  await page.goto("/admin/api/categoriessection/add/", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="submit"]').click();
  await expect(page.locator(".errorlist").first()).toBeVisible();

  await page.locator("#id_name").fill(fixtureName);
  await page.locator("#id_name_en").fill(`${fixtureSlug} English`);
  await page.locator("#id_slug").fill(fixtureSlug);
  await page.locator("#id_description").fill(fixtureDescription);
  await page.locator("#id_icon").fill("test-tube");
  await page.locator("#id_color").fill("#12AB34");
  await page.locator('input[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/api\/categoriessection\/\d+\/change\/$/);
  const changeUrl = page.url();
  await expect(page.locator("#id_name")).toHaveValue(fixtureName);
  await expect(page.locator("#id_slug")).toHaveValue(fixtureSlug);

  await page.locator("#id_description").fill(editedDescription);
  await page.locator('input[type="submit"]').click();
  await expect(page).toHaveURL(changeUrl);
  await expect(page.locator("#id_description")).toHaveValue(editedDescription);

  await page.locator("a.deletelink").click();
  await expect(page.locator(".delete-confirmation")).toBeVisible();
  await page.locator('input[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/api\/categoriessection\/$/);
  await expect(page.locator(`a[href="${new URL(changeUrl).pathname}"]`)).toHaveCount(0);

  expect(issues, issues.join("\n")).toEqual([]);
});
