import { expect, test } from "@playwright/test";

test("API developer signup opens limited admin", async ({ page }) => {
  const backendSession = await page.request.get("/api/v1/auth/session/");
  test.skip(!backendSession.ok(), "IranAPI backend unavailable; admin flow requires live MongoDB backend");
  const suffix = `${process.env.LIVE_E2E_RUN_ID || "live-e2e"}-${test.info().project.name}-${Date.now()}`;
  const username = `${suffix}-developer`;

  await page.goto("/signup", { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: "API developer" }).click();
  await page.locator("#first_name").fill("Admin");
  await page.locator("#last_name").fill("Developer");
  await page.locator("#username").fill(username);
  await page.locator("#email").fill(`${username}@example.com`);
  await page.locator("#password").fill("StrongPass123!");
  await page.locator("#password_confirm").fill("StrongPass123!");
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/admin\/$/);
  await expect(page.locator("body")).toContainText(username);
  await expect(page.locator("body")).toContainText("API");

  const forbidden = await page.request.get("/admin/api/categoriessection/");
  expect(forbidden.status()).toBe(403);
});
