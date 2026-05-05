import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4180";
const outDir = path.resolve("output/playwright/iranapi-sync");
const routes = [
  { name: "home", path: "/" },
  { name: "browse", path: "/browse" },
  { name: "pricing", path: "/pricing" },
  { name: "docs", path: "/documentation" },
  { name: "caller", path: "/caller" },
  { name: "studio", path: "/studio" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const results = [];

for (const route of routes) {
  const url = new URL(route.path, baseUrl).toString();
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await page.screenshot({ path: path.join(outDir, `${route.name}.png`), fullPage: true });
  const state = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const rect = document.body.getBoundingClientRect();
    const parity = bodyText.includes("RapidAPI parity");
    const sync = bodyText.includes("Marketplace features synced");
    const mojibake = /Ø|Ù|Û|Ã|â€/.test(bodyText);
    return {
      title: document.title,
      textLength: bodyText.length,
      height: rect.height,
      hasRapidApiParity: parity,
      hasSyncCopy: sync,
      hasMojibake: mojibake,
    };
  });
  results.push({ ...route, url, ...state });
}

await browser.close();
await writeFile(path.join(outDir, "summary.json"), JSON.stringify(results, null, 2), "utf8");
console.log(JSON.stringify(results, null, 2));
