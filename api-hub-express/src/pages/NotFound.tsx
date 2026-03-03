import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main id="main-content" className="cyber-shell container flex min-h-screen items-center justify-center py-16">
      <div className="page-hero w-full max-w-xl space-y-5 text-center">
        <p className="eyebrow">404</p>
        <h1 className="section-title">صفحه مورد نظر پیدا نشد</h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          مسیر واردشده وجود ندارد یا به آدرس دیگری منتقل شده است. از صفحه اصلی یا فهرست APIها ادامه دهید.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/">خانه</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/browse">کشف APIها</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
