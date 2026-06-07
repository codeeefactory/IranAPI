import { Link, useParams, Navigate } from "react-router-dom";
import { PageShell } from "@/components/site/Layout";
import { TerminalWindow, Prompt, Tag } from "@/components/site/Terminal";
import { useCatalogApi } from "@/hooks/useCatalog";
import { ArrowLeft, Star, Activity, Zap, Shield, Code2 } from "lucide-react";

export default function ApiDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { api, isLoading } = useCatalogApi(slug);
  if (!api && isLoading) {
    return (
      <PageShell>
        <div className="state-block" data-tone="loading">
          <div className="spinner" aria-hidden />
          <div className="state-sub">loading api...</div>
        </div>
      </PageShell>
    );
  }
  if (!api) return <Navigate to="/browse" replace />;

  return (
    <PageShell>
      <Link to="/browse" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> back to registry
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <div className="terminal-border rounded-sm bg-card/60 p-6">
            <div className="text-xs text-muted-foreground">{api.org} // {api.category}</div>
            <h1 className="mt-2 text-3xl font-black text-primary text-glow">{api.name}</h1>
            <p className="mt-2 text-foreground/85">{api.tagline}</p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{api.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {api.tags.map((t: string) => <Tag key={t} color="cyan">{t}</Tag>)}
              <Tag color={api.pricing === "paid" ? "magenta" : "primary"}>{api.pricing}</Tag>
            </div>
          </div>

          <TerminalWindow title={`~/iranapi/${api.slug}/quickstart.sh`} glow>
            <div className="space-y-2 text-sm">
              <Prompt>iran install {api.name}</Prompt>
              <div className="pl-6 text-muted-foreground text-xs">{"// "}fetching openapi schema...</div>
              <div className="pl-6 text-primary text-xs">{"// "}✓ {api.endpoints} endpoints registered</div>
              <Prompt>cat .env</Prompt>
              <pre className="text-xs bg-background/60 border border-border rounded-sm p-3 text-amber">{`IRAN_KEY=ir_live_4f9c8b2a...
${api.slug.toUpperCase().replace(/-/g, "_")}_REGION=tehran-1`}</pre>
              <Prompt>curl https://api.iranapi.dev/v1/{api.slug.split("-")[0]}/ping</Prompt>
              <pre className="text-xs bg-background/60 border border-border rounded-sm p-3 text-primary/90">{`{ "ok": true, "latency_ms": ${api.latency}, "region": "ir-tehran-1" }`}</pre>
            </div>
          </TerminalWindow>

          <div className="terminal-border rounded-sm bg-card/50 p-6">
            <div className="text-xs uppercase tracking-widest text-primary">// endpoints</div>
            <ul className="mt-3 divide-y divide-border text-sm">
              {(api.apiEndpoints.length ? api.apiEndpoints : Array.from({ length: Math.min(api.endpoints, 6) })).map((endpoint: any, i) => (
                <li key={endpoint?.id ?? i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <Tag color={endpoint?.method === "POST" ? "amber" : "primary"}>{endpoint?.method ?? (i % 2 ? "POST" : "GET")}</Tag>
                    <code className="text-foreground/90">{endpoint?.path ?? `/v1/${api.slug.split("-")[0]}/${["create", "list", "get", "update", "delete", "verify"][i % 6]}`}</code>
                  </div>
                  <span className="text-xs text-muted-foreground">p95 {api.latency + i * 12}ms</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="terminal-border rounded-sm bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">// vitals</div>
              <div className="flex items-center gap-1 text-amber text-sm"><Star className="h-3.5 w-3.5 fill-current" /> {api.rating}</div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Vital icon={Zap} label="latency p95" value={`${api.latency}ms`} />
              <Vital icon={Activity} label="uptime 30d" value={`${api.uptime}%`} />
              <Vital icon={Code2} label="endpoints" value={String(api.endpoints)} />
              <Vital icon={Shield} label="signing" value="hmac-sha256" />
            </dl>
            <Link
              to="/caller"
              className="mt-5 block rounded-sm border border-primary bg-primary text-center px-4 py-2 text-sm font-bold text-primary-foreground hover:shadow-glow"
            >
              ./try_endpoint
            </Link>
            <Link
              to="/pricing"
              className="mt-2 block rounded-sm border border-border text-center px-4 py-2 text-sm text-foreground/90 hover:border-primary hover:text-primary"
            >
              view pricing
            </Link>
          </div>

          <div className="terminal-border rounded-sm bg-card/40 p-5 text-xs text-muted-foreground space-y-2">
            <div>// last incident: <span className="text-primary">none in 30d</span></div>
            <div>// changelog: <span className="text-amber">v1.4.2</span></div>
            <div>// sdks: <span className="text-cyan">ts, py, go, php</span></div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Vital({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5 text-primary" /> {label}</span>
      <span className="text-primary text-glow font-bold">{value}</span>
    </div>
  );
}
