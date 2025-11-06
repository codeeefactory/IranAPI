import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, TrendingUp, Clock, CheckCircle, Code2, BookOpen, Shield, Zap } from "lucide-react";
import { useState } from "react";

const ApiDetails = () => {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://api.iranapi.ir/openai/v1/chat',
  headers: {
    'X-IranAPI-Key': 'YOUR_API_KEY',
    'X-IranAPI-Host': 'openai-api.iranapi.ir'
  }
};

axios.request(options)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="p-4 rounded-lg bg-gradient-primary">
              <MessageSquare className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">OpenAI GPT API</h1>
                <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  پرطرفدار
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg mb-4">
                مدل‌های زبانی پیشرفته هوش مصنوعی برای تولید متن، مکالمه و بیشتر
              </p>
              <div className="flex items-center gap-4">
                <Button className="bg-gradient-primary hover:shadow-glow transition-all">
                  اشتراک در API
                </Button>
                <Button variant="outline">تست نقطه پایانی</Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">محبوبیت</p>
              </div>
              <p className="text-2xl font-bold">۹۸٪</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-accent" />
                <p className="text-sm text-muted-foreground">تاخیر</p>
              </div>
              <p className="text-2xl font-bold">۱۲۰ میلی‌ثانیه</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <p className="text-sm text-muted-foreground">نرخ موفقیت</p>
              </div>
              <p className="text-2xl font-bold">۹۹.۹٪</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">فراخوانی/ماه</p>
              </div>
              <p className="text-2xl font-bold">۱۰ میلیون+</p>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="endpoints">نقاط پایانی</TabsTrigger>
            <TabsTrigger value="pricing">قیمت‌گذاری</TabsTrigger>
            <TabsTrigger value="docs">مستندات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">درباره این API</h2>
              <p className="text-muted-foreground mb-6">
                API OpenAI GPT دسترسی به مدل‌های زبانی پیشرفته را فراهم می‌کند که می‌توانند متن شبیه انسان را درک و تولید کنند. عالی برای چت‌بات‌ها، تولید محتوا، ترجمه و بیشتر.
              </p>

              <h3 className="text-xl font-bold mb-3">ویژگی‌های کلیدی</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">درک زبان طبیعی</p>
                    <p className="text-sm text-muted-foreground">درک پیشرفته زمینه و قصد</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">تولید محتوا</p>
                    <p className="text-sm text-muted-foreground">ایجاد متن با کیفیت در هر سبک</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">پشتیبانی چند زبانه</p>
                    <p className="text-sm text-muted-foreground">کار با ۹۵+ زبان</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">پردازش لحظه‌ای</p>
                    <p className="text-sm text-muted-foreground">زمان پاسخ سریع برای همه درخواست‌ها</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3">شروع سریع</h3>
              <Card className="bg-card p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm text-accent">JavaScript</code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                    {copied ? "کپی شد!" : "کپی"}
                  </Button>
                </div>
                <pre className="text-sm text-muted-foreground overflow-x-auto">
                  <code>{codeSnippet}</code>
                </pre>
              </Card>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">نقاط پایانی موجود</h2>
              
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-primary/20 text-primary">GET</Badge>
                    <code className="text-sm">/v1/chat/completions</code>
                  </div>
                  <p className="text-muted-foreground text-sm">ایجاد تکمیل گفتگو با مدل</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-secondary/20 text-secondary">POST</Badge>
                    <code className="text-sm">/v1/completions</code>
                  </div>
                  <p className="text-muted-foreground text-sm">تولید تکمیل متن</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-accent/20 text-accent">POST</Badge>
                    <code className="text-sm">/v1/embeddings</code>
                  </div>
                  <p className="text-muted-foreground text-sm">ایجاد جاسازی متن</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">رایگان</h3>
                <p className="text-3xl font-bold mb-4">۰ تومان<span className="text-sm text-muted-foreground">/ماه</span></p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">۱۰۰ درخواست/روز</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">پشتیبانی پایه</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">شروع کنید</Button>
              </Card>

              <Card className="p-6 border-primary shadow-glow">
                <Badge className="mb-2 bg-gradient-primary">محبوب‌ترین</Badge>
                <h3 className="text-xl font-bold mb-2">حرفه‌ای</h3>
                <p className="text-3xl font-bold mb-4">۴۹ دلار<span className="text-sm text-muted-foreground">/ماه</span></p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">۱۰,۰۰۰ درخواست/روز</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">پشتیبانی اولویت‌دار</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">تحلیل پیشرفته</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-primary">اشتراک الان</Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">سازمانی</h3>
                <p className="text-3xl font-bold mb-4">سفارشی</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">درخواست نامحدود</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">پشتیبانی اختصاصی ۲۴/۷</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">SLA سفارشی</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">تماس با فروش</Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">مستندات</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold mb-2">شروع کار</h3>
                  <p className="text-muted-foreground text-sm">نحوه انجام اولین فراخوانی API را یاد بگیرید</p>
                </div>

                <div className="border-l-4 border-secondary pl-4">
                  <h3 className="font-bold mb-2">احراز هویت</h3>
                  <p className="text-muted-foreground text-sm">درخواست‌های API خود را با احراز هویت مناسب ایمن کنید</p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-bold mb-2">مرجع API</h3>
                  <p className="text-muted-foreground text-sm">مرجع کامل برای همه نقاط پایانی</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold mb-2">بهترین شیوه‌ها</h3>
                  <p className="text-muted-foreground text-sm">نکات برای عملکرد بهینه</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDetails;