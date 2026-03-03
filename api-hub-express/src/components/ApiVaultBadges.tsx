import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Eye, EyeOff, KeyRound, RadioTower, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const methodStyles: Record<string, string> = {
  GET: "border-cyan-400/40 bg-cyan-400/12 text-cyan-200",
  POST: "border-emerald-400/40 bg-emerald-400/12 text-emerald-200",
  PUT: "border-amber-400/40 bg-amber-400/12 text-amber-200",
  PATCH: "border-blue-400/40 bg-blue-400/12 text-blue-200",
  DELETE: "border-rose-400/40 bg-rose-400/12 text-rose-200",
};

const statusStyles: Record<string, { className: string; label: string; icon: typeof CheckCircle2 }> = {
  active: { className: "border-emerald-400/40 bg-emerald-400/12 text-emerald-200", label: "فعال", icon: CheckCircle2 },
  beta: { className: "border-cyan-400/40 bg-cyan-400/12 text-cyan-200", label: "بتا", icon: RadioTower },
  deprecated: { className: "border-amber-400/40 bg-amber-400/12 text-amber-200", label: "بازنشسته", icon: AlertTriangle },
  inactive: { className: "border-slate-400/40 bg-slate-400/12 text-slate-200", label: "غیرفعال", icon: Clock3 },
};

const authSchemeLabels: Record<string, string> = {
  rapidapi_proxy: "Proxy",
  api_key: "API Key",
  bearer: "Bearer",
  oauth2: "OAuth 2.0",
  basic: "Basic Auth",
  none: "Public",
};

export function MethodBadge({ method = "GET", className }: { method?: string; className?: string }) {
  const normalized = method.toUpperCase();

  return (
    <Badge variant="outline" className={cn("font-mono tracking-normal", methodStyles[normalized] || methodStyles.GET, className)}>
      {normalized}
    </Badge>
  );
}

export function ApiStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusStyles[status] || statusStyles.active;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5", config.className, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}

export function HealthSignalBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-2 border-accent/35 bg-accent/10 text-accent", className)}
      title="وضعیت عملیاتی سرویس"
    >
      <span className="api-health-orbit" aria-hidden="true" />
      پایدار
    </Badge>
  );
}

export function AuthSchemeBadge({ scheme, className }: { scheme?: string; className?: string }) {
  const label = authSchemeLabels[scheme || ""] || "Managed";

  return (
    <Badge variant="outline" className={cn("gap-1.5 border-primary/35 bg-primary/10 text-primary", className)}>
      <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function SecretPreview({ value, hasSecret }: { value?: string | null; hasSecret?: boolean }) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const visibleValue = value || "••••••••";

  return (
    <div className="grid gap-2 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
          کلید API
        </div>
        {hasSecret ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={previewVisible}
            onClick={() => setPreviewVisible((current) => !current)}
          >
            {previewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewVisible ? "پنهان‌سازی" : "نمایش امن"}
          </Button>
        ) : null}
      </div>
      <code className="block rounded-md border border-border/70 bg-background/80 px-3 py-2 text-left text-xs text-muted-foreground">
        {hasSecret ? (previewVisible ? visibleValue : "••••••••••••••••") : "کلیدی برای این حساب ثبت نشده است"}
      </code>
      <p className="text-xs leading-6 text-muted-foreground">
        کلید خام در رابط عمومی یا متادیتای صفحه نمایش داده نمی‌شود. این کنترل فقط پس از اقدام کاربر مقدار ماسک‌شده را نشان می‌دهد.
      </p>
    </div>
  );
}

export function SecurityNotice({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md border border-accent/25 bg-accent/10 p-4 text-sm leading-7 text-muted-foreground", className)}>
      <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
        <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
        نکته امنیتی
      </p>
      <p>Secretها ماسک می‌شوند، مسیرهای خصوصی no-store هستند و نمونه‌های درخواست فقط مقدار placeholder امن نمایش می‌دهند.</p>
    </div>
  );
}
