import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2, Github, Chrome } from "lucide-react";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code2 className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ایران‌ای‌پی‌آی
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">حساب کاربری خود را بسازید</h1>
            <p className="text-muted-foreground">شروع ساخت با هزاران API</p>
          </div>

          {/* Sign Up Card */}
          <Card className="p-8">
            {/* Social Sign Up */}
            <div className="space-y-3 mb-6">
              <Button variant="outline" className="w-full gap-2">
                <Chrome className="h-5 w-5" />
                ادامه با گوگل
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Github className="h-5 w-5" />
                ادامه با گیت‌هاب
              </Button>
            </div>

            <div className="relative mb-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                یا ثبت‌نام با ایمیل
              </span>
            </div>

            {/* Email Sign Up Form */}
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">نام کامل</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="علی احمدی"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">ایمیل</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">رمز عبور</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  حداقل ۸ کاراکتر
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  با{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    شرایط خدمات
                  </Link>{" "}
                  و{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    حریم خصوصی
                  </Link>{" "}
                  موافقم
                </label>
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
                ساخت حساب کاربری
              </Button>
            </form>
          </Card>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-muted-foreground">
            قبلاً حساب کاربری دارید؟{" "}
            <Link to="/signin" className="text-primary hover:underline font-semibold">
              ورود
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
