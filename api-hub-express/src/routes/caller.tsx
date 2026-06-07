import { useState } from "react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Tag, Prompt, CodeBlock } from "@/components/site/Terminal";
import { useCatalogApis } from "@/hooks/useCatalog";
import { Play, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function CallerPage() {
  const { t } = useI18n();
  const { apis } = useCatalogApis({ page_size: 6 });
  const [method, setMethod] = useState("POST");
  const [url, setUrl] = useState("https://api.iranapi.dev/v1/zarinpal/pay");
  const [body, setBody] = useState('{\n  "amount": 50000,\n  "callback": "https://app/ok"\n}');
  const [resp, setResp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function send() {
    setLoading(true);
    setResp(null);
    setError(null);
    setTimeout(() => {
      setResp(JSON.stringify({
        ok: true,
        intent_id: "pi_4f9c8b2a",
        redirect: "https://gw.zarinpal.com/pg/StartPay/...",
        expires_in: 900,
        latency_ms: 142,
      }, null, 2));
      setLoading(false);
    }, 600);
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
                  disabled={loading}
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
                  <Tag color="primary">200</Tag>
                  <span className="text-muted-foreground">142ms // ir-tehran-1</span>
                </div>
                <CodeBlock className="mt-2">{resp}</CodeBlock>
              </div>
            ) : (
              <div className="state-block">
                <div className="state-title">{"// "}{t("caller.waiting")}</div>
                <div className="state-sub">press ./execute to fire a request</div>
              </div>
            )}
          </TerminalWindow>
        </div>

        <aside className="space-y-3">
          <div className="terminal-border rounded-sm bg-card/50 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{"// "}{t("caller.targets")}</div>
            <ul className="mt-3 space-y-1 text-sm">
              {apis.slice(0, 6).map((a) => (
                <li key={a.slug}>
                  <button
                    type="button"
                    onClick={() => setUrl(`https://api.iranapi.dev/v1/${a.slug.split("-")[0]}/ping`)}
                    className="block w-full text-start rounded-sm px-2 py-1 text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
