import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boxes, Code2, FileArchive, FolderKanban, Languages, Loader2, PackagePlus, PlugZap, Rocket, ScanSearch } from "lucide-react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { BuildTabs } from "@/components/site/BuildTabs";
import { CodeBlock, Prompt, Tag, TerminalWindow } from "@/components/site/Terminal";
import { CheckboxField, FormStatus, SelectField, TextField } from "@/components/ui/form-controls";
import { useSession } from "@/hooks/useAuth";
import { useCatalogApis } from "@/hooks/useCatalog";
import { useAnalyzeProject, useDeployProject, useInitializeProject, useProjectDeployments, useProjectInitCatalog } from "@/hooks/useUsage";
import { ApiClientError, type ApiProject } from "@/lib/api-client";

export default function InitPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { apis } = useCatalogApis({ page_size: 20 });
  const catalog = useProjectInitCatalog(isAuthenticated);
  const initialize = useInitializeProject();
  const analyze = useAnalyzeProject();
  const deploy = useDeployProject();
  const deployments = useProjectDeployments(isAuthenticated);
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
  const [archive, setArchive] = useState<File | null>(null);
  const [archiveProjectName, setArchiveProjectName] = useState("Uploaded API");
  const [archiveRegion, setArchiveRegion] = useState("ir-tehran-1");
  const [archiveError, setArchiveError] = useState("");
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

  async function analyzeArchive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setArchiveError("");
    if (!isAuthenticated) {
      navigate(`/signin?next=${encodeURIComponent("/init")}`);
      return;
    }
    if (!archive) {
      setArchiveError("Choose a compressed project first.");
      return;
    }
    try {
      await analyze.mutateAsync(archive);
    } catch (err) {
      setArchiveError(err instanceof ApiClientError ? err.message : "Project analysis failed.");
    }
  }

  async function deployArchive() {
    setArchiveError("");
    if (!archive || !analyze.data?.analysis.deployment.ready) return;
    try {
      await deploy.mutateAsync({ archive, projectName: archiveProjectName, region: archiveRegion });
    } catch (err) {
      setArchiveError(err instanceof ApiClientError ? err.message : "Project deployment failed.");
    }
  }

  return (
    <PageShell>
      <SectionHeader
        kicker="build / starter"
        title="Project starter"
        subtitle="// Generate a new client or backend scaffold. Flow deployment stays in Flow builder."
      />
      <BuildTabs />

      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr),380px]">
        <form onSubmit={analyzeArchive} className="terminal-border rounded-sm bg-card/50 p-4 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <FileArchive className="h-4 w-4" /> compressed project analyzer
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Upload ZIP, TAR, TAR.GZ, or TGZ. IranAPI inspects files without extracting or running uploaded code.
          </p>
          <label className="mt-4 block text-xs text-muted-foreground" htmlFor="project-archive">
            --archive
            <input
              id="project-archive"
              type="file"
              accept=".zip,.tar,.tar.gz,.tgz,application/zip,application/gzip"
              className="field mt-1 file:me-3 file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-primary"
              onChange={(event) => {
                setArchive(event.target.files?.[0] ?? null);
                analyze.reset();
                deploy.reset();
              }}
            />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TextField id="archive-project-name" label="--project-name" value={archiveProjectName} onChange={(event) => setArchiveProjectName(event.target.value)} icon={FolderKanban} required />
            <SelectField id="archive-region" label="--region" value={archiveRegion} onChange={(event) => setArchiveRegion(event.target.value)} icon={PlugZap}>
              <option value="ir-tehran-1">ir-tehran-1</option>
              <option value="ir-mashhad-1">ir-mashhad-1</option>
              <option value="eu-frankfurt-1">eu-frankfurt-1</option>
            </SelectField>
          </div>
          {archiveError ? <FormStatus tone="error" className="mt-3">{archiveError}</FormStatus> : null}
          {deploy.data ? <FormStatus tone="success" className="mt-3">queued deployment {deploy.data.deployment.slug}</FormStatus> : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" disabled={analyze.isPending || sessionLoading} className="btn-primary justify-center disabled:opacity-60">
              {analyze.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />}
              {isAuthenticated ? "./analyze_archive" : "./signin_to_analyze"}
            </button>
            <button
              type="button"
              disabled={!analyze.data?.analysis.deployment.ready || deploy.isPending}
              onClick={() => void deployArchive()}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deploy.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
              ./deploy_project
            </button>
          </div>
        </form>

        <TerminalWindow title="~/iranapi/project-analysis">
          {analyze.data?.analysis ? (
            <div className="space-y-3 text-xs" data-ltr>
              <div className="flex flex-wrap gap-2">
                <Tag color="primary">{analyze.data.analysis.language}</Tag>
                <Tag color="cyan">{Math.round(analyze.data.analysis.language_confidence * 100)}% confidence</Tag>
                <Tag color={analyze.data.analysis.deployment.ready ? "primary" : "amber"}>{analyze.data.analysis.deployment.ready ? "deployable" : "needs work"}</Tag>
              </div>
              <div>// {analyze.data.analysis.file_count} files / {(analyze.data.analysis.uncompressed_size / 1024).toFixed(1)} KiB</div>
              <div>// framework: {analyze.data.analysis.frameworks.join(", ") || "not detected"}</div>
              <div>// entrypoint: {analyze.data.analysis.entrypoints.join(", ") || "not detected"}</div>
              <div>// routes: {analyze.data.analysis.routes.length}</div>
              {analyze.data.analysis.deployment.start_command ? <CodeBlock>{analyze.data.analysis.deployment.start_command}</CodeBlock> : null}
              {analyze.data.analysis.warnings.map((warning) => <div key={warning} className="text-amber">// warning: {warning}</div>)}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">analysis results appear here</div>
          )}
          {deployments.data?.results.length ? (
            <div className="mt-5 border-t border-border pt-4 text-xs" data-ltr>
              <div className="mb-2 text-muted-foreground">// recent deployments</div>
              {deployments.data.results.slice(0, 3).map((item) => (
                <div key={item.id} className="py-1">
                  <div className="flex justify-between gap-2">
                    {item.deployment_url ? (
                      <a href={item.deployment_url} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">{item.slug}</a>
                    ) : <span className="truncate">{item.slug}</span>}
                    <span className={item.status === "failed" ? "text-destructive" : item.status === "deployed" ? "text-primary" : "text-amber"}>{item.status}</span>
                  </div>
                  {item.failure_reason ? <div className="mt-1 line-clamp-2 text-destructive">{item.failure_reason}</div> : null}
                </div>
              ))}
            </div>
          ) : null}
        </TerminalWindow>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),380px]">
        <form onSubmit={submit} className="terminal-border rounded-sm bg-card/50 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="init-project-name" label="--project-name" value={form.project_name} onChange={(event) => setForm((v) => ({ ...v, project_name: event.target.value }))} icon={FolderKanban} required />
            <TextField id="init-package" label="--package" value={form.package_name} onChange={(event) => setForm((v) => ({ ...v, package_name: event.target.value }))} icon={Boxes} dir="ltr" />
            <SelectField id="init-language" label="--language" value={form.language} onChange={(event) => setForm((v) => ({ ...v, language: event.target.value }))} icon={Languages}>
                {languages.map((language) => (
                  <option key={language.slug} value={language.slug}>{language.label}</option>
                ))}
            </SelectField>
            <SelectField id="init-api" label="--api" value={form.api_slug} onChange={(event) => setForm((v) => ({ ...v, api_slug: event.target.value }))} icon={PlugZap}>
                <option value="">no catalog binding</option>
                {apis.map((api) => (
                  <option key={api.slug} value={api.slug}>{api.name}</option>
                ))}
            </SelectField>
          </div>

          <div className="mt-3">
            <CheckboxField id="init-docker" label="include Dockerfile" checked={form.include_docker} onChange={(include_docker) => setForm((v) => ({ ...v, include_docker }))} />
          </div>

          {error ? <FormStatus tone="error" className="mt-3">{error}</FormStatus> : null}
          {project ? (
            <FormStatus tone="success" className="mt-3">
              <span>initialized {project.slug}</span>
              <Tag color="primary">{project.language}</Tag>
              <Tag color="amber">{project.file_count} files</Tag>
            </FormStatus>
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
              <Prompt>iranapi init --lang {form.language} --name "{form.project_name}"</Prompt>
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
