import {
  ArrowLeft,
  BarChart3,
  Blocks,
  Check,
  Copy,
  KeyRound,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { ApiStatusBadge, AuthSchemeBadge, HealthSignalBadge, MethodBadge } from "@/components/ApiVaultBadges";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAccessGrants,
  useAPIs,
  useCategories,
  useCurrentSubscription,
  useCurrentUser,
  useGenerateLegacyAPIKey,
  useProfile,
  useUsageStats,
} from "@/hooks/useApi";
import { getBrowseBootstrap, getHomeBootstrap } from "@/lib/bootstrap";
import { createBreadcrumbSchema, usePageMetadata } from "@/lib/metadata";
import { formatCurrencyLabel, formatFaNumber, toSiteUrl } from "@/lib/site";

export default function Dashboard() {
  const homeBootstrap = getHomeBootstrap();
  const browseBootstrap = getBrowseBootstrap();
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile();
  const { data: accessGrants } = useAccessGrants();
  const { data: usageStats } = useUsageStats();
  const { data: currentSubscription } = useCurrentSubscription();
  const { data: categories } = useCategories(undefined, {
    initialData: homeBootstrap?.categories || browseBootstrap?.categories,
  });
  const { data: featuredApis } = useAPIs(
    { featured: true, ordering: "-rating", page_size: 6 },
    { initialData: homeBootstrap?.featuredApis || browseBootstrap?.recommendedApis },
  );
  const { data: apiDirectory } = useAPIs(
    { ordering: "-rating", page_size: 12 },
    { initialData: homeBootstrap?.apis || browseBootstrap?.apis },
  );
  const generateLegacyAPIKey = useGenerateLegacyAPIKey();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const displayName = user?.first_name || user?.username || "IranAPI Workspace";
  const planName = currentSubscription?.subscription?.plan.name || "بدون پلن فعال";
  const activeGrant = accessGrants?.results.find((grant) => grant.status === "active");
  const totalRequests = usageStats?.total_requests || 0;
  const activeApis = usageStats?.active_apis || 0;
  const apiCount = apiDirectory?.count || 0;
  const categoryCount = categories?.count || 0;

  const visibleApis = useMemo(() => {
    const source = (featuredApis?.results.length ? featuredApis.results : apiDirectory?.results) || [];
    const needle = submittedSearch.trim().toLowerCase();

    if (!needle) {
      return source.slice(0, 6);
    }

    return source
      .filter((api) =>
        [api.name, api.name_en, api.short_description, api.category?.name, api.category?.name_en, ...(api.tags || [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle)),
      )
      .slice(0, 6);
  }, [apiDirectory?.results, featuredApis?.results, submittedSearch]);

  const topCategories = useMemo(() => (categories?.results || []).slice(0, 4), [categories?.results]);

  const integrationSnippet = [
    "curl --request GET \\",
    `  --url "${activeGrant?.api.base_url || "https://api.iranapi.com/v1"}/health" \\`,
    `  --header "X-IranAPI-Key: ${profile?.api_key_preview || "<IRANAPI_API_KEY>"}"`,
  ].join("\n");

  usePageMetadata({
    title: "داشبورد توسعه‌دهنده",
    description: "داشبورد IranAPI برای کشف APIها، مدیریت دسترسی، کلیدها، پلن و مصرف حساب توسعه‌دهنده.",
    path: "/dashboard",
    noindex: true,
    structuredData: [
      createBreadcrumbSchema([
        { name: "خانه", path: "/" },
        { name: "داشبورد", path: "/dashboard" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "IranAPI Dashboard",
        url: toSiteUrl("/dashboard"),
        applicationCategory: "DeveloperApplication",
      },
    ],
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedSearch(search);
  };

  const copyIntegration = async () => {
    try {
      await navigator.clipboard.writeText(integrationSnippet);
      setCopied(true);
      toast.success("نمونه درخواست کپی شد.");
    } catch {
      toast.error("دسترسی به Clipboard ممکن نیست.");
    }
  };

  const rotateKey = async () => {
    const result = await generateLegacyAPIKey.mutateAsync();
    if (result.api_key) {
      await navigator.clipboard.writeText(result.api_key).catch(() => undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">داشبورد</h1>
          <p className="text-muted-foreground">نظارت بر استفاده و عملکرد API خود</p>
        </div>

      <main id="main-content" className="container page-stack">
        <section className="page-hero grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div className="space-y-6">
            <span className="cyber-kicker">داشبورد همگام با تجربه اصلی IranAPI</span>
            <div className="space-y-4">
              <h1 className="section-title cyber-title">کشف، اتصال و پایش APIها در همان جریان وب‌سایت</h1>
              <p className="section-copy">
                همین داده‌هایی که در خانه و صفحه کشف می‌بینید، اینجا با وضعیت حساب، دسترسی‌ها، کلید API و مصرف شما ترکیب شده است.
              </p>
            </div>

            <form className="glass-panel grid gap-3 p-4 sm:grid-cols-[1fr,150px]" onSubmit={handleSearch} role="search">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جست‌وجوی API در داشبورد"
                  className="pr-9"
                />
              </div>
              <Button type="submit" className="gap-2">
                نمایش
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex flex-wrap gap-3">
              <span className="stat-chip">
                <Sparkles className="h-4 w-4 text-primary" />
                {formatFaNumber(apiCount)} API فعال
              </span>
              <span className="stat-chip">
                <Blocks className="h-4 w-4 text-primary" />
                {formatFaNumber(categoryCount)} دسته‌بندی
              </span>
              <span className="stat-chip">
                <BarChart3 className="h-4 w-4 text-primary" />
                {formatFaNumber(totalRequests)} درخواست حساب
              </span>
            </div>
          </div>

          <Card className="surface-card">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-gradient-primary text-primary-foreground">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{displayName}</p>
                  <p className="truncate text-sm text-muted-foreground">{user?.email || "ایمیل ثبت نشده"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="metric-card">
                  <p className="text-sm text-muted-foreground">درخواست‌ها</p>
                  <p className="text-2xl font-bold">{formatFaNumber(totalRequests)}</p>
                </div>
                <div className="metric-card">
                  <p className="text-sm text-muted-foreground">APIهای فعال</p>
                  <p className="text-2xl font-bold">{formatFaNumber(activeApis)}</p>
                </div>
              </div>

              <div className="rounded-md border border-primary/20 bg-primary/10 p-4">
                <p className="font-semibold">{planName}</p>
                <p className="mt-1 text-sm text-muted-foreground">اشتراک فعلی فضای کاری</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <RapidApiSyncPanel compact />

        <section className="section-frame space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="eyebrow">داده‌های همگام</p>
              <h2 className="text-2xl font-bold md:text-3xl">APIهای پیشنهادی همان کاتالوگ سایت</h2>
              <p className="section-copy">
                کارت‌ها از همان منبع صفحه کشف تغذیه می‌شوند و وضعیت، احراز هویت، قیمت و سلامت عملیاتی را یکپارچه نشان می‌دهند.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/browse">دیدن همه APIها</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleApis.map((api) => (
              <Card key={api.slug} className="surface-card">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{api.category?.name || "بدون دسته"}</Badge>
                    <ApiStatusBadge status={api.status} />
                  </div>
                  <CardTitle>{api.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="min-h-16 text-sm leading-7 text-muted-foreground">
                    {api.short_description || "توضیح کوتاه این API هنوز ثبت نشده است."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <HealthSignalBadge />
                    <AuthSchemeBadge scheme={api.rapidapi.public_auth_scheme} />
                    <MethodBadge method={api.endpoints?.[0]?.method || "GET"} />
                  </div>
                  <div className="grid gap-3 rounded-md bg-muted/50 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">امتیاز</p>
                      <p className="font-semibold">{api.rating}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">شروع قیمت</p>
                      <p className="font-semibold">{formatCurrencyLabel(api.pricing_from)}</p>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link to={`/api/${api.slug}`}>مشاهده جزئیات و مستندات</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="section-frame grid gap-6 lg:grid-cols-[1fr,1fr]">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                کلید و نمونه اتصال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <code className="block rounded-md border border-border bg-background/70 p-3 text-left text-xs text-muted-foreground" dir="ltr">
                {profile?.api_key_preview || "No key generated"}
              </code>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button className="gap-2" onClick={rotateKey} disabled={generateLegacyAPIKey.isPending}>
                  <Zap className="h-4 w-4" />
                  {generateLegacyAPIKey.isPending ? "در حال ساخت..." : profile?.has_api_key ? "چرخش کلید" : "ساخت کلید"}
                </Button>
                <Button variant="outline" className="gap-2" onClick={copyIntegration}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  کپی نمونه
                </Button>
              </div>
              <pre className="max-h-44 overflow-auto rounded-md border border-border bg-slate-950 p-3 text-left text-xs leading-6 text-cyan-100" dir="ltr">
                <code>{integrationSnippet}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                دسترسی‌ها و دسته‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {topCategories.map((category) => (
                  <Button key={category.slug} variant="outline" className="justify-between" asChild>
                    <Link to={`/browse?category=${category.slug}`}>
                      <span>{category.name}</span>
                      <span className="text-xs opacity-70">{formatFaNumber(category.apis_count)}</span>
                    </Link>
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                {(accessGrants?.results || []).slice(0, 3).map((grant) => (
                  <Link
                    key={grant.id}
                    to={`/api/${grant.api.slug}`}
                    className="flex items-center gap-3 rounded-md border border-border bg-background/70 p-3 hover:border-primary/40"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{grant.api.name}</span>
                    <Badge variant={grant.status === "active" ? "default" : "secondary"}>{grant.status}</Badge>
                  </Link>
                ))}
                {!accessGrants?.results.length ? <p className="text-sm text-muted-foreground">هنوز دسترسی فعالی ثبت نشده است.</p> : null}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;