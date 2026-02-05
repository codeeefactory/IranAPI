import { useState } from "react";
import { ArrowLeft, CircleAlert, Route, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCancelSubscriptionCheckout,
  useConfirmSubscriptionCheckout,
  useCreateSubscriptionCheckout,
  usePricingPlans,
  useSession,
  useSubscriptionCheckout,
  useSubscriptionPlans,
} from "@/hooks/useApi";
import { SubscriptionCheckout } from "@/lib/api";
import { usePageMetadata } from "@/lib/metadata";
import { formatCurrencyLabel, formatDateTimeFa, formatFaNumber } from "@/lib/site";

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanId = Number(searchParams.get("plan") || "0");
  const selectedSubscriptionId = Number(searchParams.get("subscription") || "0");
  const selectedCheckoutId = Number(searchParams.get("checkout") || "0");
  const [createdCheckout, setCreatedCheckout] = useState<SubscriptionCheckout | null>(null);
  const { data: pricingPlans } = usePricingPlans();
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const session = useSession();
  const createCheckout = useCreateSubscriptionCheckout();
  const confirmCheckout = useConfirmSubscriptionCheckout();
  const cancelCheckout = useCancelSubscriptionCheckout();
  const checkoutId = selectedCheckoutId || createdCheckout?.id;
  const checkoutQuery = useSubscriptionCheckout(checkoutId, createdCheckout);
  const activeCheckout = checkoutQuery.data?.checkout || createdCheckout;
  const plan = pricingPlans?.results.find((item) => item.id === selectedPlanId);
  const subscriptionPlan =
    activeCheckout?.plan || subscriptionPlans?.results.find((item) => item.id === selectedSubscriptionId);
  const isReadyForActivation = Boolean(plan?.is_listed_on_rapidapi);
  const isSubscriptionCheckout = Boolean(subscriptionPlan);

  usePageMetadata({
    title: isSubscriptionCheckout ? "فعال‌سازی اشتراک" : "فعال‌سازی دسترسی",
    description: "جزئیات پلن، محدودیت‌ها و مرحله بعدی فعال‌سازی را در IranAPI بررسی کنید.",
    path: selectedSubscriptionId ? `/payment?subscription=${selectedSubscriptionId}` : selectedPlanId ? `/payment?plan=${selectedPlanId}` : "/payment",
    noindex: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const plan = plans[planId as keyof typeof plans];
    if (plan) {
      setSelectedPlan(plan);
    }
  }, [planId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPlan.price === 0 && selectedPlan.name === "رایگان") {
      // Free plan - no payment needed
      toast.success("پلن رایگان با موفقیت فعال شد!");
      setTimeout(() => navigate("/dashboard"), 1500);
      return;
    }

    if (selectedPlan.name === "سازمانی") {
      // Enterprise plan - contact sales
      toast.info("برای پلن سازمانی، لطفاً با تیم فروش تماس بگیرید");
      return;
    }

    // Validate form
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
      toast.error("لطفاً تمام فیلدهای پرداخت را پر کنید");
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("پرداخت با موفقیت انجام شد! پلن شما فعال شد.");
      setTimeout(() => navigate("/dashboard"), 2000);
    }, 2000);
  };

  const startSubscriptionPurchase = async () => {
    if (!subscriptionPlan) {
      return;
    }
    if (!session.data?.authenticated) {
      navigate("/signin", { state: { from: `/payment?subscription=${subscriptionPlan.id}` } });
      return;
    }
    const result = await createCheckout.mutateAsync(subscriptionPlan.id);
    setCreatedCheckout(result.checkout);
    navigate(`/payment?subscription=${subscriptionPlan.id}&checkout=${result.checkout.id}`, { replace: true });
  };

  const confirmSubscriptionPayment = async () => {
    if (!activeCheckout) {
      return;
    }
    await confirmCheckout.mutateAsync(activeCheckout.id);
    navigate("/dashboard", { replace: true });
  };

  const cancelSubscriptionPayment = async () => {
    if (!activeCheckout) {
      return;
    }
    const result = await cancelCheckout.mutateAsync(activeCheckout.id);
    setCreatedCheckout(result.checkout);
  };

  const checkoutIsPending = activeCheckout?.status === "pending";
  const checkoutIsPaid = activeCheckout?.status === "paid";
  const checkoutIsClosed = Boolean(activeCheckout && !checkoutIsPending && !checkoutIsPaid);
  const isBusy = createCheckout.isPending || confirmCheckout.isPending || cancelCheckout.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/pricing")}
              className="mb-4"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              بازگشت به قیمت‌گذاری
            </Button>

            <div className="space-y-3">
              <p className="eyebrow">مسیر فعال‌سازی</p>
              <h1 className="section-title">{isSubscriptionCheckout ? "فعال‌سازی اشتراک" : "فعال‌سازی دسترسی API"}</h1>
              <p className="section-copy">
                قبل از فعال‌سازی، جزئیات پلن، سقف مصرف و وضعیت سرویس را بررسی کنید. دسترسی‌ها و گزارش مصرف بعد از فعال‌سازی در داشبورد IranAPI مدیریت می‌شوند.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="stat-chip">
                <Route className="h-4 w-4 text-primary" />
                جزئیات شفاف پلن
              </span>
              <span className="stat-chip">
                <ShieldCheck className="h-4 w-4 text-primary" />
                مدیریت امن دسترسی
              </span>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle>{isSubscriptionCheckout ? "اشتراک انتخاب‌شده" : "پلن انتخاب‌شده"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionPlan ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xl font-semibold">{subscriptionPlan.name}</p>
                        <p className="text-sm text-muted-foreground">{subscriptionPlan.plan_type}</p>
                      </div>
                      <Badge>{formatCurrencyLabel(subscriptionPlan.price, subscriptionPlan.currency)}</Badge>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{subscriptionPlan.description}</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        انتشار API:{" "}
                        {subscriptionPlan.api_publish_limit === null ? "نامحدود" : `${formatFaNumber(subscriptionPlan.api_publish_limit)} API`}
                      </p>
                      <p>
                        درخواست ماهانه:{" "}
                        {subscriptionPlan.included_requests === null ? "نامحدود" : formatFaNumber(subscriptionPlan.included_requests)}
                      </p>
                      <p>دوره تمدید: هر {formatFaNumber(subscriptionPlan.interval_days)} روز</p>
                    </div>
                  </>
                ) : plan ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label htmlFor="expiryDate">تاریخ انقضا</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          maxLength={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          type="text"
                          placeholder="۱۲۳"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          maxLength={4}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>درخواست روزانه: {plan.requests_per_day?.toLocaleString("fa-IR") || "نامشخص"}</p>
                      <p>درخواست ماهانه: {plan.requests_per_month?.toLocaleString("fa-IR") || "نامشخص"}</p>
                      <p>وضعیت دسترسی: {isReadyForActivation ? "آماده فعال‌سازی" : "در حال آماده‌سازی"}</p>
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="email">ایمیل</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">شماره تماس</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:shadow-glow"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "در حال پردازش..." : `پرداخت ${selectedPlan.priceText}`}
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                      <Lock className="h-4 w-4" />
                      <span>پرداخت شما به صورت امن انجام می‌شود</span>
                    </div>
                  </form>
                )}
                {activeCheckout ? (
                  <div className="grid gap-3 rounded-md border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-foreground">شماره پیگیری: </span>
                      {activeCheckout.reference}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">وضعیت پرداخت: </span>
                      {activeCheckout.status}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">درگاه: </span>
                      {activeCheckout.gateway}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">اعتبار تا: </span>
                      {formatDateTimeFa(activeCheckout.expires_at)}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardHeader className="flex flex-row items-center gap-3">
                <CircleAlert className="h-5 w-5 text-accent" />
                <CardTitle>مرحله‌های فعال‌سازی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <div className="metric-card">
                  <p className="mb-2 font-semibold text-foreground">1. بررسی پلن و محدودیت‌ها</p>
                  <p>سقف مصرف، نوع پلن و وضعیت آماده‌بودن سرویس را قبل از ادامه بررسی کنید.</p>
                </div>
                <div className="metric-card">
                  <p className="mb-2 font-semibold text-foreground">2. فعال‌سازی از حساب کاربری</p>
                  <p>دسترسی از حساب پرتال فعال می‌شود تا کلیدها، محدودیت‌ها و گزارش مصرف در یک مسیر واحد بمانند.</p>
                </div>
                <div className="metric-card">
                  <p className="mb-2 font-semibold text-foreground">3. بازگشت به داشبورد</p>
                  <p>بعد از فعال‌سازی، وضعیت دسترسی و مصرف را از داشبورد پیگیری کنید.</p>
                </div>

                {subscriptionPlan ? (
                  <div className="rounded-md border border-accent/30 bg-accent/10 p-4">
                    <p className="font-semibold text-foreground">
                      {activeCheckout ? "پرداخت اشتراک آماده تایید است" : "این اشتراک آماده خرید است"}
                    </p>
                    <p className="mt-2">
                      {activeCheckout
                        ? "بعد از تایید پرداخت، این پلن به عنوان اشتراک فعال حساب ثبت می‌شود."
                        : "ابتدا پرداخت را ایجاد کنید تا شماره پیگیری و زمان اعتبار سفارش ثبت شود."}
                    </p>
                  </div>
                ) : isReadyForActivation ? (
                  <div className="rounded-md border border-accent/30 bg-accent/10 p-4">
                    <p className="font-semibold text-foreground">این پلن آماده فعال‌سازی است</p>
                    <p className="mt-2">برای ادامه، داشبورد را باز کنید و دسترسی سرویس را از حساب خود نهایی کنید.</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-accent/35 bg-accent/10 p-4">
                    <p className="font-semibold text-foreground">این پلن هنوز آماده فعال‌سازی نیست</p>
                    <p className="mt-2">تا زمان تکمیل آماده‌سازی، این صفحه فقط وضعیت پلن را نمایش می‌دهد.</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {subscriptionPlan ? (
                    <>
                      {!activeCheckout || checkoutIsClosed ? (
                        <Button onClick={startSubscriptionPurchase} disabled={isBusy}>
                          {createCheckout.isPending
                            ? "در حال ایجاد پرداخت..."
                            : session.data?.authenticated
                              ? "خرید اشتراک"
                              : "ورود و خرید اشتراک"}
                        </Button>
                      ) : null}
                      {checkoutIsPending ? (
                        <>
                          <Button onClick={confirmSubscriptionPayment} disabled={isBusy}>
                            {confirmCheckout.isPending ? "در حال تایید پرداخت..." : "تایید پرداخت و فعال‌سازی"}
                          </Button>
                          <Button variant="outline" onClick={cancelSubscriptionPayment} disabled={isBusy}>
                            لغو پرداخت
                          </Button>
                        </>
                      ) : null}
                      {checkoutIsPaid ? (
                        <Button asChild>
                          <Link to="/dashboard">مشاهده اشتراک در داشبورد</Link>
                        </Button>
                      ) : null}
                    </>
                  ) : (
                    <Button asChild>
                      <Link to="/dashboard">رفتن به داشبورد</Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <Link to="/browse">کشف APIها</Link>
                  </Button>
                </div>

                <Separator />

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">قیمت پلن</span>
                    <span className="font-semibold">{selectedPlan.priceText}</span>
                  </div>
                  {selectedPlan.price > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مالیات</span>
                        <span className="font-semibold">رایگان</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>مجموع</span>
                        <span>{selectedPlan.priceText}/ماه</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;

