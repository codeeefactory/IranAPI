import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PageShell } from "@/components/site/Layout";
import { TerminalWindow, Prompt, Cursor } from "@/components/site/Terminal";
import { SocialAuth } from "@/components/site/SocialAuth";
import { useI18n } from "@/lib/i18n";
import { ApiClientError } from "@/lib/api-client";
import { useRegister } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const register = useRegister();
  const [v, setV] = useState({ first_name: "", last_name: "", username: "", email: "", pw: "", pw2: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!v.username) e.username = t("auth.error.required");
    if (!v.email) e.email = t("auth.error.required");
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = t("auth.error.email");
    if (!v.pw) e.pw = t("auth.error.required");
    else if (v.pw.length < 8) e.pw = t("auth.error.password");
    if (v.pw !== v.pw2) e.pw2 = t("auth.error.passwordConfirm");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSuccess(null);
    if (!validate()) return;
    try {
      await register.mutateAsync({
        username: v.username,
        email: v.email,
        password: v.pw,
        password_confirm: v.pw2,
        first_name: v.first_name,
        last_name: v.last_name,
      });
      setSuccess(t("auth.success.signup"));
      setTimeout(() => navigate("/dashboard"), 700);
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
        <TerminalWindow title="~/iranapi/auth/signup" glow>
          <div className="space-y-3 text-sm">
            <Prompt>iran account create</Prompt>
            <div className="text-muted-foreground text-xs">{"// "}{t("auth.signup.sub")}</div>
            <form onSubmit={onSubmit} noValidate className="space-y-3 pt-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="first_name" name="first_name" label={t("auth.field.firstName")} v={v.first_name} k="first_name" set={setV} state={v} autoComplete="given-name" placeholder="Ali" error={errors.first_name} />
                <Field id="last_name" name="last_name" label={t("auth.field.lastName")} v={v.last_name} k="last_name" set={setV} state={v} autoComplete="family-name" placeholder="Rezaei" error={errors.last_name} />
              </div>
              <Field id="username" name="username" label={t("auth.field.username")} v={v.username} k="username" set={setV} state={v} autoComplete="username" placeholder="demo-dev" error={errors.username} />
              <Field id="email" name="email" label={t("auth.field.email")} v={v.email} k="email" set={setV} state={v} type="email" autoComplete="email" placeholder={t("auth.placeholder.email")} error={errors.email} />
              <Field id="password" name="password" label={t("auth.field.password")} v={v.pw} k="pw" set={setV} state={v} type="password" autoComplete="new-password" placeholder="********" error={errors.pw} />
              <Field id="password_confirm" name="password_confirm" label={t("auth.field.passwordConfirm")} v={v.pw2} k="pw2" set={setV} state={v} type="password" autoComplete="new-password" placeholder="********" error={errors.pw2} />
              {errors.form && (
                <div role="alert" className="text-xs text-destructive">{"// "}{errors.form}</div>
              )}
              {success && (
                <div role="status" className="text-xs text-primary text-glow">{"// "}{success}</div>
              )}
              <button
                type="submit"
                disabled={register.isPending}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {register.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {register.isPending ? t("auth.submit.loading") : t("auth.submit.signup")}
              </button>
            </form>
            <SocialAuth next="/dashboard" />

            <div className="pt-3 text-xs text-muted-foreground">
              {"// "}{t("auth.toSignin")} <Link to="/signin" className="text-primary hover:underline">./signin</Link>
            </div>
            <Prompt><Cursor /></Prompt>
          </div>
        </TerminalWindow>
      </div>
    </PageShell>
  );
}

function Field({ id, name, label, v, k, set, state, type = "text", placeholder, autoComplete, error }: any) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-muted-foreground mb-1" data-ltr>--{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={v}
        onChange={(e) => set({ ...state, [k]: e.target.value })}
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
