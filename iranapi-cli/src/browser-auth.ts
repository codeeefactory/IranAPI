import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createServer, type Server } from "node:http";

export type BrowserAuthorization = {
  authorizationUrl: string;
  codeVerifier: string;
  waitForCode: () => Promise<string>;
  close: () => void;
};

function base64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

export function browserBaseUrl(apiUrl: string, override?: string): string {
  if (override) return new URL(override).origin;
  return new URL(apiUrl).origin;
}

export function launchBrowser(url: string): void {
  const command = process.platform === "win32" ? "rundll32.exe" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["url.dll,FileProtocolHandler", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
  child.on("error", () => undefined);
  child.unref();
}

export async function createBrowserAuthorization(
  apiUrl: string,
  browserUrl: string | undefined,
  timeoutSeconds: number,
): Promise<BrowserAuthorization> {
  const state = base64Url(randomBytes(24));
  const codeVerifier = base64Url(randomBytes(48));
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  let server: Server;
  let timer: NodeJS.Timeout | undefined;
  let settleCode: ((code: string) => void) | undefined;
  let settleError: ((error: Error) => void) | undefined;
  const codePromise = new Promise<string>((resolve, reject) => {
    settleCode = resolve;
    settleError = reject;
  });

  server = createServer((request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    if (url.pathname !== "/callback") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found.");
      return;
    }
    const returnedState = url.searchParams.get("state") || "";
    const code = url.searchParams.get("code") || "";
    if (returnedState !== state || !code) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("IranAPI CLI login failed: invalid callback.");
      settleError?.(new Error("Browser returned an invalid CLI authorization callback."));
    } else {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.end("<!doctype html><title>IranAPI CLI</title><h1>Login complete</h1><p>You can close this window and return to your terminal.</p>");
      settleCode?.(code);
    }
    if (timer) clearTimeout(timer);
    server.close();
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Could not create local browser-login callback.");
  }
  const callbackUrl = `http://127.0.0.1:${address.port}/callback`;
  const authorizationUrl = new URL("/signin", browserBaseUrl(apiUrl, browserUrl));
  authorizationUrl.searchParams.set("cli_callback", callbackUrl);
  authorizationUrl.searchParams.set("cli_state", state);
  authorizationUrl.searchParams.set("cli_challenge", codeChallenge);
  timer = setTimeout(() => {
    server.close();
    settleError?.(new Error(`Browser login did not finish within ${timeoutSeconds} seconds.`));
  }, timeoutSeconds * 1000);
  timer.unref();

  return {
    authorizationUrl: authorizationUrl.toString(),
    codeVerifier,
    waitForCode: () => codePromise,
    close: () => {
      if (timer) clearTimeout(timer);
      server.close();
    },
  };
}
