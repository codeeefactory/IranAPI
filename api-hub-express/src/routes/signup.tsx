import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/site/Layout";
import { SocialAuth } from "@/components/site/SocialAuth";
import { useI18n } from "@/lib/i18n";
import { ApiClientError } from "@/lib/api-client";
import { useRegister } from "@/hooks/useAuth";
import { FormStatus, PasswordField, TextField } from "@/components/ui/form-controls";
import { ArrowRight, Check, AtSign, Code2, Loader2, LockKeyhole, ShieldCheck, SquareTerminal, UserRound } from "lucide-react";

export default function SignUpPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const register = useRegister();
  const [v, setV] = useState({ first_name: "", last_name: "", username: "", email: "", pw: "", pw2: "", account_type: "user" as "user" | "api_developer" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const redirectTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
  }, []);

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
        account_type: v.account_type,
      });
      setSuccess(t("auth.success.signup"));
      redirectTimerRef.current = window.setTimeout(() => {
        if (v.account_type === "api_developer") window.location.assign("/admin/");
        else navigate("/dashboard");
      }, 700);
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
      <section className="auth-login-stage" aria-labelledby="signup-title">
        <div className="auth-terminal auth-signup-terminal">
          <header className="auth-terminal-toolbar" dir="ltr">
            <div className="auth-window-controls" aria-hidden="true">
              <span className="auth-window-dot auth-window-dot-close" />
              <span className="auth-window-dot auth-window-dot-minimize" />
              <span className="auth-window-dot auth-window-dot-maximize" />
            </div>
            <div className="auth-terminal-title">
              <SquareTerminal aria-hidden />
              <span>{t("auth.terminalTitle")}</span>
            </div>
            <div className="auth-terminal-status">
              <span aria-hidden />
              {t("auth.secure")}
            </div>
          </header>

          <div className="auth-terminal-layout">
            <aside className="auth-terminal-context" aria-hidden="true">
              <div className="auth-context-brand">
                <span className="auth-context-icon"><SquareTerminal /></span>
                <span>{t("auth.workspace")}</span>
              </div>
              <div className="auth-context-copy">
                <p className="auth-context-kicker">{t("auth.context.signupKicker")}</p>
                <h2>{t("auth.context.signupTitle1")}<br />{t("auth.context.signupTitle2")}</h2>
                <p>{t("auth.context.signupDescription")}</p>
              </div>
              <div className="auth-command-block">
                <p dir="ltr"><span>guest@iranapi</span><b>:~$</b> iranapi account create</p>
                <ul>
                  <li><Check /> {t("auth.workspace")} <strong>{t("auth.context.ready")}</strong></li>
                  <li><Check /> {t("auth.context.keys")} <strong>{t("auth.context.protected")}</strong></li>
                  <li><Check /> {t("auth.context.support")} <strong>{t("auth.context.online")}</strong></li>
                </ul>
              </div>
            </aside>

            <div className="auth-form-pane">
              <div className="auth-form-route" dir="ltr">
                <span>~</span><b>/</b>auth<b>/</b>signup
                <span className="auth-secure-badge"><ShieldCheck /> {t("auth.secureSession")}</span>
              </div>

              <div className="auth-form-heading">
                <h1 id="signup-title">{t("auth.signup.title")}</h1>
                <p>{t("auth.signup.sub")}</p>
              </div>

              <form onSubmit={onSubmit} noValidate className="auth-login-form">
                <div className="grid gap-3 sm:grid-cols-2">
                <TextField id="first_name" name="first_name" label={t("auth.field.firstName")} value={v.first_name} onChange={(event) => setV((state) => ({ ...state, first_name: event.target.value }))} autoComplete="given-name" placeholder="Ali" error={errors.first_name} icon={UserRound} />
                <TextField id="last_name" name="last_name" label={t("auth.field.lastName")} value={v.last_name} onChange={(event) => setV((state) => ({ ...state, last_name: event.target.value }))} autoComplete="family-name" placeholder="Rezaei" error={errors.last_name} icon={UserRound} />
                </div>
                <TextField id="username" name="username" label={t("auth.field.username")} value={v.username} onChange={(event) => setV((state) => ({ ...state, username: event.target.value }))} autoComplete="username" placeholder="demo-dev" error={errors.username} icon={UserRound} required dir="ltr" />
                <TextField id="email" name="email" label={t("auth.field.email")} value={v.email} onChange={(event) => setV((state) => ({ ...state, email: event.target.value }))} type="email" autoComplete="email" placeholder={t("auth.placeholder.email")} error={errors.email} icon={AtSign} required dir="ltr" />
                <fieldset>
                  <legend className="mb-1.5 text-xs text-muted-foreground">{t("auth.field.accountType")}</legend>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("auth.field.accountType")}>
                    <button type="button" role="radio" aria-checked={v.account_type === "user"} onClick={() => setV((state) => ({ ...state, account_type: "user" }))} className="field flex items-center justify-center gap-2 !py-2 data-[checked=true]:border-primary data-[checked=true]:text-primary" data-checked={v.account_type === "user"}>
                      <UserRound className="h-4 w-4" />{t("auth.account.user")}
                    </button>
                    <button type="button" role="radio" aria-checked={v.account_type === "api_developer"} onClick={() => setV((state) => ({ ...state, account_type: "api_developer" }))} className="field flex items-center justify-center gap-2 !py-2 data-[checked=true]:border-primary data-[checked=true]:text-primary" data-checked={v.account_type === "api_developer"}>
                      <Code2 className="h-4 w-4" />{t("auth.account.developer")}
                    </button>
                  </div>
                </fieldset>
                <PasswordField id="password" name="password" label={t("auth.field.password")} value={v.pw} onChange={(event) => setV((state) => ({ ...state, pw: event.target.value }))} autoComplete="new-password" placeholder="********" error={errors.pw} icon={LockKeyhole} required dir="ltr" />
                <PasswordField id="password_confirm" name="password_confirm" label={t("auth.field.passwordConfirm")} value={v.pw2} onChange={(event) => setV((state) => ({ ...state, pw2: event.target.value }))} autoComplete="new-password" placeholder="********" error={errors.pw2} icon={LockKeyhole} required dir="ltr" />
                {errors.form ? <FormStatus tone="error">{errors.form}</FormStatus> : null}
                {success ? <FormStatus tone="success">{success}</FormStatus> : null}
                <button type="submit" disabled={register.isPending} className="auth-submit disabled:opacity-60 disabled:cursor-not-allowed">
                  <span>
                    {register.isPending && <Loader2 className="animate-spin" aria-hidden />}
                    {register.isPending ? t("auth.submit.loading") : t("auth.submit.signup")}
                  </span>
                  <ArrowRight aria-hidden />
                </button>
              </form>

              <div className="auth-social-row">
                <SocialAuth next="/dashboard" />
              </div>

              <p className="auth-signup-link">
                {t("auth.toSignin")} {" "}
                <Link to="/signin">{t("auth.submit.signin")}</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
