import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Loader2, AlertTriangle, CheckCircle2, RotateCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { SocialProvider, SocialProviderInfo } from "@/lib/api-client";
import { useSocialProviders, useStartSocialLogin } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-1.66 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.68-1.27-1.68-1.04-.7.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.17a11 11 0 0 1 5.78 0c2.2-1.48 3.17-1.17 3.17-1.17.63 1.59.24 2.76.12 3.05.74.8 1.18 1.82 1.18 3.07 0 4.4-2.7 5.36-5.27 5.65.41.36.77 1.06.77 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}
function GitLabIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#FC6D26" d="M12 21.6 16.4 8.1H7.6L12 21.6z"/>
      <path fill="#E24329" d="M12 21.6 7.6 8.1H1.4L12 21.6z"/>
      <path fill="#FCA326" d="M1.4 8.1.05 12.3a.9.9 0 0 0 .33 1L12 21.6 1.4 8.1z"/>
      <path fill="#E24329" d="M1.4 8.1h6.2L4.9 1.6c-.14-.43-.74-.43-.88 0L1.4 8.1z"/>
      <path fill="#FC6D26" d="M12 21.6 16.4 8.1h6.2L12 21.6z"/>
      <path fill="#FCA326" d="m22.6 8.1 1.35 4.2a.9.9 0 0 1-.33 1L12 21.6 22.6 8.1z"/>
      <path fill="#E24329" d="M22.6 8.1h-6.2L19.1 1.6c.14-.43.74-.43.88 0l2.62 6.5z"/>
    </svg>
  );
}

type Status =
  | { kind: "idle" }
  | { kind: "loading"; provider: SocialProvider }
  | { kind: "success"; provider: SocialProvider }
  | { kind: "error"; provider: SocialProvider; message: string };

export function SocialAuth({ next }: { next?: string }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const redirectHintRef = useRef<number | undefined>(undefined);
  const providers = useSocialProviders();
  const startLogin = useStartSocialLogin();

  const providerRows = providers.data?.providers?.length ? providers.data.providers : [];

  useEffect(() => () => {
    if (redirectHintRef.current) window.clearTimeout(redirectHintRef.current);
  }, []);

  async function handle(provider: SocialProviderInfo) {
    const p = provider.slug;
    if (!provider.enabled) {
      setStatus({ kind: "error", provider: p, message: t("auth.social.err.disabled", { p: provider.label }) });
      return;
    }
    setStatus({ kind: "loading", provider: p });
    try {
      await startLogin.mutateAsync({ provider: p, next });
      // If the browser does not navigate within 6s, surface a hint.
      redirectHintRef.current = window.setTimeout(() => {
        setStatus((s) =>
          s.kind === "loading" && s.provider === p
            ? { kind: "error", provider: p, message: t("auth.social.err.slow") }
            : s,
        );
      }, 6000);
    } catch (e) {
      setStatus({
        kind: "error",
        provider: p,
        message: e instanceof Error ? e.message : t("auth.social.err.generic"),
      });
    }
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="relative my-2 text-center">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="relative bg-popover/0 px-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground" data-ltr>{t("auth.social.or")}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {providerRows.map((provider) => {
          const icon = providerIcon(provider.slug);
          const isLoading = status.kind === "loading" && status.provider === provider.slug;
          const isError = status.kind === "error" && status.provider === provider.slug;
          const label = provider.enabled ? provider.label : t("auth.social.disabled", { p: provider.label });
          return (
            <button
              key={provider.slug}
              type="button"
              onClick={() => handle(provider)}
              disabled={status.kind === "loading" || providers.isLoading}
              className="cta-grad relative !py-2 !px-2 text-xs min-w-0 truncate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={label}
              aria-busy={isLoading}
              title={label}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
              <span className="hidden sm:inline truncate">{provider.label}</span>
              {isError && (
                <span aria-hidden className="absolute -top-1 -end-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </button>
          );
        })}
        {providers.isLoading && (
          <div className="col-span-3 text-center text-[11px] text-muted-foreground" role="status">
            {"// "}{t("auth.social.status.loading")}
          </div>
        )}
        {providers.isError && (
          <div className="col-span-3 text-center text-[11px] text-destructive" role="alert">
            {"// "}{t("auth.social.err.providers")}
          </div>
        )}
      </div>

      <StatusPanel status={status} providers={providerRows} onRetry={(p) => {
        const provider = providerRows.find((row) => row.slug === p);
        if (provider) void handle(provider);
      }} />
    </div>
  );
}

function providerIcon(provider: SocialProvider): ReactNode {
  if (provider === "google") return <GoogleIcon />;
  if (provider === "github") return <GitHubIcon />;
  if (provider === "gitlab") return <GitLabIcon />;
  return null;
}

function StatusPanel({
  status,
  providers,
  onRetry,
}: {
  status: Status;
  providers: SocialProviderInfo[];
  onRetry: (p: SocialProvider) => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | undefined>(undefined);
  const canRetry = status.kind === "error" && providers.some((provider) => provider.slug === status.provider);

  useEffect(() => () => {
    if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
  }, []);

  const copyDetails = useCallback(() => {
    if (status.kind !== "error") return;
    const payload = [
      `provider: ${status.provider}`,
      `message:  ${status.message}`,
      `time:     ${new Date().toISOString()}`,
      `url:      ${typeof window !== "undefined" ? window.location.href : ""}`,
      `ua:       ${typeof navigator !== "undefined" ? navigator.userAgent : ""}`,
    ].join("\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(payload).then(() => {
        setCopied(true);
        toast.success(t("auth.social.err.copied"));
        copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
      }).catch(() => undefined);
    }
  }, [status, t]);

  if (status.kind === "idle") return null;

  if (status.kind === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="state-block mt-2 flex items-start gap-2 rounded-sm border border-primary/30 bg-primary/5 p-2 text-[11px] text-primary"
      >
        <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin" />
        <div className="min-w-0">
          <div className="font-mono">{"// "}{t("auth.social.status.redirecting").replace("{p}", status.provider)}</div>
          <div className="text-muted-foreground">{t("auth.social.status.popup")}</div>
        </div>
      </div>
    );
  }

  if (status.kind === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="state-block mt-2 flex items-start gap-2 rounded-sm border border-primary/30 bg-primary/5 p-2 text-[11px] text-primary"
      >
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div className="font-mono">{"// "}{t("auth.social.status.ok").replace("{p}", status.provider)}</div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="state-block mt-2 space-y-2 rounded-sm border border-destructive/40 bg-destructive/5 p-2 text-[11px] text-destructive"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="font-mono break-words">{"// "}{status.provider}: {status.message}</div>
          <div className="text-muted-foreground">{t("auth.social.err.hint")}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onRetry(status.provider)}
          disabled={!canRetry}
          className="btn-ghost inline-flex items-center gap-1 !py-1 !px-2 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label={t("auth.social.err.retry")}
        >
          <RotateCw className="h-3 w-3" /> {t("auth.social.err.retry")}
        </button>
        <button
          type="button"
          onClick={copyDetails}
          className="btn-ghost inline-flex items-center gap-1 !py-1 !px-2 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label={t("auth.social.err.copy")}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? t("auth.social.err.copied") : t("auth.social.err.copy")}
        </button>
      </div>
    </div>
  );
}
