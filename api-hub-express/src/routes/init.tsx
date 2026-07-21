import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Code2, Loader2, PackagePlus } from "lucide-react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { CodeBlock, Prompt, Tag, TerminalWindow } from "@/components/site/Terminal";
import { useSession } from "@/hooks/useAuth";
import { useCatalogApis } from "@/hooks/useCatalog";
import { useInitializeProject, useProjectInitCatalog } from "@/hooks/useUsage";
import { ApiClientError, type ApiProject } from "@/lib/api-client";

export default function InitPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { apis } = useCatalogApis({ page_size: 20 });
  const catalog = useProjectInitCatalog(isAuthenticated);
  const initialize = useInitializeProject();
  const languages = catalog.data?.supported_languages ?? [
    { slug: "python", label: "Python / FastAPI", runtime: "python" },
    { slug: "node", label: "Node.js / Express", runtime: "node" },
    { slug: "custom", label: "Custom HTTP starter", runtime: "generic" },
  ];
  const [form, setForm] = useState({
    project_name: "Payments Proxy",
    package_name: "payments-proxy",
    language: "python",
    api_slug: "",
    include_docker: true,
  });
  const [selectedPath, setSelectedPath] = useState("");
  const [error, setError] = useState("");
  const project = initialize.data?.project;
  const selectedFile = useMemo(() => {
    const files = project?.files ?? [];
    return files.find((file) => file.path === selectedPath) ?? files[0];
  }, [project, selectedPath]);
  const recentProjects = catalog.data?.projects.results ?? [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isAuthenticated) {
      navigate(`/signin?next=${encodeURIComponent("/init")}`);
      return;
    }
    try {
      const response = await initialize.mutateAsync(form);
      setSelectedPath(response.project.files[0]?.path ?? "");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Project initialization failed.");
    }
  }

  return (
    <PageShell>
      <SectionHeader
        kicker="api project init"
        title="bootstrap any api stack"
        subtitle="// backend generates starter files for common languages; unknown languages fall back to a generic HTTP scaffold."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),380px]">
        <form onSubmit={submit} className="terminal-border rounded-sm bg-card/50 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="--project-name" value={form.project_name} onChange={(project_name) => setForm((v) => ({ ...v, project_name }))} required />
            <Field label="--package" value={form.package_name} onChange={(package_name) => setForm((v) => ({ ...v, package_name }))} />
            <label className="block text-xs text-muted-foreground" htmlFor="init-language">
              --language
              <select
                id="init-language"
                className="field mt-1"
                value={form.language}
                onChange={(event) => setForm((v) => ({ ...v, language: event.target.value }))}
              >
                {languages.map((language) => (
                  <option key={language.slug} value={language.slug}>{language.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-muted-foreground" htmlFor="init-api">
              --api
              <select
                id="init-api"
                className="field mt-1"
                value={form.api_slug}
                onChange={(event) => setForm((v) => ({ ...v, api_slug: event.target.value }))}
              >
                <option value="">no catalog binding</option>
                {apis.map((api) => (
                  <option key={api.slug} value={api.slug}>{api.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-foreground/80" htmlFor="init-docker">
            <input
              id="init-docker"
              type="checkbox"
              checked={form.include_docker}
              onChange={(event) => setForm((v) => ({ ...v, include_docker: event.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            include Dockerfile
          </label>

          {error ? <div className="mt-3 text-xs text-destructive" role="alert">{"// "}{error}</div> : null}
          {project ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-primary" role="status">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              <span>initialized {project.slug}</span>
              <Tag color="primary">{project.language}</Tag>
              <Tag color="amber">{project.file_count} files</Tag>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={initialize.isPending || sessionLoading}
            className="btn-primary mt-5 justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {initialize.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackagePlus className="h-3.5 w-3.5" />}
            {isAuthenticated ? "./init_project" : "./signin_to_init"}
          </button>
        </form>

        <div className="space-y-4">
          <TerminalWindow title="~/iranapi/init">
            <div className="space-y-2 text-sm" data-ltr>
              <Prompt>iran init --lang {form.language} --name "{form.project_name}"</Prompt>
              <div className="text-xs text-muted-foreground">// language list loaded from backend</div>
              <div className="flex flex-wrap gap-2">
                {languages.slice(0, 7).map((language) => <Tag key={language.slug} color={language.slug === form.language ? "primary" : "muted"}>{language.slug}</Tag>)}
              </div>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/recent-projects">
            <ProjectList projects={recentProjects} activeSlug={project?.slug} />
            {!isAuthenticated && !sessionLoading ? <Link to="/signin" className="btn-primary mt-4 justify-center">./signin</Link> : null}
          </TerminalWindow>
        </div>
      </div>

      {project ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
          <TerminalWindow title="~/generated/files">
            <div className="space-y-1 text-sm" data-ltr>
              {project.files.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-start text-foreground/80 hover:bg-primary/10 hover:text-primary"
                  data-active={selectedFile?.path === file.path || undefined}
                >
                  <Code2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </TerminalWindow>
          <TerminalWindow title={selectedFile?.path ?? "~/generated"}>
            <CodeBlock>{selectedFile?.content ?? "no file selected"}</CodeBlock>
          </TerminalWindow>
        </div>
      ) : null}
    </PageShell>
  );
}

function ProjectList({ projects, activeSlug }: { projects: ApiProject[]; activeSlug?: string }) {
  if (!projects.length) {
    return <div className="text-xs text-muted-foreground">no initialized projects yet</div>;
  }
  return (
    <div className="space-y-2 text-xs" data-ltr>
      {projects.slice(0, 5).map((project) => (
        <div key={project.id} className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0">
          <span className="truncate">{project.project_name}</span>
          <span className={project.slug === activeSlug ? "text-primary" : "text-muted-foreground"}>{project.language}</span>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const id = `init-${label.replace(/^--/, "").replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <label className="block text-xs text-muted-foreground" htmlFor={id}>
      {label}
      <input id={id} className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}
