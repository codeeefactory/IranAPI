import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Code2, Zap, Shield, Users, Terminal, Rocket } from "lucide-react";

const Documentation = () => {
  const sections = [
    {
      title: "شروع کار",
      icon: Rocket,
      color: "text-primary",
      links: ["راهنمای شروع سریع", "ساخت حساب کاربری", "دریافت کلید API", "اولین درخواست"],
    },
    {
      title: "احراز هویت",
      icon: Shield,
      color: "text-secondary",
      links: ["احراز هویت کلید API", "جریان OAuth 2.0", "بهترین شیوه‌های امنیتی", "مدیریت کلیدهای API"],
    },
    {
      title: "مرجع API",
      icon: Code2,
      color: "text-accent",
      links: ["نقاط پایانی REST API", "فرمت درخواست و پاسخ", "کدهای خطا", "محدودیت نرخ"],
    },
    {
      title: "SDK و کتابخانه‌ها",
      icon: Terminal,
      color: "text-primary",
      links: ["JavaScript/Node.js", "Python", "Ruby", "PHP"],
    },
    {
      title: "بهترین شیوه‌ها",
      icon: Zap,
      color: "text-secondary",
      links: ["بهینه‌سازی عملکرد", "استراتژی‌های کش", "مدیریت خطا", "تست یکپارچه‌سازی"],
    },
    {
      title: "پشتیبانی",
      icon: Users,
      color: "text-accent",
      links: ["سوالات متداول", "انجمن", "تماس با پشتیبانی", "گزارش مشکل"],
    },
  ];

  const codeExample = `// راه‌اندازی کلاینت ایران‌ای‌پی‌آی
const iranapi = require('iranapi-connect');

const client = iranapi.init({
  apiKey: 'YOUR_API_KEY'
});

// انجام درخواست
client.call('روبیکا AI', 'chat')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">مستندات</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            همه چیزهایی که برای یکپارچه‌سازی و استفاده از APIهای بازار ما نیاز دارید
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input placeholder="جستجوی مستندات..." className="pl-12 h-12" />
          </div>
        </div>

        <Card className="p-8 mb-12 bg-gradient-hero">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">شروع سریع</h2>
              <p className="text-muted-foreground mb-6">در چند دقیقه با فرآیند یکپارچه‌سازی ساده ما راه‌اندازی کنید.</p>
              <Button className="mt-6 bg-gradient-primary hover:shadow-glow">مشاهده راهنمای کامل</Button>
            </div>
            <div>
              <Card className="bg-card p-4">
                <pre className="text-sm text-muted-foreground overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </Card>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sections.map((section) => (
            <Card key={section.title} className="p-6 hover:shadow-glow transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-gradient-primary transition-all">
                  <section.icon className={`h-6 w-6 ${section.color} group-hover:text-primary-foreground`} />
                </div>
                <h3 className="text-xl font-bold">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;