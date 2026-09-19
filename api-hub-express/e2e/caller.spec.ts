import { expect, test } from "@playwright/test";

test("anonymous visitor can call a public API", async ({ page }) => {
  let payload: Record<string, unknown> | null = null;
  await page.route("**/api/v1/public/caller/", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status_code: 200,
        latency_ms: 24,
        region: "public-direct",
        content_type: "application/json",
        body: { url: payload?.url },
        usage: null,
      }),
    });
  });

  await page.goto("/caller", { waitUntil: "networkidle" });
  await expect(page.getByLabel("url")).toHaveValue(/api\.open-meteo\.com/);
  await expect(page.getByRole("button", { name: "Tehran weather" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Python on GitHub" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Public holidays" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Persian Quran" })).toBeVisible();

  await page.getByRole("button", { name: "Python on GitHub" }).click();
  await expect(page.getByLabel("url")).toHaveValue("https://api.github.com/repos/python/cpython");
  await page.getByRole("button", { name: /execute/i }).click();

  await expect(page.locator("main#main")).toContainText("[200]");
  await expect(page.locator("main#main")).toContainText('"url": "https://api.github.com/repos/python/cpython"');
  expect(payload).toEqual({
    url: "https://api.github.com/repos/python/cpython",
    method: "GET",
    headers: { Accept: "application/vnd.github+json" },
  });
});
