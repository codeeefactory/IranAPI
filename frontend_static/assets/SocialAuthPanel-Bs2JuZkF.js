import{m as t,ag as g,j as e,B as h,Q as d}from"./index-BTiStY5Z.js";import{L as y}from"./lock-BuC4dAkv.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=t("Chrome",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["line",{x1:"21.17",x2:"12",y1:"8",y2:"8",key:"a0cw5f"}],["line",{x1:"3.95",x2:"8.54",y1:"6.06",y2:"14",key:"1kftof"}],["line",{x1:"10.88",x2:"15.46",y1:"21.94",y2:"14",key:"1ymyh8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=t("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=t("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=t("Network",[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]]),v={google:b,github:m,microsoft:p,linkedin:k},u={google:"hover:border-cyber-yellow/70 hover:text-cyber-yellow",github:"hover:border-primary/70 hover:text-primary",microsoft:"hover:border-cyber-green/70 hover:text-cyber-green",linkedin:"hover:border-blue-400/70 hover:text-blue-300"};function N({mode:l}){var c;const{data:a,isLoading:i}=g(),o=(c=a==null?void 0:a.providers)!=null&&c.length?a.providers:[{slug:"google",label:"Google",enabled:!1,start_url:"/api/v1/auth/social/google/start/"},{slug:"github",label:"GitHub",enabled:!1,start_url:"/api/v1/auth/social/github/start/"},{slug:"microsoft",label:"Microsoft",enabled:!1,start_url:"/api/v1/auth/social/microsoft/start/"},{slug:"linkedin",label:"LinkedIn",enabled:!1,start_url:"/api/v1/auth/social/linkedin/start/"}],x=o.some(s=>s.enabled);return e.jsxs("div",{className:"space-y-4","aria-busy":i,children:[e.jsxs("div",{className:"relative flex items-center gap-3 text-xs font-black uppercase tracking-[0.28em] text-muted-foreground",children:[e.jsx("span",{className:"h-px flex-1 bg-border/70"}),e.jsx("span",{children:l==="signin"?"ورود سریع شبکه‌ای":"ثبت‌نام سریع شبکه‌ای"}),e.jsx("span",{className:"h-px flex-1 bg-border/70"})]}),!i&&!x?e.jsx("div",{className:"rounded-md border border-cyber-yellow/30 bg-cyber-yellow/10 px-4 py-3 text-sm leading-7 text-muted-foreground",role:"note",children:"OAuth در این محیط هنوز تنظیم نشده است. برای تست ورود و ثبت‌نام از نام کاربری و رمز عبور استفاده کنید."}):null,e.jsx("div",{className:"grid gap-3 sm:grid-cols-2",children:o.map(s=>{const n=v[s.slug]||f,r=s.label||s.slug;return s.enabled?e.jsx(h,{asChild:!0,variant:"social",className:d("justify-start",u[s.slug]),children:e.jsxs("a",{href:s.start_url,"aria-label":`${l==="signin"?"ورود":"ثبت‌نام"} با ${r}`,children:[e.jsx(n,{className:"h-4 w-4"}),r]})},s.slug):e.jsxs(h,{type:"button",variant:"social",disabled:!0,"aria-disabled":"true",className:d("justify-start",u[s.slug]),children:[e.jsx(n,{className:"h-4 w-4"}),r,e.jsxs("span",{className:"ms-auto inline-flex items-center gap-1 text-[0.65rem] text-muted-foreground",children:[e.jsx(y,{className:"h-3 w-3"}),"تنظیم نشده"]})]},s.slug)})})]})}export{N as S};
