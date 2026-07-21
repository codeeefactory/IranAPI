const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium, expect } = require("@playwright/test");

const root = process.cwd();
const baseUrl = (process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const outDir = path.join(root, "output", "playwright", "tutorial-videos");
const storagePath = path.join(outDir, "tutorial-auth-state.json");
const manifestPath = path.join(outDir, "manifest.json");
const stamp = Date.now();
const username = `tutorial-${stamp}`;
const password = "StrongPass123!";

const coverage = [];

async function readJson(response, label) {
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${label}: expected JSON, got ${response.status()} ${text.slice(0, 240)}`);
  }
  if (!response.ok()) {
    throw new Error(`${label}: ${response.status()} ${JSON.stringify(payload).slice(0, 400)}`);
  }
  coverage.push({ label, status: response.status(), url: response.url() });
  return payload;
}

async function addOverlay(page, title, lines = []) {
  await page.evaluate(
    ({ title, lines }) => {
      const id = "tutorial-overlay";
      let node = document.getElementById(id);
      if (!node) {
        node = document.createElement("div");
        node.id = id;
        node.style.cssText = [
          "position:fixed",
          "left:18px",
          "top:18px",
          "z-index:2147483647",
          "max-width:620px",
          "background:#07170fee",
          "color:#d7ffe4",
          "border:1px solid #25d366",
          "box-shadow:0 0 24px #25d36655",
          "border-radius:4px",
          "padding:12px 14px",
          "font:14px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
          "direction:ltr",
          "text-align:left",
          "white-space:normal",
        ].join(";");
        document.body.appendChild(node);
      }
      node.innerHTML = `<div style="font-weight:800;color:#61ff8a;margin-bottom:4px">${title}</div>` +
        lines.map((line) => `<div>// ${String(line).replace(/[<&]/g, (c) => c === "<" ? "&lt;" : "&amp;")}</div>`).join("");
    },
    { title, lines },
  );
}

async function pause(page, ms = 900) {
  await page.waitForTimeout(ms);
}

async function record(browser, name, useAuth, steps) {
  const videoDir = path.join(outDir, `${name}-raw`);
  await fs.mkdir(videoDir, { recursive: true });
  const context = await browser.newContext({
    storageState: useAuth ? storagePath : undefined,
    viewport: { width: 1440, height: 1000 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  await steps(page, context);
  const video = page.video();
  await context.close();
  const target = path.join(outDir, `${name}.webm`);
  if (video) await video.saveAs(target);
  await fs.rm(videoDir, { recursive: true, force: true });
  coverage.push({ label: `video:${name}`, artifact: target });
  return target;
}

async function signupAndSave(page, context) {
  await page.goto(`${baseUrl}/signup`, { waitUntil: "networkidle" });
  await addOverlay(page, "Tutorial 01 - account creation", [
    "POST /api/v1/auth/register/",
    "Creates fresh demo user and browser session.",
  ]);
  await page.locator("#first_name").fill("Tutorial");
  await page.locator("#last_name").fill("Operator");
  await page.locator("#username").fill(username);
  await page.locator("#email").fill(`${username}@example.com`);
  await page.locator("#password").fill(password);
  await page.locator("#password_confirm").fill(password);
  await pause(page, 500);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
  await addOverlay(page, "Account ready", ["GET /api/v1/auth/session/", "Redirect landed on dashboard."]);
  await pause(page, 1100);
  await context.storageState({ path: storagePath });
}

async function run() {
  await fs.mkdir(outDir, { recursive: true });
  const seed = spawnSync(
    process.env.PYTHON || "python",
    ["../manage.py", "shell", "-c", "from api.seed import seed_sample_data; print(seed_sample_data(force=True))"],
    { cwd: root, encoding: "utf-8" },
  );
  if (seed.status !== 0) {
    throw new Error(`Seed failed:\n${seed.stdout}\n${seed.stderr}`);
  }
  coverage.push({ label: "seed sample data", stdout: seed.stdout.trim() });
  const browser = await chromium.launch(executablePath ? { executablePath } : {});

  await record(browser, "01-auth-signup-session", false, signupAndSave);

  await record(browser, "02-dashboard-profile-key", true, async (page) => {
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 02 - dashboard profile", [
      "GET account/user, profile, access, subscription, usage stats.",
      "PATCH account/user + account/profile on save.",
    ]);
    await page.locator('input[name="company"]').fill("IranAPI Tutorial Lab");
    await page.locator('input[name="phone"]').fill("+982100000000");
    await page.locator('textarea[name="bio"]').fill("Operator training account for dashboard and backend tutorials.");
    await pause(page, 600);
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole("status").filter({ hasText: "profile updated" })).toBeVisible({ timeout: 10000 });
    await addOverlay(page, "Profile saved", ["PATCH /api/v1/account/user/", "PATCH /api/v1/account/profile/"]);
    await pause(page, 900);
    await page.getByRole("button", { name: /generate|rotate|api/i }).click();
    await expect(page.getByRole("status").filter({ hasText: "api key rotated" })).toBeVisible({ timeout: 10000 });
    await addOverlay(page, "API key rotated", ["POST /api/v1/account/api-key/rotate/", "One-time demo key appears in account key panel."]);
    await pause(page, 1300);
  });

  let firstApiSlug = "";
  let firstPlanId = 0;
  let checkoutId = 0;
  await record(browser, "03-backend-api-tour", true, async (page) => {
    await page.goto(`${baseUrl}/documentation`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 03 - backend API tour", [
      "Runs every major backend operation by HTTP.",
      "Responses verified before video ends.",
    ]);
    const req = page.request;
    await readJson(await req.get(`${baseUrl}/api/v1/system/health/`), "health");
    await readJson(await req.get(`${baseUrl}/api/v1/schema/openapi.json`), "openapi schema");
    await readJson(await req.get(`${baseUrl}/api/v1/auth/session/`), "session");
    await readJson(await req.get(`${baseUrl}/api/v1/auth/social/providers/`), "social providers");
    const categories = await readJson(await req.get(`${baseUrl}/api/v1/catalog/categories/?page_size=20`), "categories list");
    const apis = await readJson(await req.get(`${baseUrl}/api/v1/catalog/apis/?page_size=20`), "apis list");
    firstApiSlug = apis.results?.[0]?.slug || "payments-hub";
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/categories/${categories.results?.[0]?.slug || "payments"}/`), "category detail");
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/categories/${categories.results?.[0]?.slug || "payments"}/apis/`), "category apis");
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/apis/${firstApiSlug}/`), "api detail");
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/apis/${firstApiSlug}/similar/`), "similar apis");
    await readJson(await req.post(`${baseUrl}/api/v1/catalog/apis/${firstApiSlug}/ratings/`, { data: { rating: 5 } }), "rate api");
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/apis/${firstApiSlug}/plans/`), "api plans");
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/apis/${firstApiSlug}/docs/`), "api docs");
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/apis/${firstApiSlug}/endpoints/`), "api endpoints");
    const subPlans = await readJson(await req.get(`${baseUrl}/api/v1/catalog/subscription-plans/`), "subscription plans");
    firstPlanId = subPlans.results?.[0]?.id || 1;
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/pricing-plans/`), "pricing plans");
    await readJson(await req.get(`${baseUrl}/api/v1/catalog/documentations/`), "documentation list");
    await readJson(await req.get(`${baseUrl}/api/v1/account/user/`), "current user");
    await readJson(await req.patch(`${baseUrl}/api/v1/account/user/`, { data: { first_name: "Tutorial", last_name: "Backend" } }), "update user");
    await readJson(await req.get(`${baseUrl}/api/v1/account/profile/`), "profile");
    await readJson(await req.patch(`${baseUrl}/api/v1/account/profile/`, { data: { company: "Backend Tutorial", phone: "+982122222222", bio: "HTTP operation coverage." } }), "update profile");
    await readJson(await req.get(`${baseUrl}/api/v1/account/access/`), "access grants");
    await readJson(await req.get(`${baseUrl}/api/v1/account/organizations/`), "organizations list");
    await readJson(await req.post(`${baseUrl}/api/v1/account/organizations/`, { data: { name: `tutorial-org-${stamp}`, region: "ir-tehran-1" } }), "create organization");
    await readJson(await req.get(`${baseUrl}/api/v1/account/usage/`), "usage list");
    await readJson(await req.get(`${baseUrl}/api/v1/account/usage/stats/`), "usage stats");
    const checkout = await readJson(await req.post(`${baseUrl}/api/v1/account/subscription/`, { data: { plan_id: firstPlanId } }), "create checkout");
    checkoutId = checkout.checkout.id;
    await readJson(await req.get(`${baseUrl}/api/v1/account/subscription/checkout/${checkoutId}/`), "get checkout");
    await readJson(await req.delete(`${baseUrl}/api/v1/account/subscription/checkout/${checkoutId}/`), "cancel checkout");
    const checkout2 = await readJson(await req.post(`${baseUrl}/api/v1/account/subscription/`, { data: { plan_id: firstPlanId } }), "create checkout for confirm");
    await readJson(await req.post(`${baseUrl}/api/v1/account/subscription/checkout/${checkout2.checkout.id}/confirm/`), "confirm checkout");
    await addOverlay(page, "Backend API tour complete", [
      `${coverage.filter((item) => item.status).length} HTTP operations passed.`,
      `Catalog target: ${firstApiSlug}`,
    ]);
    await pause(page, 1600);
  });

  await record(browser, "04-release-publish-api", true, async (page) => {
    await page.goto(`${baseUrl}/release`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 04 - publish API", ["POST /api/v1/catalog/apis/", "New API becomes searchable in catalog."]);
    await page.locator("#release-name").fill(`Tutorial Ledger API ${stamp}`);
    await page.locator("#release-base-url").fill("https://api.example.dev/v1/tutorial-ledger");
    await page.locator("#release-docs-url").fill("https://docs.example.dev/tutorial-ledger");
    await page.locator("#release-category").fill("Tutorial");
    await page.locator("#release-tags").fill("tutorial, ledger, backend");
    await page.locator("#release-description").fill("Tutorial API published during automated operator training video.");
    await pause(page, 600);
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole("status").filter({ hasText: "published" })).toBeVisible({ timeout: 12000 });
    await pause(page, 1300);
  });

  await record(browser, "05-caller-execute-usage", true, async (page) => {
    await page.goto(`${baseUrl}/caller`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 05 - API caller", ["POST /api/v1/account/caller/", "Executes selected API and writes usage history."]);
    await page.locator("#method").selectOption("POST");
    await page.locator("#url").fill(`https://api.iranapi.dev/v1/${firstApiSlug}/ping`);
    await pause(page, 600);
    await page.getByRole("button", { name: /execute|running/i }).click();
    await expect(page.locator('text=/press \\.\\/execute|response|200|ir-tehran-1/i').first()).toBeVisible({ timeout: 12000 });
    await addOverlay(page, "Caller result recorded", ["Usage appears in caller history and dashboard metrics."]);
    await pause(page, 1400);
  });

  await record(browser, "06-studio-deploy-flow", true, async (page) => {
    await page.goto(`${baseUrl}/studio`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 06 - Studio flow", ["POST /api/v1/account/studio/flows/", "Deploys trigger -> api_call -> notify flow."]);
    await page.locator("#studio-flow").fill(`tutorial_flow_${stamp}`);
    await page.locator("#studio-region").selectOption("ir-tehran-1");
    await pause(page, 600);
    await page.getByRole("button", { name: /deploy/i }).click();
    await expect(page.getByRole("status").filter({ hasText: "deployed" })).toBeVisible({ timeout: 12000 });
    await pause(page, 1300);
  });

  await record(browser, "07-project-init", true, async (page) => {
    await page.goto(`${baseUrl}/init`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 07 - project init", ["GET/POST /api/v1/account/projects/init/", "Generates starter files from backend template."]);
    await page.locator("#init-project-name").fill(`Tutorial Proxy ${stamp}`);
    await page.locator("#init-package").fill(`tutorial-proxy-${stamp}`);
    await page.locator("#init-language").selectOption("python");
    await pause(page, 600);
    await page.getByRole("button", { name: /init_project/i }).click();
    await expect(page.getByRole("status").filter({ hasText: "initialized" })).toBeVisible({ timeout: 12000 });
    await pause(page, 1400);
  });

  await record(browser, "08-org-and-billing", true, async (page) => {
    await page.goto(`${baseUrl}/org/organizations/create`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 08 - organization", ["POST /api/v1/account/organizations/", "Creates org and lists owned orgs."]);
    await page.locator("#org-name").fill(`video-org-${stamp}`);
    await page.locator("#org-region").selectOption("eu-frankfurt-1");
    await pause(page, 500);
    await page.getByRole("button", { name: /provision/i }).click();
    await expect(page.getByRole("status").filter({ hasText: "provisioned" })).toBeVisible({ timeout: 12000 });
    await pause(page, 900);
    await page.goto(`${baseUrl}/payment?subscription=growth`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 08 - billing", ["POST checkout, POST checkout confirm.", "Activates subscription for demo account."]);
    await pause(page, 600);
    await page.getByRole("button", { name: /confirm_and_pay/i }).click();
    await expect(page.getByRole("link", { name: /subscription_active/i })).toBeVisible({ timeout: 12000 });
    await pause(page, 1300);
  });

  await record(browser, "09-signout", true, async (page) => {
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
    await addOverlay(page, "Tutorial 09 - logout backend op", ["POST /api/v1/auth/logout/", "Session cookie cleared."]);
    await readJson(await page.request.post(`${baseUrl}/api/v1/auth/logout/`), "logout");
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
    await pause(page, 1200);
  });

  await browser.close();
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        created_at: new Date().toISOString(),
        base_url: baseUrl,
        tutorial_user: username,
        videos: coverage.filter((item) => item.artifact).map((item) => item.artifact),
        operations: coverage.filter((item) => item.status),
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ manifestPath, videos: coverage.filter((item) => item.artifact).length, operations: coverage.filter((item) => item.status).length }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
