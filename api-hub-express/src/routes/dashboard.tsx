import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Tag, Prompt } from "@/components/site/Terminal";
import { Activity, Key, Server, TrendingUp, Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAccountDashboard, useSession } from "@/hooks/useAuth";
import { useUsageHistory } from "@/hooks/useUsage";

export default function DashboardPage() {
  const { t } = useI18n();
  const { isAuthenticated, user, profile: sessionProfile, isLoading } = useSession();
  const account = useAccountDashboard(isAuthenticated);
  const recentUsage = useUsageHistory({ page_size: 5 }, isAuthenticated);
  const profile = account.profile.data ?? sessionProfile;
  const usageStats = account.usageStats.data;
  const accessGrants = account.access.data?.results ?? [];
  const accessCount = account.access.data?.count ?? 0;
  const subscription = account.subscription.data?.subscription;

  if (!isLoading && !isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg">
          <TerminalWindow title="~/iranapi/session" glow>
            <div className="space-y-3 text-sm">
              <Prompt>iran session status</Prompt>
              <div className="text-muted-foreground">{"// not authenticated"}</div>
              <Link to="/signin" className="btn-primary justify-center">./signin</Link>
            </div>
          </TerminalWindow>
        </div>
      </PageShell>
    );
  }

  const recentRequests = Number(usageStats?.recent_requests ?? usageStats?.total_requests ?? 0);
  const activeApis = Number(usageStats?.active_apis ?? accessCount);
  const usageRows = recentUsage.data?.results ?? [];
  const latencyValues = usageRows.map((item) => Number(item.latency_ms ?? 0)).filter((value) => value > 0);
  const p95Latency = latencyValues.length ? Math.max(...latencyValues) : 0;
  const trafficBars = usageRows.length
    ? usageRows.map((item) => Math.max(1, Number(item.requests_count ?? 0))).reverse()
    : [1];

  return (
    <PageShell>
      <SectionHeader
        kicker={user?.username ? `${t("dash.kicker")} // ${user.username}` : t("dash.kicker")}
        title={t("dash.title")}
        subtitle={"// " + (user?.email || t("dash.sub"))}
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground" data-ltr>--email</span>
          <input id="email" className="field" value={user?.email ?? ""} readOnly dir="ltr" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground" data-ltr>--company</span>
          <input id="company" className="field" value={profile?.company ?? ""} readOnly />
        </label>
        <div className="terminal-border rounded-sm bg-card/60 p-3">
          <div className="text-xs text-muted-foreground">{"// "}{t("dash.subscription")}</div>
          <div className="mt-1 font-black text-primary" data-ltr>
            {subscription?.plan?.name ?? subscription?.plan?.slug ?? "free"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { i: TrendingUp, l: t("dash.calls24h"), v: recentRequests.toLocaleString(), d: t("dash.requests") },
          { i: Activity, l: t("dash.p95"), v: p95Latency ? `${p95Latency}ms` : "0ms", d: "recent" },
          { i: Server, l: t("dash.edge"), v: String(activeApis), d: t("dash.apis") },
          { i: Key, l: t("dash.keys"), v: String(accessCount), d: t("dash.access") },
        ].map((s) => (
          <div key={s.l} className="terminal-border rounded-sm bg-card/60 p-4 sm:p-5">
            <s.i className="h-4 w-4 text-primary" aria-hidden />
            <div className="mt-2 text-xl sm:text-2xl font-black text-foreground" data-ltr>{s.v}</div>
            <div className="text-xs text-muted-foreground">
              {"// "}{s.l} <span className="text-primary" data-ltr>{s.d}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="terminal-border rounded-sm bg-card/50 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("dash.traffic")}</div>
            <Tag color="primary">{t("dash.live")}</Tag>
          </div>
          <TrafficChart bars={trafficBars} />
        </div>

        <TerminalWindow title="~/iranapi/keys">
          <div className="space-y-2 text-sm">
            <Prompt>iran keys list</Prompt>
            <div className="mt-2 divide-y divide-border text-xs">
              {accessGrants.length ? (
                accessGrants.slice(0, 4).map((grant) => (
                  <KeyRow
                    key={grant.id}
                    k={grant.external_subscription_id || `grant_${grant.id}`}
                    env={grant.status}
                    color={grant.status === "active" ? "primary" : "amber"}
                    t={t}
                  />
                ))
              ) : (
                <div className="py-3 text-muted-foreground" data-ltr>// no access grants yet</div>
              )}
            </div>
            <Link to="/release" className="cta-grad mt-3 w-full !py-2 text-xs justify-center">
              ./release_api
            </Link>
            <button className="btn-ghost mt-2 w-full !py-2 text-xs">
              {t("dash.generate")}
            </button>
          </div>
        </TerminalWindow>
      </div>

      <div className="mt-8 surface-card rounded-sm p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("dash.recent")}</div>
          <Tag color="primary">{t("dash.live")}</Tag>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="table-elev" data-ltr>
            <thead>
              <tr><th>time</th><th>status</th><th>endpoint</th><th className="text-end">latency</th></tr>
            </thead>
            <tbody>
              {usageRows.length ? (
                usageRows.map((item) => {
                  const status = item.status_code ? String(item.status_code) : "ok";
                  const endpoint = `${item.method || "GET"} ${item.path || item.api?.slug || "catalog"}`;
                  return (
                    <tr key={item.id}>
                      <td className="text-muted-foreground tabular-nums w-[80px]">{formatTime(item.last_used ?? item.created_at)}</td>
                      <td className="w-[64px]"><Tag color={status.startsWith("2") || status === "ok" ? "primary" : "magenta"}>{status}</Tag></td>
                      <td className="font-mono text-foreground/90 truncate">{endpoint}</td>
                      <td className="text-end text-amber tabular-nums w-[80px]">{item.latency_ms ? `${item.latency_ms}ms` : `${item.requests_count} req`}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-5 text-center text-muted-foreground">// no usage events yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

function KeyRow({ k, env, color, t }: { k: string; env: string; color: any; t: (s: string, v?: any) => string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <div className="flex items-center gap-2 min-w-0" data-ltr>
        <code className="text-amber truncate">{k}</code>
        <Tag color={color}>{env}</Tag>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{t("dash.usedAgo", { t: "live" })}</span>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(k); setDone(true); setTimeout(() => setDone(false), 1200); }}
          aria-label={t("common.copy")}
          className="inline-flex items-center rounded-sm border border-border p-1 hover:text-primary hover:border-primary"
        >
          {done ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

function formatTime(value?: string | null) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function TrafficChart({ bars }: { bars: number[] }) {
  const max = Math.max(...bars);
  return (
    <div className="mt-5 flex h-32 sm:h-40 items-end gap-1" aria-hidden>
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${(b / max) * 100}%`, boxShadow: "0 0 6px var(--primary)" }} />
      ))}
    </div>
  );
}
