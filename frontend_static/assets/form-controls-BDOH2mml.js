import{c as x,r as h,j as e,a as d}from"./index-7JRSAcuR.js";/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],b=x("chevron-down",p);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],v=x("circle-alert",N);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],y=x("circle-check",k);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],$=x("eye-off",w);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],_=x("eye",F);function j({id:c,label:s,hint:a,error:r,required:i,fieldClassName:o,children:l}){return e.jsxs("div",{className:d("form-field",o),"data-invalid":r?"true":void 0,children:[e.jsxs("label",{htmlFor:c,className:"form-label",children:[e.jsx("span",{children:s}),i?e.jsx("span",{className:"form-required","aria-hidden":!0,children:"*"}):null]}),l,r?e.jsx("p",{id:`${c}-error`,className:"form-error",role:"alert",children:r}):null,!r&&a?e.jsx("p",{id:`${c}-hint`,className:"form-help",children:a}):null]})}function q({label:c,hint:s,error:a,icon:r,fieldClassName:i,action:o,className:l,id:u,...m}){const t=h.useId(),n=u??t,f=a?`${n}-error`:s?`${n}-hint`:void 0;return e.jsx(j,{id:n,label:c,hint:s,error:a,required:m.required,fieldClassName:i,children:e.jsxs("div",{className:d("form-control-wrap",i),children:[r?e.jsx(r,{className:"form-control-icon","aria-hidden":!0}):null,e.jsx("input",{id:n,className:d("field form-control",r&&"form-control-with-icon",o&&"form-control-with-action",l),"aria-invalid":a?!0:void 0,"aria-describedby":f,...m}),o?e.jsx("div",{className:"form-control-action",children:o}):null]})})}function S(c){const[s,a]=h.useState(!1);return e.jsx(q,{...c,type:s?"text":"password",action:e.jsx("button",{type:"button",className:"form-icon-button",onClick:()=>a(r=>!r),"aria-label":s?"Hide password":"Show password",title:s?"Hide password":"Show password",children:s?e.jsx($,{"aria-hidden":!0}):e.jsx(_,{"aria-hidden":!0})})})}function C({label:c,hint:s,error:a,icon:r,fieldClassName:i,className:o,id:l,children:u,...m}){const t=h.useId(),n=l??t,f=a?`${n}-error`:s?`${n}-hint`:void 0;return e.jsx(j,{id:n,label:c,hint:s,error:a,required:m.required,fieldClassName:i,children:e.jsxs("div",{className:d("form-control-wrap",i),children:[r?e.jsx(r,{className:"form-control-icon","aria-hidden":!0}):null,e.jsx("select",{id:n,className:d("field form-control form-select",r&&"form-control-with-icon",o),"aria-invalid":a?!0:void 0,"aria-describedby":f,...m,children:u}),e.jsx(b,{className:"form-select-icon","aria-hidden":!0})]})})}function E({label:c,hint:s,error:a,icon:r,fieldClassName:i,className:o,id:l,...u}){const m=h.useId(),t=l??m,n=a?`${t}-error`:s?`${t}-hint`:void 0;return e.jsx(j,{id:t,label:c,hint:s,error:a,required:u.required,fieldClassName:i,children:e.jsxs("div",{className:d("form-control-wrap form-textarea-wrap",i),children:[r?e.jsx(r,{className:"form-control-icon form-textarea-icon","aria-hidden":!0}):null,e.jsx("textarea",{id:t,className:d("field form-control form-textarea",r&&"form-control-with-icon",o),"aria-invalid":a?!0:void 0,"aria-describedby":n,...u})]})})}function M({id:c,label:s,checked:a,onChange:r,disabled:i}){return e.jsxs("label",{className:"form-check",htmlFor:c,children:[e.jsx("input",{id:c,type:"checkbox",checked:a,onChange:o=>r(o.target.checked),disabled:i}),e.jsx("span",{className:"form-check-box",children:e.jsx(y,{"aria-hidden":!0})}),e.jsx("span",{children:s})]})}function B({tone:c,children:s,className:a}){const r=c==="error"?v:y;return e.jsxs("div",{className:d("form-status",a),"data-tone":c,role:c==="error"?"alert":"status",children:[e.jsx(r,{"aria-hidden":!0}),e.jsx("div",{className:"min-w-0 flex flex-wrap items-center gap-2",children:s})]})}export{M as C,B as F,S as P,C as S,E as T,q as a,y as b};
