import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const plans = {
  free: {
    name: "رایگان",
    price: 0,
    priceText: "۰ تومان",
    description: "عالی برای تست و پروژه‌های کوچک",
    features: [
      "۱۰۰ فراخوانی API/روز",
      "پشتیبانی پایه",
      "دسترسی به انجمن",
      "محدودیت نرخ استاندارد",
    ],
  },
  pro: {
    name: "حرفه‌ای",
    price: 49,
    priceText: "۴۹ تومان",
    description: "برای برنامه‌ها و تیم‌های در حال رشد",
    features: [
      "۱۰,۰۰۰ فراخوانی API/روز",
      "پشتیبانی اولویت‌دار",
      "تحلیل پیشرفته",
      "محدودیت نرخ بالاتر",
      "وب‌هوک‌های سفارشی",
      "همکاری تیمی",
    ],
  },
  enterprise: {
    name: "سازمانی",
    price: 0,
    priceText: "سفارشی",
    description: "برای برنامه‌های در مقیاس بزرگ",
    features: [
      "فراخوانی API نامحدود",
      "پشتیبانی اختصاصی ۲۴/۷",
      "تحلیل سفارشی",
      "بدون محدودیت نرخ",
      "وب‌هوک‌های سفارشی",
      "اعضای تیم نامحدود",
      "یکپارچه‌سازی سفارشی",
    ],
  },
};

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "free";
  const [selectedPlan, setSelectedPlan] = useState(plans[planId as keyof typeof plans] || plans.free);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: "",
    phone: "",
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              تکمیل خرید
            </h1>
            <p className="text-muted-foreground text-lg">
              پلن انتخابی خود را بررسی کرده و اطلاعات پرداخت را وارد کنید
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">اطلاعات پرداخت</h2>
                </div>

                {selectedPlan.price === 0 && selectedPlan.name === "رایگان" ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">پلن رایگان</h3>
                    <p className="text-muted-foreground mb-6">
                      برای فعال‌سازی پلن رایگان نیازی به پرداخت نیست
                    </p>
                    <Button
                      onClick={handleSubmit}
                      className="bg-gradient-primary hover:shadow-glow"
                      size="lg"
                    >
                      فعال‌سازی پلن رایگان
                    </Button>
                  </div>
                ) : selectedPlan.name === "سازمانی" ? (
                  <div className="text-center py-12">
                    <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">پلن سازمانی</h3>
                    <p className="text-muted-foreground mb-6">
                      برای پلن سازمانی، لطفاً با تیم فروش ما تماس بگیرید
                    </p>
                    <Button
                      onClick={handleSubmit}
                      variant="outline"
                      size="lg"
                    >
                      تماس با فروش
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="cardNumber">شماره کارت</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        placeholder="۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength={19}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div>
                      <Label htmlFor="cardholderName">نام صاحب کارت</Label>
                      <Input
                        id="cardholderName"
                        name="cardholderName"
                        type="text"
                        placeholder="نام و نام خانوادگی"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
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
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6">خلاصه سفارش</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{selectedPlan.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                    </div>
                    <Badge variant="outline">{selectedPlan.priceText}</Badge>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">ویژگی‌ها:</h3>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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

