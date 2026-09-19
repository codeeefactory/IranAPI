import { expect, test } from "@playwright/test";

const routes = [
  "/", "/browse", "/api/speech-gateway", "/documentation", "/pricing",
  "/payment?subscription=growth", "/signin", "/signup", "/dashboard",
  "/caller", "/cli", "/studio", "/init", "/release",
  "/org/organizations/create", "/terms", "/privacy", "/missing-route",
];

test("all public pages expose valid links, named controls, focus, and metadata", async ({ page, request }) => {
  const failures: string[] = [];
  const internalLinks = new Set<string>();

  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (failed) => {
    if (!failed.failure()?.errorText.includes("ERR_ABORTED")) {
      failures.push(`requestfailed: ${failed.method()} ${failed.url()}`);
    }
  });

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBeLessThan(400);
    await expect(page.locator("main#main"), route).toBeVisible();
    await expect(page).toHaveTitle(/IranAPI/);
    expect(await page.locator('meta[name="description"]').getAttribute("content"), route).toBeTruthy();

    const controls = await page.locator("a:visible, button:visible, input:visible, select:visible, textarea:visible").evaluateAll((elements) =>
      elements.map((element) => ({
        tag: element.tagName,
        text: (element.textContent || "").trim(),
        label: element.getAttribute("aria-label") || element.getAttribute("title") || "",
        href: element.getAttribute("href") || "",
        id: element.id,
        placeholder: element.getAttribute("placeholder") || "",
      })),
    );
    for (const control of controls) {
      if (!control.text && !control.label && !control.placeholder && !control.id) {
        failures.push(`${route}: unnamed ${control.tag}`);
      }
      if (control.tag === "A") {
        if (!control.href || /^javascript:/i.test(control.href)) failures.push(`${route}: invalid anchor href`);
        else if (control.href.startsWith("/")) internalLinks.add(new URL(control.href, page.url()).href);
      }
    }

    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.tagName), `${route}: keyboard focus`).not.toBe("BODY");
  }

  for (const href of internalLinks) {
    const response = await request.get(href, { maxRedirects: 5 });
    if (response.status() >= 400) failures.push(`link ${href}: HTTP ${response.status()}`);
  }

  expect(failures, failures.join("\n")).toEqual([]);
});
