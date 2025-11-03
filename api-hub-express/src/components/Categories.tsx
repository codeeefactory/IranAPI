import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  CreditCard, 
  MessageSquare, 
  MapPin, 
  Cloud, 
  Database,
  Shield,
  Smartphone,
  Layers
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const categories = [
  { name: "هوش مصنوعی", icon: Brain, count: "۲,۵۰۰+", gradient: "from-purple-500 to-pink-500" },
  { name: "پرداخت و مالی", icon: CreditCard, count: "۱,۸۰۰+", gradient: "from-blue-500 to-cyan-500" },
  { name: "ارتباطات", icon: MessageSquare, count: "۱,۲۰۰+", gradient: "from-green-500 to-teal-500" },
  { name: "نقشه و مکان", icon: MapPin, count: "۹۰۰+", gradient: "from-orange-500 to-red-500" },
  { name: "ذخیره‌سازی", icon: Cloud, count: "۱,۵۰۰+", gradient: "from-indigo-500 to-purple-500" },
  { name: "پایگاه داده", icon: Database, count: "۳,۲۰۰+", gradient: "from-cyan-500 to-blue-500" },
  { name: "امنیت", icon: Shield, count: "۸۰۰+", gradient: "from-red-500 to-pink-500" },
  { name: "موبایل", icon: Smartphone, count: "۱,۱۰۰+", gradient: "from-violet-500 to-purple-500" },
];

export const Categories = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section ref={ref} className="py-32 px-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center space-y-6 mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            <Layers className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">دسته‌بندی‌های متنوع</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black">
            مرور بر اساس <span className="bg-gradient-secondary bg-clip-text text-transparent">دسته‌بندی</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            از هزاران API در دسته‌بندی‌های مختلف، مناسب‌ترین را برای پروژه خود انتخاب کنید
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.name}
              className={`group relative bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-700 hover:-translate-y-3 hover:scale-105 cursor-pointer overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <CardContent className="p-8 text-center space-y-6 relative">
                {/* Icon container */}
                <div className="relative mx-auto w-20 h-20">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    <category.icon className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-black text-xl group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </h3>

                {/* Count */}
                <div className="relative inline-block">
                  <div className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent group-hover:scale-125 transition-transform duration-300">
                    {category.count}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-semibold">API موجود</div>
                </div>
              </CardContent>

              {/* Hover border glow effect */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                   style={{ 
                     background: `linear-gradient(90deg, transparent, var(--primary), transparent)`,
                     transform: 'translateY(-100%)',
                     animation: 'shimmer 2s infinite'
                   }} 
              />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
