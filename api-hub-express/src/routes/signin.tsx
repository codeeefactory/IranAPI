import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/site/Layout";
import { SocialAuth } from "@/components/site/SocialAuth";
import { useI18n } from "@/lib/i18n";
import { ApiClientError, authApi } from "@/lib/api-client";
import { useLogin } from "@/hooks/useAuth";
import { FormStatus, PasswordField, TextField } from "@/components/ui/form-controls";
import { ArrowRight, Check, Loader2, LockKeyhole, ShieldCheck, SquareTerminal, UserRound } from "lucide-react";

export default function SignInPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
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
      const params = new URLSearchParams(location.search);
      const callbackUrl = params.get("cli_callback");
      const state = params.get("cli_state");
      const codeChallenge = params.get("cli_challenge");
      if (callbackUrl && state && codeChallenge) {
        const authorization = await authApi.authorizeCli({
          callback_url: callbackUrl,
          state,
          code_challenge: codeChallenge,
        });
        window.location.assign(authorization.redirect_url);
        return;
      }
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
      <section className="auth-login-stage" aria-labelledby="signin-title">
        <div className="auth-terminal">
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
                <p className="auth-context-kicker">{t("auth.context.signinKicker")}</p>
                <h2>{t("auth.context.signinTitle1")}<br />{t("auth.context.signinTitle2")}</h2>
                <p>{t("auth.context.signinDescription")}</p>
              </div>
              <div className="auth-command-block">
                <p dir="ltr"><span>guest@iranapi</span><b>:~$</b> iranapi status</p>
                <ul>
                  <li><Check /> {t("auth.context.catalog")} <strong>{t("auth.context.online")}</strong></li>
                  <li><Check /> {t("auth.context.session")} <strong>{t("auth.context.protected")}</strong></li>
                  <li><Check /> {t("auth.workspace")} <strong>{t("auth.context.ready")}</strong></li>
                </ul>
              </div>
            </aside>

            <div className="auth-form-pane">
              <div className="auth-form-route" dir="ltr">
                <span>~</span><b>/</b>auth<b>/</b>signin
                <span className="auth-secure-badge"><ShieldCheck /> {t("auth.secureSession")}</span>
              </div>

              <div className="auth-form-heading">
                <h1 id="signin-title">{t("auth.signin.title")}</h1>
                <p>{t("auth.signin.sub")}</p>
              </div>

              <form onSubmit={onSubmit} noValidate className="auth-login-form">
                <TextField
                  id="username"
                  name="username"
                  label={t("auth.field.username")}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="demo-dev"
                  error={errors.username}
                  icon={UserRound}
                  required
                  dir="ltr"
                />
                <PasswordField
                  id="password"
                  name="password"
                  label={t("auth.field.password")}
                  value={pw}
                  onChange={(event) => setPw(event.target.value)}
                  autoComplete="current-password"
                  placeholder="********"
                  error={errors.pw}
                  icon={LockKeyhole}
                  required
                  dir="ltr"
                />

                {errors.form ? <FormStatus tone="error">{errors.form}</FormStatus> : null}
                {success ? <FormStatus tone="success">{success}</FormStatus> : null}

                <button
                  type="submit"
                  disabled={login.isPending}
                  className="auth-submit disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>
                  {login.isPending && <Loader2 className="animate-spin" aria-hidden />}
                  {login.isPending ? t("auth.submit.loading") : t("auth.submit.signin")}
                  </span>
                  <ArrowRight aria-hidden />
                </button>
              </form>

              <div className="auth-social-row">
                <SocialAuth next={location.pathname + location.search} />
              </div>

              <p className="auth-signup-link">
                {t("auth.toSignup")}{" "}
                <Link to="/signup">{t("auth.signup.cta")}</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
