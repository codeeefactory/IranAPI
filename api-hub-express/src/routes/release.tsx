import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlignLeft, BookOpen, Globe2, KeyRound, Layers3, Loader2, Rocket, Tags } from "lucide-react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { Prompt, Tag, TerminalWindow } from "@/components/site/Terminal";
import { FormStatus, SelectField, TextAreaField, TextField } from "@/components/ui/form-controls";
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

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={submit} className="terminal-border min-w-0 rounded-sm bg-card/50 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="release-name" label="--name" value={form.name} onChange={(event) => setForm((v) => ({ ...v, name: event.target.value }))} icon={Rocket} required />
            <SelectField id="release-auth" label="--auth" value={form.auth_scheme} onChange={(event) => setForm((v) => ({ ...v, auth_scheme: event.target.value as ApiReleaseInput["auth_scheme"] }))} icon={KeyRound}>
                {AUTH_SCHEMES.map((scheme) => <option key={scheme}>{scheme}</option>)}
            </SelectField>
            <TextField id="release-base-url" label="--base-url" value={form.base_url} onChange={(event) => setForm((v) => ({ ...v, base_url: event.target.value }))} icon={Globe2} type="url" dir="ltr" required />
            <TextField id="release-docs-url" label="--docs-url" value={form.documentation_url} onChange={(event) => setForm((v) => ({ ...v, documentation_url: event.target.value }))} icon={BookOpen} type="url" dir="ltr" />
            <TextField id="release-category" label="--category" value={form.category} list="release-categories" onChange={(event) => setForm((v) => ({ ...v, category: event.target.value }))} icon={Layers3} />
            <datalist id="release-categories">
              {categoryOptions.map((category) => <option key={category} value={category} />)}
            </datalist>
            <TextField id="release-tags" label="--tags" value={form.tags} onChange={(event) => setForm((v) => ({ ...v, tags: event.target.value }))} icon={Tags} />
          </div>

          <TextAreaField id="release-description" fieldClassName="mt-4" label="--description" value={form.description} onChange={(event) => setForm((v) => ({ ...v, description: event.target.value }))} icon={AlignLeft} className="min-h-32" required />

          {error ? <FormStatus tone="error" className="mt-3">{error}</FormStatus> : null}
          {releasedApi ? (
            <FormStatus tone="success" className="mt-3">
              <span>published {releasedApi.slug}</span>
              <Link to={`/api/${releasedApi.slug}`} className="underline">view listing</Link>
            </FormStatus>
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

        <div className="min-w-0 space-y-4">
          <TerminalWindow title="~/iranapi/releases">
            <div className="space-y-2 text-sm" data-ltr>
              <Prompt>iranapi apis release --name "{form.name}"</Prompt>
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
