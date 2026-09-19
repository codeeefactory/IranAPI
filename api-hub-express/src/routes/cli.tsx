import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, FileArchive, Globe2, KeyRound, PackageCheck, RefreshCw, Stethoscope, Terminal } from "lucide-react";
import { toast } from "sonner";
import { PageShell, SectionHeader } from "@/components/site/Layout";
import { CodeBlock, Prompt, Tag, TerminalWindow } from "@/components/site/Terminal";
import { useI18n } from "@/lib/i18n";

const PRODUCTION_ORIGIN = window.location.origin;
const PRODUCTION_API_URL = `${PRODUCTION_ORIGIN}/api/v1`;
const CLI_PACKAGE_URL = `${PRODUCTION_ORIGIN}/downloads/iranapi-cli.tgz`;
const CLI_MANIFEST_URL = `${PRODUCTION_ORIGIN}/cli/manifest.json`;

function Copyable({ children }: { children: string }) {
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<number>();
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
    <div className="relative min-w-0">
      <CodeBlock className="pe-12 whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">{children}</CodeBlock>
      <button
        type="button"
        onClick={() => void copy()}
        className="absolute end-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background/90 text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="copy"
        title="Copy command"
      >
        {done ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function CliPage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <SectionHeader kicker={t("cli.kicker")} title={t("cli.title")} subtitle={`// ${t("cli.sub")}`} />

      <div className="mb-6 flex items-start gap-3 rounded-sm border border-primary/60 bg-primary/5 p-4 text-sm text-primary" role="status">
        <PackageCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span data-ltr>CLI 1.1.0 has no hardcoded host. This page and runtime manifest always derive download/API URLs from the current temporary domain.</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 min-w-0">
          <TerminalWindow title="~/iranapi/install" glow>
            <div className="space-y-4 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Tag color="primary">npm</Tag>
                <Tag color="amber">node &gt;= 20</Tag>
                <Tag color="primary">iranapi 1.1.0</Tag>
              </div>
              <Copyable>{`npm install --global ${CLI_PACKAGE_URL}
iranapi --version
iranapi connect ${PRODUCTION_ORIGIN}
iranapi doctor`}</Copyable>
              <div className="flex flex-wrap gap-3">
                <a href={CLI_PACKAGE_URL} download className="btn-primary justify-center" data-ltr>
                  <Download className="h-4 w-4" aria-hidden /> Download CLI
                </a>
                <a href={CLI_MANIFEST_URL} className="cta-grad justify-center" data-ltr>
                  <RefreshCw className="h-4 w-4" aria-hidden /> Runtime manifest
                </a>
              </div>
              <div className="text-xs text-muted-foreground" data-ltr>
                Stable path: <span className="text-foreground">/downloads/iranapi-cli.tgz</span> · current host resolved at request time
              </div>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/catalog">
            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase text-primary">
                <Globe2 className="h-4 w-4" /> public discovery
              </div>
              <Command label="browse APIs">iranapi apis list --search weather --limit 10</Command>
              <Command label="inspect one API">iranapi apis get neshan-maps --json</Command>
              <Command label="search docs">iranapi docs search authentication --api neshan-maps</Command>
              <Command label="download OpenAPI schema">iranapi schema --out openapi.json</Command>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/caller" glow>
            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase text-primary">
                <Terminal className="h-4 w-4" /> public API caller
              </div>
              <p className="text-xs leading-6 text-muted-foreground" data-ltr>
                No IranAPI account required. Target must be a public HTTP(S) endpoint allowed by backend network policy.
              </p>
              <Copyable>{`iranapi call GET "https://api.open-meteo.com/v1/forecast?latitude=35.6892&longitude=51.3890&current=temperature_2m" \\
  --header "Accept: application/json" --json`}</Copyable>
              <Copyable>{`iranapi call GET https://api.github.com/repos/python/cpython \\
  --header "Accept: application/vnd.github+json" --json`}</Copyable>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/projects" glow>
            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase text-primary">
                <FileArchive className="h-4 w-4" /> analyze + deploy archives
              </div>
              <Copyable>{`iranapi analyze ./my-api.tar.gz --json
iranapi deploy ./my-api.tar.gz \\
  --name "My API" --region ir-tehran-1 --json`}</Copyable>
              <p className="text-xs leading-6 text-muted-foreground" data-ltr>
                Supports Java, JavaScript, TypeScript, Python, C++, and C#. Commands require an account token.
              </p>
            </div>
          </TerminalWindow>
        </div>

        <div className="space-y-6 min-w-0">
          <TerminalWindow title="~/iranapi/auth">
            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase text-primary">
                <KeyRound className="h-4 w-4" /> protected endpoints
              </div>
              <Copyable>{`iranapi login
iranapi whoami
iranapi logout`}</Copyable>
              <CodeBlock>{`# credential precedence
--token
IRANAPI_TOKEN
~/.iranapi/config.json`}</CodeBlock>
              <p className="text-xs leading-6 text-muted-foreground" data-ltr>
                Config uses owner-only permissions where supported. doctor displays only a redacted token preview.
              </p>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/doctor" glow>
            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase text-primary">
                <Stethoscope className="h-4 w-4" /> runtime checks
              </div>
              <Copyable>{`iranapi doctor --json`}</Copyable>
              <CodeBlock>{`{
  "ok": true,
  "cli_version": "1.1.0",
  "api": {
    "reachable": true,
    "status": "ok",
    "database": "up"
  }
}`}</CodeBlock>
            </div>
          </TerminalWindow>

          <TerminalWindow title="~/iranapi/raw">
            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase text-primary">
                <PackageCheck className="h-4 w-4" /> raw escape hatch
              </div>
              <Copyable>{`iranapi request GET catalog/apis/ --json
iranapi request PATCH account/user/ \\
  --body '{"first_name":"Sara"}' --json`}</Copyable>
              <p className="text-xs leading-6 text-muted-foreground" data-ltr>
                Use specific catalog commands first. Raw writes require a valid token and follow backend permissions.
              </p>
            </div>
          </TerminalWindow>
        </div>
      </div>

      <div className="mt-6">
        <TerminalWindow title="~/iranapi/help">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Prompt>iranapi --help</Prompt>
              <CodeBlock>{`doctor   connect login    logout   whoami
apis     docs    call     request
analyze  deploy  schema`}</CodeBlock>
            </div>
            <div>
              <Prompt>environment</Prompt>
              <CodeBlock>{`IRANAPI_API_URL=${PRODUCTION_API_URL}
IRANAPI_TOKEN=iapi_your_token
IRANAPI_CONFIG=~/.iranapi/config.json`}</CodeBlock>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </PageShell>
  );
}

function Command({ label, children }: { label: string; children: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-xs text-muted-foreground" data-ltr>// {label}</div>
      <Copyable>{children}</Copyable>
    </div>
  );
}
