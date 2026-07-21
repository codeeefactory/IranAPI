import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/site/Layout";
import { TerminalWindow, Prompt, Cursor } from "@/components/site/Terminal";
import { SocialAuth } from "@/components/site/SocialAuth";
import { useI18n } from "@/lib/i18n";
import { ApiClientError } from "@/lib/api-client";
import { useLogin } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const login = useLogin();
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [errors, setErrors] = useState<{ username?: string; pw?: string; form?: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const redirectTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!username) e.username = t("auth.error.required");
    if (!pw) e.pw = t("auth.error.required");
    else if (pw.length < 8) e.pw = t("auth.error.password");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSuccess(null);
    if (!validate()) return;
    try {
      await login.mutateAsync({ username, password: pw });
      setSuccess(t("auth.success.signin"));
      redirectTimerRef.current = window.setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      const e = err as ApiClientError;
      const msg = e.status && [400, 401, 403].includes(e.status)
        ? e.message || t("auth.error.invalidCreds")
        : t("auth.error.network");
      setErrors({ form: msg });
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <TerminalWindow title="~/iranapi/auth/signin" glow>
          <div className="space-y-3 text-sm">
            <Prompt>iran auth login</Prompt>
            <div className="text-muted-foreground text-xs">{"// "}{t("auth.signin.sub")}</div>
            <form onSubmit={onSubmit} noValidate className="space-y-3 pt-2">
              <Field
                id="username"
                name="username"
                label={t("auth.field.username")}
                value={username}
                onChange={setUsername}
                autoComplete="username"
                placeholder="demo-dev"
                error={errors.username}
              />
              <Field
                id="password"
                name="password"
                label={t("auth.field.password")}
                value={pw}
                onChange={setPw}
                type="password"
                autoComplete="current-password"
                placeholder="********"
                error={errors.pw}
              />
              {errors.form && (
                <div role="alert" className="text-xs text-destructive">{"// "}{errors.form}</div>
              )}
              {success && (
                <div role="status" className="text-xs text-primary text-glow">{"// "}{success}</div>
              )}

              <button
                type="submit"
                disabled={login.isPending}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {login.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {login.isPending ? t("auth.submit.loading") : t("auth.submit.signin")}
              </button>
            </form>
            <SocialAuth next="/dashboard" />
            <div className="pt-3 text-xs text-muted-foreground">
              {"// "}{t("auth.toSignup")} <Link to="/signup" className="text-primary hover:underline">./signup</Link>
            </div>
            <Prompt><Cursor /></Prompt>
          </div>
        </TerminalWindow>
      </div>
    </PageShell>
  );
}

function Field({ id, name, label, value, onChange, type = "text", placeholder, autoComplete, error }: {
  id: string; name: string; label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoComplete?: string; error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-muted-foreground mb-1" data-ltr>--{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        dir={type === "email" || type === "password" || name === "username" ? "ltr" : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className="field"
      />
      {error && (
        <div id={`${id}-err`} role="alert" className="mt-1 text-[11px] text-destructive">{"// "}{error}</div>
      )}
    </div>
  );
}
