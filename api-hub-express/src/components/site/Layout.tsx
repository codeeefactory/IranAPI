import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { Logo } from "@/components/site/Logo";
import { useLogout, useSession } from "@/hooks/useAuth";


function useNav() {
  const { t } = useI18n();
  return [
    { to: "/", label: t("nav.home") },
    { to: "/browse", label: t("nav.browse") },
    { to: "/documentation", label: t("nav.docs") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/studio", label: t("nav.studio") },
    { to: "/init", label: "init" },
    { to: "/caller", label: t("nav.caller") },
    { to: "/release", label: "release" },
    { to: "/cli", label: t("nav.cli") },
  ];
}

export function SiteHeader() {
  const path = useLocation().pathname;
  const { t } = useI18n();
  const NAV = useNav();
  const { user, isAuthenticated } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
      {/* gradient hairline */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1.5 sm:gap-3 px-2.5 sm:px-6">
        <Link to="/" className="group flex items-center gap-1 font-bold text-glow shrink-0" aria-label="iranapi home">
          <Logo size={20} className="text-primary" />
          <span className="text-primary">iran</span>
          <span className="text-foreground">api</span>
          <span className="text-amber blink hidden sm:inline" aria-hidden>_</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 text-sm" aria-label="Primary">
          {NAV.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-sm px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                  active ? "text-primary text-glow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <span aria-hidden className="absolute inset-x-2 -bottom-[7px] h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-1 sm:gap-2 min-w-0">
          <div className="hidden 2xl:flex items-center gap-1.5 rounded-sm border border-border/70 bg-card/40 px-2 py-1 text-xs text-muted-foreground" data-ltr>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span>{t("nav.uptime")} <span className="text-primary">99.97%</span></span>
          </div>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="hidden sm:inline-flex btn-ghost text-primary max-w-[180px] min-w-0"
              aria-label={t("nav.logout")}
              title={user?.username ? `${t("nav.logout")} ${user.username}` : t("nav.logout")}
            >
              <span className="truncate" data-ltr>{user?.username}</span>
              <LogOut className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : (
            <Link
              to="/signin"
              className="hidden sm:inline-flex btn-ghost text-primary"
            >
              {t("nav.signin")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            className="lg:hidden inline-flex items-center justify-center rounded-sm border border-border bg-card/50 h-10 w-10 text-foreground/80 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={cn(
          "lg:hidden border-t border-border bg-background/95 backdrop-blur-md overflow-hidden transition-[max-height] duration-200",
          open ? "max-h-[85vh]" : "max-h-0",
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 py-3" aria-label="Mobile">
          <ul className="grid gap-1 text-sm">
            {NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-sm px-3 py-2.5 min-h-11 transition-colors",
                      active ? "bg-primary/10 text-primary" : "text-foreground/85 hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2 sm:hidden">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => logout.mutate()}
                  className="block w-full rounded-sm border border-primary px-3 py-2.5 text-center text-primary hover:bg-primary hover:text-primary-foreground min-h-11"
                >
                  {t("nav.logout")}
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="block rounded-sm border border-primary px-3 py-2.5 text-center text-primary hover:bg-primary hover:text-primary-foreground min-h-11"
                >
                  {t("nav.signin")}
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <Logo size={18} className="text-primary" />

              <span className="text-primary">iran</span>
              <span>api</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{t("footer.tag")}</p>
          </div>
          <FooterCol title="// catalog" links={[["/browse", t("nav.browse")], ["/documentation", t("nav.docs")], ["/pricing", t("nav.pricing")]]} />
          <FooterCol title="// build" links={[["/dashboard", t("nav.dashboard")], ["/studio", t("nav.studio")], ["/init", "init"], ["/caller", t("nav.caller")], ["/release", "release"]]} />
          <FooterCol title="// legal" links={[["/terms", t("terms.title")], ["/privacy", t("privacy.title")]]} />
        </div>
        <div className="ascii-divider mt-8" />
        <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground" data-ltr>
          <span>© {new Date().getFullYear()} iranapi // all systems nominal</span>
          <span>build <span className="text-primary">2026.5.24-edge</span> // sha <span className="text-amber">a1f9c2e</span></span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{title}</div>
      <ul className="mt-3 space-y-1.5">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-foreground/80 hover:text-primary transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="relative min-h-dvh flex flex-col crt-flicker">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-sm focus:bg-primary focus:px-3 focus:py-1 focus:text-primary-foreground">
        skip to content
      </a>
      <SiteHeader />
      <main id="main" className={cn("mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6", className)}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SectionHeader({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8 space-y-2">
      {kicker && <div className="text-xs uppercase tracking-[0.2em] text-primary text-glow" data-ltr>{"// "}{kicker}</div>}
      <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
    </div>
  );
}
