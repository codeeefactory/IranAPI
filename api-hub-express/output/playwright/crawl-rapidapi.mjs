import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("output/playwright/rapidapi");
const pages = [
  { name: "home", url: "https://rapidapi.com/" },
  { name: "hub", url: "https://rapidapi.com/hub" },
  { name: "search", url: "https://rapidapi.com/search/google" },
  { name: "marketplace-product", url: "https://rapidapi.com/products/api-marketplace" },
  { name: "docs", url: "https://docs.rapidapi.com/" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const summary = [];

for (const item of pages) {
  try {
    await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.screenshot({ path: path.join(outDir, `${item.name}.png`), fullPage: true });

    const data = await page.evaluate(() => {
      const text = document.body?.innerText || "";
      const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
        .map((node) => node.textContent?.trim())
        .filter(Boolean)
        .slice(0, 30);
      const links = Array.from(document.querySelectorAll("a[href]"))
        .map((node) => ({
          text: node.textContent?.trim().replace(/\s+/g, " ").slice(0, 100),
          href: node.href,
        }))
        .filter((link) => link.text && link.href)
        .slice(0, 80);
      return { title: document.title, headings, links, text: text.slice(0, 12000) };
    });

    await writeFile(path.join(outDir, `${item.name}.json`), JSON.stringify({ ...item, ...data }, null, 2), "utf8");
    summary.push({ name: item.name, url: item.url, title: data.title, headings: data.headings.slice(0, 8) });
  } catch (error) {
    summary.push({ name: item.name, url: item.url, error: String(error) });
  }
}

await browser.close();
await writeFile(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
