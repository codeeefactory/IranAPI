import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAPIs, useCurrentSubscription, usePricingPlans, useSubscriptionPlans } from "@/hooks/useApi";
import { getPricingBootstrap } from "@/lib/bootstrap";
import { createBreadcrumbSchema, usePageMetadata } from "@/lib/metadata";
import { formatCurrencyLabel, formatFaNumber, toSiteUrl } from "@/lib/site";

export default function Pricing() {
  const bootstrap = getPricingBootstrap();
  const { data: pricingPlans, isLoading } = usePricingPlans(undefined, undefined, {
    initialData: bootstrap?.pricingPlans,
  });
  const { data: subscriptionPlans, isLoading: subscriptionsLoading } = useSubscriptionPlans();
  const { data: currentSubscription } = useCurrentSubscription();
  const { data: apis } = useAPIs({ ordering: "name", page_size: 100 }, { initialData: bootstrap?.apis });
  const apiMap = new Map((apis?.results || []).map((api) => [api.slug, api.name]));
  const activeSubscription = currentSubscription?.subscription?.status === "active" ? currentSubscription.subscription : null;
  const activeSubscriptionPlanId = activeSubscription?.plan.id;

  usePageMetadata({
    title: "قیمت‌گذاری",
    description: "پلن‌های فعال، سقف مصرف و وضعیت آماده‌بودن سرویس‌ها را قبل از انتخاب و فعال‌سازی در IranAPI مقایسه کنید.",
    path: "/pricing",
    structuredData: [
      createBreadcrumbSchema([
        { name: "خانه", path: "/" },
        { name: "قیمت‌گذاری", path: "/pricing" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "قیمت‌گذاری APIها",
        url: toSiteUrl("/pricing"),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            قیمت‌گذاری ساده و شفاف
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            پلن مناسب برای نیازهای خود را انتخاب کنید. همه پلن‌ها شامل دسترسی به کل بازار API ما هستند.
          </p>
        </div>

      <main id="main-content" className="container page-stack">
        <section className="page-hero space-y-6">
          <div className="space-y-3">
            <p className="eyebrow">پلن‌ها و ظرفیت‌ها</p>
            <h1 className="section-title">قیمت، سقف مصرف و وضعیت سرویس‌ها را یک‌جا مقایسه کنید</h1>
            <p className="section-copy">
              این صفحه اشتراک‌های حساب کاربری و پلن‌های هر API را از بک‌اند نمایش می‌دهد تا هزینه، ظرفیت و آمادگی سرویس‌ها شفاف باشد.
            </p>
          </div>

          <div className="section-frame grid gap-4 md:grid-cols-3">
            <Card className="surface-card">
              <CardContent className="space-y-2 p-6">
                <p className="text-sm text-muted-foreground">پلن‌های فعال</p>
                <p className="text-3xl font-bold">{formatFaNumber(pricingPlans?.count || 0)}</p>
              </CardContent>
            </Card>
            <Card className="surface-card">
              <CardContent className="space-y-2 p-6">
                <p className="text-sm text-muted-foreground">APIهای دارای پلن</p>
                <p className="text-3xl font-bold">{formatFaNumber(new Set((pricingPlans?.results || []).map((item) => item.api_slug)).size)}</p>
              </CardContent>
            </Card>
            <Card className="surface-card">
              <CardContent className="space-y-2 p-6">
                <p className="text-sm text-muted-foreground">پلن‌های محبوب</p>
                <p className="text-3xl font-bold">{formatFaNumber((pricingPlans?.results || []).filter((item) => item.is_popular).length)}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <RapidApiSyncPanel compact />

        <section className="section-frame space-y-6">
          <div className="space-y-2">
            <p className="eyebrow">اشتراک توسعه‌دهنده</p>
            <h2 className="text-2xl font-bold">پلن‌های عضویت IranAPI</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              این پلن‌ها ظرفیت انتشار API، سقف مصرف ماهانه و امکانات داشبورد را برای حساب توسعه‌دهنده مشخص می‌کنند.
            </p>
          </div>

          {activeSubscription ? (
            <Card className="surface-card border-primary/35 bg-primary/5">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Current active subscription</p>
                  <p className="text-sm text-muted-foreground">
                    {activeSubscription.plan.name} - renews {formatFaNumber(activeSubscription.days_remaining)} days from now
                  </p>
                </div>
                <Badge>{activeSubscription.status}</Badge>
              </CardContent>
            </Card>
          ) : null}

          {subscriptionsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="h-72 animate-pulse bg-muted/60" />
              ))}
            </div>
          ) : subscriptionPlans?.results && subscriptionPlans.results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {subscriptionPlans.results.map((plan) => (
                <Card key={plan.id} className="surface-card">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline">{plan.plan_type}</Badge>
                      {plan.is_popular ? <Badge>محبوب</Badge> : null}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-bold">
                      {formatCurrencyLabel(plan.price, plan.currency)}
                      <span className="text-sm font-normal text-muted-foreground"> / ماه</span>
                    </p>
                    <p className="min-h-14 text-sm leading-7 text-muted-foreground">{plan.description}</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        انتشار API:{" "}
                        {plan.api_publish_limit === null ? "نامحدود" : `${formatFaNumber(plan.api_publish_limit)} API`}
                      </p>
                      <p>
                        درخواست ماهانه:{" "}
                        {plan.included_requests === null ? "نامحدود" : formatFaNumber(plan.included_requests)}
                      </p>
                    </div>
                    {plan.features.length > 0 ? (
                      <ul className="space-y-2 rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                        {plan.features.map((feature) => (
                          <li key={feature}>• {feature}</li>
                        ))}
                      </ul>
                    ) : null}
                    <Button className="w-full" asChild={activeSubscriptionPlanId !== plan.id} disabled={activeSubscriptionPlanId === plan.id}>
                      <Link to={`/payment?subscription=${plan.id}`}>انتخاب این اشتراک</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
            <CardContent className="p-8 text-center text-muted-foreground">هنوز پلن اشتراکی فعالی ثبت نشده است.</CardContent>
            </Card>
          )}
        </section>

        <h2 className="sr-only">Pricing plans list</h2>

        {isLoading ? (
          <div className="section-frame grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-64 animate-pulse bg-muted/60" />
            ))}
          </div>
        ) : pricingPlans?.results && pricingPlans.results.length > 0 ? (
          <div className="section-frame grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pricingPlans.results.map((plan) => (
              <Card key={plan.id} className="surface-card">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{apiMap.get(plan.api_slug) || plan.api_slug}</Badge>
                    {plan.is_popular ? <Badge>محبوب</Badge> : null}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-2xl font-bold">{formatCurrencyLabel(plan.price, plan.currency)}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>نوع پلن: {plan.plan_type}</p>
                    <p>درخواست روزانه: {plan.requests_per_day ? formatFaNumber(plan.requests_per_day) : "نامشخص"}</p>
                    <p>درخواست ماهانه: {plan.requests_per_month ? formatFaNumber(plan.requests_per_month) : "نامشخص"}</p>
                    <p>وضعیت دسترسی: {plan.is_listed_on_rapidapi ? "آماده فعال‌سازی" : "در حال آماده‌سازی"}</p>
                  </div>
                  {plan.features.length > 0 ? (
                    <ul className="space-y-2 rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                      {plan.features.map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex gap-3">
                    <Button className="flex-1" asChild>
                      <Link to={`/payment?plan=${plan.id}`}>
                        {plan.is_listed_on_rapidapi ? "شروع فعال‌سازی" : "مشاهده وضعیت"}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/api/${plan.api_slug}`}>جزئیات API</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="space-y-4 p-8 text-center">
              <h2 className="text-xl font-semibold">هنوز پلنی برای نمایش وجود ندارد</h2>
              <p className="text-muted-foreground">بعد از ثبت پلن‌های قیمت‌گذاری در بک‌اند، این بخش به‌صورت خودکار به‌روز می‌شود.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;