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

  usePageMetadata({
    title: "ثبت‌نام",
    description: "حساب توسعه‌دهنده IranAPI را بسازید و داشبورد، دسترسی‌ها و گزارش مصرف خود را مدیریت کنید.",
    path: "/signup",
    noindex: true,
  });

  useEffect(() => {
    if (session.data?.authenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session.data?.authenticated]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!acceptedTerms) {
      return;
    }
    try {
      // Prepare form data - always include email (even if empty)
      const cleanedData: {
        username: string;
        email: string;
        password: string;
        password_confirm: string;
        first_name?: string;
        last_name?: string;
      } = {
        username: formData.username.trim(),
        email: formData.email.trim() || '', // Always send email, even if empty
        password: formData.password,
        password_confirm: formData.password_confirm,
      };
      
      // Only add optional fields if they have values
      const trimmedFirstName = formData.first_name.trim();
      const trimmedLastName = formData.last_name.trim();
      if (trimmedFirstName) {
        cleanedData.first_name = trimmedFirstName;
      }
      if (trimmedLastName) {
        cleanedData.last_name = trimmedLastName;
      }
      
      console.log('Submitting registration with data:', cleanedData);
      await register.mutateAsync(cleanedData);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by hook
      console.error('Registration failed:', error);
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

      <main id="main-content" className="container page-stack">
        <section className="page-hero grid gap-6 lg:grid-cols-[1.12fr,0.88fr] lg:items-start">
          <Card className="surface-card">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">ثبت‌نام توسعه‌دهنده</Badge>
                <Badge variant="outline">Developer Account</Badge>
              </div>
              <div className="space-y-3">
                <p className="eyebrow">ساخت حساب</p>
                <CardTitle className="text-3xl">ساخت حساب IranAPI</CardTitle>
                <p className="text-sm leading-7 text-muted-foreground">
                  با این حساب به داشبورد، پروفایل توسعه‌دهنده، وضعیت دسترسی‌ها، کلیدهای امن و گزارش مصرف دسترسی پیدا می‌کنید.
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

              <form className="space-y-4 rounded-md border border-border/70 bg-background/45 p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.07)]" onSubmit={handleSubmit} aria-busy={register.isPending}>
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="font-black uppercase tracking-[0.22em] text-primary">اطلاعات حساب</span>
                  <span>پروفایل توسعه‌دهنده</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">نام</Label>
                    <Input
                      id="first_name"
                      autoComplete="given-name"
                      value={formData.first_name}
                      onChange={(event) => {
                        setFormError("");
                        setFormData((current) => ({ ...current, first_name: event.target.value }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">نام خانوادگی</Label>
                    <Input
                      id="last_name"
                      autoComplete="family-name"
                      value={formData.last_name}
                      onChange={(event) => {
                        setFormError("");
                        setFormData((current) => ({ ...current, last_name: event.target.value }));
                      }}
                    />
                  </div>
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

          <div className="grid gap-4">
            <Card className="surface-card">
              <CardContent className="content-list p-6 text-sm leading-7 text-muted-foreground">
                <div className="metric-card">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    بعد از ثبت‌نام چه چیزی دارید؟
                  </p>
                  <p>دسترسی به داشبورد، ویرایش اطلاعات حساب، مدیریت پروفایل توسعه‌دهنده و مشاهده گزارش مصرف.</p>
                </div>
                <div className="metric-card">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    مسیر شفاف دسترسی API
                  </p>
                  <p>این فرم حساب پرتال را ایجاد می‌کند. فعال‌سازی پلن‌های API از داشبورد انجام می‌شود تا دسترسی، مصرف و کلیدها قابل پیگیری بمانند.</p>
                </div>
                <div className="metric-card">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <KeyRound className="h-4 w-4 text-primary" />
                    استاندارد پایه امنیت
                  </p>
                  <p>حداقل طول رمز عبور ۸ کاراکتر است و نشست کاربر با کوکی امن مدیریت می‌شود.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignUp;
