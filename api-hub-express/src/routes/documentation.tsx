import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Prompt, CodeBlock } from "@/components/site/Terminal";
import { BookOpen, Check, Copy, Play, Search } from "lucide-react";
import { useCatalogApis, useCatalogDocumentations } from "@/hooks/useCatalog";
import { useI18n } from "@/lib/i18n";

const SECTIONS = [
  { id: "quickstart", n: "01", key: "quickstart" },
  { id: "catalog-docs", n: "live", key: "catalog-docs" },
  { id: "auth", n: "02", key: "auth" },
  { id: "errors", n: "03", key: "errors" },
  { id: "webhooks", n: "04", key: "webhooks" },
  { id: "idempotency", n: "05", key: "idempotency" },
  { id: "sdks", n: "06", key: "sdks" },
];

export default function DocsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { apis } = useCatalogApis({ page_size: 100 });
  const { documentations, isError: documentsError, isFallback: documentsFallback } = useCatalogDocumentations({ page_size: 100 });
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredDocs = useMemo(() => documentations.filter((doc) => {
    if (!normalizedSearch) return true;
    return [doc.title, doc.api_slug, doc.content].some((value) => value?.toLocaleLowerCase().includes(normalizedSearch));
  }), [documentations, normalizedSearch]);
  const filteredApis = useMemo(() => apis.filter((api) => {
    if (!normalizedSearch) return true;
    const apiMatch = [api.name, api.name_en, api.slug, api.short_description, ...api.tags]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch));
    return apiMatch || filteredDocs.some((doc) => doc.api_slug === api.slug);
  }), [apis, filteredDocs, normalizedSearch]);
  const docsByApi = filteredDocs.reduce<Record<string, typeof documentations>>((groups, doc) => {
    groups[doc.api_slug] = [...(groups[doc.api_slug] ?? []), doc];
    return groups;
  }, {});

  return (
    <PageShell>
      <SectionHeader kicker={t("docs.kicker")} title={t("docs.title")} subtitle={"// " + t("docs.sub")} />
      <div className="grid gap-8 lg:grid-cols-4">
        <nav aria-label="Docs" className="space-y-4 self-start lg:sticky lg:top-20 lg:col-span-1">
          <label className="relative block">
            <span className="sr-only">Search documentation</span>
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search docs"
              className="field min-h-10 ps-9 text-sm"
            />
          </label>
          <ul className="grid grid-cols-2 lg:grid-cols-1 gap-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-sm px-2 py-1.5 text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                  data-ltr
                >
                  <span className="text-muted-foreground">{s.n}</span>
                  <span className="text-muted-foreground"> // </span>
                  <span>{s.key}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 space-y-12 lg:col-span-3">
          <Doc id="quickstart" n="01" title="quickstart">
            <p>sign in, rotate an account key in the dashboard, then call an endpoint registered in the live catalog.</p>
            <TerminalWindow title="terminal">
              <div data-terminal className="space-y-1 text-sm">
                <Prompt>export IRANAPI_KEY=&lt;copy-once-from-dashboard&gt;</Prompt>
                <Prompt>curl /api/v1/system/health/</Prompt>
                <div className="text-primary text-xs mt-2">{"// "}database: up</div>
              </div>
            </TerminalWindow>
          </Doc>
          <Doc id="catalog-docs" n="live" title="catalog docs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-xs">
              <span className="text-muted-foreground">{filteredApis.length} APIs // {filteredDocs.length} documents</span>
              <Link to="/caller" className="btn-primary !min-h-8 !px-3 !py-1.5">
                <Play className="h-3.5 w-3.5" aria-hidden />
                try caller
              </Link>
            </div>
            <Copyable code={`curl "/api/v1/catalog/documentations/?search=quick&page_size=12"
curl "/api/v1/catalog/documentations/?api=${apis[0]?.slug ?? "speech-gateway"}"`} />
            <div className="grid gap-3 xl:grid-cols-2">
              {filteredApis.slice(0, 12).map((api) => {
                const apiDocs = docsByApi[api.slug] ?? [];
                return (
                  <article key={api.slug} className="surface-card rounded-sm p-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2" data-ltr>
                      <span className="font-bold text-primary">{api.name}</span>
                      <span className="text-muted-foreground">{apiDocs.length || api.documentations.length} docs</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-foreground/70">{api.short_description}</p>
                    <div className="mt-2 space-y-1">
                      {(apiDocs.length ? apiDocs : api.documentations).slice(0, 2).map((doc) => (
                        <div key={doc.id} className="text-foreground/80">
                          <span className="text-muted-foreground">{"// "}</span>
                          {doc.title}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-2">
                      <Link to={`/api/${api.slug}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden />
                        reference
                      </Link>
                      <Link to="/caller" className="inline-flex items-center gap-1 text-amber hover:underline">
                        <Play className="h-3.5 w-3.5" aria-hidden />
                        caller
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
            {!filteredApis.length ? <div className="state-block"><div className="state-title">// no matching documentation</div></div> : null}
            {documentsError && !documentsFallback ? <div className="text-xs text-destructive" role="alert" data-ltr>// catalog docs unavailable; retry after backend recovery</div> : null}
          </Doc>
          <Doc id="auth" n="02" title="auth">
            <p>private endpoints accept the secure session cookie or a bearer account key. Account keys start with <code className="text-amber px-1 bg-background/40 rounded-sm">iapi_</code>, are shown once, and are stored only as a hash plus fingerprint.</p>
            <Copyable code={`curl /api/v1/account/user/ \\
  -H "Authorization: Bearer $IRANAPI_KEY"`} />
          </Doc>
          <Doc id="errors" n="03" title="errors">
            <p>API errors use a stable IranAPI envelope. Inspect <code className="text-amber px-1 bg-background/40 rounded-sm">error.code</code> and <code className="text-amber px-1 bg-background/40 rounded-sm">error.details</code>; retry only transient 5xx and 429 responses.</p>
            <Copyable code={`{
  "error": {
    "code": "validation_error",
    "message": "request is invalid",
    "details": {}
  }
}`} />
          </Doc>
          <Doc id="webhooks" n="04" title="webhooks">
            <p>webhook delivery is not exposed by the current public API. Provider callbacks must be implemented and verified server-side before use.</p>
          </Doc>
          <Doc id="idempotency" n="05" title="idempotency">
            <p>subscription confirmation is idempotent. Other write endpoints do not yet promise generic idempotency-key semantics.</p>
          </Doc>
          <Doc id="sdks" n="06" title="sdks">
            <p>the machine-readable OpenAPI 3.0 schema is available at <code className="text-amber px-1 bg-background/40 rounded-sm">/api/v1/schema/openapi.json</code>. Generated SDK packages are not published yet.</p>
          </Doc>
        </div>
      </div>
    </PageShell>
  );
}

function Doc({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-bold text-primary text-glow" data-ltr>
        <span className="text-muted-foreground">{n}</span>
        <span className="text-muted-foreground"> // </span>
        <span>{title}</span>
      </h2>
      <div className="text-sm text-foreground/85 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

function Copyable({ code }: { code: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  async function copy() {
    if (!navigator.clipboard) return;
    const copied = await navigator.clipboard.writeText(code).then(() => true).catch(() => false);
    if (!copied) return;
    setDone(true);
    timeoutRef.current = window.setTimeout(() => setDone(false), 1500);
  }

  return (
    <div className="relative group">
      <CodeBlock>{code}</CodeBlock>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={t("docs.copy")}
        className="absolute top-2 end-2 inline-flex items-center gap-1 rounded-sm border border-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground hover:text-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {done ? t("docs.copied") : t("docs.copy")}
      </button>
    </div>
  );
}
