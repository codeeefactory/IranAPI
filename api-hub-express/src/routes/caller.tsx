import { useState } from "react";
import {
  Braces,
  Check,
  Clock3,
  Copy,
  FileJson2,
  Globe2,
  History,
  Info,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/site/Layout";
import { useSession } from "@/hooks/useAuth";
import { useCallerExecute, useUsageHistory } from "@/hooks/useUsage";
import { useI18n } from "@/lib/i18n";

const EXAMPLES = [
  { label: "GET JSON", method: "GET", url: "https://httpbin.org/get", body: "" },
  {
    label: "POST JSON",
    method: "POST",
    url: "https://httpbin.org/anything",
    body: '{\n  "message": "hello from IranAPI"\n}',
  },
  { label: "404 response", method: "GET", url: "https://httpbin.org/status/404", body: "" },
] as const;

type RequestTab = "headers" | "body";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export default function CallerPage() {
  const { t } = useI18n();
  const { isAuthenticated } = useSession();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [activeRequestTab, setActiveRequestTab] = useState<RequestTab>("headers");
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const caller = useCallerExecute();
  const usage = useUsageHistory({ source: "caller", page_size: 5 }, isAuthenticated);

  function loadExample(example: (typeof EXAMPLES)[number]) {
    setMethod(example.method);
    setUrl(example.url);
    setHeaders("{}");
    setBody(example.body);
    setActiveRequestTab(example.body ? "body" : "headers");
    setResponseBody(null);
    setError(null);
    setCopied(false);
    caller.reset();
  }

  async function copyResponse() {
    if (responseBody === null) return;
    try {
      await navigator.clipboard.writeText(responseBody);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function send() {
    if (!url.trim()) {
      setError("Enter a public HTTP(S) API URL.");
      return;
    }

    setResponseBody(null);
    setError(null);
    setCopied(false);
    let parsedBody: unknown = undefined;
    let parsedHeaders: Record<string, unknown> = {};

    try {
      const value: unknown = JSON.parse(headers || "{}");
      if (!isRecord(value)) throw new Error();
      parsedHeaders = value;
    } catch {
      setActiveRequestTab("headers");
      setError("Request headers must be a valid JSON object.");
      return;
    }

    if (body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        setActiveRequestTab("body");
        setError("Request body must be valid JSON.");
        return;
      }
    }

    try {
      const result = await caller.mutateAsync({
        url: url.trim(),
        method,
        headers: parsedHeaders,
        body: parsedBody,
      });
      const formatted = typeof result.body === "string"
        ? result.body
        : JSON.stringify(result.body, null, 2);
      setResponseBody(formatted || "(empty response body)");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Caller request failed.");
    }
  }

  const statusCode = caller.data?.status_code;
  const statusTone = statusCode && statusCode >= 400 ? "error" : "success";

  return (
    <PageShell>
      <section className="caller-hero" aria-labelledby="caller-title">
        <div>
          <div className="caller-eyebrow"><Globe2 aria-hidden /> {t("caller.kicker")}</div>
          <h1 id="caller-title">{t("caller.title")}</h1>
          <p>{t("caller.sub")}</p>
        </div>
        <div className="caller-hero-badges" aria-label="Caller capabilities">
          <span><ShieldCheck aria-hidden /> private networks blocked</span>
          <span><Zap aria-hidden /> no sign-in required</span>
        </div>
      </section>

      <div className="caller-page-grid">
        <div className="caller-workbench">
          <header className="caller-workbench-header">
            <div className="caller-window-controls" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="caller-workbench-title">
              <span className="caller-live-dot" aria-hidden />
              New request
            </div>
            <span className="caller-proxy-label">via secure proxy</span>
          </header>

          <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="caller-composer">
            <div className="caller-request-bar" data-method={method} data-ltr>
              <label className="sr-only" htmlFor="method">method</label>
              <select id="method" value={method} onChange={(event) => setMethod(event.target.value)} className="caller-method-select">
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
              </select>
              <span className="caller-url-icon" aria-hidden><Globe2 /></span>
              <label className="sr-only" htmlFor="url">url</label>
              <input
                id="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                type="url"
                placeholder="https://api.example.com/v1/resource"
                spellCheck={false}
                autoComplete="off"
                className="caller-url-input"
              />
              <button type="submit" disabled={caller.isPending || !url.trim()} className="caller-send-button">
                {caller.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />}
                <span>{caller.isPending ? t("caller.running") : t("caller.execute")}</span>
              </button>
            </div>

            <div className="caller-examples" aria-label="Request examples">
              <span>Quick start</span>
              {EXAMPLES.map((example) => (
                <button key={example.label} type="button" onClick={() => loadExample(example)}>
                  <RotateCcw aria-hidden />
                  {example.label}
                </button>
              ))}
            </div>

            <div className="caller-panels">
              <section className="caller-request-panel" aria-label="Request configuration">
                <div className="caller-panel-tabs" role="tablist" aria-label="Request configuration">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeRequestTab === "headers"}
                    onClick={() => setActiveRequestTab("headers")}
                  >
                    <Braces aria-hidden /> Headers <span>{headers.trim() === "{}" ? "0" : "•"}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeRequestTab === "body"}
                    onClick={() => setActiveRequestTab("body")}
                  >
                    <FileJson2 aria-hidden /> Body <span>{body.trim() ? "•" : "0"}</span>
                  </button>
                </div>

                <div className="caller-editor-toolbar">
                  <span>{activeRequestTab === "headers" ? "headers.json" : "body.json"}</span>
                  <span>JSON</span>
                </div>
                {activeRequestTab === "headers" ? (
                  <textarea
                    id="headers"
                    aria-label="headers"
                    value={headers}
                    onChange={(event) => setHeaders(event.target.value)}
                    rows={13}
                    dir="ltr"
                    spellCheck={false}
                    className="caller-code-editor"
                  />
                ) : (
                  <textarea
                    id="body"
                    aria-label="body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    rows={13}
                    dir="ltr"
                    spellCheck={false}
                    placeholder={'{\n  "message": "Hello, API"\n}'}
                    className="caller-code-editor caller-code-editor-body"
                  />
                )}
              </section>

              <section className="caller-response-panel" aria-live="polite">
                <div className="caller-response-header">
                  <div>
                    <span className="caller-response-label">Response</span>
                    {responseBody !== null && statusCode ? (
                      <span className="caller-status-code" data-tone={statusTone}>[{statusCode}]</span>
                    ) : null}
                  </div>
                  <div className="caller-response-actions" data-ltr>
                    {responseBody !== null ? (
                      <>
                        <span><Clock3 aria-hidden /> {caller.data?.latency_ms ?? 0}ms</span>
                        <button type="button" onClick={() => void copyResponse()} aria-label="Copy response">
                          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="caller-response-body">
                  {caller.isPending ? (
                    <div className="caller-empty-state" data-tone="loading">
                      <Loader2 className="animate-spin" aria-hidden />
                      <strong>{t("caller.running")}</strong>
                      <span>Waiting for upstream response</span>
                    </div>
                  ) : error ? (
                    <div className="caller-empty-state" data-tone="error">
                      <Info aria-hidden />
                      <strong>{t("caller.error")}</strong>
                      <span role="alert">{error}</span>
                    </div>
                  ) : responseBody !== null ? (
                    <pre dir="ltr"><code>{responseBody}</code></pre>
                  ) : (
                    <div className="caller-empty-state">
                      <Play aria-hidden />
                      <strong>{t("caller.waiting")}</strong>
                      <span>Send a request to inspect response data here.</span>
                    </div>
                  )}
                </div>

                <footer className="caller-response-footer" data-ltr>
                  <span>{caller.data?.content_type || "application/json"}</span>
                  <span>{caller.data?.region || "public-direct"}</span>
                </footer>
              </section>
            </div>
          </form>
        </div>

        <aside className="caller-sidebar">
          <section className="caller-side-card">
            <header><ShieldCheck aria-hidden /><div><span>Safe by default</span><small>Request limits</small></div></header>
            <dl>
              <div><dt>Destination</dt><dd>Public HTTP(S)</dd></div>
              <div><dt>Request body</dt><dd>64 KB</dd></div>
              <div><dt>Response body</dt><dd>512 KB</dd></div>
              <div><dt>Private IPs</dt><dd data-tone="blocked">Blocked</dd></div>
            </dl>
          </section>

          <section className="caller-side-card caller-history-card">
            <header><History aria-hidden /><div><span>Recent requests</span><small>{isAuthenticated ? "Workspace history" : "Anonymous session"}</small></div></header>
            <div className="caller-history-list" data-ltr>
              {usage.isLoading ? (
                <div className="caller-history-empty"><Loader2 className="animate-spin" aria-hidden /> Loading history</div>
              ) : usage.data?.results.length ? (
                usage.data.results.map((item) => (
                  <div key={item.id} className="caller-history-item">
                    <span className="caller-history-method">{item.method || "GET"}</span>
                    <span className="caller-history-path">{item.path || item.api?.slug || "api"}</span>
                    <span className="caller-history-latency">{item.latency_ms ?? 0}ms</span>
                  </div>
                ))
              ) : (
                <div className="caller-history-empty">
                  <History aria-hidden />
                  {isAuthenticated ? "No recorded calls yet" : "Sign in to save request history"}
                </div>
              )}
            </div>
          </section>

          <div className="caller-privacy-note">
            <ShieldCheck aria-hidden />
            <span>Credentials remain server-side. Private and local destinations stay blocked.</span>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
