import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2, Github, Chrome, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "@/hooks/useApi";
import { useState } from "react";

const SignUp = () => {
  const navigate = useNavigate();
  const register = useRegister();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      return;
    }
    try {
      await register.mutateAsync(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by hook
    }
  };
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">نام</Label>
                  <Input 
                    id="first_name" 
                    type="text" 
                    placeholder="علی"
                    className="mt-1"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">نام خانوادگی</Label>
                  <Input 
                    id="last_name" 
                    type="text" 
                    placeholder="احمدی"
                    className="mt-1"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">نام کاربری</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="username"
                  className="mt-1"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">ایمیل</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com"
                  className="mt-1"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">رمز عبور</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="mt-1"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  حداقل ۸ کاراکتر
                </p>
              </div>

              <div>
                <Label htmlFor="password_confirm">تکرار رمز عبور</Label>
                <Input 
                  id="password_confirm" 
                  type="password" 
                  placeholder="••••••••"
                  className="mt-1"
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
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

              <Button 
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
                disabled={register.isPending || !acceptedTerms}
              >
                {register.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    در حال ثبت‌نام...
                  </>
                ) : (
                  'ساخت حساب کاربری'
                )}
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
