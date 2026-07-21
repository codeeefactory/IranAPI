import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Tag } from "@/components/site/Terminal";
import { useCatalogApis, useCatalogCategories } from "@/hooks/useCatalog";
import { Search, Star, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function BrowsePage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const { apis } = useCatalogApis({ page_size: 100, ordering: "-rating" });
  const { categories } = useCatalogCategories();

  const results = useMemo(() => {
    return apis.filter((a) => {
      if (cat && a.category !== cat) return false;
      if (price && a.pricing !== price) return false;
      if (q && !(`${a.name} ${a.tagline} ${a.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [apis, q, cat, price]);

  const countKey = results.length === 1 ? "browse.results.count_one" : "browse.results.count_other";
  const clearAll = () => { setQ(""); setCat(null); setPrice(null); };
  const hasFilters = q || cat || price;

  return (
    <PageShell>
      <SectionHeader kicker={t("browse.kicker")} title={t("browse.title")} subtitle={"// " + t("browse.sub")} />

      <TerminalWindow title="~/iranapi/search">
        <div data-terminal className="flex flex-wrap items-center gap-2">
          <span className="text-primary font-mono">$ grep</span>
          <span className="text-amber font-mono">--type</span>
          <span className="text-muted-foreground font-mono">api</span>
          <label className="sr-only" htmlFor="api-search">{t("browse.search.placeholder")}</label>
          <div className="flex-1 min-w-[180px] flex items-center gap-2 rounded-sm border border-border bg-background/60 px-3">
            <Search className="h-4 w-4 text-primary shrink-0" aria-hidden />
            <input
              id="api-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("browse.search.placeholder")}
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="clear search" className="text-muted-foreground hover:text-primary">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </TerminalWindow>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-6">
          <div className="terminal-border rounded-sm bg-card/50 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <SlidersHorizontal className="h-3 w-3 text-primary" aria-hidden />
              {"// "}{t("browse.filters.categories")}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setCat(null)}
                  className={`w-full text-start rounded-sm px-2 py-1 transition-colors ${cat === null ? "bg-primary/10 text-primary" : "text-foreground/80 hover:text-primary"}`}
                >
                  {t("browse.filters.all")} <span className="text-muted-foreground">({apis.length})</span>
                </button>
              </li>
              {categories.map((c) => {
                const n = apis.filter((a) => a.category === c.slug).length;
                const label = t(`cat.${c.slug}`);
                return (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => setCat(c.slug)}
                      className={`w-full text-start rounded-sm px-2 py-1 transition-colors ${cat === c.slug ? "bg-primary/10 text-primary" : "text-foreground/80 hover:text-primary"}`}
                    >
                      {label} <span className="text-muted-foreground">({n || c.apis_count})</span>
                    </button>
                  </li>
                );
              })}

            </ul>
          </div>

          <div className="terminal-border rounded-sm bg-card/50 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{"// "}{t("browse.filters.pricing")}</div>
            <ul className="mt-3 space-y-1 text-sm">
              {[null, "free", "freemium", "paid"].map((p) => (
                <li key={String(p)}>
                  <button
                    type="button"
                    onClick={() => setPrice(p)}
                    className={`w-full text-start rounded-sm px-2 py-1 transition-colors ${price === p ? "bg-primary/10 text-primary" : "text-foreground/80 hover:text-primary"}`}
                  >
                    {p ? t(`status.${p}`) : t("browse.filters.any")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>


        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{"// "}{t(countKey, { n: results.length })}</span>
            <span data-ltr>{t("browse.results.sort")}: <span className="text-primary">{t("browse.results.byRating")}</span></span>
          </div>
          <div className="grid gap-3">
            {results.map((a) => (
              <Link
                key={a.slug}
                to={`/api/${a.slug}`}
                className="group block terminal-border rounded-sm bg-card/50 p-4 transition-all hover:border-primary hover:shadow-glow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground" data-ltr>{a.org}</div>
                    <div className="text-base font-bold text-primary group-hover:text-glow" data-ltr>{a.name}</div>
                    <p className="mt-1 text-sm text-foreground/80">{a.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber text-sm" data-ltr>
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden /> {a.rating}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground" data-ltr>
                  <span>p95 <span className="text-primary">{a.latency}ms</span></span>
                  <span>up <span className="text-primary">{a.uptime}%</span></span>
                  <span>req <span className="text-amber">{a.calls}</span></span>
                  <Tag color={a.pricing === "paid" ? "magenta" : a.pricing === "freemium" ? "cyan" : "primary"}>{t(`status.${a.pricing}`)}</Tag>

                  {a.tags.slice(0, 3).map((tg) => (<Tag key={tg} color="muted">{tg}</Tag>))}
                </div>
              </Link>
            ))}
            {results.length === 0 && (
              <div className="state-block">
                <div className="state-title">{"// "}{t("browse.empty.title")}</div>
                <div className="state-sub">{t("browse.empty.sub")}</div>
                {hasFilters && (
                  <button type="button" onClick={clearAll} className="btn-ghost mt-3 text-xs">
                    {t("browse.empty.clear")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
