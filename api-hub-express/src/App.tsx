import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CyberCursor } from "@/components/site/CyberCursor";
import { CommandPalette } from "@/components/site/CommandPalette";
import { I18nProvider } from "@/lib/i18n";

const Index = lazy(() => import("@/routes/index"));
const Browse = lazy(() => import("@/routes/browse"));
const ApiDetails = lazy(() => import("@/routes/api.$slug"));
const Pricing = lazy(() => import("@/routes/pricing"));
const Payment = lazy(() => import("@/routes/payment"));
const Documentation = lazy(() => import("@/routes/documentation"));
const Dashboard = lazy(() => import("@/routes/dashboard"));
const Studio = lazy(() => import("@/routes/studio"));
const Init = lazy(() => import("@/routes/init"));
const ApiCaller = lazy(() => import("@/routes/caller"));
const Cli = lazy(() => import("@/routes/cli"));
const Orgs = lazy(() => import("@/routes/org.organizations.create"));
const Release = lazy(() => import("@/routes/release"));
const SignIn = lazy(() => import("@/routes/signin"));
const SignUp = lazy(() => import("@/routes/signup"));
const Terms = lazy(() => import("@/routes/terms"));
const Privacy = lazy(() => import("@/routes/privacy"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 } },
});

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);
  return null;
}

function RouteFallback() {
  return <div className="min-h-screen bg-background p-6 font-mono text-primary">booting iranapi...</div>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <CyberCursor />
      <CommandPalette />
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/api/:slug" element={<ApiDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/init" element={<Init />} />
          <Route path="/caller" element={<ApiCaller />} />
          <Route path="/cli" element={<Cli />} />
          <Route path="/org/organizations/create" element={<Orgs />} />
          <Route path="/release" element={<Release />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AppRoutes />
      </I18nProvider>
    </QueryClientProvider>
  );
}
