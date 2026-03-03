import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAPIs, useCategories } from "@/hooks/useApi";
import heroBg from "@/assets/hero-bg.jpg";
import heroBg480 from "@/assets/hero-bg-480.webp";
import heroBg768 from "@/assets/hero-bg-768.webp";
import heroBg960 from "@/assets/hero-bg-960.webp";
import { getHomeBootstrap } from "@/lib/bootstrap";
import { usePageMetadata } from "@/lib/metadata";
import { DEFAULT_DESCRIPTION, formatCurrencyLabel, formatFaNumber, SITE_NAME, toSiteUrl } from "@/lib/site";

export default function Index() {
  const bootstrap = getHomeBootstrap();
  const { data: apis, isLoading: apisLoading } = useAPIs({ ordering: "-rating" }, { initialData: bootstrap?.apis });
  const { data: featuredApis, isLoading: featuredLoading } = useAPIs(
    { featured: true, ordering: "-rating" },
    { initialData: bootstrap?.featuredApis },
  );
  const { data: categories, isLoading: categoriesLoading } = useCategories(undefined, {
    initialData: bootstrap?.categories,
  });

  const featured = featuredApis?.results ?? [];
  const categoryItems = categories?.results.slice(0, 4) ?? [];
  const apiCount = apis?.count ?? 0;
  const categoryCount = categories?.count ?? 0;

  usePageMetadata({
    title: "هاب API برای تیم‌های ایرانی",
    description: DEFAULT_DESCRIPTION,
    path: "/",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: toSiteUrl("/"),
        inLanguage: "fa-IR",
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          "@type": "SearchAction",
          target: `${toSiteUrl("/browse")}?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "کشف APIها در IranAPI",
        url: toSiteUrl("/"),
        description: DEFAULT_DESCRIPTION,
      },
    ],
  });

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main id="main-content" className="container page-stack">
        <section className="page-hero grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="cyber-kicker">هاب API برای تیم‌های محصول، داده و توسعه</span>
            <div className="space-y-4">
              <h1 className="section-title cyber-title">API مناسب را سریع پیدا کنید، مطمئن مقایسه کنید و بی‌دردسر متصل شوید</h1>
              <p className="section-copy">
                IranAPI فهرست سرویس‌ها، مستندات، قیمت‌گذاری و وضعیت دسترسی را کنار هم می‌آورد تا تیم شما بدون جست‌وجوی پراکنده، API درست را انتخاب و مدیریت کند.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/browse" className="gap-2">
                  کشف APIها
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/documentation">مطالعه مستندات</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="stat-chip">
                <Sparkles className="h-4 w-4 text-primary" />
                {apisLoading ? "..." : `${formatFaNumber(apiCount)} API فعال`}
              </span>
              <span className="stat-chip">
                <Blocks className="h-4 w-4 text-primary" />
                {categoriesLoading ? "..." : `${formatFaNumber(categoryCount)} دسته‌بندی`}
              </span>
              <span className="stat-chip">
                <ShieldCheck className="h-4 w-4 text-primary" />
                داده یکپارچه، مستندات روشن، دسترسی قابل پیگیری
              </span>
            </div>
          </div>

          <Card className="surface-card">
            <div className="vault-visual">
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${heroBg480} 480w, ${heroBg768} 768w, ${heroBg960} 960w`}
                  sizes="(min-width: 1024px) 36vw, 92vw"
                />
                <img
                  src={heroBg}
                  alt="نمای تصویری کنسول توسعه‌دهنده برای مدیریت APIها"
                  width="960"
                  height="540"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                ساخته‌شده برای تصمیم‌های روزمره تیم فنی
              </Badge>
              <h2 className="text-xl font-semibold leading-tight tracking-tight">از انتخاب سرویس تا مدیریت دسترسی، همه چیز در یک جریان ساده</h2>
            </CardHeader>
            <CardContent className="content-list text-sm leading-7 text-muted-foreground">
              <div className="metric-card">
                <p className="mb-2 font-semibold text-foreground">جست‌وجوی سریع و قابل اعتماد</p>
                <p>سرویس‌ها با دسته‌بندی، جست‌وجو و مرتب‌سازی روشن نمایش داده می‌شوند تا گزینه مناسب زودتر پیدا شود.</p>
              </div>
              <div className="metric-card">
                <p className="mb-2 font-semibold text-foreground">مستندات و قیمت‌گذاری کنار هم</p>
                <p>جزئیات فنی، پلن‌ها و وضعیت آماده‌بودن هر API در یک صفحه دیده می‌شود تا مقایسه کوتاه‌تر شود.</p>
              </div>
              <div className="metric-card">
                <p className="mb-2 font-semibold text-foreground">داشبورد آماده برای عملیات</p>
                <p>دسترسی‌ها، اشتراک‌ها و مصرف سرویس‌ها در یک کنسول قابل پیگیری می‌ماند.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <RapidApiSyncPanel />

        <section className="section-frame grid gap-4 md:grid-cols-3">
          <Card className="surface-card">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm text-muted-foreground">APIهای قابل بررسی</p>
              <p className="text-3xl font-bold">{apisLoading ? "..." : formatFaNumber(apiCount)}</p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm text-muted-foreground">دسته‌بندی‌ها</p>
              <p className="text-3xl font-bold">{categoriesLoading ? "..." : formatFaNumber(categoryCount)}</p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm text-muted-foreground">الگوی دسترسی</p>
              <p className="text-xl font-semibold">IranAPI Vault</p>
            </CardContent>
          </Card>
        </section>

        <section className="section-frame space-y-6">
          <div className="space-y-3">
              <p className="eyebrow">دسته‌های پرکاربرد</p>
            <h2 className="text-2xl font-bold md:text-3xl">از حوزه‌ای شروع کنید که به محصول شما نزدیک‌تر است</h2>
            <p className="section-copy">دسته‌ها برای اسکن سریع بازار API چیده شده‌اند؛ از پرداخت و داده تا ارتباطات و هوش مصنوعی.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categoryItems.map((category) => (
              <Card key={category.slug} className="surface-card">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{category.name_en}</Badge>
                    <span className="text-sm text-muted-foreground">{formatFaNumber(category.apis_count)} سرویس</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{category.description}</p>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/browse?category=${category.slug}`}>دیدن APIهای این دسته</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="section-frame space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <p className="eyebrow">پیشنهادهای شروع</p>
              <h2 className="text-2xl font-bold md:text-3xl">APIهایی که ارزش بررسی سریع دارند</h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/browse">دیدن همه APIها</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(featuredLoading ? [] : featured.slice(0, 6)).map((api) => (
              <Card key={api.slug} className="surface-card">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{api.category?.name || "بدون دسته"}</Badge>
                    {api.is_popular ? <Badge>محبوب</Badge> : null}
                  </div>
                  <CardTitle>{api.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="min-h-16 text-sm leading-7 text-muted-foreground">
                    {api.short_description || "توضیح کوتاه این API هنوز ثبت نشده است."}
                  </p>
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

        <section className="section-frame grid gap-4 md:grid-cols-3">
          <Card className="surface-card">
            <CardContent className="space-y-3 p-6">
              <Zap className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">تصمیم‌گیری سریع‌تر</h3>
              <p className="text-sm leading-7 text-muted-foreground">از جست‌وجوی اولیه تا انتخاب پلن و خواندن مستندات، مسیرها کوتاه و قابل پیش‌بینی هستند.</p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardContent className="space-y-3 p-6">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">اطلاعات قابل اتکا</h3>
              <p className="text-sm leading-7 text-muted-foreground">متادیتای سرویس، روش احراز هویت و وضعیت انتشار با ساختاری یکدست نمایش داده می‌شود.</p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardContent className="space-y-3 p-6">
              <ChartNoAxesColumn className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">پیشنهادهای مرتبط‌تر</h3>
              <p className="text-sm leading-7 text-muted-foreground">APIهای برجسته، دسته‌های نزدیک و سرویس‌های مشابه کمک می‌کنند انتخاب بعدی واضح‌تر باشد.</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
