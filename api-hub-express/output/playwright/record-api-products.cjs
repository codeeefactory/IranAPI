const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium, expect } = require("@playwright/test");

const root = process.cwd();
const videoDir = path.join(root, "output", "playwright", "api-products-video");
const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const now = Date.now();

const products = [
  {
    name: "Tehran Transit Routing API",
    base_url: "https://api.iranapi.dev/v1/tehran-transit-routing",
    documentation_url: "https://docs.iranapi.dev/tehran-transit-routing",
    auth_scheme: "api-key",
    category: "Mobility",
    tags: ["routing", "metro", "traffic"],
    description: "Route planning, station lookup, and estimated arrival data for Tehran public transit apps.",
  },
  {
    name: "Persian OCR Documents API",
    base_url: "https://api.iranapi.dev/v1/persian-ocr-documents",
    documentation_url: "https://docs.iranapi.dev/persian-ocr-documents",
    auth_scheme: "bearer",
    category: "AI",
    tags: ["ocr", "persian", "documents"],
    description: "Persian and English OCR extraction for invoices, IDs, receipts, and scanned business documents.",
  },
  {
    name: "Shetab Fraud Score API",
    base_url: "https://api.iranapi.dev/v1/shetab-fraud-score",
    documentation_url: "https://docs.iranapi.dev/shetab-fraud-score",
    auth_scheme: "api-key",
    category: "Fintech",
    tags: ["fraud", "payments", "risk"],
    description: "Risk scoring signals for card-not-present payments, suspicious velocity, and merchant controls.",
  },
  {
    name: "Zarinpal Ledger Sync API",
    base_url: "https://api.iranapi.dev/v1/zarinpal-ledger-sync",
    documentation_url: "https://docs.iranapi.dev/zarinpal-ledger-sync",
    auth_scheme: "oauth2",
    category: "Finance",
    tags: ["ledger", "reconciliation", "payouts"],
    description: "Automated reconciliation for payment ledgers, payout batches, refunds, and settlement reports.",
  },
  {
    name: "Iran Weather Alerts API",
    base_url: "https://api.iranapi.dev/v1/iran-weather-alerts",
    documentation_url: "https://docs.iranapi.dev/iran-weather-alerts",
    auth_scheme: "none",
    category: "Data",
    tags: ["weather", "alerts", "forecast"],
    description: "Regional forecast, air quality, severe-weather warnings, and city-level alert feeds for Iran.",
  },
];

async function json(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON ${response.status()}: ${text.slice(0, 300)}`);
  }
}

(async () => {
  await fs.mkdir(videoDir, { recursive: true });
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  const created = [];

  await page.goto(`${baseUrl}/browse`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "output/playwright/api-products-before.png", fullPage: true });

  await page.goto(`${baseUrl}/signup`, { waitUntil: "networkidle" });
  await page.locator("#first_name").fill("Backend");
  await page.locator("#last_name").fill("Seeder");
  await page.locator("#username").fill(`api-seeder-${now}`);
  await page.locator("#email").fill(`api-seeder-${now}@example.com`);
  await page.locator("#password").fill("StrongPass123!");
  await page.locator("#password_confirm").fill("StrongPass123!");
  await page.locator('button[type="submit"]').first().click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

  await page.goto(`${baseUrl}/release`, { waitUntil: "networkidle" });
  for (const product of products) {
    const response = await page.request.post(`${baseUrl}/api/v1/catalog/apis/`, {
      data: product,
      headers: { "Content-Type": "application/json" },
    });
    const payload = await json(response);
    if (response.status() !== 201) {
      throw new Error(`Release failed for ${product.name}: ${response.status()} ${JSON.stringify(payload)}`);
    }
    created.push(payload.api);

    await page.evaluate(
      ({ productName, count }) => {
        document.body.insertAdjacentHTML(
          "afterbegin",
          `<div style="position:fixed;inset:16px auto auto 16px;z-index:9999;background:#07170f;color:#61ff5a;border:1px solid #1f7a3b;padding:10px 12px;font:14px monospace">POST /api/v1/catalog/apis/ -> ${count}<br>${productName}</div>`,
        );
      },
      { productName: product.name, count: created.length },
    );
    await page.waitForTimeout(600);
  }

  const slugs = created.map((api) => api.slug);
  const listResponse = await page.request.get(`${baseUrl}/api/v1/catalog/apis/?search=API&page_size=100`);
  if (listResponse.status() !== 200) throw new Error(`Catalog check failed: ${listResponse.status()}`);

  await page.goto(`${baseUrl}/browse`, { waitUntil: "networkidle" });
  await page.locator("#api-search").fill("API");
  await page.waitForTimeout(800);
  for (const api of created.slice(0, 3)) {
    await expect(page.locator("main#main")).toContainText(api.name, { timeout: 10000 });
  }
  await page.screenshot({ path: "output/playwright/api-products-after.png", fullPage: true });

  await page.goto(`${baseUrl}/api/${slugs[0]}`, { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText(created[0].name);
  await page.waitForTimeout(1500);

  await fs.writeFile(
    path.join(root, "output", "playwright", "api-products-created.json"),
    JSON.stringify({ created_at: new Date().toISOString(), products: created }, null, 2),
  );
  await context.close();
  await browser.close();

  const videos = await fs.readdir(videoDir);
  console.log(JSON.stringify({ created: created.map((api) => ({ name: api.name, slug: api.slug })), videoDir, videos }, null, 2));
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
