import { existsSync } from "node:fs";

const systemChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || (existsSync(systemChrome) ? systemChrome : undefined);

export default {
  testDir: "./e2e",
  // Authenticated specs share the same local MongoDB and rate-limit state.
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:5173",
    launchOptions: browserExecutable ? { executablePath: browserExecutable } : undefined,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium-desktop", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "chromium-mobile", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
};
