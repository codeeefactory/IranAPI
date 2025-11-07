import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Code2, Github, Chrome } from "lucide-react";
import { Link } from "react-router-dom";

const SignIn = () => {
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
            <h1 className="text-3xl font-bold mb-2">به حساب خود وارد شوید</h1>
            <p className="text-muted-foreground">به بازار API خوش آمدید</p>
          </div>

          {/* Sign In Card */}
          <Card className="p-8">
            {/* Social Sign In */}
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
                یا ورود با ایمیل
              </span>
            </div>

            {/* Email Sign In Form */}
            <form className="space-y-4">
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
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    فراموشی رمز عبور؟
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                />
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
                ورود
              </Button>
            </form>
          </Card>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-muted-foreground">
            حساب کاربری ندارید؟{" "}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
