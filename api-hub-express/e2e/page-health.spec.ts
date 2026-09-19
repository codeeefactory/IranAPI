import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/browse",
  "/api/speech-gateway",
  "/documentation",
  "/pricing",
  "/payment",
  "/signin",
  "/signup",
  "/terms",
  "/privacy",
  "/dashboard",
  "/caller",
  "/cli",
  "/studio",
  "/init",
  "/release",
  "/org/organizations/create",
  "/missing-route",
];

test.describe("page health", () => {
  for (const route of routes) {
    test(`${route} renders nonblank page`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        // API is optional for static/page-health smoke tests; backend 4xx/5xx
        // responses are asserted by backend/e2e flows, not this route check.
        if (message.type() === "error" && !message.text().includes("Failed to load resource")) {
          errors.push(message.text());
        }
      });

      await page.goto(route, { waitUntil: "networkidle" });

      const bodyText = (await page.locator("body").innerText()).trim();
      await expect(page.locator("body")).toBeVisible();
      expect(bodyText.length).toBeGreaterThan(20);
      expect(
        errors.filter((error) => !error.includes("favicon") && !error.includes("cdn.jsdelivr.net") && !error.includes("net::ERR_FAILED")),
      ).toEqual([]);
    });
  }
});
