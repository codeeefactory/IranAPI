import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, Zap, Users, Cloud, Database, MessageSquare, Music, Image, ShoppingCart, Car, ShoppingBag, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const apis = [
  { id: 1, name: "روبیکا AI", category: "هوش مصنوعی", description: "مدل‌های زبانی پیشرفته هوش مصنوعی برای تولید متن و چت", popularity: "۹۸٪", latency: "۱۲۰ میلی‌ثانیه", icon: MessageSquare, trending: true, price: "پلن رایگان موجود" },
  { id: 2, name: "زرین‌پال", category: "پرداخت", description: "درگاه پرداخت امن و سریع برای پذیرش پرداخت آنلاین", popularity: "۹۵٪", latency: "۸۵ میلی‌ثانیه", icon: Database, trending: true, price: "پرداخت بر اساس مصرف" },
  { id: 3, name: "دیجی‌کالا", category: "خرید و فروش", description: "دسترسی به کاتالوگ محصولات و قیمت‌گذاری از بزرگترین فروشگاه آنلاین ایران", popularity: "۹۶٪", latency: "۸۸ میلی‌ثانیه", icon: ShoppingCart, trending: true, price: "پرداخت بر اساس مصرف" },
  { id: 4, name: "اسنپ", category: "حمل و نقل", description: "سرویس درخواست تاکسی و پیک آنلاین با امکان ردیابی لحظه‌ای", popularity: "۹۴٪", latency: "۷۵ میلی‌ثانیه", icon: Car, trending: true, price: "پرداخت بر اساس مصرف" },
  { id: 5, name: "ترب", category: "جستجو", description: "مقایسه قیمت محصولات از فروشگاه‌های مختلف و یافتن بهترین قیمت", popularity: "۹۱٪", latency: "۹۸ میلی‌ثانیه", icon: Search, trending: false, price: "رایگان" },
  { id: 6, name: "تکنولایف", category: "خرید و فروش", description: "دسترسی به محصولات تکنولوژی و لوازم الکترونیکی با قیمت‌های به‌روز", popularity: "۸۹٪", latency: "۱۰۲ میلی‌ثانیه", icon: Smartphone, trending: false, price: "پرداخت بر اساس مصرف" },
  { id: 7, name: "بله", category: "ارتباطات", description: "پیام‌رسان و شبکه اجتماعی ایرانی با امکانات چت، کانال و گروه", popularity: "۹۲٪", latency: "۹۵ میلی‌ثانیه", icon: MessageSquare, trending: true, price: "رایگان" },
  { id: 8, name: "هواشناسی ایران", category: "داده", description: "داده‌های آب و هوای لحظه‌ای و پیش‌بینی برای شهرهای ایران", popularity: "۹۲٪", latency: "۹۵ میلی‌ثانیه", icon: Cloud, trending: false, price: "رایگان" },
  { id: 9, name: "ایتا", category: "ارتباطات", description: "سرویس پیام‌رسانی و ارسال اعلان‌های فوری", popularity: "۹۰٪", latency: "۱۱۰ میلی‌ثانیه", icon: MessageSquare, trending: false, price: "۱۹.۹۵ تومان/ماه" },
  { id: 10, name: "بیپ‌تونز", category: "موسیقی", description: "دسترسی به کاتالوگ موسیقی ایرانی و بین‌المللی", popularity: "۸۸٪", latency: "۱۳۰ میلی‌ثانیه", icon: Music, trending: true, price: "رایگان" },
  { id: 11, name: "آپارات", category: "رسانه", description: "ویدئو و تصاویر با کیفیت بالا از پلتفرم آپارات", popularity: "۸۵٪", latency: "۱۰۰ میلی‌ثانیه", icon: Image, trending: false, price: "رایگان" },
  { id: 12, name: "نشان", category: "مکان", description: "نقشه‌ها و خدمات مکان‌یابی برای ایران", popularity: "۹۷٪", latency: "۹۰ میلی‌ثانیه", icon: Cloud, trending: true, price: "۷ تومان/۱۰۰۰ فراخوانی" },
  { id: 13, name: "سروش‌پلاس", category: "ارتباطات", description: "ارسال پیامک و پیام‌های صوتی و تصویری", popularity: "۹۳٪", latency: "۱۰۵ میلی‌ثانیه", icon: MessageSquare, trending: false, price: "۰.۰۰۷۵ تومان/پیامک" },
];

const categories = [
  "همه دسته‌ها", "هوش مصنوعی", "پرداخت", "خرید و فروش", "حمل و نقل", "جستجو", "ارتباطات", "داده", "موسیقی", "رسانه", "مکان"
];

const Browse = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">مرور APIها</h1>
          <p className="text-muted-foreground text-lg">
            هزاران API را برای توانمندسازی برنامه‌های خود کشف کنید
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="جستجوی APIها..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              فیلترها
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "همه دسته‌ها" ? "default" : "outline"}
                size="sm"
                className={category === "همه دسته‌ها" ? "bg-gradient-primary" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">۱۰,۰۰۰+</p>
                <p className="text-sm text-muted-foreground">API موجود</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">۵ میلیون+</p>
                <p className="text-sm text-muted-foreground">توسعه‌دهنده</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">۹۹.۹٪</p>
                <p className="text-sm text-muted-foreground">زمان فعالیت</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">۵۰ میلی‌ثانیه</p>
                <p className="text-sm text-muted-foreground">تاخیر میانگین</p>
              </div>
            </div>
          </Card>
        </div>

        {/* API Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apis.map((api) => (
            <Card key={api.id} className="p-6 hover:shadow-glow transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-gradient-primary transition-all">
                  <api.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                {api.trending && (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    پرطرفدار
                  </Badge>
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">{api.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{api.description}</p>

              <div className="flex items-center gap-4 text-sm mb-4">
                <Badge variant="outline">{api.category}</Badge>
                <span className="text-muted-foreground">{api.price}</span>
              </div>

              <div className="flex items-center justify-between mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">محبوبیت: </span>
                  <span className="font-semibold">{api.popularity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">تاخیر: </span>
                  <span className="font-semibold">{api.latency}</span>
                </div>
              </div>

              <Link to={`/api/${api.id}`}>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
                  مشاهده جزئیات
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button variant="outline" disabled>قبلی</Button>
          <Button variant="default" className="bg-gradient-primary">۱</Button>
          <Button variant="outline">۲</Button>
          <Button variant="outline">۳</Button>
          <Button variant="outline">بعدی</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;