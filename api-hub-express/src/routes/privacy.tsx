import { PageShell, SectionHeader } from "@/components/site/Layout";

export default function Privacy() {
  return (
    <PageShell>
      <SectionHeader kicker="legal" title="privacy policy" subtitle="// last updated 2026.5.24" />
      <article className="max-w-3xl space-y-5 text-sm text-foreground/85">
        <Section n="01" t="what we collect">
          account email, billing info, request metadata (timing, status, bytes) for keys you own.
        </Section>
        <Section n="02" t="what we do not collect">
          request and response bodies are not stored. webhook payloads are forwarded, not retained.
        </Section>
        <Section n="03" t="retention">
          metadata retained 30 days. invoices retained 7 years per local tax law.
        </Section>
        <Section n="04" t="export & delete">
          request a full data export or deletion at <span className="text-amber">privacy@iranapi.dev</span>.
        </Section>
        <Section n="05" t="contact">
          questions: <span className="text-amber">privacy@iranapi.dev</span> // pgp on request.
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
