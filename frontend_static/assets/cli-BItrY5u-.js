import{c as d,u as h,j as e,r as l,t as y}from"./index-7JRSAcuR.js";import{P as g,S as f}from"./Layout-CeG7u94A.js";import{a as s,T as o,b as i,P as m}from"./Terminal-mRbo380S.js";import{T as v}from"./triangle-alert-tacRIo3N.js";import{E as b,K as w}from"./key-round-CM9ZOUpY.js";import{F as N}from"./file-archive-D_LxK7Eu.js";import{C as k}from"./check-BAeZD7jx.js";import{C as A}from"./copy-CEg3-43C.js";/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["path",{d:"M12 22V12",key:"d0xqtd"}],["path",{d:"m16 17 2 2 4-4",key:"uh5qu3"}],["path",{d:"M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753",key:"kpkbpo"}],["path",{d:"M3.29 7 12 12l8.71-5",key:"19ckod"}],["path",{d:"m7.5 4.27 8.997 5.148",key:"9yrvtv"}]],I=d("package-check",P);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M11 2v2",key:"1539x4"}],["path",{d:"M5 2v2",key:"1yf1q8"}],["path",{d:"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1",key:"rb5t3r"}],["path",{d:"M8 15a6 6 0 0 0 12 0v-3",key:"x18d4x"}],["circle",{cx:"20",cy:"10",r:"2",key:"ts1r5v"}]],T=d("stethoscope",C);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]],R=d("terminal",_),x="http://localhost:8000/api/v1";function r({children:a}){const[n,p]=l.useState(!1),c=l.useRef(),{t:u}=h();l.useEffect(()=>()=>{c.current&&window.clearTimeout(c.current)},[]);async function j(){!navigator.clipboard||!await navigator.clipboard.writeText(a).then(()=>!0).catch(()=>!1)||(p(!0),y.success(u("cli.copied")),c.current=window.setTimeout(()=>p(!1),1200))}return e.jsxs("div",{className:"relative min-w-0",children:[e.jsx(i,{className:"pe-12 whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal",children:a}),e.jsx("button",{type:"button",onClick:()=>void j(),className:"absolute end-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background/90 text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary","aria-label":"copy",title:"Copy command",children:n?e.jsx(k,{className:"h-4 w-4 text-primary"}):e.jsx(A,{className:"h-4 w-4"})})]})}function K(){const{t:a}=h();return e.jsxs(g,{children:[e.jsx(f,{kicker:a("cli.kicker"),title:a("cli.title"),subtitle:`// ${a("cli.sub")}`}),e.jsxs("div",{className:"mb-6 flex items-start gap-3 rounded-sm border border-amber/60 bg-amber/5 p-4 text-sm text-amber",role:"status",children:[e.jsx(v,{className:"mt-0.5 h-4 w-4 shrink-0"}),e.jsx("span",{"data-ltr":!0,children:"CLI 0.1.0 is packaged and tested locally. npm registry publish is waiting for maintainer login."})]}),e.jsxs("div",{className:"grid gap-6 lg:grid-cols-[1.15fr_0.85fr]",children:[e.jsxs("div",{className:"space-y-6 min-w-0",children:[e.jsx(s,{title:"~/iranapi/install",glow:!0,children:e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsx(o,{color:"primary",children:"npm"}),e.jsx(o,{color:"amber",children:"node >= 20"}),e.jsx(o,{color:"primary",children:"iran 0.1.0"})]}),e.jsx(r,{children:`npm install --global iranapi-cli
iran --version
iran doctor`}),e.jsxs("div",{className:"text-xs text-muted-foreground","data-ltr":!0,children:["Local artifact: ",e.jsx("span",{className:"text-foreground",children:"iranapi-cli/iranapi-cli-0.1.0.tgz"})]})]})}),e.jsx(s,{title:"~/iranapi/catalog",children:e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase text-primary",children:[e.jsx(b,{className:"h-4 w-4"})," public discovery"]}),e.jsx(t,{label:"browse APIs",children:"iran apis list --search weather --limit 10"}),e.jsx(t,{label:"inspect one API",children:"iran apis get neshan-maps --json"}),e.jsx(t,{label:"search docs",children:"iran docs search authentication --api neshan-maps"}),e.jsx(t,{label:"download OpenAPI schema",children:"iran schema --out openapi.json"})]})}),e.jsx(s,{title:"~/iranapi/caller",glow:!0,children:e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase text-primary",children:[e.jsx(R,{className:"h-4 w-4"})," public API caller"]}),e.jsx("p",{className:"text-xs leading-6 text-muted-foreground","data-ltr":!0,children:"No IranAPI account required. Target must be a public HTTP(S) endpoint allowed by backend network policy."}),e.jsx(r,{children:`iran call GET https://httpbin.org/get \\
  --header "Accept: application/json" --json`}),e.jsx(r,{children:`iran call POST https://example.com/events \\
  --header "Content-Type: application/json" \\
  --body '{"event":"created"}' --json`})]})}),e.jsx(s,{title:"~/iranapi/projects",glow:!0,children:e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase text-primary",children:[e.jsx(N,{className:"h-4 w-4"})," analyze + deploy archives"]}),e.jsx(r,{children:`iran analyze ./my-api.tar.gz --json
iran deploy ./my-api.tar.gz \\
  --name "My API" --region ir-tehran-1 --json`}),e.jsx("p",{className:"text-xs leading-6 text-muted-foreground","data-ltr":!0,children:"Supports Java, JavaScript, TypeScript, Python, C++, and C#. Commands require an account token."})]})})]}),e.jsxs("div",{className:"space-y-6 min-w-0",children:[e.jsx(s,{title:"~/iranapi/auth",children:e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase text-primary",children:[e.jsx(w,{className:"h-4 w-4"})," protected endpoints"]}),e.jsx(r,{children:`iran login --token iapi_your_token
iran whoami
iran logout`}),e.jsx(i,{children:`# credential precedence
--token
IRANAPI_TOKEN
~/.iranapi/config.json`}),e.jsx("p",{className:"text-xs leading-6 text-muted-foreground","data-ltr":!0,children:"Config uses owner-only permissions where supported. doctor displays only a redacted token preview."})]})}),e.jsx(s,{title:"~/iranapi/doctor",glow:!0,children:e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase text-primary",children:[e.jsx(T,{className:"h-4 w-4"})," runtime checks"]}),e.jsx(r,{children:`iran --api-url ${x} doctor --json`}),e.jsx(i,{children:`{
  "ok": true,
  "cli_version": "0.1.0",
  "api": {
    "reachable": true,
    "status": "ok",
    "database": "up"
  }
}`})]})}),e.jsx(s,{title:"~/iranapi/raw",children:e.jsxs("div",{className:"space-y-4 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase text-primary",children:[e.jsx(I,{className:"h-4 w-4"})," raw escape hatch"]}),e.jsx(r,{children:`iran request GET catalog/apis/ --json
iran request PATCH account/user/ \\
  --body '{"first_name":"Sara"}' --json`}),e.jsx("p",{className:"text-xs leading-6 text-muted-foreground","data-ltr":!0,children:"Use specific catalog commands first. Raw writes require a valid token and follow backend permissions."})]})})]})]}),e.jsx("div",{className:"mt-6",children:e.jsx(s,{title:"~/iranapi/help",children:e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx(m,{children:"iran --help"}),e.jsx(i,{children:`doctor   login   logout   whoami
apis     docs    call     request
analyze  deploy  schema`})]}),e.jsxs("div",{children:[e.jsx(m,{children:"environment"}),e.jsx(i,{children:`IRANAPI_API_URL=${x}
IRANAPI_TOKEN=iapi_your_token
IRANAPI_CONFIG=~/.iranapi/config.json`})]})]})})})]})}function t({label:a,children:n}){return e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"mb-1 text-xs text-muted-foreground","data-ltr":!0,children:["// ",a]}),e.jsx(r,{children:n})]})}export{K as default};
