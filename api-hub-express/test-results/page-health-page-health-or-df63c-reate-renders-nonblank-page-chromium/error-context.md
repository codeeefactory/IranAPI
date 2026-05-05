# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-health.spec.ts >> page health >> /org/organizations/create renders nonblank page
- Location: e2e\page-health.spec.ts:21:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/org/organizations/create", waiting until "networkidle"

```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const routes = [
  4  |   "/",
  5  |   "/browse",
  6  |   "/documentation",
  7  |   "/pricing",
  8  |   "/payment",
  9  |   "/signin",
  10 |   "/signup",
  11 |   "/terms",
  12 |   "/privacy",
  13 |   "/dashboard",
  14 |   "/studio",
  15 |   "/org/organizations/create",
  16 |   "/missing-route",
  17 | ];
  18 | 
  19 | test.describe("page health", () => {
  20 |   for (const route of routes) {
  21 |     test(`${route} renders nonblank page`, async ({ page }) => {
  22 |       const errors: string[] = [];
  23 |       page.on("pageerror", (error) => errors.push(error.message));
  24 |       page.on("console", (message) => {
  25 |         if (message.type() === "error") {
  26 |           errors.push(message.text());
  27 |         }
  28 |       });
  29 | 
> 30 |       await page.goto(route, { waitUntil: "networkidle" });
     |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  31 | 
  32 |       const bodyText = (await page.locator("body").innerText()).trim();
  33 |       await expect(page.locator("body")).toBeVisible();
  34 |       expect(bodyText.length).toBeGreaterThan(20);
  35 |       expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
  36 |     });
  37 |   }
  38 | });
  39 | 
```