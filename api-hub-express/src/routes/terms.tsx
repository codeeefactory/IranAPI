import { PageShell, SectionHeader } from "@/components/site/Layout";

export default function Terms() {
  return (
    <PageShell>
      <SectionHeader kicker="legal" title="terms of service" subtitle="// last updated 2026.5.24" />
      <article className="prose prose-invert max-w-3xl space-y-5 text-sm text-foreground/85">
        <Section n="01" t="acceptance">
          by calling any endpoint at api.iranapi.dev you agree to these terms.
        </Section>
        <Section n="02" t="acceptable use">
          no scraping. no resale of credentials. no automated attacks against upstream apis.
        </Section>
        <Section n="03" t="rate limits">
          enforced per-key. burst capacity may be granted by support.
        </Section>
        <Section n="04" t="data">
          we store request metadata for 30 days for billing and observability. payload bodies are not persisted beyond the
          request lifecycle.
        </Section>
        <Section n="05" t="termination">
          we may suspend keys violating these terms with reasonable notice except in security emergencies.
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
