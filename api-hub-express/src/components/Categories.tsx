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
  Layers,
  Loader2
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCategories } from "@/hooks/useApi";
import { Link } from "react-router-dom";

// Icon mapping for categories
const iconMap: Record<string, any> = {
  'هوش مصنوعی': Brain,
  'پرداخت': CreditCard,
  'ارتباطات': MessageSquare,
  'نقشه': MapPin,
  'ذخیره\u200cسازی': Cloud,
  'پایگاه داده': Database,
  'امنیت': Shield,
  'موبایل': Smartphone,
};

const gradients = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-red-500 to-pink-500",
  "from-violet-500 to-purple-500",
];

export const Categories = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: categoriesData, isLoading } = useCategories();
  
  const categories = categoriesData?.map((cat, index) => ({
    id: cat.id,
    name: cat.name,
    name_en: cat.name_en,
    slug: cat.slug,
    icon: iconMap[cat.name] || Layers,
    count: `${cat.apis_count || 0}+`,
    gradient: gradients[index % gradients.length],
    color: cat.color,
  })) || [];
  
  if (isLoading) {
    return (
      <section className="py-32 px-4">
        <div className="container mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </section>
    );
  }

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
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">دسته‌بندی‌ای یافت نشد</p>
            </div>
          ) : (
            categories.map((category, index) => (
            <Link key={category.id} to={`/browse?category=${category.id}`}>
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
            </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
