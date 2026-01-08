import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import { AOSProvider } from "@/components/AOSProvider";
import { CyberCursor } from "@/components/CyberCursor";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RuntimeTranslator } from "@/components/RuntimeTranslator";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/lib/i18n";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

const Browse = lazy(() => import("@/pages/Browse"));
const ApiDetails = lazy(() => import("@/pages/ApiDetails"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Payment = lazy(() => import("@/pages/Payment"));
const Documentation = lazy(() => import("@/pages/Documentation"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Studio = lazy(() => import("@/pages/Studio"));
const ApiCaller = lazy(() => import("@/pages/ApiCaller"));
const Orgs = lazy(() => import("@/pages/Orgs"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return null;
}

function RouteFallback() {
  const { t } = useI18n();

  return (
    <main id="main-content" className="container py-16">
      <div className="grid gap-6" aria-label={t("app.loadingRoute")}>
        <div className="doc-skeleton h-10 w-48" />
        <div className="doc-skeleton h-32" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="doc-skeleton h-48" />
          <div className="doc-skeleton h-48" />
          <div className="doc-skeleton h-48" />
        </div>
      </div>
    </main>
  );
}

function AppRoutes() {
  const { dir, t } = useI18n();

  return (
    <BrowserRouter>
      <div dir={dir} className="min-h-screen">
        <CyberCursor />
        <LoadingScreen />
        <RuntimeTranslator />
        <AOSProvider />
        <a href="#main-content" className="skip-link">
          {t("app.skip")}
        </a>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/api/:slug" element={<ApiDetails />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/caller" element={<ApiCaller />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studio"
                element={
                  <ProtectedRoute>
                    <Studio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/org/organizations/create"
                element={
                  <ProtectedRoute>
                    <Orgs />
                  </ProtectedRoute>
                }
              />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="iranapi-theme">
        <I18nProvider>
          <Sonner position="top-center" />
          <AppRoutes />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
