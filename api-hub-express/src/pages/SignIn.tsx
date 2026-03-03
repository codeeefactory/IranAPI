import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Code2, Github, Chrome, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useApi";
import { useState } from "react";

const SignIn = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  usePageMetadata({
    title: "ورود",
    description: "وارد حساب IranAPI شوید و داشبورد، دسترسی‌ها و گزارش مصرف خود را مدیریت کنید.",
    path: "/signin",
    noindex: true,
  });

  useEffect(() => {
    if (session.data?.authenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session.data?.authenticated]);

  const nextPath = useMemo(() => (location.state as { from?: string } | null)?.from || "/dashboard", [location.state]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync(formData);
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
            <h1 className="text-3xl font-bold mb-2">به حساب خود وارد شوید</h1>
            <p className="text-muted-foreground">به بازار API خوش آمدید</p>
          </div>

      <main id="main-content" className="container page-stack">
        <section className="page-hero grid gap-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
          <Card className="surface-card">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">ورود امن</Badge>
                <Badge variant="outline">Account Access</Badge>
              </div>
              <div className="space-y-3">
                <p className="eyebrow">حساب توسعه‌دهنده</p>
                <CardTitle className="text-3xl">ورود به حساب IranAPI</CardTitle>
                <p className="text-sm leading-7 text-muted-foreground">
                  از این حساب برای مدیریت پروفایل، دسترسی‌های ثبت‌شده، کلیدهای امن و تاریخچه مصرف استفاده می‌کنید.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {nextPath !== "/dashboard" ? (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm leading-7 text-muted-foreground">
                  برای ادامه، ابتدا وارد حساب خود شوید. بعد از ورود به صفحه قبلی برمی‌گردید.
                </div>
              ) : null}

              <SocialAuthPanel mode="signin" />

              {formError ? (
                <div className="flex items-start gap-3 rounded-md border border-destructive/35 bg-destructive/10 p-4 text-sm leading-7 text-destructive" role="alert">
                  <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              ) : null}

              <form className="space-y-4 rounded-md border border-border/70 bg-background/45 p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.07)]" onSubmit={handleSubmit} aria-busy={login.isPending}>
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="font-black uppercase tracking-[0.22em] text-primary">ورود امن</span>
                  <span>نشست محافظت‌شده</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">نام کاربری</Label>
                  <Input
                    id="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={(event) => {
                      setFormError("");
                      setFormData((current) => ({ ...current, username: event.target.value }));
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    فراموشی رمز عبور؟
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  'ورود'
                )}
              </Button>
            </form>
          </Card>

          <div className="grid gap-4">
            <Card className="surface-card">
              <CardContent className="content-list p-6 text-sm leading-7 text-muted-foreground">
                <div className="metric-card">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    داشبورد آماده مدیریت
                  </p>
                  <p>پس از ورود می‌توانید پروفایل، مصرف، دسترسی‌های فعال و اشتراک‌ها را در یک نگاه بررسی کنید.</p>
                </div>
                <div className="metric-card">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    نشست امن
                  </p>
                  <p>ورود با نشست محافظت‌شده انجام می‌شود و رابط فقط داده‌های موردنیاز حساب شما را دریافت می‌کند.</p>
                </div>
                <div className="metric-card">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <KeyRound className="h-4 w-4 text-primary" />
                    نقش‌ها و دسترسی‌های روشن
                  </p>
                  <p>حساب پرتال از دسترسی مصرفی APIها جداست و هر دسترسی از داشبورد قابل پیگیری است.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
                <p className="mb-2 font-semibold text-foreground">حساب نمونه برای QA</p>
                <p>اگر در محیط محلی با داده نمونه کار می‌کنید، این حساب در فرآیند seed ساخته می‌شود و داشبورد را با داده واقعی‌تر باز می‌کند.</p>
                <div className="mt-4 grid gap-3 rounded-md border border-border/70 bg-background/60 p-4">
                  <div className="grid gap-2 text-left font-mono text-xs" dir="ltr">
                    <code>username: {demoCredentials.username}</code>
                    <code>password: {demoCredentials.password}</code>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={fillDemoAccount}>
                    <KeyRound className="h-4 w-4" />
                    پر کردن حساب نمونه
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignIn;
