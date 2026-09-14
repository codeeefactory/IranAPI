import { Link } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSubscriptionPlans } from "@/hooks/useSubscription";
import type { SubscriptionPlan } from "@/lib/api-client";

export default function PricingPage() {
  const { t } = useI18n();
  const { plans, isLoading, isError, isFallback, refetch } = useSubscriptionPlans();

  return (
    <PageShell>
      <SectionHeader kicker={t("pricing.kicker")} title={t("pricing.title")} subtitle={"// " + t("pricing.sub")} />

      {isLoading && <div className="state-block" data-tone="loading"><div className="spinner" aria-hidden /><div className="state-sub">loading plans...</div></div>}
      {isError && !isFallback && <div className="state-block" data-tone="error" role="alert"><div className="state-title">// pricing unavailable</div><button type="button" className="btn-primary mt-3" onClick={() => void refetch()}>./retry</button></div>}
      {!isLoading && !isError && plans.length === 0 && <div className="state-block"><div className="state-title">// no active plans published</div></div>}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const features = getPlanFeatures(p);
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
              <p className="mt-1 text-xs text-muted-foreground">{p.description || "No description published."}</p>
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

    </PageShell>
  );
}

function getPlanFeatures(plan: SubscriptionPlan) {
  if (plan.features?.length) return plan.features;
  return ["No feature list published."];
}

function formatPlanPrice(plan: SubscriptionPlan, t: (key: string) => string) {
  const value = Number(plan.price);
  if (plan.plan_type === "enterprise" && value === 0) return t("pricing.plans.enterprise.price");
  if (!Number.isFinite(value)) return plan.price;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);
}
