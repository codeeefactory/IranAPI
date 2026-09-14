import { chmod, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const DEFAULT_API_URL = "https://iranapi-2mc-iranapi.runflare.cloud/api/v1";

export interface StoredConfig {
  api_url?: string;
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
      token: typeof value.token === "string" ? value.token : undefined,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw new Error(`Cannot read IranAPI config at ${path}: ${(error as Error).message}`);
  }
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
  return {
    apiUrl: normalizeApiUrl(options.apiUrl || env.IRANAPI_API_URL || config.api_url || DEFAULT_API_URL),
    token,
    tokenSource,
  };
}

export function redactToken(token: string | undefined): string | undefined {
  if (!token) return undefined;
  if (token.length <= 8) return "********";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
