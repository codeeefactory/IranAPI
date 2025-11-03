import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Zap, Star, TrendingUp, Clock, Activity } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const apis = [
  {
    name: "OpenAI GPT-4",
    category: "هوش مصنوعی",
    description: "مدل زبانی پیشرفته برای پردازش و تولید زبان طبیعی با دقت بالا",
    popularity: "۹۹٪",
    latency: "۱۲۰ms",
    icon: Code2,
    trending: true,
    color: "primary",
  },
  {
    name: "Stripe Payments",
    category: "پرداخت",
    description: "پلتفرم جامع پرداخت آنلاین با امنیت بانکی و پشتیبانی ۲۴/۷",
    popularity: "۹۸٪",
    latency: "۸۵ms",
    icon: Zap,
    trending: true,
    color: "secondary",
  },
  {
    name: "Weather API",
    category: "داده",
    description: "اطلاعات لحظه‌ای و پیش‌بینی آب و هوا برای تمام نقاط جهان",
    popularity: "۹۶٪",
    latency: "۴۵ms",
    icon: Star,
    trending: false,
    color: "accent",
  },
  {
    name: "SendGrid Email",
    category: "ارتباطات",
    description: "سرویس قدرتمند ارسال ایمیل با قابلیت ارسال میلیونی",
    popularity: "۹۷٪",
    latency: "۹۵ms",
    icon: TrendingUp,
    trending: true,
    color: "primary",
  },
  {
    name: "Google Maps",
    category: "نقشه",
    description: "نقشه‌های تعاملی، مسیریابی و اطلاعات مکانی دقیق",
    popularity: "۹۹٪",
    latency: "۱۱۰ms",
    icon: Code2,
    trending: false,
    color: "secondary",
  },
  {
    name: "Twilio SMS",
    category: "پیامک",
    description: "ارسال پیامک و تماس صوتی با کیفیت بالا در سراسر دنیا",
    popularity: "۹۵٪",
    latency: "۱۳۰ms",
    icon: Zap,
    trending: true,
    color: "accent",
  },
];

export const FeaturedApis = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section ref={ref} className="py-32 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center space-y-6 mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">محبوب‌ترین APIها</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black">
            APIهای <span className="bg-gradient-primary bg-clip-text text-transparent">پرطرفدار</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            به پرکاربردترین و معتبرترین APIها دسترسی داشته باشید. 
            تست شده توسط میلیون‌ها توسعه‌دهنده در سراسر جهان.
          </p>
        </div>

        {/* API Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apis.map((api, index) => (
            <Card 
              key={api.name}
              className={`group relative bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-glow-primary transition-all duration-700 hover:-translate-y-2 overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              
              {/* Trending badge */}
              {api.trending && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-primary border-0 shadow-glow-primary animate-pulse-glow font-bold">
                    🔥 پرطرفدار
                  </Badge>
                </div>
              )}

              <CardHeader className="relative">
                {/* Icon */}
                <div className="mb-6 relative inline-block">
                  <div className={`absolute inset-0 bg-gradient-${api.color} blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative p-4 rounded-2xl bg-gradient-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <api.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors duration-300">
                  {api.name}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">
                  {api.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 relative">
                {/* Category badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">دسته‌بندی</span>
                  <Badge variant="outline" className="font-semibold border-primary/20 hover:bg-primary/10 transition-colors">
                    {api.category}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/50 hover:scale-105 transition-transform duration-300">
                    <Activity className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">محبوبیت</div>
                      <div className="text-sm font-bold text-primary">{api.popularity}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/50 hover:scale-105 transition-transform duration-300">
                    <Clock className="h-4 w-4 text-accent" />
                    <div>
                      <div className="text-xs text-muted-foreground">تاخیر</div>
                      <div className="text-sm font-bold text-accent">{api.latency}</div>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <Button className="w-full bg-gradient-primary hover:shadow-glow-primary hover:scale-105 transition-all duration-300 font-bold text-base h-12">
                  مشاهده جزئیات
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
