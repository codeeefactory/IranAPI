import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Prompt, Tag } from "@/components/site/Terminal";
import { useSession } from "@/hooks/useAuth";
import {
  useConfirmSubscriptionCheckout,
  useCreateSubscriptionCheckout,
  useSubscriptionPlans,
} from "@/hooks/useSubscription";
import type { SubscriptionCheckout, SubscriptionPlan } from "@/lib/api-client";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedSlug = searchParams.get("subscription") || searchParams.get("plan") || "growth";
  const { isAuthenticated } = useSession();
  const { plans } = useSubscriptionPlans();
  const createCheckout = useCreateSubscriptionCheckout();
  const confirmCheckout = useConfirmSubscriptionCheckout();
  const selectedPlan = plans.find((plan) => plan.slug === selectedSlug) ?? plans.find((plan) => plan.is_popular) ?? plans[0];
  const checkout = createCheckout.data?.checkout ?? confirmCheckout.data?.checkout;
  const activeError = createCheckout.error || confirmCheckout.error;
  const isBusy = createCheckout.isPending || confirmCheckout.isPending;

  async function handlePay() {
    if (!isAuthenticated) {
      navigate(`/signin?next=${encodeURIComponent(`/payment?subscription=${selectedPlan.slug}`)}`);
      return;
    }
    if (!selectedPlan || selectedPlan.id <= 0) return;
    const checkoutResult = checkout ?? (await createCheckout.mutateAsync(selectedPlan.id)).checkout;
    await confirmCheckout.mutateAsync(checkoutResult.id);
  }

  return (
    <PageShell>
      <SectionHeader kicker="iran billing checkout" title="confirm payment" subtitle="// settled in irr or usd. invoices issued via email." />
      <div className="mx-auto max-w-xl space-y-4">
        <TerminalWindow title="~/iranapi/billing/checkout" glow>
          <div className="space-y-3 text-sm">
            <Prompt>iran billing checkout --plan {selectedPlan?.slug ?? selectedSlug}</Prompt>
            {selectedPlan ? (
              <CheckoutPanel plan={selectedPlan} checkout={checkout} />
            ) : (
              <div className="surface-card rounded-sm p-4 text-sm text-muted-foreground">plan not found</div>
            )}
            {activeError && (
              <div className="rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                {activeError.message}
              </div>
            )}
            {confirmCheckout.data?.subscription ? (
              <Link to="/dashboard" className="btn-primary w-full justify-center">
                ./subscription_active
              </Link>
            ) : (
              <button
                type="button"
                className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!selectedPlan || isBusy}
                onClick={handlePay}
              >
                {isBusy ? "./processing" : isAuthenticated ? "./confirm_and_pay" : "./signin_to_pay"}
              </button>
            )}
          </div>
        </TerminalWindow>
      </div>
    </PageShell>
  );
}

function CheckoutPanel({ plan, checkout }: { plan: SubscriptionPlan; checkout?: SubscriptionCheckout }) {
  const subtotal = Number(checkout?.amount ?? plan.price);
  const vat = subtotal * 0.09;
  const total = subtotal + vat;
  const currency = (checkout?.currency ?? plan.currency).toLowerCase();

  return (
    <div className="grad-border glass rounded-sm p-4 space-y-2">
      <Row label="plan" value={plan.slug} tag="primary" />
      <Row label="period" value={plan.interval} />
      <Row label="gateway" value={checkout?.gateway ?? "manual"} />
      <Row label="reference" value={checkout?.reference ?? "pending"} />
      <div className="ascii-divider" />
      <Row label="subtotal" value={`${formatMoney(subtotal)} ${currency}`} />
      <Row label="vat 9%" value={`${formatMoney(vat)} ${currency}`} />
      <div className="flex items-center justify-between pt-2 text-base">
        <span className="text-muted-foreground">// total</span>
        <span className="font-black text-primary text-glow">{formatMoney(total)} {currency}</span>
      </div>
    </div>
  );
}

function Row({ label, value, tag }: { label: string; value: string; tag?: "primary" | "amber" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {tag ? <Tag color={tag}>{value}</Tag> : <span className="text-foreground" data-ltr>{value}</span>}
    </div>
  );
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);
}
