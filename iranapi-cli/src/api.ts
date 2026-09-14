import type { ResolvedSettings } from "./config.js";

export type QueryValue = string | number | boolean | undefined;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = "request_failed",
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function normalizeLimit(value: string | number): number {
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Limit must be an integer from 1 to 100.");
  }
  return limit;
}

export function buildUrl(
  apiUrl: string,
  path: string,
  query: Record<string, QueryValue> = {},
): URL {
  const normalizedBase = `${apiUrl.replace(/\/$/, "")}/`;
  const url = /^https?:\/\//i.test(path)
    ? new URL(path)
    : new URL(path.replace(/^\/+/, ""), normalizedBase);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

export function parseHeaders(entries: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const entry of entries) {
    const separator = entry.indexOf(":");
    if (separator <= 0) throw new Error(`Invalid header "${entry}". Expected "Name: value".`);
    const name = entry.slice(0, separator).trim();
    const value = entry.slice(separator + 1).trim();
    if (!name || /[\r\n]/.test(name + value)) throw new Error(`Invalid header "${entry}".`);
    headers[name] = value;
  }
  return headers;
}

function errorPayload(payload: unknown): { code?: string; message?: string; details?: unknown } {
  if (!payload || typeof payload !== "object") return {};
  const root = payload as Record<string, unknown>;
  const nested = root.error && typeof root.error === "object" ? (root.error as Record<string, unknown>) : undefined;
  const detail = root.detail;
  const message =
    typeof nested?.message === "string"
      ? nested.message
      : typeof root.message === "string"
        ? root.message
        : typeof detail === "string"
          ? detail
          : undefined;
  return {
    code: typeof nested?.code === "string" ? nested.code : undefined,
    message,
    details: nested
      ? nested.details
      : typeof detail === "object"
        ? detail
        : message
          ? undefined
          : payload,
  };
}

export function archiveContentType(filename: string): string {
  const lowered = filename.toLowerCase();
  if (lowered.endsWith(".zip")) return "application/zip";
  if (lowered.endsWith(".tar.gz") || lowered.endsWith(".tgz")) return "application/gzip";
  if (lowered.endsWith(".tar")) return "application/x-tar";
  throw new Error("Archive must use .zip, .tar, .tar.gz, or .tgz.");
}

export async function requestMultipart<T = unknown>(
  settings: ResolvedSettings,
  path: string,
  file: { name: string; bytes: Uint8Array },
  fields: Record<string, string> = {},
  timeoutMs = 120_000,
): Promise<T> {
  const url = buildUrl(settings.apiUrl, path);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (settings.token) headers.Authorization = `Bearer ${settings.token}`;
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  const archiveBytes = new ArrayBuffer(file.bytes.byteLength);
  new Uint8Array(archiveBytes).set(file.bytes);
  form.append("archive", new Blob([archiveBytes], { type: archiveContentType(file.name) }), file.name);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: form,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ApiError(`Cannot reach ${url.origin}: ${message}`, "network_error");
  }
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) {
    const parsed = errorPayload(payload);
    throw new ApiError(
      parsed.message || `IranAPI returned HTTP ${response.status}.`,
      parsed.code || `http_${response.status}`,
      response.status,
      parsed.details,
    );
  }
  return payload as T;
}

export async function requestJson<T = unknown>(
  settings: ResolvedSettings,
  method: string,
  path: string,
  options: {
    query?: Record<string, QueryValue>;
    body?: unknown;
    headers?: Record<string, string>;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const url = buildUrl(settings.apiUrl, path, options.query);
  const normalizedMethod = method.toUpperCase();
  if (options.body !== undefined && (normalizedMethod === "GET" || normalizedMethod === "HEAD")) {
    throw new ApiError(`${normalizedMethod} requests cannot include a body.`, "invalid_request");
  }
  const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
  if (settings.token) headers.Authorization = `Bearer ${settings.token}`;
  if (options.body !== undefined && !Object.keys(headers).some((key) => key.toLowerCase() === "content-type")) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: normalizedMethod,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ApiError(`Cannot reach ${url.origin}: ${message}`, "network_error");
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) {
    const parsed = errorPayload(payload);
    throw new ApiError(
      parsed.message || `IranAPI returned HTTP ${response.status}.`,
      parsed.code || `http_${response.status}`,
      response.status,
      parsed.details,
    );
  }
  return payload as T;
}
