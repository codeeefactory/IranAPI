import { chmod, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const API_URL_HINT =
  "No IranAPI base URL configured. Pass --api-url <url>, set IRANAPI_API_URL, or run `iranapi login --api-url <url>` to store one.";

export interface StoredConfig {
  api_url?: string;
  site_url?: string;
  token?: string;
}

export interface GlobalOptions {
  apiUrl?: string;
  token?: string;
  json?: boolean;
}

export interface ResolvedSettings {
  apiUrl: string;
  token?: string;
  tokenSource?: "flag" | "environment" | "config";
}

export interface RuntimeManifest {
  schema_version: number;
  origin: string;
  api_url: string;
  cli?: {
    version?: string;
    download_url?: string;
  };
}

export function configPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.IRANAPI_CONFIG || join(homedir(), ".iranapi", "config.json");
}

export function normalizeApiUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("API URL must use http or https.");
  }
  return url.toString().replace(/\/$/, "");
}

export async function loadConfig(path = configPath()): Promise<StoredConfig> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Config root must be a JSON object.");
    }
    const value = parsed as Record<string, unknown>;
    return {
      api_url: typeof value.api_url === "string" ? value.api_url : undefined,
      site_url: typeof value.site_url === "string" ? value.site_url : undefined,
      token: typeof value.token === "string" ? value.token : undefined,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw new Error(`Cannot read IranAPI config at ${path}: ${(error as Error).message}`);
  }
}

export function runtimeManifestUrl(siteUrl: string): URL {
  const site = new URL(siteUrl);
  if (site.protocol !== "http:" && site.protocol !== "https:") {
    throw new Error("Site URL must use http or https.");
  }
  return new URL("/cli/manifest.json", site.origin);
}

export async function discoverRuntime(siteUrl: string): Promise<RuntimeManifest> {
  const manifestUrl = runtimeManifestUrl(siteUrl);
  let response: Response;
  try {
    response = await fetch(manifestUrl, {
      headers: { Accept: "application/json", "User-Agent": "iranapi-cli/1.1.0" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new Error(`Cannot reach IranAPI site ${manifestUrl.origin}: ${(error as Error).message}`);
  }
  if (!response.ok) {
    throw new Error(`IranAPI runtime manifest returned HTTP ${response.status}.`);
  }
  const value: unknown = await response.json();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("IranAPI runtime manifest is not a JSON object.");
  }
  const manifest = value as Record<string, unknown>;
  if (manifest.schema_version !== 1 || typeof manifest.origin !== "string" || typeof manifest.api_url !== "string") {
    throw new Error("IranAPI runtime manifest is missing required fields.");
  }
  const origin = new URL(manifest.origin);
  const apiUrl = new URL(manifest.api_url);
  if (origin.origin !== manifestUrl.origin || apiUrl.origin !== manifestUrl.origin) {
    throw new Error("IranAPI runtime manifest points to a different origin.");
  }
  return {
    schema_version: 1,
    origin: origin.origin,
    api_url: normalizeApiUrl(apiUrl.toString()),
    cli: typeof manifest.cli === "object" && manifest.cli !== null
      ? manifest.cli as RuntimeManifest["cli"]
      : undefined,
  };
}

export async function saveConfig(config: StoredConfig, path = configPath()): Promise<void> {
  const directory = dirname(path);
  const temporary = `${path}.${process.pid}.tmp`;
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(temporary, `${JSON.stringify(config, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporary, path);
  await chmod(path, 0o600).catch(() => undefined);
}

export async function removeToken(path = configPath()): Promise<boolean> {
  const config = await loadConfig(path);
  if (!config.token) return false;
  delete config.token;
  await saveConfig(config, path);
  return true;
}

export async function removeConfig(path = configPath()): Promise<void> {
  await unlink(path).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export function resolveSettings(
  options: GlobalOptions,
  config: StoredConfig,
  env: NodeJS.ProcessEnv = process.env,
): ResolvedSettings {
  const token = options.token || env.IRANAPI_TOKEN || config.token;
  const tokenSource = options.token
    ? "flag"
    : env.IRANAPI_TOKEN
      ? "environment"
      : config.token
        ? "config"
        : undefined;
  const rawUrl = options.apiUrl || env.IRANAPI_API_URL || config.api_url;
  if (!rawUrl) throw new Error(API_URL_HINT);
  return {
    apiUrl: normalizeApiUrl(rawUrl),
    token,
    tokenSource,
  };
}

export function redactToken(token: string | undefined): string | undefined {
  if (!token) return undefined;
  if (token.length <= 8) return "********";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
