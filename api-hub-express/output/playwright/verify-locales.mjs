import { chromium } from "playwright";

const locales = ["en", "ar", "es", "fr", "tr"];
const browser = await chromium.launch();

for (const locale of locales) {
  const page = await browser.newPage();
  await page.addInitScript((nextLocale) => {
    localStorage.setItem("iranapi-locale", nextLocale);
  }, locale);
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const text = await page.locator("main").innerText();
  console.log(locale, /پلتفرم|جستجو|داشبورد مشترک/.test(text) ? "PERSIAN_LEFT" : "ok", text.slice(0, 140).replace(/\s+/g, " "));
  await page.close();
}

await browser.close();
