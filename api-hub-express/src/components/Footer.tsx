import { Code2, Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                <Code2 className="relative h-10 w-10 text-primary" />
              </div>
              <span className="text-2xl font-black bg-gradient-primary bg-clip-text text-transparent">
                ایران‌ای‌پی‌آی
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              بزرگترین و پیشرفته‌ترین بازار API ایران. اتصال آسان و سریع به هزاران سرویس وب با یک کلیک.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              <a href="#" className="p-3 rounded-xl bg-card border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:shadow-glow-primary transition-all duration-300 group">
                <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="#" className="p-3 rounded-xl bg-card border border-border/50 hover:bg-secondary/10 hover:border-secondary/30 hover:shadow-glow-secondary transition-all duration-300 group">
                <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
              </a>
              <a href="#" className="p-3 rounded-xl bg-card border border-border/50 hover:bg-accent/10 hover:border-accent/30 hover:shadow-glow-accent transition-all duration-300 group">
                <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </a>
              <a href="#" className="p-3 rounded-xl bg-card border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:shadow-glow-primary transition-all duration-300 group">
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Links sections */}
          <div className="space-y-4">
            <h3 className="font-black text-lg">محصول</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-primary group-hover:w-4 transition-all duration-300" />
                  مرور APIها
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-primary group-hover:w-4 transition-all duration-300" />
                  قیمت‌گذاری
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-primary group-hover:w-4 transition-all duration-300" />
                  مستندات
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-primary group-hover:w-4 transition-all duration-300" />
                  وضعیت سرویس
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-lg">توسعه‌دهندگان</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-secondary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-secondary group-hover:w-4 transition-all duration-300" />
                  شروع سریع
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-secondary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-secondary group-hover:w-4 transition-all duration-300" />
                  مستندات API
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-secondary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-secondary group-hover:w-4 transition-all duration-300" />
                  نمونه کدها
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-secondary transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-secondary group-hover:w-4 transition-all duration-300" />
                  انجمن توسعه‌دهندگان
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-lg">شرکت</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-accent group-hover:w-4 transition-all duration-300" />
                  درباره ما
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-accent group-hover:w-4 transition-all duration-300" />
                  وبلاگ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-accent group-hover:w-4 transition-all duration-300" />
                  فرصت‌های شغلی
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors duration-300 inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-gradient-accent group-hover:w-4 transition-all duration-300" />
                  تماس با ما
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="text-center md:text-right">
              © ۱۴۰۳ ایران‌ای‌پی‌آی. تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors duration-300">شرایط استفاده</a>
              <a href="#" className="hover:text-primary transition-colors duration-300">حریم خصوصی</a>
              <a href="#" className="hover:text-primary transition-colors duration-300">قوانین کوکی‌ها</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
