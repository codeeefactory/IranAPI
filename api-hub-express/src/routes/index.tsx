import { Link } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Prompt, Cursor, Tag } from "@/components/site/Terminal";
import { Reveal } from "@/components/site/Reveal";
import { useI18n } from "@/lib/i18n";
import { useCatalogHome } from "@/hooks/useCatalog";
import { ArrowRight, Boxes, GitBranch, Lock, Radio, Sparkles, Star, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export default function IndexPage() {
  const { t } = useI18n();
  const { apis, categories, stats } = useCatalogHome();
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative -mx-4 sm:-mx-6 px-4 sm:px-6 py-16 overflow-hidden">

        <div
          className="absolute inset-0 -z-10 opacity-[0.12]"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          aria-hidden
        />
        <div className="absolute inset-0 grid-bg -z-10 opacity-40" aria-hidden />
        <div className="scan-line" aria-hidden />

        <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <Reveal className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/5 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary">{t("hero.badge")}</span>
              <span className="text-muted-foreground">// {stats.requestsPerSec.toLocaleString()} req/s</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
              <span className="block text-foreground">{t("hero.title1")}</span>
              <span className="block text-primary text-glow-strong glitch">{t("hero.title2")}</span>
            </h1>

            <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
              <span className="text-amber">{"// "}</span>
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="group btn-primary grad-border ring-glow"
              >
                {t("hero.cta1")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </Link>
              <Link
                to="/documentation"
                className="btn-ghost ring-glow"
              >
                {t("hero.cta2")}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Tag color="primary">SOC2</Tag>
              <Tag color="amber">RTL-ready</Tag>
              <Tag color="cyan">edge-cached</Tag>
              <Tag color="magenta">webhook-signed</Tag>
            </div>
          </Reveal>

          <TerminalWindow title="~/iranapi/quickstart.sh" glow>
            <div data-terminal className="min-w-max space-y-2 text-sm">
              <Prompt>curl \</Prompt>
              <div className="whitespace-nowrap ps-6 text-foreground/90">https://api.iranapi.dev/v1/zarinpal/pay \</div>
              <div className="whitespace-nowrap ps-6 text-foreground/90">-H <span className="text-amber">"x-iran-key: $IRAN_KEY"</span> \</div>
              <div className="whitespace-nowrap ps-6 text-foreground/90">-d <span className="text-amber">{`'{"amount":50000,"callback":"/ok"}'`}</span></div>
              <div className="pt-3 text-xs text-muted-foreground">{"// HTTP/2 200  // 142ms  // signed:0xa1f9c2e"}</div>
              <pre dir="ltr" className="mt-2 text-xs text-primary/90 bg-background/60 rounded-sm border border-border p-3 overflow-x-auto">{`{
  "ok": true,
  "intent_id": "pi_4f9c8b2a",
  "redirect": "https://gw.zarinpal.com/...",
  "expires_in": 900
}`}</pre>
              <Prompt><Cursor /></Prompt>
            </div>
          </TerminalWindow>
        </div>

        {/* stats strip */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("stats.apis"), value: stats.apiCount },
            { label: t("stats.categories"), value: stats.categoryCount },
            { label: t("stats.uptime"), value: stats.uptime + "%" },
            { label: t("stats.devs"), value: stats.developers },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="surface-card rounded-sm p-4 transition-all hover:border-primary/60 hover:shadow-glow">
                <div className="text-2xl font-black text-primary text-glow tabular-nums">{s.value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{"// "}{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED APIs */}
      <section className="mt-20">
        <SectionHeader kicker={t("section.featured.kicker")} title={t("section.featured.title")} subtitle={"// " + t("section.featured.sub")} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apis.slice(0, 6).map((a) => (
            <Link
              key={a.slug}
              to={`/api/${a.slug}`}
              className="group block terminal-border rounded-sm bg-card/60 p-5 transition-all hover:border-primary hover:bg-card hover:shadow-glow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">{a.org}</div>
                  <div className="text-base font-bold text-primary group-hover:text-glow">{a.name}</div>
                </div>
                <div className="flex items-center gap-1 text-amber text-sm">
                  <Star className="h-3.5 w-3.5 fill-current" /> {a.rating}
                </div>
              </div>
              <p className="mt-3 text-sm text-foreground/80 line-clamp-2">{a.tagline}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>p95 <span className="text-primary">{a.latency}ms</span></span>
                <span>up <span className="text-primary">{a.uptime}%</span></span>
                <span>req <span className="text-amber">{a.calls}</span></span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {a.tags.slice(0, 3).map((t) => (
                  <Tag key={t} color="muted">{t}</Tag>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mt-20">
        <SectionHeader kicker={t("section.categories.kicker")} title={t("section.categories.title")} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 40}>
              <Link
                to="/browse"
                className="terminal-border group flex items-center justify-between rounded-sm bg-card/50 p-4 transition-all hover:border-primary hover:bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-primary text-glow">{c.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-foreground group-hover:text-primary">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.apis_count} APIs</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all rtl:rotate-180" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-20">
        <SectionHeader kicker={t("section.manifesto.kicker")} title={t("section.manifesto.title")} />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "edge-first", body: "calls hit the closest pop in <50ms. no cold starts, no surprises." },
            { icon: Lock, title: "signed everything", body: "every payload signed, every webhook verified, every secret scoped." },
            { icon: Radio, title: "live observability", body: "p50/p95/p99, error budget burn, regional heatmaps. built in." },
            { icon: GitBranch, title: "versioned by default", body: "every endpoint is /v1, /v2-staged, /v3-beta. no breaking changes." },
            { icon: Boxes, title: "one bill", body: "aggregate billing across providers. usage-based, irr or usd." },
            { icon: Sparkles, title: "ai-native", body: "openapi -> typed sdks -> ai completions in your editor." },
          ].map((f) => (
            <div key={f.title} className="surface-card group rounded-sm p-5 transition-all hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-glow">
              <div className="inline-flex items-center justify-center rounded-sm border border-primary/30 bg-primary/5 p-2 text-primary text-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-bold text-foreground">// {f.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20">
        <Reveal>
          <div className="terminal-border rounded-sm bg-gradient-to-br from-card to-background p-8 sm:p-12 text-center">
            <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("cta.ready")}</div>
            <h3 className="mt-3 text-3xl sm:text-4xl font-black">{t("cta.headline")} <span className="text-primary text-glow">{t("cta.headline2")}</span></h3>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">{t("cta.sub")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn-primary grad-border">
                {t("cta.signup")}
              </Link>
              <Link to="/pricing" className="btn-ghost">
                {t("cta.pricing")}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
