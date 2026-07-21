import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { Prompt, Tag, TerminalWindow } from "@/components/site/Terminal";
import { useSession } from "@/hooks/useAuth";
import { useCatalogCategories, useReleaseApi } from "@/hooks/useCatalog";
import { ApiClientError, type ApiReleaseInput } from "@/lib/api-client";

const AUTH_SCHEMES: ApiReleaseInput["auth_scheme"][] = ["api-key", "bearer", "oauth2", "basic", "none"];

export default function ReleasePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSession();
  const { categories } = useCatalogCategories();
  const release = useReleaseApi();
  const [form, setForm] = useState({
    name: "Ledger Reconcile API",
    base_url: "https://api.example.dev/v1",
    documentation_url: "https://docs.example.dev",
    auth_scheme: "api-key" as ApiReleaseInput["auth_scheme"],
    category: "Fintech",
    tags: "ledger, reconciliation, finance",
    description: "Reconcile payment ledgers, payouts, and settlement exports for finance teams.",
  });
  const [error, setError] = useState("");
  const releasedApi = release.data?.api;
  const categoryOptions = useMemo(() => {
    const names = categories.map((category) => category.name_en || category.name).filter(Boolean);
    return Array.from(new Set(["Fintech", "Payments", "Data", "Community", ...names]));
  }, [categories]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isAuthenticated) {
      navigate(`/signin?next=${encodeURIComponent("/release")}`);
      return;
    }
    try {
      await release.mutateAsync({
        name: form.name,
        base_url: form.base_url,
        documentation_url: form.documentation_url,
        auth_scheme: form.auth_scheme,
        category: form.category,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        description: form.description,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "API release failed.");
    }
  }

  return (
    <PageShell>
      <SectionHeader
        kicker="catalog release"
        title="publish an api"
        subtitle="// authenticated releases go straight into Explore with docs metadata and searchable tags."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <form onSubmit={submit} className="terminal-border rounded-sm bg-card/50 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="--name" value={form.name} onChange={(name) => setForm((v) => ({ ...v, name }))} required />
            <label className="block text-xs text-muted-foreground" htmlFor="release-auth">
              --auth
              <select
                id="release-auth"
                className="field mt-1"
                value={form.auth_scheme}
                onChange={(event) => setForm((v) => ({ ...v, auth_scheme: event.target.value as ApiReleaseInput["auth_scheme"] }))}
              >
                {AUTH_SCHEMES.map((scheme) => <option key={scheme}>{scheme}</option>)}
              </select>
            </label>
            <Field label="--base-url" value={form.base_url} onChange={(base_url) => setForm((v) => ({ ...v, base_url }))} required />
            <Field label="--docs-url" value={form.documentation_url} onChange={(documentation_url) => setForm((v) => ({ ...v, documentation_url }))} />
            <label className="block text-xs text-muted-foreground" htmlFor="release-category">
              --category
              <input
                id="release-category"
                className="field mt-1"
                value={form.category}
                list="release-categories"
                onChange={(event) => setForm((v) => ({ ...v, category: event.target.value }))}
              />
              <datalist id="release-categories">
                {categoryOptions.map((category) => <option key={category} value={category} />)}
              </datalist>
            </label>
            <Field label="--tags" value={form.tags} onChange={(tags) => setForm((v) => ({ ...v, tags }))} />
          </div>

          <label className="mt-4 block text-xs text-muted-foreground" htmlFor="release-description">
            --description
            <textarea
              id="release-description"
              className="field mt-1 min-h-32 resize-y"
              value={form.description}
              onChange={(event) => setForm((v) => ({ ...v, description: event.target.value }))}
              required
            />
          </label>

          {error ? <div className="mt-3 text-xs text-destructive" role="alert">{"// "}{error}</div> : null}
          {releasedApi ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-primary" role="status">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              <span>published {releasedApi.slug}</span>
              <Link to={`/api/${releasedApi.slug}`} className="underline">view listing</Link>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={release.isPending || isLoading}
            className="btn-primary mt-5 justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {release.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            {isAuthenticated ? "./publish" : "./signin_to_publish"}
          </button>
        </form>

        <div className="space-y-4">
          <TerminalWindow title="~/iranapi/releases">
            <div className="space-y-2 text-sm" data-ltr>
              <Prompt>iran apis release --name "{form.name}"</Prompt>
              <div className="text-xs text-muted-foreground">// target {form.base_url}</div>
              <div className="text-xs text-muted-foreground">// docs {form.documentation_url || "inline overview"}</div>
              <div className="flex flex-wrap gap-2">
                <Tag color="primary">{form.auth_scheme}</Tag>
                <Tag color="amber">{form.category || "Community"}</Tag>
                {form.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 3).map((tag) => <Tag key={tag} color="muted">{tag}</Tag>)}
              </div>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/catalog/status">
            <div className="space-y-2 text-xs" data-ltr>
              <div className="flex items-center justify-between gap-2">
                <span>session</span>
                <Tag color={isAuthenticated ? "primary" : "amber"}>{isAuthenticated ? "authenticated" : "required"}</Tag>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>publication</span>
                <Tag color={releasedApi ? "primary" : "muted"}>{releasedApi?.rapidapi.publication_status ?? "draft"}</Tag>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>schema</span>
                <span className="text-primary">POST /api/v1/catalog/apis/</span>
              </div>
            </div>
          </TerminalWindow>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const id = `release-${label.replace(/^--/, "").replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <label className="block text-xs text-muted-foreground" htmlFor={id}>
      {label}
      <input id={id} className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}
