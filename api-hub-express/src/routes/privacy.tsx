import { PageShell, SectionHeader } from "@/components/site/Layout";

export default function Privacy() {
  return (
    <PageShell>
      <SectionHeader kicker="legal" title="privacy implementation notes" subtitle="// describes the current repository behavior" />
      <article className="max-w-3xl space-y-5 text-sm text-foreground/85">
        <Section n="01" t="what we collect">
          account and profile fields, subscription and project records, plus caller metadata such as status, latency, and response size.
        </Section>
        <Section n="02" t="what we do not collect">
          caller request and response bodies are not persisted by the usage recorder. Public webhook delivery is not implemented.
        </Section>
        <Section n="03" t="retention">
          session documents expire through a MongoDB TTL index. A general account-data retention schedule is not implemented in this repository.
        </Section>
        <Section n="04" t="export & delete">
          self-service export and deletion endpoints are not implemented yet; contact the operator of your deployment for manual handling.
        </Section>
        <Section n="05" t="contact">
          use the contact channel configured by the operator of the deployment you are using.
        </Section>
      </article>
    </PageShell>
  );
}

function Section({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-primary text-glow">
        <span data-ltr>{n} // </span>
        {t}
      </h2>
      <p className="mt-1 text-sm leading-relaxed">{children}</p>
    </section>
  );
}
