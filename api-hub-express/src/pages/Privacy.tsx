import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Lock, Eye, Shield, Database, UserCheck } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-primary bg-clip-text text-transparent">
              حریم خصوصی
            </h1>
            <p className="text-muted-foreground text-lg">
              آخرین به‌روزرسانی: دی ۱۴۰۳
            </p>
          </div>

          {/* Content */}
          <Card className="p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                ۱. اطلاعاتی که جمع‌آوری می‌کنیم
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>ما اطلاعات زیر را از شما جمع‌آوری می‌کنیم:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>اطلاعات حساب کاربری:</strong> نام کاربری، ایمیل، رمز عبور (رمزگذاری شده)</li>
                  <li><strong>اطلاعات پروفایل:</strong> نام، نام خانوادگی، شماره تلفن (در صورت ارائه)</li>
                  <li><strong>اطلاعات استفاده:</strong> لاگ درخواست‌های API، آمار استفاده، تاریخ و زمان دسترسی</li>
                  <li><strong>اطلاعات فنی:</strong> آدرس IP، نوع مرورگر، سیستم عامل</li>
                  <li><strong>کوکی‌ها و فناوری‌های مشابه:</strong> برای بهبود تجربه کاربری و تحلیل استفاده</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                ۲. نحوه استفاده از اطلاعات
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>ما از اطلاعات شما برای اهداف زیر استفاده می‌کنیم:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>ارائه و بهبود خدمات</li>
                  <li>پردازش درخواست‌های API شما</li>
                  <li>ارتباط با شما در مورد حساب کاربری و خدمات</li>
                  <li>ارسال اطلاع‌رسانی‌های مهم</li>
                  <li>تحلیل و بهبود عملکرد پلتفرم</li>
                  <li>جلوگیری از تقلب و سوءاستفاده</li>
                  <li>رعایت الزامات قانونی</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                ۳. حفاظت از اطلاعات
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>ما از اقدامات امنیتی زیر برای محافظت از اطلاعات شما استفاده می‌کنیم:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>رمزگذاری داده‌ها در انتقال (HTTPS/TLS)</li>
                  <li>رمزگذاری داده‌های حساس در ذخیره‌سازی</li>
                  <li>دسترسی محدود به اطلاعات بر اساس نیاز</li>
                  <li>نظارت منظم بر سیستم‌های امنیتی</li>
                  <li>پشتیبان‌گیری منظم و امن از داده‌ها</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۴. اشتراک‌گذاری اطلاعات</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما اطلاعات شما را به اشخاص ثالث نمی‌فروشیم. اطلاعات شما تنها در موارد زیر به اشتراک گذاشته می‌شود:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4 mt-3 text-muted-foreground">
                <li>ارائه‌دهندگان خدمات (مانند میزبانی وب، پردازش پرداخت) که به ما در ارائه خدمات کمک می‌کنند</li>
                <li>در صورت الزام قانونی یا درخواست مقامات قضایی</li>
                <li>در صورت انتقال کسب‌وکار (ادغام، خرید یا ورشکستگی)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" />
                ۵. حقوق شما
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>شما حق دارید:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>به اطلاعات شخصی خود دسترسی داشته باشید</li>
                  <li>اطلاعات نادرست را اصلاح کنید</li>
                  <li>درخواست حذف اطلاعات خود را بدهید</li>
                  <li>مخالفت با پردازش اطلاعات خود را اعلام کنید</li>
                  <li>درخواست انتقال اطلاعات خود را بدهید</li>
                  <li>در هر زمان از عضویت انصراف دهید</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۶. کوکی‌ها</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما از کوکی‌ها و فناوری‌های مشابه برای بهبود تجربه کاربری، تحلیل استفاده و ارائه 
                خدمات شخصی‌سازی شده استفاده می‌کنیم. شما می‌توانید تنظیمات کوکی‌ها را در مرورگر 
                خود تغییر دهید، اما این ممکن است بر عملکرد برخی از ویژگی‌های سایت تأثیر بگذارد.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۷. تغییرات در سیاست حریم خصوصی</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما ممکن است این سیاست حریم خصوصی را به‌روزرسانی کنیم. تغییرات مهم از طریق ایمیل 
                یا اطلاع‌رسانی در پلتفرم به شما اطلاع داده خواهد شد. ادامه استفاده از خدمات پس از 
                تغییرات به معنای پذیرش سیاست جدید است.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۸. تماس با ما</h2>
              <p className="text-muted-foreground leading-relaxed">
                در صورت داشتن سوال یا نگرانی در مورد حریم خصوصی یا نحوه استفاده ما از اطلاعات شما، 
                لطفاً با ما از طریق ایمیل یا بخش پشتیبانی تماس بگیرید.
              </p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

