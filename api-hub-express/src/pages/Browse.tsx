import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAPIs, useCategories } from "@/hooks/useApi";
import { getBrowseBootstrap } from "@/lib/bootstrap";
import { createBreadcrumbSchema, usePageMetadata } from "@/lib/metadata";
import { formatCurrencyLabel, formatFaNumber, toSiteUrl } from "@/lib/site";
import type { APISummary } from "@/lib/api";

const orderingOptions = [
  { label: "بهترین امتیاز", value: "-rating" },
  { label: "پربازدیدترین", value: "-views_count" },
  { label: "تازه‌ترین", value: "-created_at" },
  { label: "نام", value: "name" },
];

export default function Browse() {
  const bootstrap = getBrowseBootstrap();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page") || "1");
  const selectedCategory = searchParams.get("category") || "";
  const ordering = searchParams.get("ordering") || "-rating";
  const [searchValue, setSearchValue] = useState(initialSearch);
  const hasActiveFilters = Boolean(searchParams.get("search") || selectedCategory || ordering !== "-rating");
  const showCategorizedResults = !searchParams.get("search") && !selectedCategory;
  const pageSize = showCategorizedResults ? 100 : 12;

  const apiParams = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      category: selectedCategory || undefined,
      ordering,
      page: currentPage,
      page_size: pageSize,
    }),
    [currentPage, ordering, pageSize, searchParams, selectedCategory],
  );

  const defaultBrowseData =
    currentPage === 1 && !selectedCategory && !searchParams.get("search") && ordering === "-rating"
      ? bootstrap?.apis
      : undefined;

  const { data: categories } = useCategories(undefined, { initialData: bootstrap?.categories });
  const { data: recommendedApis } = useAPIs(
    { featured: true, ordering: "-rating" },
    { initialData: bootstrap?.recommendedApis },
  );
  const { data: apis, isLoading, isError } = useAPIs(apiParams, { initialData: defaultBrowseData });
  const selectedCategoryLabel = categories?.results.find((category) => category.slug === selectedCategory)?.name;
  const categorizedResults = useMemo(() => {
    const categoryOrder = new Map((categories?.results || []).map((category, index) => [category.slug, index]));
    const groups = new Map<string, { slug: string; name: string; apis: APISummary[] }>();

    (apis?.results || []).forEach((api) => {
      const slug = api.category?.slug || "uncategorized";
      const name = api.category?.name || "بدون دسته";
      const current = groups.get(slug) || { slug, name, apis: [] };
      current.apis.push(api);
      groups.set(slug, current);
    });

    return Array.from(groups.values()).sort((left, right) => {
      const leftIndex = categoryOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = categoryOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex || left.name.localeCompare(right.name);
    });
  }, [apis?.results, categories?.results]);

  usePageMetadata({
    title: "کشف APIها",
    description: "فهرست APIها را با جست‌وجو، دسته‌بندی و مرتب‌سازی دقیق بررسی کنید و سریع‌تر سرویس مناسب محصول خود را پیدا کنید.",
    path: "/browse",
    structuredData: [
      createBreadcrumbSchema([
        { name: "خانه", path: "/" },
        { name: "کشف APIها", path: "/browse" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "کشف APIها",
        url: toSiteUrl("/browse"),
        description: "فهرست APIها با جست‌وجو، دسته‌بندی و مرتب‌سازی.",
        mainEntity: (apis?.results || []).slice(0, 10).map((api) => ({
          "@type": "SoftwareApplication",
          name: api.name,
          url: toSiteUrl(`/api/${api.slug}`),
          applicationCategory: "DeveloperApplication",
        })),
      },
    ],
  });

  const updateParams = (patch: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    if (!patch.page) {
      nextParams.delete("page");
    }
    startTransition(() => setSearchParams(nextParams));
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      search: searchValue.trim() || undefined,
      page: undefined,
    });
  };

  const totalPages = apis ? Math.max(1, Math.ceil(apis.count / pageSize)) : 1;

  const renderApiCard = (api: NonNullable<typeof apis>["results"][number]) => (
    <Card key={api.slug} className="surface-card">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline">{api.category?.name || "بدون دسته"}</Badge>
          <div className="flex gap-2">
            {api.is_featured ? <Badge>ویژه</Badge> : null}
            {api.is_popular ? <Badge variant="secondary">محبوب</Badge> : null}
          </div>
        </div>
        <CardTitle>{api.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="min-h-16 text-sm leading-7 text-muted-foreground">
          {api.short_description || "توضیح کوتاه این API هنوز ثبت نشده است."}
        </p>
        <div className="flex flex-wrap gap-2">
          <ApiStatusBadge status={api.status} />
          <HealthSignalBadge />
          <AuthSchemeBadge scheme={api.rapidapi.public_auth_scheme} />
          <MethodBadge method="GET" />
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
          <Link to={`/api/${api.slug}`}>جزئیات API</Link>
        </Button>
      </CardContent>
    </Card>
  );

const Browse = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">مرور APIها</h1>
          <p className="text-muted-foreground text-lg">
            هزاران API را برای توانمندسازی برنامه‌های خود کشف کنید
          </p>
        </div>

      <main id="main-content" className="container page-stack">
        <section className="page-hero space-y-6">
          <div className="space-y-3">
            <p className="eyebrow">کشف و انتخاب</p>
            <h1 className="section-title">APIها را با فیلترهای دقیق و نتیجه‌های قابل مقایسه پیدا کنید</h1>
            <p className="section-copy">
              نتیجه‌ها بر اساس دسته‌بندی، جست‌وجو و مرتب‌سازی به‌روز نمایش داده می‌شوند تا انتخاب سرویس برای تیم‌های فنی سریع‌تر و مطمئن‌تر شود.
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "همه دسته‌ها" ? "default" : "outline"}
                size="sm"
                className={category === "همه دسته‌ها" ? "bg-gradient-primary" : ""}
              >
                <div className="space-y-2">
                  <label htmlFor="browse-search" className="text-sm font-medium text-foreground">
                    جست‌وجوی نام یا کاربرد API
                  </label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="browse-search"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="مثلا پرداخت، نقشه، پیامک، هوش مصنوعی"
                      className="pr-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="browse-ordering" className="text-sm font-medium text-foreground">
                    نمایش بر اساس
                  </label>
                  <select
                    id="browse-ordering"
                    value={ordering}
                    onChange={(event) => updateParams({ ordering: event.target.value, page: undefined })}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {orderingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <Button type="submit" className="w-full">
                    نمایش نتایج
                  </Button>
                  {hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSearchValue("");
                        updateParams({
                          search: undefined,
                          category: undefined,
                          ordering: "-rating",
                          page: undefined,
                        });
                      }}
                    >
                      حذف فیلترها
                    </Button>
                  ) : null}
                </div>
              </form>

              <div className="lg:col-span-3 flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory ? "outline" : "default"}
                  size="sm"
                  onClick={() => updateParams({ category: undefined, page: undefined })}
                >
                  همه دسته‌ها
                </Button>
                {categories?.results.map((category) => (
                  <Button
                    key={category.slug}
                    variant={selectedCategory === category.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateParams({ category: category.slug, page: undefined })}
                  >
                    {category.name}
                    <span className="mr-1 text-xs opacity-70">{formatFaNumber(category.apis_count)}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <RapidApiSyncPanel compact />

        {!searchParams.get("search") && !selectedCategory ? (
          <section className="section-frame space-y-5">
            <div className="space-y-2">
              <p className="eyebrow">برای شروع</p>
              <h2 className="text-2xl font-bold">APIهای پیشنهادی برای بررسی سریع</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(recommendedApis?.results || []).slice(0, 3).map((api) => (
                <Card key={api.slug} className="surface-card">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{api.category?.name || "بدون دسته"}</Badge>
                      <span className="text-sm text-muted-foreground">امتیاز {api.rating}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{api.name}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{api.short_description}</p>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/api/${api.slug}`}>جزئیات API</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section-frame space-y-6" aria-live="polite" aria-busy={isLoading}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">نتایج</h2>
              <p className="text-sm text-muted-foreground">
                {apis ? `${formatFaNumber(apis.count)} API پیدا شد` : "در حال بارگذاری نتایج"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategory ? <Badge variant="outline">دسته: {selectedCategoryLabel || selectedCategory}</Badge> : null}
              {searchParams.get("search") ? <Badge variant="outline">عبارت: {searchParams.get("search")}</Badge> : null}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">۱۰,۰۰۰+</p>
                <p className="text-sm text-muted-foreground">API موجود</p>
              </div>
            </div>
          ) : isError ? (
            <Card className="border-destructive/30">
              <CardContent className="p-6 text-destructive">بارگذاری فهرست APIها انجام نشد. دوباره تلاش کنید.</CardContent>
            </Card>
          ) : apis && apis.results.length > 0 ? (
            <>
              {showCategorizedResults ? (
                <div className="space-y-8">
                  {categorizedResults.map((group) => (
                    <section key={group.slug} className="space-y-4" aria-labelledby={`category-${group.slug}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                        <div className="space-y-1">
                          <h3 id={`category-${group.slug}`} className="text-xl font-bold">
                            {group.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatFaNumber(group.apis.length)} API
                          </p>
                        </div>
                        {group.slug !== "uncategorized" ? (
                          <Button variant="outline" size="sm" onClick={() => updateParams({ category: group.slug, page: undefined })}>
                            دیدن همه
                          </Button>
                        ) : null}
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{group.apis.map(renderApiCard)}</div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{apis.results.map(renderApiCard)}</div>
              )}

              {totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  صفحه {formatFaNumber(currentPage)} از {formatFaNumber(totalPages)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateParams({ page: currentPage > 1 ? String(currentPage - 1) : undefined })}
                    disabled={currentPage <= 1}
                  >
                    قبلی
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateParams({ page: currentPage < totalPages ? String(currentPage + 1) : String(currentPage) })
                    }
                    disabled={currentPage >= totalPages}
                  >
                    بعدی
                  </Button>
                </div>
              </div>
              ) : null}
            </>
          ) : (
            <Card>
              <CardContent className="space-y-3 p-8 text-center">
                <h2 className="text-xl font-semibold">نتیجه‌ای پیدا نشد</h2>
                <p className="text-muted-foreground">فیلترها را ساده‌تر کنید یا با عبارت دیگری جست‌وجو کنید.</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button variant="outline" disabled>قبلی</Button>
          <Button variant="default" className="bg-gradient-primary">۱</Button>
          <Button variant="outline">۲</Button>
          <Button variant="outline">۳</Button>
          <Button variant="outline">بعدی</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;