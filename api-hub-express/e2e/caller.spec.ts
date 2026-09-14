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
        body: { url: "https://httpbin.org/get" },
        usage: null,
      }),
    });
  });

  await page.goto("/caller", { waitUntil: "networkidle" });
  await expect(page.getByLabel("url")).toHaveValue("https://httpbin.org/get");
  await page.getByRole("button", { name: /execute/i }).click();

  await expect(page.locator("main#main")).toContainText("[200]");
  await expect(page.locator("main#main")).toContainText('"url": "https://httpbin.org/get"');
  expect(payload).toEqual({
    url: "https://httpbin.org/get",
    method: "GET",
    headers: {},
  });
});
