import {
  Braces,
  Check,
  Clock3,
  Copy,
  Download,
  Globe2,
  History,
  KeyRound,
  Play,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { usePageMetadata } from "@/lib/metadata";

type HeaderRow = { id: number; key: string; value: string; enabled: boolean };
type SavedRequest = {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: HeaderRow[];
  body: string;
  createdAt: string;
};
type CallResult = {
  ok: boolean;
  status: number | null;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  error?: string;
};

const storageKey = "iranapi-api-caller-requests";
const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const bodylessMethods = new Set(["GET", "HEAD"]);

const starterHeaders: HeaderRow[] = [
  { id: 1, key: "Content-Type", value: "application/json", enabled: true },
  { id: 2, key: "Authorization", value: "Bearer <IRANAPI_API_KEY>", enabled: false },
];

function readSavedRequests(): SavedRequest[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatJson(value: string) {
  if (!value.trim()) return value;
  return JSON.stringify(JSON.parse(value), null, 2);
}

function buildHeaders(rows: HeaderRow[]) {
  return rows.reduce<Record<string, string>>((headers, row) => {
    if (row.enabled && row.key.trim()) {
      headers[row.key.trim()] = row.value;
    }
    return headers;
  }, {});
}

function toCurl(method: string, url: string, headers: HeaderRow[], body: string) {
  const parts = [`curl --request ${method} \\`, `  --url '${url || "https://api.example.com/v1/resource"}'`];
  Object.entries(buildHeaders(headers)).forEach(([key, value]) => {
    parts.push(`  --header '${key}: ${value}'`);
  });
  if (!bodylessMethods.has(method) && body.trim()) {
    parts.push(`  --data '${body.replace(/\s+/g, " ").trim()}'`);
  }
  return parts.join(" \\\n");
}

function toFetch(method: string, url: string, headers: HeaderRow[], body: string) {
  const payload = !bodylessMethods.has(method) && body.trim() ? `,\n  body: JSON.stringify(${body})` : "";
  return `const response = await fetch("${url || "https://api.example.com/v1/resource"}", {
  method: "${method}",
  headers: ${JSON.stringify(buildHeaders(headers), null, 2)}${payload},
});

const data = await response.text();
console.log(response.status, data);`;
}

export default function ApiCaller() {
  const { dir } = useI18n();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState<HeaderRow[]>(starterHeaders);
  const [body, setBody] = useState('{\n  "hello": "IranAPI"\n}');
  const [response, setResponse] = useState<CallResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [saved, setSaved] = useState<SavedRequest[]>(readSavedRequests);
  const [activeSnippet, setActiveSnippet] = useState<"curl" | "fetch">("curl");

  usePageMetadata({
    title: "API Caller",
    description: "Call, inspect, save, and export HTTP API requests inside IranAPI.",
    path: "/caller",
    noindex: true,
  });

  const enabledHeaders = useMemo(() => buildHeaders(headers), [headers]);
  const snippet = activeSnippet === "curl" ? toCurl(method, url, headers, body) : toFetch(method, url, headers, body);

  const updateHeader = (id: number, patch: Partial<HeaderRow>) => {
    setHeaders((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeHeader = (id: number) => {
    setHeaders((current) => current.filter((row) => row.id !== id));
  };

  const addHeader = () => {
    setHeaders((current) => [...current, { id: Date.now(), key: "", value: "", enabled: true }]);
  };

  const sendRequest = async () => {
    setIsSending(true);
    setResponse(null);
    const started = performance.now();

    try {
      const res = await fetch(url, {
        method,
        headers: enabledHeaders,
        body: bodylessMethods.has(method) || !body.trim() ? undefined : body,
      });
      const text = await res.text();
      const result: CallResult = {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(performance.now() - started),
        headers: Object.fromEntries(res.headers.entries()),
        body: text,
      };
      setResponse(result);
      toast.success(`Response ${res.status} in ${result.durationMs}ms`);
    } catch (error) {
      const result: CallResult = {
        ok: false,
        status: null,
        statusText: "Network error",
        durationMs: Math.round(performance.now() - started),
        headers: {},
        body: "",
        error: error instanceof Error ? error.message : "Request failed",
      };
      setResponse(result);
      toast.error("Request failed. Browser CORS or network policy may block this URL.");
    } finally {
      setIsSending(false);
    }
  };

  const saveRequest = () => {
    const item: SavedRequest = {
      id: `${Date.now()}`,
      name: url.replace(/^https?:\/\//, "").split(/[/?#]/)[0] || "Untitled request",
      method,
      url,
      headers,
      body,
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...saved].slice(0, 12);
    setSaved(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    toast.success("Request saved.");
  };

  const loadRequest = (item: SavedRequest) => {
    setMethod(item.method);
    setUrl(item.url);
    setHeaders(item.headers);
    setBody(item.body);
    setResponse(null);
  };

  const deleteRequest = (id: string) => {
    const next = saved.filter((item) => item.id !== id);
    setSaved(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const copyText = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const exportRequest = () => {
    const blob = new Blob([JSON.stringify({ method, url, headers, body }, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "iranapi-request.json";
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="cyber-shell min-h-screen bg-background" dir={dir}>
      <Navigation />
      <main id="main-content" className="container page-stack">
        <section className="page-hero grid gap-6 lg:grid-cols-[1fr,0.42fr]">
          <div className="space-y-4">
            <p className="eyebrow">HTTP Client</p>
            <h1 className="section-title">Modern API Caller</h1>
            <p className="section-copy">
              Build requests, run them from the browser, inspect headers and body, save reusable calls, and export snippets without leaving IranAPI.
            </p>
          </div>
          <Card className="surface-card">
            <CardContent className="grid gap-3 p-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                Direct browser calls
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                CORS-safe error display
              </div>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Local request history
              </div>
            </CardContent>
          </Card>
        </section>

        <RapidApiSyncPanel compact />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr),340px]">
          <div className="space-y-6">
            <Card className="surface-card">
              <CardContent className="space-y-5 p-5">
                <div className="grid gap-3 md:grid-cols-[160px,1fr,auto]">
                  <select
                    value={method}
                    onChange={(event) => setMethod(event.target.value)}
                    className="h-11 rounded-md border border-input bg-background px-3 text-sm font-bold"
                  >
                    {methods.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://api.example.com/v1/resource" dir="ltr" />
                  <Button className="gap-2" onClick={sendRequest} disabled={isSending || !url.trim()}>
                    <Play className="h-4 w-4" />
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                </div>

                <div className="rounded-md border border-border/70 bg-background/60">
                  <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <KeyRound className="h-4 w-4 text-primary" />
                      Headers
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={addHeader}>
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  <div className="grid gap-2 p-4">
                    {headers.map((row) => (
                      <div key={row.id} className="grid gap-2 md:grid-cols-[34px,1fr,1fr,40px]">
                        <input
                          type="checkbox"
                          className="h-5 w-5 self-center accent-primary"
                          checked={row.enabled}
                          onChange={(event) => updateHeader(row.id, { enabled: event.target.checked })}
                          aria-label="Enable header"
                        />
                        <Input value={row.key} onChange={(event) => updateHeader(row.id, { key: event.target.value })} placeholder="Header" dir="ltr" />
                        <Input value={row.value} onChange={(event) => updateHeader(row.id, { value: event.target.value })} placeholder="Value" dir="ltr" />
                        <Button variant="ghost" size="icon" onClick={() => removeHeader(row.id)} aria-label="Remove header">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold">Body</label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          try {
                            setBody(formatJson(body));
                          } catch {
                            toast.error("Body is not valid JSON.");
                          }
                        }}
                      >
                        <Wand2 className="h-4 w-4" />
                        Format
                      </Button>
                    </div>
                    <Textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      rows={14}
                      className="font-mono text-sm"
                      dir="ltr"
                      disabled={bodylessMethods.has(method)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button size="sm" variant={activeSnippet === "curl" ? "secondary" : "outline"} onClick={() => setActiveSnippet("curl")}>
                          cURL
                        </Button>
                        <Button size="sm" variant={activeSnippet === "fetch" ? "secondary" : "outline"} onClick={() => setActiveSnippet("fetch")}>
                          fetch
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => copyText(snippet, "Snippet copied.")}>
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <pre className="min-h-[21.5rem] overflow-auto rounded-md bg-slate-950 p-4 text-left text-sm leading-6 text-cyan-100" dir="ltr" data-no-translate>
                      <code>{snippet}</code>
                    </pre>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-2" onClick={saveRequest}>
                    <Save className="h-4 w-4" />
                    Save request
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={exportRequest}>
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Braces className="h-5 w-5 text-primary" />
                    <h2 className="font-black">Response</h2>
                  </div>
                  {response ? (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={response.ok ? "default" : "destructive"}>{response.status ?? "ERR"} {response.statusText}</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock3 className="h-3 w-3" />
                        {response.durationMs}ms
                      </Badge>
                    </div>
                  ) : null}
                </div>

                {response ? (
                  <div className="grid gap-4 lg:grid-cols-[0.7fr,1fr]">
                    <pre className="max-h-72 overflow-auto rounded-md border border-border bg-background/70 p-4 text-left text-xs leading-5" dir="ltr" data-no-translate>
                      <code>{JSON.stringify(response.headers, null, 2)}</code>
                    </pre>
                    <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-4 text-left text-sm leading-6 text-slate-100" dir="ltr" data-no-translate>
                      <code>{response.error || response.body || "(empty response)"}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Send a request to inspect response status, headers, timing, and body.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="surface-card">
              <CardContent className="space-y-4 p-5">
                <h2 className="flex items-center gap-2 font-black">
                  <History className="h-4 w-4 text-primary" />
                  Saved requests
                </h2>
                {saved.length ? (
                  saved.map((item) => (
                    <div key={item.id} className="rounded-md border border-border/70 bg-background/70 p-3">
                      <button type="button" className="w-full text-left" onClick={() => loadRequest(item)}>
                        <span className="block truncate text-sm font-semibold">{item.name}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{item.method}</Badge>
                          {new Date(item.createdAt).toLocaleString("en-US")}
                        </span>
                      </button>
                      <Button variant="ghost" size="sm" className="mt-2 gap-2 text-destructive" onClick={() => deleteRequest(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">No saved requests yet. Save common calls to reuse them here.</p>
                )}
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="space-y-3 p-5">
                <h2 className="font-black">Caller notes</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Direct browser execution respects CORS. For private APIs, use allowed origins or connect a backend proxy later.
                </p>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  {["No secrets are stored outside this browser.", "Saved requests use localStorage.", "Code snippets skip runtime translation."].map((item) => (
                    <p key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {item}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
