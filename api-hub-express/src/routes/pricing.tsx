import { Link } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { Tag } from "@/components/site/Terminal";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSubscriptionPlans } from "@/hooks/useSubscription";
import type { SubscriptionPlan } from "@/lib/api-client";

const OVERAGE = [
  { catKey: "cat.payments", unitKey: "pricing.overage.unitIrr", n: "120" },
  { catKey: "cat.sms-otp", unitKey: "pricing.overage.unitIrr", n: "85" },
  { catKey: "cat.ai-ml", unitKey: "pricing.overage.unitTok", n: "0.0008" },
  { catKey: "cat.maps-geo", unitKey: "pricing.overage.unitIrr", n: "40" },
];

export default function PricingPage() {
  const { t } = useI18n();
  const { plans } = useSubscriptionPlans();

  return (
    <PageShell>
      <SectionHeader kicker={t("pricing.kicker")} title={t("pricing.title")} subtitle={"// " + t("pricing.sub")} />

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const features = getPlanFeatures(p, t);
          const price = formatPlanPrice(p, t);
          const unit = p.plan_type === "enterprise" ? t("pricing.unit.custom") : `${p.currency.toLowerCase()} / ${p.interval}`;
          const cta = p.plan_type === "enterprise" ? t("pricing.plans.enterprise.cta") : `./checkout_${p.slug}`;
          return (
            <div
              key={p.slug}
              className={`relative rounded-sm p-6 flex flex-col ${p.is_popular ? "grad-border glass shadow-glow-amber" : "surface-card"}`}
            >
              {p.is_popular && (
                <div className="absolute -top-2.5 left-4 rounded-sm bg-amber px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-glow-amber">
                  {t("pricing.recommended")}
                </div>
              )}
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{"// "}{t("pricing.plan")}</div>
              <div className="mt-1 text-2xl font-black text-primary text-glow">{p.name || p.slug}</div>
              <p className="mt-1 text-xs text-muted-foreground">{p.description || t(`pricing.plans.${legacyPlanKey(p)}.desc`)}</p>
              <div className="mt-5 flex items-baseline gap-2" data-ltr>
                <span className="text-4xl font-black text-foreground">{price}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm flex-1">
                {features.map((f) => (
                  <li key={f} className="flex gap-2 text-foreground/85">
                    <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={p.plan_type === "enterprise" ? "/dashboard" : `/payment?subscription=${encodeURIComponent(p.slug)}`}
                className={`mt-6 w-full justify-center ${p.is_popular ? "btn-primary" : "cta-grad"}`}
              >
                {cta}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-12 surface-card rounded-sm p-6">
        <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("pricing.overage")}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-sm">
          {OVERAGE.map((row) => (
            <div key={row.catKey} className="rounded-sm border border-border bg-background/40 p-3 transition hover:border-primary/60 hover:shadow-glow">
              <Tag color="muted">{t(row.catKey)}</Tag>
              <div className="mt-2 text-foreground" data-ltr>{t(row.unitKey, { n: row.n })}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function legacyPlanKey(plan: SubscriptionPlan) {
  if (plan.plan_type === "starter") return "free";
  if (plan.plan_type === "growth") return "team";
  if (plan.plan_type === "enterprise") return "enterprise";
  return "team";
}

function getPlanFeatures(plan: SubscriptionPlan, t: (key: string) => string) {
  if (plan.features?.length) return plan.features;
  return t(`pricing.plans.${legacyPlanKey(plan)}.features`).split("|");
}

function formatPlanPrice(plan: SubscriptionPlan, t: (key: string) => string) {
  const value = Number(plan.price);
  if (plan.plan_type === "enterprise" && value === 0) return t("pricing.plans.enterprise.price");
  if (!Number.isFinite(value)) return plan.price;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);
}
