import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const codeSnippet = `import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://api.iranapi.ir/weather',
  headers: {
    'X-IranAPI-Key': 'YOUR_API_KEY',
    'X-IranAPI-Host': 'iran-weather-api.iranapi.ir'
  }
};

const response = await axios.request(options);
console.log(response.data);`;

export const IntegrationPreview = () => {
  const [copied, setCopied] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section ref={ref} className="py-32 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[150px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[150px] animate-float [animation-delay:3s]" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Code2 className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">یکپارچه‌سازی آسان</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              اتصال در
              <span className="block mt-2 bg-gradient-accent bg-clip-text text-transparent">
                کمتر از ۵ دقیقه
              </span>
            </h2>

            <p className="text-xl text-muted-foreground leading-relaxed">
              با کد نمونه آماده و مستندات جامع، یکپارچه‌سازی APIها در چند کلیک انجام می‌شود. 
              نیازی به پیکربندی پیچیده نیست.
            </p>

            {/* Features list */}
            <div className="space-y-4 pt-4">
              {[
                { text: "احراز هویت یکپارچه در تمام APIها", delay: 0 },
                { text: "مدیریت خودکار خطا و Retry", delay: 100 },
                { text: "Rate Limiting و کش هوشمند", delay: 200 },
                { text: "نظارت و آنالیتیکس لحظه‌ای", delay: 300 }
              ].map((feature) => (
                <div 
                  key={feature.text} 
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card hover:border-accent/30 hover:shadow-glow-accent hover:translate-x-2 transition-all duration-500 group animate-fade-in-up"
                  style={{ animationDelay: `${feature.delay}ms` }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-accent blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span className="text-foreground font-semibold group-hover:text-accent transition-colors">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Button 
              size="lg"
              className="bg-gradient-accent hover:shadow-glow-accent hover:scale-105 transition-all duration-300 font-bold text-lg h-14 px-8"
            >
              <Sparkles className="h-5 w-5 ml-2" />
              شروع رایگان
            </Button>
          </div>

          {/* Right - Code preview */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <Card className="relative group bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm overflow-hidden hover:shadow-glow-primary transition-all duration-500 hover:scale-[1.02]">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              
              {/* Code window header */}
              <div className="relative bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm p-4 flex items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse [animation-delay:200ms]"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse [animation-delay:400ms]"></div>
                  <span className="mr-4 text-sm font-semibold text-muted-foreground">integration.js</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-300 font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 ml-2 text-green-500 animate-scale-in" />
                      کپی شد!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 ml-2" />
                      کپی کد
                    </>
                  )}
                </Button>
              </div>

              {/* Code content */}
              <div className="relative p-8 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                <pre className="text-sm font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                  <code className="language-javascript">{codeSnippet}</code>
                </pre>
              </div>

              {/* Bottom gradient accent */}
              <div className="h-1 bg-gradient-primary" />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
