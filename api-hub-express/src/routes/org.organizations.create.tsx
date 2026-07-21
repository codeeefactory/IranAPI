import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Prompt, Tag } from "@/components/site/Terminal";
import { useCreateOrganization, useOrganizations, useSession } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/api-client";

export default function OrgCreate() {
  const { isAuthenticated } = useSession();
  const organizations = useOrganizations(isAuthenticated);
  const createOrganization = useCreateOrganization();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("ir-tehran-1");
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedSlug("");

    if (!isAuthenticated) {
      setError("Sign in required for organization provisioning.");
      return;
    }

    try {
      const response = await createOrganization.mutateAsync({ name, region });
      setCreatedSlug(response.organization.slug);
      setName("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Organization provisioning failed.");
    }
  }

  return (
    <PageShell>
      <SectionHeader kicker="iran org create" title="provision a new organization" subtitle="// orgs scope billing, keys, members and rbac." />
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1fr,320px]">
        <TerminalWindow title="~/iranapi/orgs/create" glow>
          <form onSubmit={submit} className="space-y-3 text-sm">
            <Prompt>iran org create</Prompt>
            <label className="block" htmlFor="org-name">
              <div className="text-xs text-muted-foreground mb-1">--name</div>
              <input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="acme-payments"
                required
                className="w-full rounded-sm border border-border bg-background/60 px-3 py-2 outline-none focus:border-primary"
              />
            </label>
            <label className="block" htmlFor="org-region">
              <div className="text-xs text-muted-foreground mb-1">--region</div>
              <select
                id="org-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-sm border border-border bg-background/60 px-3 py-2 outline-none focus:border-primary text-primary"
              >
                <option value="ir-tehran-1">ir-tehran-1</option>
                <option value="ir-mashhad-1">ir-mashhad-1</option>
                <option value="eu-frankfurt-1">eu-frankfurt-1</option>
              </select>
            </label>
            {error ? <div className="text-xs text-destructive" role="alert">{"// "}{error}</div> : null}
            {createdSlug ? <div className="text-xs text-primary text-glow" role="status">{"// provisioned "}{createdSlug}</div> : null}
            <button
              type="submit"
              disabled={createOrganization.isPending}
              className="w-full rounded-sm border border-primary bg-primary px-4 py-2 font-bold text-primary-foreground hover:shadow-glow disabled:opacity-60"
            >
              {createOrganization.isPending ? "./provision --wait" : "./provision"}
            </button>
            {!isAuthenticated ? (
              <div className="text-xs text-muted-foreground">
                {"// "}
                <Link to="/signin" className="text-primary hover:underline">signin</Link>
                {" required"}
              </div>
            ) : null}
          </form>
        </TerminalWindow>
        <TerminalWindow title="~/iranapi/orgs/list">
          <div className="space-y-3 text-sm">
            <Prompt>iran org list --mine</Prompt>
            {organizations.isLoading && isAuthenticated ? <div className="text-xs text-muted-foreground">// loading orgs...</div> : null}
            {!isAuthenticated ? <div className="text-xs text-muted-foreground">// authenticate to list orgs</div> : null}
            {isAuthenticated && !organizations.data?.results.length && !organizations.isLoading ? (
              <div className="text-xs text-muted-foreground">// no organizations yet</div>
            ) : null}
            {organizations.data?.results.map((org) => (
              <div key={org.id} className="terminal-border rounded-sm bg-background/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-primary">{org.slug}</span>
                  <Tag color={org.status === "active" ? "primary" : "amber"}>{org.status}</Tag>
                </div>
                <div className="mt-1 text-xs text-muted-foreground" data-ltr>{org.region}</div>
              </div>
            ))}
          </div>
        </TerminalWindow>
      </div>
    </PageShell>
  );
}
