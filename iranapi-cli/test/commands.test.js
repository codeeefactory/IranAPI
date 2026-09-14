import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { DEFAULT_API_URL } from "../dist/config.js";

let server;
let apiUrl;
let temporaryDirectory;
let configFile;
let requests = [];

function json(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

before(async () => {
  temporaryDirectory = await mkdtemp(join(tmpdir(), "iranapi-cli-test-"));
  configFile = join(temporaryDirectory, "config.json");
  server = createServer((request, response) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const bytes = Buffer.concat(chunks);
      const url = new URL(request.url || "/", "http://127.0.0.1");
      const contentType = String(request.headers["content-type"] || "");
      let body;
      if (bytes.length && contentType.includes("application/json")) body = JSON.parse(bytes.toString("utf8"));
      requests.push({ method: request.method, url, headers: request.headers, body, bytes, contentType });

      if (url.pathname === "/api/v1/system/health/") return json(response, 200, { status: "ok", database: "up" });
      if (url.pathname === "/api/v1/account/user/") return json(response, 200, { id: "user-1", username: "cli-user" });
      if (url.pathname === "/api/v1/catalog/apis/") {
        return json(response, 200, {
          count: 1,
          page: 1,
          page_size: Number(url.searchParams.get("page_size") || 20),
          results: [{ slug: "weather", name: "Weather", status: "published", rating: "4.9", pricing_from: "0" }],
        });
      }
      if (url.pathname.startsWith("/api/v1/catalog/apis/")) return json(response, 200, { slug: decodeURIComponent(url.pathname.split("/").at(-2)) });
      if (url.pathname === "/api/v1/catalog/documentations/") {
        return json(response, 200, {
          count: 1,
          page: 1,
          page_size: Number(url.searchParams.get("page_size") || 20),
          results: [{ api_slug: "weather", slug: "auth", title: "Authentication" }],
        });
      }
      if (url.pathname === "/api/v1/public/caller/") return json(response, 200, { accepted: body });
      if (url.pathname === "/api/v1/raw/echo/") return json(response, 200, { method: request.method, body });
      if (url.pathname === "/api/v1/account/projects/analyze/") return json(response, 200, { analysis: { runtime: "python" } });
      if (url.pathname === "/api/v1/account/projects/deployments/" && request.method === "POST") {
        return json(response, 200, { deployment: { slug: "demo", status: "queued" } });
      }
      if (url.pathname === "/api/v1/account/projects/deployments/demo/") {
        return json(response, 200, { deployment: { slug: "demo", status: "deployed", deployment_url: "https://demo.example" } });
      }
      if (url.pathname === "/api/v1/schema/openapi.json") return json(response, 200, { openapi: "3.0.3", info: { title: "IranAPI" } });
      if (url.pathname === "/api/v1/error/") return json(response, 422, { error: { code: "invalid_demo", message: "Demo rejected." } });
      return json(response, 404, { error: { code: "not_found", message: "Not found." } });
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  apiUrl = `http://127.0.0.1:${address.port}/api/v1`;
});

beforeEach(() => {
  requests = [];
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(temporaryDirectory, { recursive: true, force: true });
});

function runCli(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["dist/cli.js", ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        NO_COLOR: "1",
        IRANAPI_CONFIG: configFile,
        ...options.env,
      },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`CLI timed out: ${args.join(" ")}`));
    }, 10_000);
    child.once("error", reject);
    child.once("close", (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr });
    });
  });
}

async function runJson(args, options) {
  const result = await runCli(args, options);
  assert.equal(result.status, 0, result.stderr);
  return { result, payload: JSON.parse(result.stdout) };
}

describe("production defaults and command help", () => {
  it("targets production by default and reports production version", () => {
    assert.equal(DEFAULT_API_URL, "https://iranapi-2mc-iranapi.runflare.cloud/api/v1");
    const version = spawnSync(process.execPath, ["dist/cli.js", "--version"], { encoding: "utf8" });
    assert.equal(version.status, 0, version.stderr);
    assert.equal(version.stdout.trim(), "1.0.0");
  });

  it("renders help for every command and command group", () => {
    const commands = [
      [], ["doctor"], ["login"], ["logout"], ["whoami"], ["apis"], ["apis", "list"], ["apis", "get"],
      ["docs"], ["docs", "search"], ["call"], ["request"], ["analyze"], ["deploy"], ["schema"],
    ];
    for (const command of commands) {
      const result = spawnSync(process.execPath, ["dist/cli.js", ...command, "--help"], { encoding: "utf8" });
      assert.equal(result.status, 0, `${command.join(" ")}: ${result.stderr}`);
      assert.match(result.stdout, /Usage:/);
    }
  });
});

describe("complete CLI command and parameter matrix", () => {
  it("doctor supports global API, token, and JSON flags", async () => {
    const { payload } = await runJson(["--api-url", apiUrl, "--token", "iapi_secret1234", "doctor", "--json"]);
    assert.equal(payload.ok, true);
    assert.equal(payload.cli_version, "1.0.0");
    assert.equal(payload.auth.token, "iapi...1234");
    assert.equal(payload.auth.valid, true);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].headers.authorization, "Bearer iapi_secret1234");
  });

  it("login token verification, no-verify, whoami, and logout manage config", async () => {
    await rm(configFile, { force: true });
    const verified = await runJson(["--api-url", apiUrl, "login", "--token", "verified-token", "--json"]);
    assert.equal(verified.payload.user.username, "cli-user");
    let stored = JSON.parse(await readFile(configFile, "utf8"));
    assert.equal(stored.token, "verified-token");

    const unverified = await runJson(["login", "--token", "unverified-token", "--no-verify", "--json"]);
    assert.equal(unverified.payload.user, undefined);
    stored = JSON.parse(await readFile(configFile, "utf8"));
    assert.equal(stored.token, "unverified-token");

    const whoami = await runJson(["whoami", "--json"]);
    assert.equal(whoami.payload.username, "cli-user");
    const logout = await runJson(["logout", "--json"]);
    assert.equal(logout.payload.removed, true);
    stored = JSON.parse(await readFile(configFile, "utf8"));
    assert.equal(stored.token, undefined);
  });

  it("validates browser URL, no-browser, and timeout parameters before login", async () => {
    await rm(configFile, { force: true });
    const result = await runCli([
      "--api-url", apiUrl, "login", "--browser-url", "https://iranapi.example/signin", "--no-browser", "--timeout", "29", "--json",
    ], { env: { IRANAPI_TOKEN: "" } });
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stdout).error.message, "Browser login timeout must be an integer from 30 to 900 seconds.");
  });

  it("apis list sends search, category, tag, and limit; apis get encodes slug", async () => {
    const listed = await runJson([
      "--api-url", apiUrl, "apis", "list", "--search", "weather rain", "--category", "maps", "--tag", "live", "--limit", "7", "--json",
    ]);
    assert.equal(listed.payload.page_size, 7);
    assert.equal(requests[0].url.searchParams.get("search"), "weather rain");
    assert.equal(requests[0].url.searchParams.get("category"), "maps");
    assert.equal(requests[0].url.searchParams.get("tag"), "live");
    assert.equal(requests[0].url.searchParams.get("page_size"), "7");

    requests = [];
    const detail = await runJson(["--api-url", apiUrl, "apis", "get", "weather map", "--json"]);
    assert.equal(detail.payload.slug, "weather map");
  });

  it("docs search sends query, API, and limit parameters", async () => {
    const { payload } = await runJson([
      "--api-url", apiUrl, "docs", "search", "authentication flow", "--api", "weather", "--limit", "9", "--json",
    ]);
    assert.equal(payload.page_size, 9);
    assert.equal(requests[0].url.searchParams.get("search"), "authentication flow");
    assert.equal(requests[0].url.searchParams.get("api"), "weather");
  });

  it("call supports method, URL, repeated headers, and inline body", async () => {
    const { payload } = await runJson([
      "--api-url", apiUrl, "call", "post", "https://example.com/events?source=cli",
      "--header", "Accept: application/json", "--header", "X-Time: 12:30", "--body", "{\"event\":\"created\"}", "--json",
    ]);
    assert.deepEqual(payload.accepted, {
      method: "POST",
      url: "https://example.com/events?source=cli",
      headers: { Accept: "application/json", "X-Time": "12:30" },
      body: { event: "created" },
    });
  });

  it("request supports arbitrary method, path, header, and body-file", async () => {
    const bodyFile = join(temporaryDirectory, "body.json");
    await writeFile(bodyFile, "{\"enabled\":true}", "utf8");
    const { payload } = await runJson([
      "--api-url", apiUrl, "request", "patch", "raw/echo/?existing=1", "--header", "X-Test: yes", "--body-file", bodyFile, "--json",
    ]);
    assert.deepEqual(payload, { method: "PATCH", body: { enabled: true } });
    assert.equal(requests[0].headers["x-test"], "yes");
    assert.equal(requests[0].url.searchParams.get("existing"), "1");
  });

  it("analyze sends supported archive with authentication", async () => {
    const archive = join(temporaryDirectory, "service.zip");
    await writeFile(archive, Buffer.from("PK test archive"));
    const { payload } = await runJson(["--api-url", apiUrl, "--token", "archive-token", "analyze", archive, "--json"]);
    assert.equal(payload.analysis.runtime, "python");
    assert.equal(requests[0].headers.authorization, "Bearer archive-token");
    assert.match(requests[0].contentType, /^multipart\/form-data; boundary=/);
    assert.match(requests[0].bytes.toString("latin1"), /filename="service.zip"/);
  });

  it("deploy supports name, region, no-wait, wait, and timeout", async () => {
    const archive = join(temporaryDirectory, "service.tar.gz");
    await writeFile(archive, Buffer.from("test archive"));
    const queued = await runJson([
      "--api-url", apiUrl, "--token", "deploy-token", "deploy", archive,
      "--name", "CLI Service", "--region", "ir-test-1", "--no-wait", "--timeout", "30", "--json",
    ]);
    assert.equal(queued.payload.deployment.status, "queued");
    const multipart = requests[0].bytes.toString("latin1");
    assert.match(multipart, /name="project_name"\r\n\r\nCLI Service/);
    assert.match(multipart, /name="region"\r\n\r\nir-test-1/);

    requests = [];
    const deployed = await runJson([
      "--api-url", apiUrl, "--token", "deploy-token", "deploy", archive, "--timeout", "10", "--json",
    ]);
    assert.equal(deployed.payload.deployment.status, "deployed");
    assert.equal(deployed.payload.deployment.deployment_url, "https://demo.example");
    assert.equal(requests.at(-1).url.pathname, "/api/v1/account/projects/deployments/demo/");
  });

  it("schema prints JSON and supports output path", async () => {
    const direct = await runJson(["--api-url", apiUrl, "schema", "--json"]);
    assert.equal(direct.payload.openapi, "3.0.3");
    const output = join(temporaryDirectory, "openapi.json");
    const saved = await runJson(["--api-url", apiUrl, "schema", "--out", output, "--json"]);
    assert.equal(saved.payload.path, output);
    assert.equal(JSON.parse(await readFile(output, "utf8")).info.title, "IranAPI");
  });

  it("returns stable JSON errors for backend and local validation failures", async () => {
    const backend = await runCli(["--api-url", apiUrl, "request", "GET", "error/", "--json"]);
    assert.equal(backend.status, 1);
    assert.deepEqual(JSON.parse(backend.stdout).error, { code: "invalid_demo", message: "Demo rejected.", status: 422 });

    const local = await runCli(["--api-url", apiUrl, "apis", "list", "--limit", "101", "--json"]);
    assert.equal(local.status, 1);
    assert.equal(JSON.parse(local.stdout).error.code, "cli_error");
  });
});
