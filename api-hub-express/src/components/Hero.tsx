import { Search, Sparkles, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="API Network Visualization" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 opacity-30" style={{ background: 'var(--gradient-mesh)' }} />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-float [animation-delay:2s]" />
      <div className="absolute top-40 right-40 w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-float [animation-delay:4s]" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-32">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-xl hover:shadow-glow-primary transition-all duration-500 group cursor-pointer">
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
                پلتفرم هوشمند API • دسترسی به بیش از ۴۰,۰۰۰ سرویس
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center space-y-6 animate-fade-in-up [animation-delay:200ms]">
            <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
              <span className="block text-foreground">دنیای بی‌پایان</span>
              <span className="block mt-4 bg-gradient-primary bg-clip-text text-transparent animate-glow">
                APIهای آماده
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              یکپارچه‌سازی سریع، مستندات کامل، و اتصال فوری به هزاران سرویس وب. 
              <span className="text-primary font-semibold"> دقایقی تا راه‌اندازی فاصله دارید.</span>
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto animate-scale-in [animation-delay:400ms]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-primary opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500 rounded-2xl" />
              <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-card border border-primary/20 backdrop-blur-xl shadow-card hover:shadow-card-hover transition-all duration-500">
                <div className="flex items-center gap-3 flex-1 px-4">
                  <Search className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  <Input 
                    placeholder="جستجوی APIها... (مثلاً: پرداخت، هوش مصنوعی، اس‌ام‌اس)"
                    className="h-14 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-muted-foreground"
                  />
                </div>
                <Button 
                  size="lg"
                  className="h-14 px-8 bg-gradient-primary hover:shadow-glow-primary hover:scale-105 transition-all duration-300 rounded-xl font-bold"
                >
                  جستجو
                </Button>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8 animate-fade-in [animation-delay:600ms]">
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-primary/20 backdrop-blur-sm hover:shadow-glow-primary hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary group-hover:animate-bounce-gentle" />
                  <div className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent">
                    ۴۰,۰۰۰+
                  </div>
                </div>
                <div className="text-sm font-semibold text-muted-foreground">API فعال</div>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-secondary/20 backdrop-blur-sm hover:shadow-glow-secondary hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-secondary group-hover:animate-bounce-gentle" />
                  <div className="text-4xl font-black bg-gradient-secondary bg-clip-text text-transparent">
                    ۴M+
                  </div>
                </div>
                <div className="text-sm font-semibold text-muted-foreground">کاربر فعال</div>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-accent/20 backdrop-blur-sm hover:shadow-glow-accent hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-accent group-hover:animate-bounce-gentle" />
                  <div className="text-4xl font-black bg-gradient-accent bg-clip-text text-transparent">
                    ۹۹.۹٪
                  </div>
                </div>
                <div className="text-sm font-semibold text-muted-foreground">آپتایم</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
