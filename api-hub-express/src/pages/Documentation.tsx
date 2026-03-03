import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Code2, Zap, Shield, Users, Terminal, Rocket } from "lucide-react";

const Documentation = () => {
  const sections = [
    {
      title: "شروع کار",
      icon: Rocket,
      color: "text-primary",
      links: ["راهنمای شروع سریع", "ساخت حساب کاربری", "دریافت کلید API", "اولین درخواست"],
    },
    {
      title: "احراز هویت",
      icon: Shield,
      color: "text-secondary",
      links: ["احراز هویت کلید API", "جریان OAuth 2.0", "بهترین شیوه‌های امنیتی", "مدیریت کلیدهای API"],
    },
    {
      title: "مرجع API",
      icon: Code2,
      color: "text-accent",
      links: ["نقاط پایانی REST API", "فرمت درخواست و پاسخ", "کدهای خطا", "محدودیت نرخ"],
    },
    {
      title: "SDK و کتابخانه‌ها",
      icon: Terminal,
      color: "text-primary",
      links: ["JavaScript/Node.js", "Python", "Ruby", "PHP"],
    },
    {
      title: "بهترین شیوه‌ها",
      icon: Zap,
      color: "text-secondary",
      links: ["بهینه‌سازی عملکرد", "استراتژی‌های کش", "مدیریت خطا", "تست یکپارچه‌سازی"],
    },
    {
      title: "پشتیبانی",
      icon: Users,
      color: "text-accent",
      links: ["سوالات متداول", "انجمن", "تماس با پشتیبانی", "گزارش مشکل"],
    },
  ];

const playbooks = [
  {
    title: "ساخت حساب و تکمیل پروفایل",
    copy: "حساب توسعه‌دهنده را بسازید، پروفایل را کامل کنید و از داشبورد وضعیت دسترسی‌ها و مصرف سرویس‌ها را ببینید.",
    icon: TerminalSquare,
  },
  {
    title: "بررسی مستندات و نمونه درخواست",
    copy: "برای هر سرویس، توضیح فنی، پلن‌ها، وضعیت دسترسی و نمونه درخواست را کنار هم بخوانید تا تصمیم‌گیری ساده‌تر شود.",
    icon: FileCode2,
  },
  {
    title: "فعال‌سازی پلن و پایش مصرف",
    copy: "پلن مناسب را انتخاب کنید و بعد از فعال‌سازی، مصرف و وضعیت سرویس را از پرتال پیگیری کنید.",
    icon: Activity,
  },
];

const client = iranapi.init({
  apiKey: 'YOUR_API_KEY'
});

export default function Documentation() {
  const bootstrap = getDocumentationBootstrap();
  const { data: apis } = useAPIs({ ordering: "name", page_size: 100 }, { initialData: bootstrap?.apis });
  const [selectedApi, setSelectedApi] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());
  const { data: docs, isLoading } = useDocumentations(selectedApi || undefined, undefined, {
    initialData: !selectedApi ? bootstrap?.documentations : undefined,
  });

  usePageMetadata({
    title: "مستندات",
    description:
      "مستندات فنی، نمونه درخواست‌ها و وضعیت سرویس‌ها را در مرکز راهنمای IranAPI مرور کنید.",
    path: "/documentation",
    structuredData: [
      createBreadcrumbSchema([
        { name: "خانه", path: "/" },
        { name: "مستندات", path: "/documentation" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "مستندات IranAPI",
        url: toSiteUrl("/documentation"),
      },
    ],
  });

  const documentationItems = useMemo(() => docs?.results || [], [docs?.results]);
  const filteredDocs = useMemo(() => {
    if (!deferredSearch) {
      return documentationItems;
    }

    return documentationItems.filter(
      (doc) => doc.title.toLowerCase().includes(deferredSearch) || doc.content.toLowerCase().includes(deferredSearch),
    );
  }, [deferredSearch, documentationItems]);

  const selectedApiName = apis?.results.find((api) => api.slug === selectedApi)?.name || "همه APIها";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">مستندات</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            همه چیزهایی که برای یکپارچه‌سازی و استفاده از APIهای بازار ما نیاز دارید
          </p>
        </div>

      <main id="main-content" className="container page-stack">
        <section className="cyber-doc-hero overflow-hidden">
          <div className="cyber-grid" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1.08fr,0.92fr] lg:items-center">
            <div className="space-y-6">
              <span className="cyber-kicker">
                <CircuitBoard className="h-4 w-4" />
                مرکز مستندات توسعه‌دهنده
              </span>

              <div className="space-y-4">
                <h1 className="cyber-display">مستندات روشن برای اتصال سریع‌تر به APIها</h1>
                <p className="section-copy">
                  این صفحه مستندات بک‌اند را به شکل قابل جست‌وجو نمایش می‌دهد، فیلتر هر API را نگه می‌دارد و مسیر استفاده از هر سرویس را بدون شلوغی نشان می‌دهد.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {operatingSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div key={signal.label} className="signal-tile">
                      <Icon className="h-4 w-4 text-accent" />
                      <span className="text-[11px] uppercase text-muted-foreground">{signal.label}</span>
                      <strong>{signal.value}</strong>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/browse" className="gap-2">
                    کشف APIها
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/api/speech-gateway" className="gap-2">
                    مشاهده نمونه سرویس
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div>
              <Card className="bg-card p-4">
                <pre className="text-sm text-muted-foreground overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </Card>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sections.map((section) => (
            <Card key={section.title} className="p-6 hover:shadow-glow transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-gradient-primary transition-all">
                  <section.icon className={`h-6 w-6 ${section.color} group-hover:text-primary-foreground`} />
                </div>
                <h3 className="text-xl font-bold">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      {link}
                    </a>
                  </li>
                ))}
                <div className="rounded-md border border-accent/25 bg-accent/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Zap className="h-4 w-4 text-accent" />
                    وضعیت مستندات
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <span>docs: {isLoading ? "syncing..." : `${formatFaNumber(documentationItems.length)} سند فعال`}</span>
                    <span>scope: {selectedApiName}</span>
                    <span>query: {searchValue || "بدون جست‌وجو"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RapidApiSyncPanel compact />

        <section className="docs-control-deck">
          <div className="space-y-2">
            <label htmlFor="documentation-search" className="text-sm font-semibold text-foreground">
              جست‌وجو در مستندات
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="documentation-search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="عنوان، محتوا یا کلیدواژه فنی"
                className="h-12 pr-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="documentation-api" className="text-sm font-semibold text-foreground">
              فیلتر بر اساس API
            </label>
            <select
              id="documentation-api"
              value={selectedApi}
              onChange={(event) => setSelectedApi(event.target.value)}
              className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">همه APIها</option>
              {apis?.results.map((api) => (
                <option key={api.slug} value={api.slug}>
                  {api.name}
                </option>
              ))}
            </select>
          </div>

          <div className="docs-count-card">
            <span>سند پیدا شده</span>
            <strong>{isLoading ? "..." : formatFaNumber(filteredDocs.length)}</strong>
          </div>
        </section>

        <section className="section-frame grid gap-6 xl:grid-cols-[1fr,360px]" aria-busy={isLoading}>
          <Card className="surface-card docs-list-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                مستندات موجود
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="doc-skeleton" />
                  ))}
                </div>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc, index) => (
                  <article key={doc.slug} className="doc-record">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="record-index">{formatFaNumber(index + 1)}</span>
                        <h3 className="text-lg font-semibold">{doc.title}</h3>
                      </div>
                      <Badge variant="outline">{doc.api_slug}</Badge>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{doc.content}</p>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <Braces className="h-8 w-8 text-primary" />
                  <p className="font-semibold text-foreground">برای این فیلتر سندی پیدا نشد.</p>
                  <p className="text-sm text-muted-foreground">عبارت جست‌وجو را ساده‌تر کنید یا فیلتر API را روی همه سرویس‌ها بگذارید.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <aside className="grid gap-4 content-start">
            {playbooks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="surface-card playbook-card">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Icon className="h-5 w-5 text-accent" />
                      <span className="record-index">{formatFaNumber(index + 1)}</span>
                    </div>
                    <h2 className="text-base font-semibold">{item.title}</h2>
                    <p className="text-sm leading-7 text-muted-foreground">{item.copy}</p>
                  </CardContent>
                </Card>
              );
            })}

            <Button variant="outline" asChild>
              <Link to="/browse" className="gap-2">
                رفتن به فهرست APIها
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;