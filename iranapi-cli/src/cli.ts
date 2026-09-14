#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { Command, Help, Option } from "commander";
import { ApiError, normalizeLimit, parseHeaders, requestJson, requestMultipart } from "./api.js";
import {
  configPath,
  loadConfig,
  redactToken,
  removeToken,
  resolveSettings,
  saveConfig,
  type GlobalOptions,
} from "./config.js";
import { readJsonInput } from "./input.js";
import { printJson, printRows, printValue, type Page } from "./output.js";
import { paint, styleHelp } from "./theme.js";
import { createBrowserAuthorization, launchBrowser } from "./browser-auth.js";

const program = new Command();

program.configureHelp({ formatHelp: (command, helper) => styleHelp(new Help().formatHelp(command, helper)) });

function globals(command: Command): GlobalOptions {
  return command.optsWithGlobals() as GlobalOptions;
}

async function context(command: Command) {
  const options = globals(command);
  const stored = await loadConfig();
  return { options, stored, settings: resolveSettings(options, stored) };
}

function requireToken(token: string | undefined): asserts token is string {
  if (!token) throw new ApiError("Authentication required. Run `iranapi login`.", "auth_required", 401);
}

function optionCollector(value: string, previous: string[]): string[] {
  return previous.concat(value);
}

type DeploymentStatus = {
  slug: string;
  status: "queued" | "building" | "deployed" | "failed";
  deployment_url?: string;
  failure_reason?: string;
};

async function waitForDeployment(settings: Awaited<ReturnType<typeof context>>["settings"], slug: string, timeoutSeconds: number) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    const response = await requestJson<{ deployment: DeploymentStatus }>(
      settings,
      "GET",
      `account/projects/deployments/${encodeURIComponent(slug)}/`,
    );
    if (response.deployment.status === "deployed") return response;
    if (response.deployment.status === "failed") {
      throw new ApiError(
        response.deployment.failure_reason || "Project deployment build failed.",
        "deployment_failed",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new ApiError(`Deployment did not finish within ${timeoutSeconds} seconds.`, "deployment_timeout");
}

program
  .name("iranapi")
  .description("IranAPI catalog and public caller CLI")
  .version("1.0.0")
  .option("--api-url <url>", "IranAPI base URL (or IRANAPI_API_URL)")
  .option("--token <token>", "one-off API token (or IRANAPI_TOKEN)")
  .option("--json", "emit machine-readable JSON");

program
  .command("doctor")
  .description("check CLI config, API, database, and optional authentication")
  .action(async (_options, command: Command) => {
    const { options, settings } = await context(command);
    const result: Record<string, unknown> = {
      ok: false,
      cli_version: program.version(),
      api_url: settings.apiUrl,
      config_path: configPath(),
      auth: {
        configured: Boolean(settings.token),
        source: settings.tokenSource ?? null,
        token: redactToken(settings.token) ?? null,
      },
    };
    try {
      const health = await requestJson<Record<string, unknown>>(settings, "GET", "system/health/");
      result.api = { reachable: true, ...health };
      result.ok = health.status === "ok";
    } catch (error) {
      result.api = {
        reachable: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
    if (settings.token) {
      try {
        const user = await requestJson<Record<string, unknown>>(settings, "GET", "account/user/");
        result.auth = { ...(result.auth as object), valid: true, user: user.username ?? user.email ?? user.id };
      } catch (error) {
        result.auth = { ...(result.auth as object), valid: false, error: (error as Error).message };
        result.ok = false;
      }
    }
    printValue(result, Boolean(options.json));
    if (!result.ok) process.exitCode = 1;
  });

program
  .command("login")
  .description("sign in with a browser or validate and store an IranAPI token")
  .option("-t, --token <token>", "token to store")
  .option("--browser-url <url>", "IranAPI website URL when different from API origin")
  .option("--no-browser", "print login URL without opening a browser")
  .option("--timeout <seconds>", "browser login timeout", "300")
  .option("--no-verify", "store token without calling account endpoint")
  .action(async (local: { token?: string; browserUrl?: string; browser: boolean; timeout: string; verify: boolean }, command: Command) => {
    const options = globals(command);
    const stored = await loadConfig();
    let token = local.token || options.token || process.env.IRANAPI_TOKEN;
    let browserUser: unknown;
    if (!token) {
      const settings = resolveSettings(options, stored);
      const timeoutSeconds = Number(local.timeout);
      if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 30 || timeoutSeconds > 900) {
        throw new Error("Browser login timeout must be an integer from 30 to 900 seconds.");
      }
      const authorization = await createBrowserAuthorization(settings.apiUrl, local.browserUrl, timeoutSeconds);
      process.stderr.write(`${local.browser ? "Opening browser" : "Open this URL"}: ${authorization.authorizationUrl}\n`);
      if (local.browser) launchBrowser(authorization.authorizationUrl);
      try {
        const code = await authorization.waitForCode();
        const exchange = await requestJson<{ token: string; user?: unknown }>(settings, "POST", "auth/cli/token/", {
          body: { code, code_verifier: authorization.codeVerifier },
        });
        token = exchange.token;
        browserUser = exchange.user;
      } finally {
        authorization.close();
      }
    }
    requireToken(token);
    const settings = resolveSettings({ ...options, token }, stored);
    let user: unknown = browserUser;
    if (local.verify) user = await requestJson(settings, "GET", "account/user/");
    await saveConfig({ ...stored, api_url: settings.apiUrl, token });
    printValue(
      { ok: true, message: "Token stored.", config_path: configPath(), api_url: settings.apiUrl, user },
      Boolean(options.json),
    );
  });

program
  .command("logout")
  .description("remove stored token")
  .action(async (_local, command: Command) => {
    const options = globals(command);
    const removed = await removeToken();
    printValue({ ok: true, removed, config_path: configPath() }, Boolean(options.json));
  });

program
  .command("whoami")
  .description("show authenticated user")
  .action(async (_local, command: Command) => {
    const { options, settings } = await context(command);
    requireToken(settings.token);
    printValue(await requestJson(settings, "GET", "account/user/"), Boolean(options.json));
  });

const apis = program.command("apis").description("browse API catalog");

apis
  .command("list")
  .description("list catalog APIs")
  .option("-s, --search <text>", "search names and descriptions")
  .option("-c, --category <slug>", "filter category slug")
  .option("--tag <tag>", "filter tag")
  .option("--limit <number>", "maximum results", "20")
  .action(async (local: { search?: string; category?: string; tag?: string; limit: string }, command: Command) => {
    const { options, settings } = await context(command);
    const limit = normalizeLimit(local.limit);
    const page = await requestJson<Page>(settings, "GET", "catalog/apis/", {
      query: { search: local.search, category: local.category, tag: local.tag, page_size: limit },
    });
    printRows(page.results, ["slug", "name", "status", "rating", "pricing_from"], Boolean(options.json), page);
  });

apis
  .command("get <slug>")
  .description("show one catalog API")
  .action(async (slug: string, _local, command: Command) => {
    const { options, settings } = await context(command);
    printValue(
      await requestJson(settings, "GET", `catalog/apis/${encodeURIComponent(slug)}/`),
      Boolean(options.json),
    );
  });

const docs = program.command("docs").description("search API documentation");

docs
  .command("search [query]")
  .description("search documentation text")
  .option("--api <slug>", "filter API slug")
  .option("--limit <number>", "maximum results", "20")
  .action(async (query: string | undefined, local: { api?: string; limit: string }, command: Command) => {
    const { options, settings } = await context(command);
    const page = await requestJson<Page>(settings, "GET", "catalog/documentations/", {
      query: { search: query, api: local.api, page_size: normalizeLimit(local.limit) },
    });
    printRows(page.results, ["api_slug", "slug", "title"], Boolean(options.json), page);
  });

program
  .command("call <method> <url>")
  .description("call any public HTTP(S) API through IranAPI caller")
  .addOption(new Option("-H, --header <header>", "request header: Name: value").argParser(optionCollector).default([]))
  .option("--body <json>", "JSON request body")
  .option("--body-file <path>", "read JSON request body from file")
  .action(
    async (
      method: string,
      url: string,
      local: { header: string[]; body?: string; bodyFile?: string },
      command: Command,
    ) => {
      const { options, settings } = await context(command);
      const body = await readJsonInput(local.body, local.bodyFile);
      const payload = await requestJson(settings, "POST", "public/caller/", {
        body: { method: method.toUpperCase(), url, headers: parseHeaders(local.header), body },
      });
      printValue(payload, Boolean(options.json));
    },
  );

program
  .command("request <method> <path>")
  .description("send raw request to an IranAPI endpoint")
  .addOption(new Option("-H, --header <header>", "request header: Name: value").argParser(optionCollector).default([]))
  .option("--body <json>", "JSON request body")
  .option("--body-file <path>", "read JSON request body from file")
  .action(
    async (
      method: string,
      path: string,
      local: { header: string[]; body?: string; bodyFile?: string },
      command: Command,
    ) => {
      const { options, settings } = await context(command);
      const body = await readJsonInput(local.body, local.bodyFile);
      const payload = await requestJson(settings, method, path, {
        body,
        headers: parseHeaders(local.header),
      });
      printValue(payload, Boolean(options.json));
    },
  );

program
  .command("analyze <archive>")
  .description("analyze a compressed API project without executing its code")
  .action(async (archive: string, _local, command: Command) => {
    const { options, settings } = await context(command);
    requireToken(settings.token);
    const bytes = await readFile(archive);
    const result = await requestMultipart(settings, "account/projects/analyze/", {
      name: basename(archive),
      bytes,
    });
    printValue(result, Boolean(options.json));
  });

program
  .command("deploy <archive>")
  .description("upload, analyze, and queue an API project deployment")
  .option("-n, --name <name>", "deployment project name")
  .option("-r, --region <region>", "deployment region", "ir-tehran-1")
  .option("--no-wait", "return after queueing instead of waiting for a live deployment")
  .option("--timeout <seconds>", "maximum build wait", "900")
  .action(async (archive: string, local: { name?: string; region: string; wait: boolean; timeout: string }, command: Command) => {
    const { options, settings } = await context(command);
    requireToken(settings.token);
    const bytes = await readFile(archive);
    const result = await requestMultipart<{ deployment: DeploymentStatus }>(
      settings,
      "account/projects/deployments/",
      { name: basename(archive), bytes },
      { project_name: local.name || basename(archive).replace(/\.(?:tar\.gz|tgz|tar|zip)$/i, ""), region: local.region },
    );
    if (!local.wait) {
      printValue(result, Boolean(options.json));
      return;
    }
    const timeoutSeconds = Number(local.timeout);
    if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 10 || timeoutSeconds > 3600) {
      throw new Error("Deployment timeout must be an integer from 10 to 3600 seconds.");
    }
    printValue(await waitForDeployment(settings, result.deployment.slug, timeoutSeconds), Boolean(options.json));
  });

program
  .command("schema")
  .description("download IranAPI OpenAPI schema")
  .option("-o, --out <path>", "write schema to file")
  .action(async (local: { out?: string }, command: Command) => {
    const { options, settings } = await context(command);
    const schema = await requestJson<Record<string, unknown>>(settings, "GET", "schema/openapi.json");
    if (local.out) {
      await writeFile(local.out, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
      printValue({ ok: true, path: local.out, title: (schema.info as Record<string, unknown> | undefined)?.title }, Boolean(options.json));
      return;
    }
    printValue(schema, Boolean(options.json));
  });

function jsonWasRequested(): boolean {
  return process.argv.includes("--json");
}

program.parseAsync(process.argv).catch((error: unknown) => {
  const apiError = error instanceof ApiError ? error : new ApiError((error as Error).message, "cli_error");
  const payload = {
    ok: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.status ? { status: apiError.status } : {}),
      ...(apiError.details !== undefined ? { details: apiError.details } : {}),
    },
  };
  if (jsonWasRequested()) printJson(payload);
  else process.stderr.write(`${paint("Error:", "magenta")} ${apiError.message}\n`);
  process.exitCode = 1;
});
