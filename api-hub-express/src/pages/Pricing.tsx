import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  
  const plans = [
    {
      id: "free",
      name: "رایگان",
      price: "۰ تومان",
      description: "عالی برای تست و پروژه‌های کوچک",
      features: [
        { text: "۱۰۰ فراخوانی API/روز", included: true },
        { text: "پشتیبانی پایه", included: true },
        { text: "دسترسی به انجمن", included: true },
        { text: "محدودیت نرخ استاندارد", included: true },
        { text: "پشتیبانی اولویت‌دار", included: false },
        { text: "تحلیل پیشرفته", included: false },
        { text: "یکپارچه‌سازی سفارشی", included: false },
      ],
      cta: "شروع کنید",
      popular: false,
    },
    {
      id: "pro",
      name: "حرفه‌ای",
      price: "۴۹ تومان",
      description: "برای برنامه‌ها و تیم‌های در حال رشد",
      features: [
        { text: "۱۰,۰۰۰ فراخوانی API/روز", included: true },
        { text: "پشتیبانی اولویت‌دار", included: true },
        { text: "تحلیل پیشرفته", included: true },
        { text: "محدودیت نرخ بالاتر", included: true },
        { text: "وب‌هوک‌های سفارشی", included: true },
        { text: "همکاری تیمی", included: true },
        { text: "یکپارچه‌سازی سفارشی", included: false },
      ],
      cta: "شروع دوره آزمایشی رایگان",
      popular: true,
    },
    {
      id: "enterprise",
      name: "سازمانی",
      price: "سفارشی",
      description: "برای برنامه‌های در مقیاس بزرگ",
      features: [
        { text: "فراخوانی API نامحدود", included: true },
        { text: "پشتیبانی اختصاصی ۲۴/۷", included: true },
        { text: "تحلیل سفارشی", included: true },
        { text: "بدون محدودیت نرخ", included: true },
        { text: "وب‌هوک‌های سفارشی", included: true },
        { text: "اعضای تیم نامحدود", included: true },
        { text: "یکپارچه‌سازی سفارشی", included: true },
      ],
      cta: "تماس با فروش",
      popular: false,
    },
  ];

  const handlePlanClick = (planId: string) => {
    navigate(`/payment?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            قیمت‌گذاری ساده و شفاف
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            پلن مناسب برای نیازهای خود را انتخاب کنید. همه پلن‌ها شامل دسترسی به کل بازار API ما هستند.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`p-8 ${plan.popular ? 'border-primary shadow-glow' : ''} relative`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                  محبوب‌ترین
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "سفارشی" && <span className="text-muted-foreground">/ماه</span>}
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${plan.popular ? 'bg-gradient-primary hover:shadow-glow' : ''}`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handlePlanClick(plan.id)}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">سوالات متداول</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-2">آیا می‌توانم بعداً پلن را تغییر دهم؟</h3>
              <p className="text-muted-foreground">
                بله! شما می‌توانید در هر زمان پلن خود را ارتقا یا کاهش دهید. تغییرات فوراً اعمال می‌شود.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">اگر از محدودیت API خود عبور کنم چه اتفاقی می‌افتد؟</h3>
              <p className="text-muted-foreground">
                درخواست‌های شما تا چرخه صورتحساب بعدی محدود می‌شوند. ما قبل از رسیدن به محدودیت به شما اطلاع می‌دهیم.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">آیا بازگشت وجه ارائه می‌دهید؟</h3>
              <p className="text-muted-foreground">
                ما برای همه پلن‌های پولی ضمانت بازگشت وجه ۳۰ روزه ارائه می‌دهیم. بدون هیچ سوالی.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">آیا دوره آزمایشی رایگان وجود دارد؟</h3>
              <p className="text-muted-foreground">
                بله! پلن‌های حرفه‌ای و سازمانی با دوره آزمایشی رایگان ۱۴ روزه ارائه می‌شوند. بدون نیاز به کارت اعتباری.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-12 bg-gradient-hero">
            <h2 className="text-3xl font-bold mb-4">آماده شروع هستید؟</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              به هزاران توسعه‌دهنده که برنامه‌های شگفت‌انگیزی با بازار API ما می‌سازند، بپیوندید.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                className="bg-gradient-primary hover:shadow-glow transition-all"
                onClick={() => handlePlanClick("pro")}
              >
                شروع دوره آزمایشی رایگان
              </Button>
              <Button 
                variant="outline"
                onClick={() => handlePlanClick("enterprise")}
              >
                تماس با فروش
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;