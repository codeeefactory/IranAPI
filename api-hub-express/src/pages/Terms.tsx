import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { FileText, Shield, AlertCircle, CheckCircle } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-primary bg-clip-text text-transparent">
              شرایط استفاده از خدمات
            </h1>
            <p className="text-muted-foreground text-lg">
              آخرین به‌روزرسانی: دی ۱۴۰۳
            </p>
          </div>

          {/* Content */}
          <Card className="p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                ۱. پذیرش شرایط
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                با استفاده از خدمات ایران‌ای‌پی‌آی، شما موافقت می‌کنید که این شرایط استفاده را رعایت کنید. 
                اگر با هر بخشی از این شرایط موافق نیستید، لطفاً از استفاده از خدمات ما خودداری کنید.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                ۲. استفاده از خدمات
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>شما مجاز به استفاده از خدمات ما برای اهداف قانونی و مشروع هستید. موارد زیر ممنوع است:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>استفاده از خدمات برای فعالیت‌های غیرقانونی</li>
                  <li>تلاش برای دسترسی غیرمجاز به سیستم‌ها یا داده‌ها</li>
                  <li>توزیع بدافزار، ویروس یا کدهای مخرب</li>
                  <li>انجام حملات DDoS یا هرگونه تلاش برای مختل کردن خدمات</li>
                  <li>استفاده از خدمات برای اسپم یا ارسال پیام‌های ناخواسته</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary" />
                ۳. حساب کاربری و امنیت
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>شما مسئولیت کامل حفظ امنیت حساب کاربری و کلید API خود را بر عهده دارید:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>کلید API خود را محرمانه نگه دارید و با دیگران به اشتراک نگذارید</li>
                  <li>در صورت مشاهده هرگونه فعالیت مشکوک، بلافاصله به ما اطلاع دهید</li>
                  <li>ما حق داریم در صورت نقض این شرایط، حساب کاربری شما را مسدود کنیم</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۴. محدودیت‌های استفاده</h2>
              <p className="text-muted-foreground leading-relaxed">
                استفاده از خدمات ما مشمول محدودیت‌های نرخ (rate limits) است که بر اساس پلن انتخابی شما تعیین می‌شود. 
                تلاش برای دور زدن این محدودیت‌ها یا استفاده بیش از حد از منابع، منجر به مسدود شدن حساب کاربری خواهد شد.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۵. مالکیت فکری</h2>
              <p className="text-muted-foreground leading-relaxed">
                تمام حقوق مالکیت فکری مربوط به خدمات، پلتفرم و محتوای ما متعلق به ایران‌ای‌پی‌آی است. 
                شما حق کپی، توزیع یا استفاده تجاری از محتوای ما را بدون اجازه کتبی ندارید.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۶. محدودیت مسئولیت</h2>
              <p className="text-muted-foreground leading-relaxed">
                خدمات ما به صورت "همان‌طور که هست" ارائه می‌شود. ما هیچ تضمینی در مورد در دسترس بودن، 
                دقت یا عملکرد خدمات نمی‌دهیم. ما مسئولیتی در قبال خسارات مستقیم یا غیرمستقیم ناشی از 
                استفاده یا عدم امکان استفاده از خدمات نداریم.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۷. تغییرات در شرایط</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما حق داریم این شرایط استفاده را در هر زمان تغییر دهیم. تغییرات از طریق ایمیل یا 
                اطلاع‌رسانی در پلتفرم به شما اطلاع داده خواهد شد. ادامه استفاده از خدمات پس از 
                تغییرات به معنای پذیرش شرایط جدید است.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">۸. تماس با ما</h2>
              <p className="text-muted-foreground leading-relaxed">
                در صورت داشتن سوال یا نگرانی در مورد این شرایط، لطفاً با ما از طریق ایمیل یا 
                بخش پشتیبانی تماس بگیرید.
              </p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

