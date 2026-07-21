import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Tag, Prompt, CodeBlock } from "@/components/site/Terminal";
import { useCatalogApis } from "@/hooks/useCatalog";
import { Play, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/hooks/useAuth";
import { useCallerExecute, useUsageHistory } from "@/hooks/useUsage";

export default function CallerPage() {
  const { t } = useI18n();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { apis } = useCatalogApis({ page_size: 6 });
  const firstApi = apis[0];
  const [apiSlug, setApiSlug] = useState(firstApi?.slug ?? "");
  const [method, setMethod] = useState("POST");
  const [url, setUrl] = useState("https://api.iranapi.dev/v1/payments-hub/ping");
  const [body, setBody] = useState('{\n  "amount": 50000,\n  "callback": "https://app/ok"\n}');
  const [resp, setResp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const caller = useCallerExecute();
  const usage = useUsageHistory({ source: "caller", page_size: 5 }, isAuthenticated);
  const selectedApi = useMemo(() => apis.find((api) => api.slug === apiSlug) ?? firstApi, [apiSlug, apis, firstApi]);
  const loading = caller.isPending;

  useEffect(() => {
    if (!apiSlug && firstApi?.slug) setApiSlug(firstApi.slug);
  }, [apiSlug, firstApi?.slug]);

  async function send() {
    if (!isAuthenticated) {
      setError("Sign in required for caller execution.");
      return;
    }
    if (!selectedApi?.slug) {
      setError("Select an API target first.");
      return;
    }
    setResp(null);
    setError(null);
    let parsedBody: unknown = undefined;
    if (body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        setError("Request body must be valid JSON.");
        return;
      }
    }
    try {
      let path = "/";
      try {
        path = new URL(url, "https://api.iranapi.dev").pathname.replace(/^\/v\d+\/[^/]+/, "") || "/";
      } catch {
        setError("Request URL must be a valid URL or path.");
        return;
      }
      const result = await caller.mutateAsync({
        api_slug: selectedApi.slug,
        method,
        path,
        body: parsedBody,
      });
      setResp(JSON.stringify(result.body, null, 2));
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Caller request failed.");
    }
  }

  return (
    <PageShell>
      <SectionHeader kicker={t("caller.kicker")} title={t("caller.title")} subtitle={"// " + t("caller.sub")} />

      <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
        <div className="space-y-4 min-w-0">
          <TerminalWindow title="~/iranapi/caller">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="space-y-3"
            >
              <div data-terminal className="flex flex-wrap items-center gap-2 text-sm">
                <label className="sr-only" htmlFor="method">method</label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="field !w-auto !py-1.5 !px-2 text-primary"
                >
                  {["GET", "POST", "PUT", "DELETE"].map((m) => <option key={m}>{m}</option>)}
                </select>
                <label className="sr-only" htmlFor="url">url</label>
                <input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  className="field flex-1 min-w-[200px] !py-1.5 font-mono"
                />
                <button
                  type="submit"
                  disabled={loading || sessionLoading}
                  className="btn-primary !py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  {loading ? t("caller.running") : t("caller.execute")}
                </button>
              </div>
              <div>
                <label htmlFor="body" className="block text-xs text-muted-foreground mb-1">{"// "}{t("caller.body")}</label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  dir="ltr"
                  spellCheck={false}
                  className="field !p-3 text-xs text-amber font-mono resize-y"
                />
              </div>
            </form>
          </TerminalWindow>

          <TerminalWindow title="~/response">
            {loading ? (
              <div className="state-block" data-tone="loading">
                <div className="spinner" aria-hidden />
                <div className="state-sub">{t("caller.running")}</div>
              </div>
            ) : error ? (
              <div className="state-block" data-tone="error">
                <div className="state-title text-destructive">{"// "}{t("caller.error")}</div>
                <div className="state-sub">{error}</div>
              </div>
            ) : resp ? (
              <div className="space-y-2 text-sm">
                <Prompt>{t("caller.response")}</Prompt>
                <div className="text-xs flex flex-wrap items-center gap-2" data-ltr>
                  <Tag color="primary">{caller.data?.status_code ?? 200}</Tag>
                  <span className="text-muted-foreground">
                    {caller.data?.latency_ms ?? 0}ms // {caller.data?.region ?? "ir-tehran-1"}
                  </span>
                </div>
                <CodeBlock className="mt-2">{resp}</CodeBlock>
              </div>
            ) : (
              <div className="state-block">
                <div className="state-title">{"// "}{t("caller.waiting")}</div>
                <div className="state-sub">
                  {isAuthenticated ? "press ./execute to fire a request" : "signin required to execute"}
                </div>
              </div>
            )}
          </TerminalWindow>

          {!isAuthenticated && !sessionLoading ? (
            <Link to="/signin" className="btn-primary justify-center">./signin</Link>
          ) : null}
        </div>

        <aside className="space-y-3">
          <div className="terminal-border rounded-sm bg-card/50 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{"// "}{t("caller.targets")}</div>
            <ul className="mt-3 space-y-1 text-sm">
              {apis.slice(0, 6).map((a) => (
                <li key={a.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setApiSlug(a.slug);
                      setUrl(`https://api.iranapi.dev/v1/${a.slug}/ping`);
                    }}
                    className="block w-full text-start rounded-sm px-2 py-1 text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                    data-active={a.slug === selectedApi?.slug || undefined}
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="terminal-border rounded-sm bg-card/50 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{"// usage.history"}</div>
            <div className="mt-3 space-y-2 text-xs" data-ltr>
              {usage.isLoading ? (
                <div className="text-muted-foreground">loading...</div>
              ) : usage.data?.results.length ? (
                usage.data.results.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0">
                    <span className="truncate">{item.method || "GET"} {item.path || item.api?.slug || "api"}</span>
                    <span className="text-amber tabular-nums">{item.latency_ms ?? 0}ms</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">no caller usage yet</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
