import { Link, Navigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Code2, LoaderCircle, Shield, Star, type LucideIcon } from "lucide-react";
import { PageShell } from "@/components/site/Layout";
import { CodeBlock, Prompt, Tag, TerminalWindow } from "@/components/site/Terminal";
import { useSession } from "@/hooks/useAuth";
import { useCatalogApi, useRateApi, useSimilarApis } from "@/hooks/useCatalog";
import type { CatalogEndpoint } from "@/types/catalog";
import { buildCallSnippet, CALL_LANGUAGES, CALL_LANGUAGE_LABELS, type CallLanguage } from "@/lib/code-snippets";

type EndpointPreview = {
  id?: string | number;
  method?: string;
  path?: string;
  summary?: string;
  requires_auth?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function buildCallerPayload(apiSlug: string, endpoint: CatalogEndpoint) {
  const sample = isRecord(endpoint.sample_request) ? endpoint.sample_request : {};
  const query = isRecord(sample.query) ? sample.query : undefined;
  const pathParams = isRecord(sample.path) ? sample.path : undefined;
  const explicitBody = sample.body ?? sample.form;
  const remainingBody = Object.fromEntries(
    Object.entries(sample).filter(([key]) => !["query", "path", "headers", "body", "form"].includes(key)),
  );
  return {
    api_slug: apiSlug,
    endpoint_id: endpoint.id,
    method: endpoint.method,
    path: endpoint.path,
    ...(query ? { query } : {}),
    ...(pathParams ? { path_params: pathParams } : {}),
    ...(explicitBody !== undefined
      ? { body: explicitBody }
      : Object.keys(remainingBody).length
        ? { body: remainingBody }
        : {}),
  };
}

export default function ApiDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { api, isLoading, isError, refetch } = useCatalogApi(slug);
  const { apis: similarApis } = useSimilarApis(slug);
  const { isAuthenticated } = useSession();
  const ratingMutation = useRateApi(slug);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [callLanguage, setCallLanguage] = useState<CallLanguage>("javascript");
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);

  if (!api && isLoading) {
    return (
      <PageShell>
        <div className="state-block" data-tone="loading">
          <div className="spinner" aria-hidden />
          <div className="state-sub">loading api...</div>
        </div>
      </PageShell>
    );
  }
  if (!api && isError) {
    return (
      <PageShell>
        <div className="state-block" data-tone="error" role="alert">
          <div className="state-title">// API data unavailable</div>
          <button type="button" className="btn-primary mt-3" onClick={() => void refetch()}>./retry</button>
        </div>
      </PageShell>
    );
  }
  if (!api) return <Navigate to="/browse" replace />;

  const firstEndpoint = api.apiEndpoints[0];
  const snippetEndpoint = api.apiEndpoints.find((endpoint) => endpoint.id === selectedEndpointId) ?? firstEndpoint;
  const activeRating = selectedRating ?? Math.round(api.ratingValue);
  const quickstartPayload = firstEndpoint ? buildCallerPayload(api.slug, firstEndpoint) : null;
  const quickstartCurl = quickstartPayload
    ? `curl -X POST http://localhost:8000/api/v1/account/caller/ \\\n  -H "Authorization: Bearer \${IRANAPI_KEY}" \\\n  -H "Content-Type: application/json" \\\n  --data '${JSON.stringify(quickstartPayload)}'`
    : "No active endpoint is registered for this API yet.";

  return (
    <PageShell>
      <Link to="/browse" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> back to registry
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="min-w-0 space-y-6">
          <div className="terminal-border rounded-sm bg-card/60 p-6">
            <div className="text-xs text-muted-foreground">{api.org} // {api.category}</div>
            <h1 className="mt-2 text-3xl font-black text-primary text-glow">{api.name}</h1>
            <p className="mt-2 text-foreground/85">{api.tagline}</p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{api.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {api.tags.map((tag: string) => (
                <Tag key={tag} color="cyan">{tag}</Tag>
              ))}
              <Tag color={api.pricing === "paid" ? "magenta" : "primary"}>{api.pricing}</Tag>
            </div>
          </div>

          <TerminalWindow title={`~/iranapi/${api.slug}/quickstart.sh`} glow>
            <div className="space-y-2 text-sm">
              <Prompt>export IRANAPI_KEY=&lt;copy-once-from-dashboard&gt;</Prompt>
              <div className="pl-6 text-muted-foreground text-xs">{"// "}{api.endpoints} catalog endpoints registered</div>
              <Prompt>{firstEndpoint ? `${firstEndpoint.method} ${firstEndpoint.path}` : "no endpoint"}</Prompt>
              <CodeBlock>{quickstartCurl}</CodeBlock>
            </div>
          </TerminalWindow>

          <div className="terminal-border rounded-sm bg-card/50 p-6">
            <div className="text-xs uppercase tracking-widest text-primary">// endpoints</div>
            <ul className="mt-3 divide-y divide-border text-sm">
              {(api.apiEndpoints.length ? api.apiEndpoints : Array.from<EndpointPreview>({ length: Math.min(api.endpoints, 6) })).map((endpoint: EndpointPreview, i) => (
                <li key={endpoint?.id ?? i} className="grid gap-2 py-3 sm:grid-cols-[1fr,auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <Tag color={endpoint?.method === "POST" ? "amber" : "primary"}>{endpoint?.method ?? (i % 2 ? "POST" : "GET")}</Tag>
                    <div className="min-w-0">
                      <code className="break-all text-foreground/90">{endpoint?.path ?? `/v1/${api.slug.split("-")[0]}/${["create", "list", "get", "update", "delete", "verify"][i % 6]}`}</code>
                      {endpoint?.summary && <div className="mt-1 text-xs text-muted-foreground">{endpoint.summary}</div>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{endpoint?.requires_auth === false ? "public" : "provider auth"}</span>
                </li>
              ))}
            </ul>
          </div>

          {snippetEndpoint && (
            <TerminalWindow title={`~/iranapi/${api.slug}/call-${snippetEndpoint.id}`} glow>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <label className="block min-w-0 flex-1 text-xs text-muted-foreground" htmlFor="snippet-endpoint">
                  --endpoint
                  <select
                    id="snippet-endpoint"
                    value={snippetEndpoint.id}
                    onChange={(event) => setSelectedEndpointId(Number(event.target.value))}
                    className="field mt-1"
                  >
                    {api.apiEndpoints.map((endpoint) => (
                      <option key={endpoint.id} value={endpoint.id}>{endpoint.method} {endpoint.path}</option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-wrap gap-1" aria-label="code language">
                  {CALL_LANGUAGES.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => setCallLanguage(language)}
                      className={`rounded-sm border px-2 py-1 text-xs ${callLanguage === language ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      {CALL_LANGUAGE_LABELS[language]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">// ready-to-run {CALL_LANGUAGE_LABELS[callLanguage]} request</div>
              <CodeBlock className="mt-2">{buildCallSnippet(callLanguage, api, snippetEndpoint)}</CodeBlock>
            </TerminalWindow>
          )}

          {api.documentations.length > 0 && (
            <div className="terminal-border rounded-sm bg-card/50 p-6">
              <div className="text-xs uppercase tracking-widest text-primary">// docs</div>
              <div className="mt-4 grid gap-3">
                {api.documentations.slice(0, 3).map((doc) => (
                  <article key={doc.id} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <h2 className="text-sm font-bold text-foreground">{doc.title}</h2>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{doc.content}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {firstEndpoint && (
            <TerminalWindow title={`~/iranapi/${api.slug}/sample.json`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">// request</div>
                  <CodeBlock>{JSON.stringify(firstEndpoint.sample_request, null, 2)}</CodeBlock>
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">// response</div>
                  <CodeBlock>{JSON.stringify(firstEndpoint.sample_response, null, 2)}</CodeBlock>
                </div>
              </div>
            </TerminalWindow>
          )}
        </div>

        <aside className="min-w-0 space-y-4">
          <div className="terminal-border rounded-sm bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">// vitals</div>
              <div className="flex items-center gap-1 text-amber text-sm">
                <Star className="h-3.5 w-3.5 fill-current" /> {api.rating}
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Vital icon={Shield} label="provider auth" value={api.rapidapi.public_auth_scheme} />
              <Vital icon={Code2} label="endpoints" value={String(api.endpoints)} />
              <Vital icon={Star} label="catalog views" value={api.views_count.toLocaleString()} />
            </dl>
            <Link
              to="/caller"
              className="mt-5 block rounded-sm border border-primary bg-primary text-center px-4 py-2 text-sm font-bold text-primary-foreground hover:shadow-glow"
            >
              ./try_endpoint
            </Link>
            <Link
              to="/pricing"
              className="mt-2 block rounded-sm border border-border text-center px-4 py-2 text-sm text-foreground/90 hover:border-primary hover:text-primary"
            >
              view pricing
            </Link>
          </div>

          <div className="terminal-border rounded-sm bg-card/50 p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">// rate api</div>
            <div className="mt-3 flex items-center gap-1" aria-label="rate api">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  disabled={!isAuthenticated || ratingMutation.isPending}
                  onClick={() => {
                    setSelectedRating(rating);
                    ratingMutation.mutate(rating);
                  }}
                  className="rounded-sm p-1 text-amber transition-colors hover:bg-amber/10 disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label={`rate ${rating} stars`}
                >
                  <Star className={`h-4 w-4 ${rating <= activeRating ? "fill-current" : ""}`} />
                </button>
              ))}
              {ratingMutation.isPending && <LoaderCircle className="ms-2 h-3.5 w-3.5 animate-spin text-primary" />}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {isAuthenticated ? `${api.rating_count} ratings` : "sign in to submit rating"}
            </div>
            {ratingMutation.isError && <div className="mt-2 text-xs text-destructive">{ratingMutation.error.message}</div>}
          </div>

          <div className="terminal-border rounded-sm bg-card/40 p-5 text-xs text-muted-foreground space-y-2">
            <div>// publication: <span className="text-primary">{api.rapidapi.publication_status}</span></div>
            <div>// catalog version: <span className="text-amber">{api.rapidapi.canonical_version}</span></div>
            <div>// documentation: <span className="text-cyan">{api.documentation_url ? "provider link available" : "catalog only"}</span></div>
          </div>

          {similarApis.length > 0 && (
            <div className="terminal-border rounded-sm bg-card/40 p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">// similar apis</div>
              <div className="mt-3 grid gap-2">
                {similarApis.slice(0, 3).map((item) => (
                  <Link
                    key={item.slug}
                    to={`/api/${item.slug}`}
                    className="rounded-sm border border-border bg-background/35 px-3 py-2 text-sm hover:border-primary hover:text-primary"
                  >
                    <div className="font-bold">{item.name}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{item.tagline}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}

function Vital({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </span>
      <span className="text-primary text-glow font-bold">{value}</span>
    </div>
  );
}
