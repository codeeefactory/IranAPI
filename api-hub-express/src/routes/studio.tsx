import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Rocket } from "lucide-react";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Prompt, Tag } from "@/components/site/Terminal";
import { useSession } from "@/hooks/useAuth";
import { useCatalogApis } from "@/hooks/useCatalog";
import { useUsageHistory } from "@/hooks/useUsage";
import { useDeployStudioFlow, useStudioFlows } from "@/hooks/useStudio";
import { ApiClientError, type StudioFlowNode } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";

const regions = ["ir-tehran-1", "ir-mashhad-1", "eu-frankfurt-1"];

function buildNodes(apiName: string): StudioFlowNode[] {
  return [
    { type: "trigger", label: "POST /webhook", order: 1 },
    { type: "api_call", label: apiName || "catalog api", order: 2 },
    { type: "notify", label: "send confirmation", order: 3 },
  ];
}

export default function StudioPage() {
  const { t } = useI18n();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { apis } = useCatalogApis({ page_size: 6 });
  const firstApi = apis[0];
  const [apiSlug, setApiSlug] = useState(firstApi?.slug ?? "");
  const [flowName, setFlowName] = useState("payment_confirm");
  const [region, setRegion] = useState("ir-tehran-1");
  const [error, setError] = useState("");
  const [deployedSlug, setDeployedSlug] = useState("");
  const selectedApi = useMemo(() => apis.find((api) => api.slug === apiSlug) ?? firstApi, [apiSlug, apis, firstApi]);
  const nodes = useMemo(() => buildNodes(selectedApi?.name ?? selectedApi?.slug ?? ""), [selectedApi?.name, selectedApi?.slug]);
  const deploy = useDeployStudioFlow();
  const flows = useStudioFlows(isAuthenticated);
  const usage = useUsageHistory({ source: "studio", page_size: 5 }, isAuthenticated);

  useEffect(() => {
    if (!apiSlug && firstApi?.slug) setApiSlug(firstApi.slug);
  }, [apiSlug, firstApi?.slug]);

  async function deployFlow() {
    setError("");
    setDeployedSlug("");
    if (!isAuthenticated) {
      setError("Sign in required for Studio deploy.");
      return;
    }
    if (!selectedApi?.slug) {
      setError("Select an API target first.");
      return;
    }

    try {
      const response = await deploy.mutateAsync({
        name: flowName,
        api_slug: selectedApi.slug,
        region,
        nodes,
      });
      setDeployedSlug(response.flow.slug);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Studio flow deploy failed.");
    }
  }

  return (
    <PageShell>
      <SectionHeader kicker={t("studio.kicker")} title={t("studio.title")} subtitle={"// " + t("studio.sub")} />

      <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
        <div className="terminal-border rounded-sm bg-card/40 min-h-[420px] p-4 sm:p-6 grid-bg overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs uppercase text-muted-foreground">{"// "}{t("studio.canvas")}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="sr-only" htmlFor="studio-api">api</label>
              <select id="studio-api" value={apiSlug} onChange={(e) => setApiSlug(e.target.value)} className="field !w-auto !py-1.5 text-primary">
                {apis.slice(0, 6).map((api) => <option key={api.slug} value={api.slug}>{api.name}</option>)}
              </select>
              <label className="sr-only" htmlFor="studio-region">region</label>
              <select id="studio-region" value={region} onChange={(e) => setRegion(e.target.value)} className="field !w-auto !py-1.5 text-amber">
                {regions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-4 sm:gap-6 sm:items-center min-w-[520px] sm:min-w-0">
            {nodes.map((node, index) => (
              <div key={node.order} className="relative">
                <div className="terminal-border bg-background/80 rounded-sm p-4 shadow-glow">
                  <Tag color={index === 0 ? "amber" : index === 1 ? "primary" : "cyan"}>{node.type}</Tag>
                  <div className="mt-2 text-sm text-foreground">{node.label}</div>
                  <div className="mt-2 text-[10px] text-muted-foreground" data-ltr>// node #{node.order}</div>
                </div>
                {index < nodes.length - 1 && (
                  <div className="absolute top-1/2 -end-4 hidden sm:flex items-center text-primary text-glow rtl-flip" aria-hidden>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ascii-divider mt-8" />
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr,auto] md:items-end">
            <label className="block text-xs text-muted-foreground" htmlFor="studio-flow">
              --flow
              <input id="studio-flow" value={flowName} onChange={(e) => setFlowName(e.target.value)} className="field mt-1 font-mono text-primary" />
            </label>
            <button
              type="button"
              onClick={deployFlow}
              disabled={deploy.isPending || sessionLoading}
              className="btn-primary justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deploy.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
              {deploy.isPending ? "./deploying" : "./deploy"}
            </button>
          </div>
          {error ? <div className="mt-3 text-xs text-destructive" role="alert">{"// "}{error}</div> : null}
          {deployedSlug ? <div className="mt-3 text-xs text-primary text-glow" role="status">{"// deployed "}{deployedSlug}</div> : null}
          {!isAuthenticated && !sessionLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {"// "}
              <Link to="/signin" className="text-primary hover:underline">signin</Link>
              {" required"}
            </div>
          ) : null}
          <pre data-ltr className="mt-4 text-[10px] text-muted-foreground overflow-x-auto">{`// flow: ${flowName}.v1
// triggers: 1   nodes: ${nodes.length}   branches: 0   p95: ${deploy.data?.flow.latency_ms ?? 478}ms`}</pre>
        </div>

        <div className="space-y-4">
          <TerminalWindow title="~/iranapi/studio/deploy">
            <div data-terminal className="text-sm space-y-2">
              <Prompt>iran flow deploy {flowName}</Prompt>
              <div className="text-xs text-muted-foreground">// validating dag...</div>
              <div className="text-xs text-primary">// {nodes.length} nodes ok</div>
              <div className="text-xs text-primary">// target {selectedApi?.slug ?? "api"}</div>
              <div className="text-xs text-primary">// region {region}</div>
              <div className="text-xs text-amber">// flow id: {deploy.data?.flow.slug ?? "pending"}</div>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/studio/flows">
            <div className="space-y-2 text-xs" data-ltr>
              {flows.isLoading && isAuthenticated ? <div className="text-muted-foreground">loading...</div> : null}
              {!isAuthenticated ? <div className="text-muted-foreground">authenticate to list flows</div> : null}
              {isAuthenticated && !flows.data?.results.length && !flows.isLoading ? <div className="text-muted-foreground">no flows deployed yet</div> : null}
              {flows.data?.results.slice(0, 4).map((flow) => (
                <div key={flow.id} className="terminal-border rounded-sm bg-background/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-bold text-primary">{flow.slug}</span>
                    <Tag color={flow.status === "deployed" ? "primary" : "amber"}>{flow.status}</Tag>
                  </div>
                  <div className="mt-1 text-muted-foreground">{flow.api_slug} // {flow.node_count} nodes // {flow.latency_ms}ms</div>
                </div>
              ))}
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/studio/usage">
            <div className="space-y-2 text-xs" data-ltr>
              {usage.isLoading && isAuthenticated ? <div className="text-muted-foreground">loading...</div> : null}
              {usage.data?.results.length ? (
                usage.data.results.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0">
                    <span className="truncate">{item.path || item.api?.slug || "studio"}</span>
                    <span className="text-amber tabular-nums">{item.latency_ms ?? 0}ms</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">{isAuthenticated ? "no studio usage yet" : "signin required"}</div>
              )}
            </div>
          </TerminalWindow>
        </div>
      </div>
    </PageShell>
  );
}
