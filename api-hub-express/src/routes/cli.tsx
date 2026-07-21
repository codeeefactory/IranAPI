import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { TerminalWindow, Prompt, CodeBlock, Tag } from "@/components/site/Terminal";
import { Copy, Check, Download, Terminal as TerminalIcon, KeyRound, Cog, AlertTriangle, LifeBuoy, Stethoscope } from "lucide-react";
import { useCatalogApis } from "@/hooks/useCatalog";
import { useI18n } from "@/lib/i18n";

const CLI_BASE_URL = "https://iranapi.dev";
const CLI_API_URL = `${CLI_BASE_URL}/api`;

const INSTALL: { id: string; label: string; cmd: string }[] = [
  { id: "npm", label: "npm // cross-platform", cmd: "npm i -g @iranapi/cli" },
  { id: "curl", label: "curl // unix", cmd: "curl -fsSL https://iranapi.dev/install.sh | bash" },
  { id: "brew", label: "brew // macos", cmd: "brew install iranapi/tap/iran" },
  { id: "scoop", label: "scoop // windows", cmd: "scoop bucket add iranapi https://github.com/iranapi/scoop && scoop install iran" },
];

function Copyable({ children, lang }: { children: string; lang?: string }) {
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const { t } = useI18n();

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  async function copy() {
    if (!navigator.clipboard) return;
    const copied = await navigator.clipboard.writeText(children).then(() => true).catch(() => false);
    if (!copied) return;
    setDone(true);
    toast.success(t("cli.copied"));
    timeoutRef.current = window.setTimeout(() => setDone(false), 1200);
  }

  return (
    <div className="relative">
      <CodeBlock>{children}</CodeBlock>
      <button
        type="button"
        onClick={() => void copy()}
        className="absolute end-2 top-2 inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-background/80 px-2 text-[10px] text-muted-foreground hover:text-primary hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="copy"
        data-lang={lang}
      >
        {done ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        {done ? "ok" : "cp"}
      </button>
    </div>
  );
}

export default function CliPage() {
  const { t } = useI18n();
  const { apis, isFallback } = useCatalogApis({ page_size: 6, ordering: "-views_count" });
  const primaryApi = apis[0];
  const primaryEndpoint = primaryApi?.apiEndpoints?.[0];
  const primarySlug = primaryApi?.slug ?? "speech-gateway";
  const primaryMethod = primaryEndpoint?.method ?? "POST";
  const primaryPath = primaryEndpoint?.path ?? "/speech/transcriptions";
  const categorySlug = primaryApi?.categorySlug ?? "ai-services";
  const sampleRequest = primaryEndpoint?.sample_request ?? { language: "fa-IR" };
  const firstQueryKey = Object.keys(sampleRequest)[0] ?? "limit";
  const firstQueryValue = String(sampleRequest[firstQueryKey] ?? "20");

  return (
    <PageShell>
      <SectionHeader kicker={t("cli.kicker")} title={t("cli.title")} subtitle={"// " + t("cli.sub")} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-4 min-w-0">
          {/* INSTALL */}
          <TerminalWindow title="~/iranapi/install" glow>
            <div className="space-y-3 min-w-0">
              <Prompt>iran --version</Prompt>
              <div className="text-xs text-primary" data-ltr>iran 2026.5.24 // edge-cli</div>
              <div className="text-xs text-muted-foreground">{"// "}{t("cli.installSub")}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {INSTALL.map((i) => (
                  <div key={i.id} className="surface-card rounded-sm p-3 min-w-0">
                    <Tag color="primary">{i.label}</Tag>
                    <div className="mt-2 min-w-0"><Copyable lang="bash">{i.cmd}</Copyable></div>
                  </div>
                ))}
              </div>
              <a href="/install.sh" download className="btn-ghost mt-2 text-xs inline-flex">
                <Download className="h-3.5 w-3.5" /> {t("cli.download")}
              </a>
            </div>
          </TerminalWindow>

          {/* AUTH */}
          <TerminalWindow title="~/iranapi/auth">
            <div className="space-y-3 text-sm min-w-0">
              <div className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5" /> {"// "}{t("cli.auth")}
              </div>
              <Copyable lang="bash">{`# device-code flow (browser opens with a one-time code)
iran login

# or non-interactive with a personal access token
iran login --token iak_live_xxxxxxxxxxxx
iran whoami`}</Copyable>
              <div className="text-[11px] text-muted-foreground">{"// "}example output</div>
              <CodeBlock>{`> iran login
  open: ${CLI_BASE_URL}/cli/device
  code: WXKT-9F4Q

waiting for approval....
✓ signed in as dev@team.ir`}</CodeBlock>

              <div className="text-[11px] text-muted-foreground pt-2">{"// "}env vars</div>
              <CodeBlock>{`IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx     # bearer token, overrides config
IRANAPI_API_URL=${CLI_API_URL}
IRANAPI_PROFILE=default                   # named credential profile`}</CodeBlock>

              <div className="text-[11px] text-muted-foreground pt-2 flex items-center gap-2">
                <Cog className="h-3 w-3" /> ~/.iranapi/&lt;profile&gt;.json (mode 0600)
              </div>
            </div>
          </TerminalWindow>

          {/* USAGE */}
          <TerminalWindow title="~/iranapi/cli/commands">
            <div className="space-y-3 text-sm min-w-0">
              <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("cli.usage")}</div>
              <UsageRow label="browse catalog" cmd={`iran apis list --category ${categorySlug} --json`} />
              <UsageRow label="query catalog docs" cmd={`iran docs search "${primaryApi?.tags?.[0] ?? "quick"}" --api ${primarySlug} --json`} />
              <UsageRow label="create + revoke keys" cmd={`iran keys list
iran keys create "ci-pipeline"       # secret shown ONCE
iran keys revoke key_abc123`} />
              <UsageRow label={t("cli.run")} cmd={`iran call ${primaryMethod} ${primaryPath} --api ${primarySlug} \\
  --json ${firstQueryKey}=${firstQueryValue}`} />
              <UsageRow label={t("cli.tail")} cmd="iran logs tail --env prod --status 5xx --grep timeout" />
              {isFallback ? <div className="text-[11px] text-amber" data-ltr>// offline mock catalog shown</div> : null}
            </div>
          </TerminalWindow>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 min-w-0">
          <TerminalWindow title="~/iranapi/cli/recipes">
            <div className="space-y-3 text-sm min-w-0">
              <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("cli.examples")}</div>

              <div className="text-[11px] text-muted-foreground" data-ltr>// auth</div>
              <Copyable lang="bash">{`iran login                                   # device-code flow
iran login --token iak_live_xxxxxxxxxxxx     # non-interactive
iran whoami --json | jq .email
iran logout`}</Copyable>

              <div className="text-[11px] text-muted-foreground" data-ltr>// keys</div>
              <Copyable lang="bash">{`iran keys list --json
iran keys create "ci-pipeline"               # secret printed ONCE
iran keys revoke key_abc123`}</Copyable>

              <div className="text-[11px] text-muted-foreground" data-ltr>// api calls</div>
              <Copyable lang="bash">{`iran call GET /v1/me
iran apis list --search "${primaryApi?.tags?.[0] ?? "speech"}" --json
iran docs search "${primaryApi?.documentations?.[0]?.title ?? "quick start"}" --api ${primarySlug} --json
iran call ${primaryMethod} ${primaryPath} --api ${primarySlug} \\
  --json ${firstQueryKey}=${firstQueryValue}`}</Copyable>

              <div className="text-[11px] text-muted-foreground" data-ltr>// power moves</div>
              <Copyable lang="bash">{`# tail prod and pipe into jq
iran logs tail --env prod --status 5xx \\
  | jq 'select(.latency_ms > 800)'

# rotate every CI key nightly
for id in $(iran keys list --json | jq -r '.[].id'); do
  iran keys revoke "$id"
done
iran keys create "ci-$(date +%F)"

# load a different profile
IRANAPI_PROFILE=staging iran whoami`}</Copyable>

              <div className="pt-1 text-xs text-muted-foreground flex items-center gap-2" data-ltr>
                <TerminalIcon className="h-3 w-3 text-primary" />
                every command supports --json and --quiet
              </div>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/cli/diagnose" glow>
            <div className="space-y-3 text-sm min-w-0">
              <div className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5" /> {"// "}{t("cli.diagnose")}
              </div>
              <div className="text-[11px] text-muted-foreground">{t("cli.diagnose.sub")}</div>
              <Copyable lang="bash">{`iran diagnose          # full report with actionable fixes
iran diagnose --json   # machine-readable, pipe into jq
iran doctor            # alias`}</Copyable>
              <CodeBlock>{`> iran diagnose

  ✓ node runtime           — node 20.11.1
  ✓ IRANAPI_API_URL        — ${CLI_API_URL}
  × IRANAPI_TOKEN / session — no token configured
    → iran login    # or: export IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx
  ✓ config file            — ~/.iranapi/default.json (profile: default)
  ✓ api reachability       — 200 OK

× one or more checks failed — apply the fixes above and re-run`}</CodeBlock>
            </div>
          </TerminalWindow>


          <TerminalWindow title="~/iranapi/cli/exit-codes">
            <div className="text-xs space-y-1.5">
              <CodeRow code="0" label="success" />
              <CodeRow code="1" label="usage / auth error" />
              <CodeRow code="2" label="device-code expired" />
              <CodeRow code="3" label="upstream API ≥ 400" />
            </div>
          </TerminalWindow>
        </div>
      </div>

      {/* HELP & COMPLETIONS */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <TerminalWindow title="~/iranapi/cli/help">
          <div className="space-y-3 text-sm min-w-0">
            <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("cli.help")}</div>
            <Copyable lang="bash">{`iran --help            # global help with grouped commands
iran <cmd> --help      # detailed help, examples, env vars
iran --version         # prints "iran 2026.5.24"
iran help keys         # alias for: iran keys --help`}</Copyable>
            <CodeBlock>{`> iran --help
iran 2026.5.24 — drive the iranapi control plane from your terminal

usage:  iran <command> [flags]

auth:     login, logout, whoami
catalog:  apis list
keys:     keys list|create|revoke
runtime:  call, logs tail
shell:    completion <bash|zsh|fish|powershell>
debug:    diagnose (alias: doctor)

flags:    --json  --quiet  --api-url <url>  --profile <name>
env:      IRANAPI_TOKEN, IRANAPI_API_URL, IRANAPI_PROFILE
docs:     ${CLI_BASE_URL}/cli`}</CodeBlock>
          </div>
        </TerminalWindow>

        <TerminalWindow title="~/iranapi/cli/completion" glow>
          <div className="space-y-3 text-sm min-w-0">
            <div className="text-xs uppercase tracking-widest text-primary">{"// "}{t("cli.completion")}</div>
            <div className="text-[11px] text-muted-foreground">{t("cli.completion.sub")}</div>
            <Copyable lang="bash">{`# bash
iran completion bash   | sudo tee /etc/bash_completion.d/iran

# zsh (add to ~/.zshrc once)
iran completion zsh    > "\${fpath[1]}/_iran"

# fish
iran completion fish   > ~/.config/fish/completions/iran.fish

# powershell
iran completion powershell | Out-String | Invoke-Expression`}</Copyable>
            <div className="text-[11px] text-muted-foreground">
              {"// "}tab-complete commands, sub-commands, flags and known paths like <span className="text-primary">/v1/zarinpal/pay</span>.
            </div>
          </div>
        </TerminalWindow>
      </div>

      {/* TROUBLESHOOTING */}
      <div className="mt-6">
        <TerminalWindow title="~/iranapi/cli/troubleshooting">
          <div className="space-y-4 text-sm min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <LifeBuoy className="h-3.5 w-3.5" /> {"// "}{t("cli.troubleshoot")}
            </div>
            <div className="text-[11px] text-muted-foreground">{t("cli.troubleshoot.sub")}</div>

            <div className="grid gap-3 md:grid-cols-2">
              <TroubleCard
                title="× command not found: iran"
                hint="binary not on PATH after install"
                fix={`# npm global bin not on PATH
export PATH="$(npm prefix -g)/bin:$PATH"
# or reinstall:
npm i -g @iranapi/cli && hash -r`}
              />
              <TroubleCard
                title="× Unauthorized (401)"
                hint="missing or expired token"
                fix={`iran logout
iran login                  # device flow
# or use a PAT:
export IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx
iran whoami`}
              />
              <TroubleCard
                title="× device-code expired (exit 2)"
                hint="login window was not approved in time"
                fix={`iran login --api-url ${CLI_API_URL}`}
              />
              <TroubleCard
                title="× ENOTFOUND / ECONNREFUSED"
                hint="wrong API URL or offline"
                fix={`echo $IRANAPI_API_URL
export IRANAPI_API_URL=${CLI_API_URL}
iran apis list --json | head`}
              />
              <TroubleCard
                title="× upstream 4xx/5xx (exit 3)"
                hint="the iranapi backend rejected the call"
                fix={`iran call POST /v1/zarinpal/pay \\
  --json amount=50000 --json currency=IRR \\
  --header x-debug=1
iran logs tail --status 5xx --grep zarinpal`}
              />
              <TroubleCard
                title="× EACCES writing ~/.iranapi/*.json"
                hint="config dir owned by root after sudo install"
                fix={`sudo chown -R "$USER" ~/.iranapi
chmod 700 ~/.iranapi && chmod 600 ~/.iranapi/*.json`}
              />
            </div>

            <div className="pt-2">
              <div className="text-xs uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" /> {"// "}{t("cli.env")}
              </div>
              <Copyable lang="bash">{`# minimal working environment
export IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx
export IRANAPI_API_URL=${CLI_API_URL}
export IRANAPI_PROFILE=default
# verify:
iran whoami && iran apis list --json | jq '. | length'`}</Copyable>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </PageShell>
  );
}

function TroubleCard({ title, hint, fix }: { title: string; hint: string; fix: string }) {
  return (
    <div className="surface-card rounded-sm p-3 min-w-0 space-y-2">
      <div className="text-[12px] font-mono text-destructive break-words" data-ltr>{title}</div>
      <div className="text-[11px] text-muted-foreground">{"// "}{hint}</div>
      <Copyable lang="bash">{fix}</Copyable>
    </div>
  );
}

function UsageRow({ label, cmd }: { label: string; cmd: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-muted-foreground mb-1" data-ltr>// {label}</div>
      <Copyable lang="bash">{cmd}</Copyable>
    </div>
  );
}

function CodeRow({ code, label }: { code: string; label: string }) {
  return (
    <div className="flex items-center gap-3" data-ltr>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">{code}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
