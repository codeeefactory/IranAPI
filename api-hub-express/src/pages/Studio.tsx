import {
  Activity,
  BarChart3,
  CheckCircle2,
  Globe2,
  Layers3,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  TerminalSquare,
  TestTube2,
  Wand2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAPIs, useReleaseAPI } from "@/hooks/useApi";
import { useI18n } from "@/lib/i18n";
import { usePageMetadata } from "@/lib/metadata";

const defaultProjectForm = {
  name: "",
  baseUrl: "",
  documentationUrl: "",
  authScheme: "api-key",
  category: "Community",
  tags: "",
  description: "",
};

const studioTabs = [
  { id: "projects", label: "studio.tabProjects", icon: Layers3 },
  { id: "requests", label: "studio.tabRequests", icon: TerminalSquare },
  { id: "tests", label: "studio.tabTests", icon: TestTube2 },
  { id: "listing", label: "studio.tabListing", icon: Globe2 },
  { id: "analytics", label: "studio.tabAnalytics", icon: BarChart3 },
  { id: "inbox", label: "studio.tabInbox", icon: MessageSquare },
  { id: "settings", label: "studio.tabSettings", icon: Settings },
] as const;

const featurePanels = {
  requests: { title: "studio.requestsTitle", copy: "studio.requestsCopy", icon: TerminalSquare, action: "studio.runTest" },
  tests: { title: "studio.testsTitle", copy: "studio.testsCopy", icon: TestTube2, action: "studio.runTest" },
  listing: { title: "studio.listingTitle", copy: "studio.listingCopy", icon: Globe2, action: "studio.publish" },
  analytics: { title: "studio.analyticsTitle", copy: "studio.analyticsCopy", icon: BarChart3, action: "studio.configure" },
  inbox: { title: "studio.inboxTitle", copy: "studio.inboxCopy", icon: MessageSquare, action: "studio.configure" },
  settings: { title: "studio.settingsTitle", copy: "studio.settingsCopy", icon: Settings, action: "studio.configure" },
} as const;

export default function Studio() {
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof studioTabs)[number]["id"]>("projects");
  const [form, setForm] = useState(defaultProjectForm);
  const { data: apiProjects } = useAPIs({ owned: true, search: query, ordering: "-updated_at", page_size: 100 });
  const releaseAPI = useReleaseAPI();
  const { dir, t } = useI18n();

  usePageMetadata({
    title: t("studio.title"),
    description: t("studio.metaDescription"),
    path: "/studio",
    noindex: true,
  });

  const projects = useMemo(() => {
    return (apiProjects?.results || [])
      .map((api, index) => ({
        id: api.id,
        name: api.name_en || api.name,
        slug: api.slug,
        description: api.short_description || api.description || "API project created from Studio.",
        updatedAt: api.updated_at,
        favorite: index === 0,
        status: api.rapidapi.publication_status || api.status,
      }))
      .filter((project) => (favoritesOnly ? project.favorite : true));
  }, [apiProjects?.results, favoritesOnly]);

  const submitProject = async (event: FormEvent) => {
    event.preventDefault();
    await releaseAPI.mutateAsync({
      name: form.name.trim(),
      base_url: form.baseUrl.trim(),
      documentation_url: form.documentationUrl.trim() || undefined,
      auth_scheme: form.authScheme as "api-key" | "bearer" | "oauth2" | "basic" | "none",
      category: form.category.trim() || "Community",
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      description: form.description.trim(),
    });
    setForm(defaultProjectForm);
    setCreateOpen(false);
  };

  const hasProjects = projects.length > 0;
  const panel = activeTab === "projects" ? null : featurePanels[activeTab];

  return (
    <div className="cyber-shell min-h-screen bg-background" dir={dir}>
      <Navigation />
      <main id="main-content" className="container py-7">
        <section className="rounded-md border border-border/70 bg-card/90 p-6 shadow-card backdrop-blur-xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{t("studio.eyebrow")}</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">{t("studio.title")}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("studio.subtitle")}</p>
            </div>
            <Button className="gap-2 px-5" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("studio.addProject")}
            </Button>
          </div>

          <div className="mb-7 flex gap-2 overflow-x-auto rounded-md border border-border bg-background p-1">
            {studioTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  className="h-10 shrink-0 gap-2 rounded-md px-3"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  {t(tab.label)}
                </Button>
              );
            })}
          </div>

          <RapidApiSyncPanel className="mb-8" compact />

          {createOpen ? (
            <form onSubmit={submitProject} className="mb-8 rounded-md border border-primary/20 bg-primary/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black text-foreground">{t("studio.newProject")}</h2>
                <Button type="button" variant="ghost" size="icon" onClick={() => setCreateOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input required placeholder={t("studio.projectName")} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                <Input required type="url" placeholder={t("studio.baseUrl")} value={form.baseUrl} onChange={(event) => setForm((current) => ({ ...current, baseUrl: event.target.value }))} />
                <Input type="url" placeholder={t("studio.docsUrl")} value={form.documentationUrl} onChange={(event) => setForm((current) => ({ ...current, documentationUrl: event.target.value }))} />
                <Input placeholder={t("studio.category")} value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
                <Input placeholder={t("studio.tags")} value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.authScheme}
                  onChange={(event) => setForm((current) => ({ ...current, authScheme: event.target.value }))}
                >
                  <option value="api-key">API Key</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="basic">Basic Auth</option>
                  <option value="none">No Auth</option>
                </select>
                <Textarea
                  required
                  className="md:col-span-2"
                  rows={4}
                  placeholder={t("studio.description")}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <Button className="mt-4 gap-2" disabled={releaseAPI.isPending}>
                <Plus className="h-4 w-4" />
                {releaseAPI.isPending ? t("studio.createPending") : t("studio.createPublish")}
              </Button>
            </form>
          ) : null}

          {activeTab === "projects" ? (
            <>
              <div className="mb-12 grid gap-4 md:grid-cols-[280px,1fr,220px] md:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("studio.search")}
                    className="h-11 rounded-md border-border bg-background ps-9 shadow-inner"
                  />
                </div>
                <div className="justify-self-center rounded-md border border-border bg-background p-1 shadow-sm">
                  <Button variant={!favoritesOnly ? "secondary" : "ghost"} className="h-9 rounded-md px-4" onClick={() => setFavoritesOnly(false)}>
                    {t("studio.all")}
                  </Button>
                  <Button variant={favoritesOnly ? "secondary" : "ghost"} className="h-9 gap-2 rounded-md px-4" onClick={() => setFavoritesOnly(true)}>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {t("studio.favorites")}
                  </Button>
                </div>
                <div className="hidden justify-self-end rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary md:block">
                  {projects.length} {t("studio.activeProjects")}
                </div>
              </div>

              <section className="mx-auto grid max-w-4xl justify-items-center text-center">
                {!hasProjects ? (
                  <>
                    <div className="mb-6 grid h-16 w-16 place-items-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow-primary">
                      <Layers3 className="h-7 w-7" />
                    </div>
                    <h2 className="text-lg font-black">{t("studio.emptyTitle")}</h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t("studio.emptyText")}</p>
                    <Button variant="outline" className="mt-5 gap-2 px-5 shadow-sm" onClick={() => setCreateOpen(true)}>
                      <Plus className="h-4 w-4" />
                      {t("studio.addProject")}
                    </Button>
                  </>
                ) : null}

                <div className="mt-6 grid w-full gap-4 md:grid-cols-2">
                  {(hasProjects
                    ? projects
                    : [{ id: 0, name: t("studio.demoProject"), slug: "", description: t("studio.demoDescription"), favorite: true, status: "demo" }]
                  ).map((project) => (
                    <Card key={project.id} className="surface-card text-start">
                      <CardContent className="min-h-64 p-5">
                        <div className="mb-5 flex items-start justify-between">
                          <div className="grid h-12 w-12 place-items-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow-primary">
                            <Wand2 className="h-6 w-6" />
                          </div>
                          <Star className={`h-5 w-5 ${project.favorite ? "fill-yellow-300 text-yellow-300" : "text-slate-300"}`} />
                        </div>
                        <Link to={project.id ? `/api/${project.slug}` : "/dashboard"} className="font-black text-foreground hover:text-primary">
                          {project.name}
                        </Link>
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{project.description}</p>
                        <div className="mt-16 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("studio.updatedToday")}</span>
                          <Badge variant="outline">{project.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Card className="surface-card bg-primary/5 text-start">
                    <CardContent className="min-h-64 p-5">
                      <Sparkles className="mb-5 h-8 w-8 text-primary" />
                      <h3 className="font-black text-foreground">{t("studio.checklist")}</h3>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {["Create project in backend", "Add docs and endpoints", "Open marketplace detail", "Monitor usage in dashboard"].map((item) => (
                          <p key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </>
          ) : panel ? (
            <section className="grid gap-4 lg:grid-cols-[1fr,0.75fr]">
              <Card className="surface-card">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow-primary">
                      <panel.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{t(panel.title)}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(panel.copy)}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {["200 OK", "86 ms", "99.9%"].map((item) => (
                      <div key={item} className="rounded-md border border-border/70 bg-background/70 p-4 text-sm font-semibold">
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button className="mt-5 gap-2">
                    <Activity className="h-4 w-4" />
                    {t(panel.action)}
                  </Button>
                </CardContent>
              </Card>

              <Card className="surface-card">
                <CardContent className="p-6">
                  <h3 className="font-black text-foreground">IranAPI marketplace sync</h3>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {["IranAPI endpoints", "Pricing plans", "Code snippets", "Consumer support"].map((item) => (
                      <p key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {item}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
