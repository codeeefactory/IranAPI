import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, DollarSign, Key, BarChart3, AlertCircle } from "lucide-react";
import { useProfile, useGenerateApiKey } from "@/hooks/useApi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const generateApiKey = useGenerateApiKey();
  const [showApiKey, setShowApiKey] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  // Redirect if profile fetch fails due to auth
  useEffect(() => {
    if (profileError && (profileError as any)?.response?.status === 401) {
      localStorage.removeItem('auth_token');
      navigate('/signin');
    }
  }, [profileError, navigate]);

  const handleGenerateApiKey = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
      setTimeout(() => navigate('/signin'), 1500);
      return;
    }
    
    // Verify token is valid by checking if profile can be loaded
    if (profileError) {
      toast.error('خطا در احراز هویت. لطفاً دوباره وارد شوید');
      localStorage.removeItem('auth_token');
      setTimeout(() => navigate('/signin'), 1500);
      return;
    }
    
    if (window.confirm('آیا مطمئن هستید که می‌خواهید یک کلید API جدید بسازید؟ کلید قبلی غیرفعال خواهد شد.')) {
      generateApiKey.mutate();
    }
  };
  const stats = [
    { label: "فراخوانی API", value: "۲۴,۵۹۱", change: "+۱۲.۵٪", icon: Activity, color: "text-primary" },
    { label: "نرخ موفقیت", value: "۹۹.۸٪", change: "+۰.۲٪", icon: TrendingUp, color: "text-secondary" },
    { label: "تاخیر میانگین", value: "۱۴۵ میلی‌ثانیه", change: "-۸ میلی‌ثانیه", icon: Zap, color: "text-accent" },
    { label: "اعتبار مصرف‌شده", value: "۱۲۷.۵۰ تومان", change: "+۲۳ تومان", icon: DollarSign, color: "text-primary" },
  ];

  const recentCalls = [
    { api: "روبیکا AI", status: "success", time: "۲ دقیقه پیش", latency: "۱۲۰ میلی‌ثانیه", cost: "۰.۰۲ تومان" },
    { api: "دیجی‌کالا", status: "success", time: "۳ دقیقه پیش", latency: "۸۸ میلی‌ثانیه", cost: "۰.۰۱۵ تومان" },
    { api: "اسنپ", status: "success", time: "۵ دقیقه پیش", latency: "۷۵ میلی‌ثانیه", cost: "۰.۰۱ تومان" },
    { api: "زرین‌پال", status: "success", time: "۷ دقیقه پیش", latency: "۸۵ میلی‌ثانیه", cost: "۰.۰۱ تومان" },
    { api: "بله", status: "success", time: "۸ دقیقه پیش", latency: "۹۵ میلی‌ثانیه", cost: "۰.۰۰ تومان" },
    { api: "ترب", status: "success", time: "۱۰ دقیقه پیش", latency: "۹۸ میلی‌ثانیه", cost: "۰.۰۰ تومان" },
    { api: "تکنولایف", status: "success", time: "۱۲ دقیقه پیش", latency: "۱۰۲ میلی‌ثانیه", cost: "۰.۰۱۲ تومان" },
  ];

  const subscribedApis = [
    { name: "روبیکا AI", plan: "حرفه‌ای", calls: "۸,۴۳۲", limit: "۱۰,۰۰۰", callsNum: 8432, limitNum: 10000 },
    { name: "دیجی‌کالا", plan: "حرفه‌ای", calls: "۵,۲۳۴", limit: "۱۰,۰۰۰", callsNum: 5234, limitNum: 10000 },
    { name: "اسنپ", plan: "پایه", calls: "۳,۱۲۳", limit: "۵,۰۰۰", callsNum: 3123, limitNum: 5000 },
    { name: "زرین‌پال", plan: "رایگان", calls: "۱۵۶", limit: "۱,۰۰۰", callsNum: 156, limitNum: 1000 },
    { name: "بله", plan: "رایگان", calls: "۴,۵۶۷", limit: "۵,۰۰۰", callsNum: 4567, limitNum: 5000 },
    { name: "ترب", plan: "رایگان", calls: "۲,۸۹۰", limit: "۵,۰۰۰", callsNum: 2890, limitNum: 5000 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">داشبورد</h1>
          <p className="text-muted-foreground">نظارت بر استفاده و عملکرد API خود</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <Badge variant={stat.change.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">فراخوانی‌های اخیر API</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/browse')}
              >
                مشاهده همه
              </Button>
            </div>
            <div className="space-y-3">
              {recentCalls.map((call, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Badge variant={call.status === 'success' ? 'default' : 'destructive'} className="w-20">
                      {call.status === 'success' ? 'موفق' : 'خطا'}
                    </Badge>
                    <div>
                      <p className="font-semibold">{call.api}</p>
                      <p className="text-sm text-muted-foreground">{call.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{call.latency}</p>
                    <p className="text-sm text-muted-foreground">{call.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">کلیدهای API</h2>
              <Button variant="ghost" size="icon"><Key className="h-4 w-4" /></Button>
            </div>
            {!localStorage.getItem('auth_token') && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-semibold">⚠️ شما وارد نشده‌اید</p>
                <p className="text-xs text-muted-foreground mt-1">برای ساخت کلید API، لطفاً ابتدا وارد حساب کاربری خود شوید</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => navigate('/signin')}
                >
                  ورود به حساب کاربری
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {profileLoading ? (
                <div className="p-4 border border-border rounded-lg text-center">
                  <p className="text-muted-foreground">در حال بارگذاری...</p>
                </div>
              ) : profileError ? (
                <div className="p-4 border border-destructive/20 rounded-lg text-center">
                  <p className="text-destructive font-semibold mb-2">خطا در بارگذاری پروفایل</p>
                  <p className="text-xs text-muted-foreground mb-3">لطفاً دوباره وارد شوید</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('auth_token');
                      navigate('/signin');
                    }}
                  >
                    ورود مجدد
                  </Button>
                </div>
              ) : profile?.api_key ? (
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">کلید تولید</p>
                    <Badge variant="default">فعال</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs text-muted-foreground flex-1 break-all">
                      {showApiKey ? profile.api_key : profile.api_key.substring(0, 8) + '••••••••••••' + profile.api_key.slice(-4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowApiKey(!showApiKey);
                        if (!showApiKey && navigator.clipboard) {
                          navigator.clipboard.writeText(profile.api_key);
                        }
                      }}
                    >
                      {showApiKey ? 'مخفی' : 'نمایش'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">برای کپی کردن کلید، روی نمایش کلیک کنید</p>
                </div>
              ) : (
                <div className="p-4 border border-border rounded-lg text-center">
                  <p className="text-muted-foreground mb-2">کلید API وجود ندارد</p>
                  <p className="text-xs text-muted-foreground">برای شروع، یک کلید جدید بسازید</p>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGenerateApiKey}
                disabled={generateApiKey.isPending}
              >
                {generateApiKey.isPending ? 'در حال ساخت...' : 'ساخت کلید جدید'}
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">APIهای مشترک</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/browse')}
            >
              مدیریت
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscribedApis.map((api) => (
              <div key={api.name} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">{api.name}</h3>
                  <Badge variant="outline">{api.plan}</Badge>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">استفاده</span>
                    <span className="font-semibold">{api.calls} / {api.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full" style={{ width: `${(api.callsNum / api.limitNum) * 100}%` }} />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/api/${api.name.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  مشاهده جزئیات
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6 p-4 border-accent bg-accent/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">به محدودیت API خود نزدیک می‌شوید</p>
              <p className="text-sm text-muted-foreground">۸۵٪ از سهمیه ماهانه خود را استفاده کرده‌اید. برای فراخوانی‌های نامحدود به حرفه‌ای ارتقا دهید.</p>
            </div>
            <Button 
              type="button"
              size="sm" 
              className="ml-auto shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Upgrade button clicked');
                navigate('/pricing');
              }}
            >
              ارتقا
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;