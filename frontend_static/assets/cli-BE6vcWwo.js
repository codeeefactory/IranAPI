import{c as d,u as R,j as e,r as v,t as $}from"./index-En-aUPRy.js";import{P as T,S as C}from"./Layout-BsNZwiqk.js";import{a as n,P as E,T as L,b as m}from"./Terminal-B__j4p22.js";import{a as O}from"./useCatalog-Djfc84u0.js";import{T as S}from"./triangle-alert-2GmVW7TF.js";import{C as q}from"./check-BvJ_GGy9.js";import{C as M}from"./copy-KzQ4ZISO.js";/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"M11 10.27 7 3.34",key:"16pf9h"}],["path",{d:"m11 13.73-4 6.93",key:"794ttg"}],["path",{d:"M12 22v-2",key:"1osdcq"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M14 12h8",key:"4f43i9"}],["path",{d:"m17 20.66-1-1.73",key:"eq3orb"}],["path",{d:"m17 3.34-1 1.73",key:"2wel8s"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"m20.66 17-1.73-1",key:"sg0v6f"}],["path",{d:"m20.66 7-1.73 1",key:"1ow05n"}],["path",{d:"m3.34 17 1.73-1",key:"nuk764"}],["path",{d:"m3.34 7 1.73 1",key:"1ulond"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["circle",{cx:"12",cy:"12",r:"8",key:"46899m"}]],z=d("cog",U);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],F=d("download",K);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]],D=d("key-round",H);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m4.93 4.93 4.24 4.24",key:"1ymg45"}],["path",{d:"m14.83 9.17 4.24-4.24",key:"1cb5xl"}],["path",{d:"m14.83 14.83 4.24 4.24",key:"q42g0n"}],["path",{d:"m9.17 14.83-4.24 4.24",key:"bqpfvv"}],["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}]],B=d("life-buoy",V);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["path",{d:"M11 2v2",key:"1539x4"}],["path",{d:"M5 2v2",key:"1yf1q8"}],["path",{d:"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1",key:"rb5t3r"}],["path",{d:"M8 15a6 6 0 0 0 12 0v-3",key:"x18d4x"}],["circle",{cx:"20",cy:"10",r:"2",key:"ts1r5v"}]],W=d("stethoscope",Q);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]],X=d("terminal",G),y="https://iranapi.dev",x=`${y}/api`,J=[{id:"npm",label:"npm // cross-platform",cmd:"npm i -g @iranapi/cli"},{id:"curl",label:"curl // unix",cmd:"curl -fsSL https://iranapi.dev/install.sh | bash"},{id:"brew",label:"brew // macos",cmd:"brew install iranapi/tap/iran"},{id:"scoop",label:"scoop // windows",cmd:"scoop bucket add iranapi https://github.com/iranapi/scoop && scoop install iran"}];function t({children:a,lang:r}){const[l,s]=v.useState(!1),i=v.useRef(void 0),{t:c}=R();v.useEffect(()=>()=>{i.current&&window.clearTimeout(i.current)},[]);async function h(){!navigator.clipboard||!await navigator.clipboard.writeText(a).then(()=>!0).catch(()=>!1)||(s(!0),$.success(c("cli.copied")),i.current=window.setTimeout(()=>s(!1),1200))}return e.jsxs("div",{className:"relative",children:[e.jsx(m,{children:a}),e.jsxs("button",{type:"button",onClick:()=>void h(),className:"absolute end-2 top-2 inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-background/80 px-2 text-[10px] text-muted-foreground hover:text-primary hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary","aria-label":"copy","data-lang":r,children:[l?e.jsx(q,{className:"h-3 w-3 text-primary"}):e.jsx(M,{className:"h-3 w-3"}),l?"ok":"cp"]})]})}function re(){var N,w,_,I,P;const{t:a}=R(),{apis:r,isFallback:l}=O({page_size:6,ordering:"-views_count"}),s=r[0],i=(N=s==null?void 0:s.apiEndpoints)==null?void 0:N[0],c=(s==null?void 0:s.slug)??"speech-gateway",h=(i==null?void 0:i.method)??"POST",g=(i==null?void 0:i.path)??"/speech/transcriptions",A=(s==null?void 0:s.categorySlug)??"ai-services",b=(i==null?void 0:i.sample_request)??{language:"fa-IR"},j=Object.keys(b)[0]??"limit",k=String(b[j]??"20");return e.jsxs(T,{children:[e.jsx(C,{kicker:a("cli.kicker"),title:a("cli.title"),subtitle:"// "+a("cli.sub")}),e.jsxs("div",{className:"grid gap-6 lg:grid-cols-[1.4fr,1fr]",children:[e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsx(n,{title:"~/iranapi/install",glow:!0,children:e.jsxs("div",{className:"space-y-3 min-w-0",children:[e.jsx(E,{children:"iran --version"}),e.jsx("div",{className:"text-xs text-primary","data-ltr":!0,children:"iran 2026.5.24 // edge-cli"}),e.jsxs("div",{className:"text-xs text-muted-foreground",children:["// ",a("cli.installSub")]}),e.jsx("div",{className:"grid gap-3 sm:grid-cols-2",children:J.map(f=>e.jsxs("div",{className:"surface-card rounded-sm p-3 min-w-0",children:[e.jsx(L,{color:"primary",children:f.label}),e.jsx("div",{className:"mt-2 min-w-0",children:e.jsx(t,{lang:"bash",children:f.cmd})})]},f.id))}),e.jsxs("a",{href:"/install.sh",download:!0,className:"btn-ghost mt-2 text-xs inline-flex",children:[e.jsx(F,{className:"h-3.5 w-3.5"})," ",a("cli.download")]})]})}),e.jsx(n,{title:"~/iranapi/auth",children:e.jsxs("div",{className:"space-y-3 text-sm min-w-0",children:[e.jsxs("div",{className:"text-xs uppercase tracking-widest text-primary flex items-center gap-2",children:[e.jsx(D,{className:"h-3.5 w-3.5"})," ","// ",a("cli.auth")]}),e.jsx(t,{lang:"bash",children:`# device-code flow (browser opens with a one-time code)
iran login

# or non-interactive with a personal access token
iran login --token iak_live_xxxxxxxxxxxx
iran whoami`}),e.jsxs("div",{className:"text-[11px] text-muted-foreground",children:["// ","example output"]}),e.jsx(m,{children:`> iran login
  open: ${y}/cli/device
  code: WXKT-9F4Q

waiting for approval....
✓ signed in as dev@team.ir`}),e.jsxs("div",{className:"text-[11px] text-muted-foreground pt-2",children:["// ","env vars"]}),e.jsx(m,{children:`IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx     # bearer token, overrides config
IRANAPI_API_URL=${x}
IRANAPI_PROFILE=default                   # named credential profile`}),e.jsxs("div",{className:"text-[11px] text-muted-foreground pt-2 flex items-center gap-2",children:[e.jsx(z,{className:"h-3 w-3"})," ~/.iranapi/<profile>.json (mode 0600)"]})]})}),e.jsx(n,{title:"~/iranapi/cli/commands",children:e.jsxs("div",{className:"space-y-3 text-sm min-w-0",children:[e.jsxs("div",{className:"text-xs uppercase tracking-widest text-primary",children:["// ",a("cli.usage")]}),e.jsx(p,{label:"browse catalog",cmd:`iran apis list --category ${A} --json`}),e.jsx(p,{label:"query catalog docs",cmd:`iran docs search "${((w=s==null?void 0:s.tags)==null?void 0:w[0])??"quick"}" --api ${c} --json`}),e.jsx(p,{label:"create + revoke keys",cmd:`iran keys list
iran keys create "ci-pipeline"       # secret shown ONCE
iran keys revoke key_abc123`}),e.jsx(p,{label:a("cli.run"),cmd:`iran call ${h} ${g} --api ${c} \\
  --json ${j}=${k}`}),e.jsx(p,{label:a("cli.tail"),cmd:"iran logs tail --env prod --status 5xx --grep timeout"}),l?e.jsx("div",{className:"text-[11px] text-amber","data-ltr":!0,children:"// offline mock catalog shown"}):null]})})]}),e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsx(n,{title:"~/iranapi/cli/recipes",children:e.jsxs("div",{className:"space-y-3 text-sm min-w-0",children:[e.jsxs("div",{className:"text-xs uppercase tracking-widest text-primary",children:["// ",a("cli.examples")]}),e.jsx("div",{className:"text-[11px] text-muted-foreground","data-ltr":!0,children:"// auth"}),e.jsx(t,{lang:"bash",children:`iran login                                   # device-code flow
iran login --token iak_live_xxxxxxxxxxxx     # non-interactive
iran whoami --json | jq .email
iran logout`}),e.jsx("div",{className:"text-[11px] text-muted-foreground","data-ltr":!0,children:"// keys"}),e.jsx(t,{lang:"bash",children:`iran keys list --json
iran keys create "ci-pipeline"               # secret printed ONCE
iran keys revoke key_abc123`}),e.jsx("div",{className:"text-[11px] text-muted-foreground","data-ltr":!0,children:"// api calls"}),e.jsx(t,{lang:"bash",children:`iran call GET /v1/me
iran apis list --search "${((_=s==null?void 0:s.tags)==null?void 0:_[0])??"speech"}" --json
iran docs search "${((P=(I=s==null?void 0:s.documentations)==null?void 0:I[0])==null?void 0:P.title)??"quick start"}" --api ${c} --json
iran call ${h} ${g} --api ${c} \\
  --json ${j}=${k}`}),e.jsx("div",{className:"text-[11px] text-muted-foreground","data-ltr":!0,children:"// power moves"}),e.jsx(t,{lang:"bash",children:`# tail prod and pipe into jq
iran logs tail --env prod --status 5xx \\
  | jq 'select(.latency_ms > 800)'

# rotate every CI key nightly
for id in $(iran keys list --json | jq -r '.[].id'); do
  iran keys revoke "$id"
done
iran keys create "ci-$(date +%F)"

# load a different profile
IRANAPI_PROFILE=staging iran whoami`}),e.jsxs("div",{className:"pt-1 text-xs text-muted-foreground flex items-center gap-2","data-ltr":!0,children:[e.jsx(X,{className:"h-3 w-3 text-primary"}),"every command supports --json and --quiet"]})]})}),e.jsx(n,{title:"~/iranapi/cli/diagnose",glow:!0,children:e.jsxs("div",{className:"space-y-3 text-sm min-w-0",children:[e.jsxs("div",{className:"text-xs uppercase tracking-widest text-primary flex items-center gap-2",children:[e.jsx(W,{className:"h-3.5 w-3.5"})," ","// ",a("cli.diagnose")]}),e.jsx("div",{className:"text-[11px] text-muted-foreground",children:a("cli.diagnose.sub")}),e.jsx(t,{lang:"bash",children:`iran diagnose          # full report with actionable fixes
iran diagnose --json   # machine-readable, pipe into jq
iran doctor            # alias`}),e.jsx(m,{children:`> iran diagnose

  ✓ node runtime           — node 20.11.1
  ✓ IRANAPI_API_URL        — ${x}
  × IRANAPI_TOKEN / session — no token configured
    → iran login    # or: export IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx
  ✓ config file            — ~/.iranapi/default.json (profile: default)
  ✓ api reachability       — 200 OK

× one or more checks failed — apply the fixes above and re-run`})]})}),e.jsx(n,{title:"~/iranapi/cli/exit-codes",children:e.jsxs("div",{className:"text-xs space-y-1.5",children:[e.jsx(u,{code:"0",label:"success"}),e.jsx(u,{code:"1",label:"usage / auth error"}),e.jsx(u,{code:"2",label:"device-code expired"}),e.jsx(u,{code:"3",label:"upstream API ≥ 400"})]})})]})]}),e.jsxs("div",{className:"grid gap-6 lg:grid-cols-2 mt-6",children:[e.jsx(n,{title:"~/iranapi/cli/help",children:e.jsxs("div",{className:"space-y-3 text-sm min-w-0",children:[e.jsxs("div",{className:"text-xs uppercase tracking-widest text-primary",children:["// ",a("cli.help")]}),e.jsx(t,{lang:"bash",children:`iran --help            # global help with grouped commands
iran <cmd> --help      # detailed help, examples, env vars
iran --version         # prints "iran 2026.5.24"
iran help keys         # alias for: iran keys --help`}),e.jsx(m,{children:`> iran --help
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
docs:     ${y}/cli`})]})}),e.jsx(n,{title:"~/iranapi/cli/completion",glow:!0,children:e.jsxs("div",{className:"space-y-3 text-sm min-w-0",children:[e.jsxs("div",{className:"text-xs uppercase tracking-widest text-primary",children:["// ",a("cli.completion")]}),e.jsx("div",{className:"text-[11px] text-muted-foreground",children:a("cli.completion.sub")}),e.jsx(t,{lang:"bash",children:`# bash
iran completion bash   | sudo tee /etc/bash_completion.d/iran

# zsh (add to ~/.zshrc once)
iran completion zsh    > "\${fpath[1]}/_iran"

# fish
iran completion fish   > ~/.config/fish/completions/iran.fish

# powershell
iran completion powershell | Out-String | Invoke-Expression`}),e.jsxs("div",{className:"text-[11px] text-muted-foreground",children:["// ","tab-complete commands, sub-commands, flags and known paths like ",e.jsx("span",{className:"text-primary",children:"/v1/zarinpal/pay"}),"."]})]})})]}),e.jsx("div",{className:"mt-6",children:e.jsx(n,{title:"~/iranapi/cli/troubleshooting",children:e.jsxs("div",{className:"space-y-4 text-sm min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase tracking-widest text-primary",children:[e.jsx(B,{className:"h-3.5 w-3.5"})," ","// ",a("cli.troubleshoot")]}),e.jsx("div",{className:"text-[11px] text-muted-foreground",children:a("cli.troubleshoot.sub")}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsx(o,{title:"× command not found: iran",hint:"binary not on PATH after install",fix:`# npm global bin not on PATH
export PATH="$(npm prefix -g)/bin:$PATH"
# or reinstall:
npm i -g @iranapi/cli && hash -r`}),e.jsx(o,{title:"× Unauthorized (401)",hint:"missing or expired token",fix:`iran logout
iran login                  # device flow
# or use a PAT:
export IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx
iran whoami`}),e.jsx(o,{title:"× device-code expired (exit 2)",hint:"login window was not approved in time",fix:`iran login --api-url ${x}`}),e.jsx(o,{title:"× ENOTFOUND / ECONNREFUSED",hint:"wrong API URL or offline",fix:`echo $IRANAPI_API_URL
export IRANAPI_API_URL=${x}
iran apis list --json | head`}),e.jsx(o,{title:"× upstream 4xx/5xx (exit 3)",hint:"the iranapi backend rejected the call",fix:`iran call POST /v1/zarinpal/pay \\
  --json amount=50000 --json currency=IRR \\
  --header x-debug=1
iran logs tail --status 5xx --grep zarinpal`}),e.jsx(o,{title:"× EACCES writing ~/.iranapi/*.json",hint:"config dir owned by root after sudo install",fix:`sudo chown -R "$USER" ~/.iranapi
chmod 700 ~/.iranapi && chmod 600 ~/.iranapi/*.json`})]}),e.jsxs("div",{className:"pt-2",children:[e.jsxs("div",{className:"text-xs uppercase tracking-widest text-primary mb-2 flex items-center gap-2",children:[e.jsx(S,{className:"h-3.5 w-3.5"})," ","// ",a("cli.env")]}),e.jsx(t,{lang:"bash",children:`# minimal working environment
export IRANAPI_TOKEN=iak_live_xxxxxxxxxxxx
export IRANAPI_API_URL=${x}
export IRANAPI_PROFILE=default
# verify:
iran whoami && iran apis list --json | jq '. | length'`})]})]})})})]})}function o({title:a,hint:r,fix:l}){return e.jsxs("div",{className:"surface-card rounded-sm p-3 min-w-0 space-y-2",children:[e.jsx("div",{className:"text-[12px] font-mono text-destructive break-words","data-ltr":!0,children:a}),e.jsxs("div",{className:"text-[11px] text-muted-foreground",children:["// ",r]}),e.jsx(t,{lang:"bash",children:l})]})}function p({label:a,cmd:r}){return e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"text-[11px] text-muted-foreground mb-1","data-ltr":!0,children:["// ",a]}),e.jsx(t,{lang:"bash",children:r})]})}function u({code:a,label:r}){return e.jsxs("div",{className:"flex items-center gap-3","data-ltr":!0,children:[e.jsx("span",{className:"inline-flex h-5 w-5 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary",children:a}),e.jsx("span",{className:"text-muted-foreground",children:r})]})}export{re as default};
