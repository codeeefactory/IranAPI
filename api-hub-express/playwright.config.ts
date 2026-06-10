export default {
  testDir: "./e2e",
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : undefined,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
};
