import { useEffect, useRef, useState } from "react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Prompt, CodeBlock } from "@/components/site/Terminal";
import { Check, Copy } from "lucide-react";
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
  const { apis } = useCatalogApis({ page_size: 6 });
  const { documentations, isFallback } = useCatalogDocumentations({ page_size: 12 });
  const docsByApi = documentations.reduce<Record<string, typeof documentations>>((groups, doc) => {
    groups[doc.api_slug] = [...(groups[doc.api_slug] ?? []), doc];
    return groups;
  }, {});

  return (
    <PageShell>
      <SectionHeader kicker={t("docs.kicker")} title={t("docs.title")} subtitle={"// " + t("docs.sub")} />
      <div className="grid gap-8 lg:grid-cols-[220px,1fr]">
        <nav aria-label="Docs" className="lg:sticky lg:top-20 self-start">
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
        <div className="space-y-12 max-w-3xl min-w-0">
          <Doc id="quickstart" n="01" title="quickstart">
            <p>install the cli, login, and call your first endpoint.</p>
            <TerminalWindow title="terminal">
              <div data-terminal className="space-y-1 text-sm">
                <Prompt>npm i -g @iranapi/cli</Prompt>
                <Prompt>iran login</Prompt>
                <Prompt>iran call zarinpal/pay --amount 50000</Prompt>
                <div className="text-primary text-xs mt-2">{"// "}HTTP/2 200 // 142ms</div>
              </div>
            </TerminalWindow>
          </Doc>
          <Doc id="catalog-docs" n="live" title="catalog docs">
            <p>documentation index is loaded from <code className="text-amber px-1 bg-background/40 rounded-sm">/api/v1/catalog/documentations/</code>. filter by API slug or search text.</p>
            <Copyable code={`curl "/api/v1/catalog/documentations/?search=quick&page_size=12"
curl "/api/v1/catalog/documentations/?api=${apis[0]?.slug ?? "speech-gateway"}"`} />
            <div className="grid gap-3">
              {apis.slice(0, 4).map((api) => {
                const apiDocs = docsByApi[api.slug] ?? [];
                return (
                  <a key={api.slug} href={`/api/${api.slug}`} className="surface-card rounded-sm p-3 text-xs transition-colors hover:border-primary/50">
                    <div className="flex flex-wrap items-center justify-between gap-2" data-ltr>
                      <span className="text-primary">{api.slug}</span>
                      <span className="text-muted-foreground">{apiDocs.length || api.documentations.length} docs</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {(apiDocs.length ? apiDocs : api.documentations).slice(0, 2).map((doc) => (
                        <div key={doc.id} className="text-foreground/80">
                          <span className="text-muted-foreground">{"// "}</span>
                          {doc.title}
                        </div>
                      ))}
                    </div>
                  </a>
                );
              })}
            </div>
            {isFallback ? <div className="text-xs text-amber" data-ltr>// offline mock docs shown</div> : null}
          </Doc>
          <Doc id="auth" n="02" title="auth">
            <p>every request requires an <code className="text-amber px-1 bg-background/40 rounded-sm">x-iran-key</code> header. live keys start with <code className="text-amber px-1 bg-background/40 rounded-sm">ir_live_</code>, test keys with <code className="text-amber px-1 bg-background/40 rounded-sm">ir_test_</code>.</p>
            <Copyable code={`curl https://api.iranapi.dev/v1/ping \\
  -H "x-iran-key: ir_live_4f9c8b2a..."`} />
          </Doc>
          <Doc id="errors" n="03" title="errors">
            <p>errors are RFC 7807 problem-json. retry only on <code className="text-amber px-1 bg-background/40 rounded-sm">5xx</code> and <code className="text-amber px-1 bg-background/40 rounded-sm">429</code>.</p>
            <Copyable code={`{
  "type": "/errors/rate_limited",
  "title": "Too many requests",
  "status": 429,
  "retry_after_ms": 850
}`} />
          </Doc>
          <Doc id="webhooks" n="04" title="webhooks">
            <p>webhooks are signed with hmac-sha256. verify <code className="text-amber px-1 bg-background/40 rounded-sm">x-iran-signature</code> before trusting any payload.</p>
          </Doc>
          <Doc id="idempotency" n="05" title="idempotency">
            <p>pass <code className="text-amber px-1 bg-background/40 rounded-sm">idempotency-key</code> on writes. same key returns the same response for 24h.</p>
          </Doc>
          <Doc id="sdks" n="06" title="sdks">
            <p>typed sdks for typescript, python, go, php, kotlin. generated from openapi 3.1.</p>
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
