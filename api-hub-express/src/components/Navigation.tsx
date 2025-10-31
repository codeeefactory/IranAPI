import { Button } from "@/components/ui/button";
import { Code2, Menu, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70 animate-fade-in-down">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              <Code2 className="relative h-10 w-10 text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            </div>
            <span className="text-2xl font-black bg-gradient-primary bg-clip-text text-transparent">
              ایران‌ای‌پی‌آی
            </span>
          </a>

          {/* Navigation links */}
          <div className="hidden lg:flex items-center gap-8">
            <a 
              href="/browse" 
              className="relative text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors duration-300 group"
            >
              مرور APIها
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a 
              href="/pricing" 
              className="relative text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors duration-300 group"
            >
              قیمت‌گذاری
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a 
              href="/documentation" 
              className="relative text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors duration-300 group"
            >
              مستندات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a 
              href="/dashboard" 
              className="relative text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors duration-300 group flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
              داشبورد
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
            </a>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            className="hidden md:inline-flex hover:bg-primary/10 hover:text-primary transition-all duration-300" 
            asChild
          >
            <a href="/signin">ورود</a>
          </Button>
          <Button 
            className="bg-gradient-primary hover:shadow-glow-primary hover:scale-105 transition-all duration-300 font-bold"
            asChild
          >
            <a href="/signup">شروع رایگان</a>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden hover:bg-primary/10 hover:rotate-90 transition-all duration-300"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
