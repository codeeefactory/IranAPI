import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/browse",
  "/documentation",
  "/pricing",
  "/payment",
  "/signin",
  "/signup",
  "/terms",
  "/privacy",
  "/dashboard",
  "/studio",
  "/org/organizations/create",
  "/missing-route",
];

test.describe("page health", () => {
  for (const route of routes) {
    test(`${route} renders nonblank page`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });

      await page.goto(route, { waitUntil: "networkidle" });

      const bodyText = (await page.locator("body").innerText()).trim();
      await expect(page.locator("body")).toBeVisible();
      expect(bodyText.length).toBeGreaterThan(20);
      expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
    });
  }
});
