import {
  Bell,
  BookOpenText,
  ChevronDown,
  CircuitBoard,
  Compass,
  Copy,
  Heart,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlayCircle,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLogout, useSession } from "@/hooks/useApi";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navItems = [
  { labelKey: "nav.home" as const, to: "/", icon: Home },
  { labelKey: "nav.browse" as const, to: "/browse", icon: Compass },
  { labelKey: "nav.docs" as const, to: "/documentation", icon: BookOpenText },
  { labelKey: "nav.pricing" as const, to: "/pricing", icon: WalletCards },
  { labelKey: "nav.caller" as const, to: "/caller", icon: PlayCircle },
  { labelKey: "nav.studio" as const, to: "/studio", icon: CircuitBoard },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const logout = useLogout();
  const { t } = useI18n();
  const isStudioSurface = location.pathname.startsWith("/studio");
  const workspaceName = session.data?.user?.first_name || session.data?.user?.username || t("nav.workspace");

  const handleLogout = async () => {
    navigate("/", { replace: true });
    await logout.mutateAsync();
  };

export const Navigation = () => {
  return (
    <header className="nav-console sticky top-0 z-40 border-b border-border/70 bg-background/78 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/68">
      <div className="container py-3">
        <div className="flex min-h-16 items-center justify-between gap-3 rounded-md border border-border/60 bg-card/62 px-3 shadow-card backdrop-blur-xl sm:px-4 lg:px-5">
          <Link to="/" className="group flex min-w-0 max-w-[14rem] shrink items-center gap-3 rounded-md py-2 2xl:max-w-[19rem]">
            <span className="brand-sigil relative overflow-hidden">
              <CircuitBoard className="h-5 w-5" />
              <span className="absolute inset-x-2 bottom-1 h-px bg-primary/45" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="glitch-text font-display text-lg font-black tracking-tight text-foreground">IranAPI</span>
                <span className="hidden rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-[0.65rem] font-black text-accent sm:inline-flex">
                  {t("nav.consoleBadge")}
                </span>
              </div>
              <p className="hidden max-w-64 truncate text-xs leading-5 text-muted-foreground 2xl:block">{t("nav.tagline")}</p>
            </div>
          </Link>

          {isStudioSurface ? (
            <Button variant="outline" className="hidden h-10 min-w-48 max-w-64 justify-between rounded-md px-3 xl:flex">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-6 w-6 shrink-0 rounded-md bg-gradient-primary" />
                <span className="truncate">{workspaceName}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          ) : null}

          <nav
            aria-label={t("nav.main")}
            className="hidden flex-1 shrink items-center justify-center rounded-md border border-border/70 bg-background/70 p-1 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.05)] lg:flex"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "group/nav relative inline-flex min-h-11 shrink-0 items-center gap-2 overflow-hidden rounded-md px-3 text-sm font-bold text-muted-foreground transition duration-200 hover:bg-primary/10 hover:text-foreground 2xl:px-4",
                      isActive && "bg-primary text-primary-foreground shadow-glow-primary hover:bg-primary hover:text-primary-foreground",
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap leading-none">{t(item.labelKey)}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {isStudioSurface ? (
              <div className="hidden items-center gap-1 border-l border-border/70 pl-2 xl:flex">
                {[Heart, Bell, Copy, HelpCircle].map((Icon, index) => (
                  <Button key={index} type="button" variant="ghost" size="icon" className="h-9 w-9" aria-label="Studio action">
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            ) : null}

            <LanguageToggle />
            <ThemeToggle />

            <div className="hidden items-center gap-2 sm:flex">
              {session.data?.authenticated ? (
                <>
                  <Button variant="outline" className="max-w-44 px-3" asChild>
                    <Link to="/dashboard" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="truncate">{session.data.user?.username || t("nav.dashboard")}</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={t("nav.logout")} onClick={handleLogout} disabled={logout.isPending}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="px-4" asChild>
                    <Link to="/signin">{t("nav.signIn")}</Link>
                  </Button>
                  <Button className="px-4" asChild>
                    <Link to="/signup">
                      <Sparkles className="h-4 w-4" />
                      {t("nav.signUp")}
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label={t("nav.openMenu")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[min(88vw,24rem)] flex-col border-border/80 bg-background/95 p-0 backdrop-blur-xl [&>button]:left-4 [&>button]:right-auto [&>button]:top-5"
              >
                <SheetHeader className="border-b border-border/70 px-5 py-5 text-right">
                  <SheetTitle className="flex items-center gap-3">
                    <span className="brand-sigil h-10 w-10">
                      <CircuitBoard className="h-5 w-5" />
                    </span>
                    IranAPI
                  </SheetTitle>
                  <SheetDescription>{t("nav.sheetDescription")}</SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
                  {isStudioSurface ? (
                    <Button variant="outline" className="h-11 justify-between rounded-md">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="h-6 w-6 shrink-0 rounded-md bg-gradient-primary" />
                        <span className="truncate">{workspaceName}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  ) : null}

                  <nav aria-label={t("nav.mobile")} className="grid gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <SheetClose asChild key={item.to}>
                          <NavLink
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                              cn(
                                "flex min-h-12 items-center gap-3 rounded-md border border-border/70 bg-card/72 px-4 text-sm font-bold text-muted-foreground shadow-sm transition hover:border-primary/35 hover:bg-primary/10 hover:text-foreground",
                                isActive && "border-primary/45 bg-primary/15 text-foreground shadow-glow-primary",
                              )
                            }
                          >
                            <Icon className="h-4 w-4 text-primary" />
                            {t(item.labelKey)}
                          </NavLink>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  <div className="mt-auto grid gap-2 border-t border-border/70 pt-5">
                    {session.data?.authenticated ? (
                      <>
                        <SheetClose asChild>
                          <Button variant="outline" className="justify-start" asChild>
                            <Link to="/dashboard">
                              <LayoutDashboard className="h-4 w-4" />
                              <span className="truncate">{session.data.user?.username || t("nav.dashboard")}</span>
                            </Link>
                          </Button>
                        </SheetClose>
                        <Button variant="ghost" className="justify-start" onClick={handleLogout} disabled={logout.isPending}>
                          <LogOut className="h-4 w-4" />
                          {t("nav.logout")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Button variant="outline" asChild>
                            <Link to="/signin">{t("nav.signIn")}</Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button asChild>
                            <Link to="/signup">
                              <Sparkles className="h-4 w-4" />
                              {t("nav.signUp")}
                            </Link>
                          </Button>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
