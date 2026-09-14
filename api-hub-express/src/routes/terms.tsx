import { PageShell, SectionHeader } from "@/components/site/Layout";

export default function Terms() {
  return (
    <PageShell>
      <SectionHeader kicker="legal" title="terms of service" subtitle="// development draft; deployment operators must publish their own legal terms" />
      <article className="prose prose-invert max-w-3xl space-y-5 text-sm text-foreground/85">
        <Section n="01" t="scope">
          this page documents repository behavior and is not a substitute for a deployment-specific legal agreement.
        </Section>
        <Section n="02" t="acceptable use">
          do not expose account or provider credentials, bypass access grants, or use the caller against unintended destinations.
        </Section>
        <Section n="03" t="caller controls">
          live calls are limited to catalog endpoints and server-configured provider hosts. Provider credentials remain server-side.
        </Section>
        <Section n="04" t="data">
          MongoDB stores account, catalog, subscription, project, and usage metadata. Caller request and response bodies are not stored by the usage recorder.
        </Section>
        <Section n="05" t="production use">
          before public deployment, the operator must add applicable terms, privacy contacts, retention periods, billing rules, and support commitments.
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
