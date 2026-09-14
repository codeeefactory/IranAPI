import{c as P,b as T,r as N,j as e,N as k,L as b}from"./index-7JRSAcuR.js";import{u as H,P as _,C as O}from"./Layout-CeG7u94A.js";import{T as $,a as w,P as R,b as j}from"./Terminal-mRbo380S.js";import{c as U,d as B,e as I}from"./useCatalog-CrQhXs-0.js";import{S as A}from"./star-DoVNfjfR.js";import{L as V}from"./loader-circle-DyowJO2N.js";/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],D=P("arrow-left",M);/**
 * @license lucide-react v1.21.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],z=P("shield",Y),G=["java","javascript","typescript","python","cpp","csharp"],q={java:"Java",javascript:"JavaScript",typescript:"TypeScript",python:"Python",cpp:"C++",csharp:"C#"};function J(i,s){const a=s.sample_request??{},r=typeof a.path=="object"&&a.path&&!Array.isArray(a.path)?a.path:{},u=typeof a.query=="object"&&a.query&&!Array.isArray(a.query)?a.query:{},c=s.path.replace(/\{([^}]+)\}/g,(n,x)=>r[x]===void 0?n:encodeURIComponent(String(r[x]))),d=new URLSearchParams(Object.entries(u).filter(([,n])=>n!=null).map(([n,x])=>[n,String(x)])).toString(),o=`${i.base_url.replace(/\/$/,"")}/${c.replace(/^\//,"")}${d?`?${d}`:""}`,l=s.method.toUpperCase(),m=a.body??a.form,h=Object.fromEntries(Object.entries(a).filter(([n])=>!["query","path","headers","body","form"].includes(n))),g=m??(Object.keys(h).length?h:void 0),f=l==="GET"||l==="DELETE"||g===void 0?"":JSON.stringify(g,null,2),y=i.rapidapi.public_auth_scheme==="bearer"||i.rapidapi.public_auth_scheme==="oauth2"?"Authorization":"X-API-Key";return{url:o,method:l,body:f,authHeader:y,authValue:y==="Authorization"?"Bearer YOUR_API_KEY":"YOUR_API_KEY",authenticated:s.requires_auth}}function K(i){return i||"{}"}function F(i,s,a){const r=J(s,a),u=r.authenticated?`"${r.authHeader}": "${r.authValue}",`:"",c=r.body?`,
  body: JSON.stringify(${K(r.body)})`:"";if(i==="javascript")return`const response = await fetch("${r.url}", {
  method: "${r.method}",
  headers: { ${u} "Content-Type": "application/json" }${c}
});

if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
console.log(await response.json());`;if(i==="typescript")return`type ApiResponse = Record<string, unknown>;

const response = await fetch("${r.url}", {
  method: "${r.method}",
  headers: { ${u} "Content-Type": "application/json" }${c}
});

if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
const data: ApiResponse = await response.json();
console.log(data);`;if(i==="python"){const l=r.authenticated?`{
    "${r.authHeader}": "${r.authValue}",
    "Content-Type": "application/json",
}`:'{"Content-Type": "application/json"}',m=r.body?`, json=${r.body}`:"";return`import requests

response = requests.request(
    "${r.method}",
    "${r.url}",
    headers=${l}${m},
    timeout=30,
)
response.raise_for_status()
print(response.json())`}if(i==="java"){const l=r.body?`HttpRequest.BodyPublishers.ofString("${r.body.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"")}")`:"HttpRequest.BodyPublishers.noBody()",m=r.authenticated?`
    .header("${r.authHeader}", "${r.authValue}")`:"";return`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
  public static void main(String[] args) throws Exception {
    var request = HttpRequest.newBuilder(URI.create("${r.url}"))
        .method("${r.method}", ${l})${m}
        .header("Content-Type", "application/json")
        .build();
    var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    System.out.println(response.body());
  }
}`}if(i==="cpp"){const l=r.authenticated?`
    headers = curl_slist_append(headers, "${r.authHeader}: ${r.authValue}");`:"",m=r.body?`
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, R"json(${r.body})json");`:"";return`#include <curl/curl.h>

int main() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    CURL* curl = curl_easy_init();
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");${l}
    curl_easy_setopt(curl, CURLOPT_URL, "${r.url}");
    curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "${r.method}");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);${m}
    CURLcode result = curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    curl_global_cleanup();
    return result == CURLE_OK ? 0 : 1;
}`}const d=r.authenticated?r.authHeader==="Authorization"?`
client.DefaultRequestHeaders.Authorization = new("Bearer", "YOUR_API_KEY");`:`
client.DefaultRequestHeaders.Add("${r.authHeader}", "${r.authValue}");`:"",o=r.body?`new StringContent("${r.body.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"")}", Encoding.UTF8, "application/json")`:"null";return`using System.Net.Http;
using System.Text;

using var client = new HttpClient();${d}
using var request = new HttpRequestMessage(HttpMethod.${r.method[0]}${r.method.slice(1).toLowerCase()}, "${r.url}") {
    Content = ${o}
};
using var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());`}function C(i){return!!i&&typeof i=="object"&&!Array.isArray(i)}function X(i,s){const a=C(s.sample_request)?s.sample_request:{},r=C(a.query)?a.query:void 0,u=C(a.path)?a.path:void 0,c=a.body??a.form,d=Object.fromEntries(Object.entries(a).filter(([o])=>!["query","path","headers","body","form"].includes(o)));return{api_slug:i,endpoint_id:s.id,method:s.method,path:s.path,...r?{query:r}:{},...u?{path_params:u}:{},...c!==void 0?{body:c}:Object.keys(d).length?{body:d}:{}}}function re(){const{slug:i}=T(),{api:s,isLoading:a,isError:r,refetch:u}=U(i),{apis:c}=B(i),{isAuthenticated:d}=H(),o=I(i),[l,m]=N.useState(null),[h,g]=N.useState("javascript"),[f,y]=N.useState(null);if(!s&&a)return e.jsx(_,{children:e.jsxs("div",{className:"state-block","data-tone":"loading",children:[e.jsx("div",{className:"spinner","aria-hidden":!0}),e.jsx("div",{className:"state-sub",children:"loading api..."})]})});if(!s&&r)return e.jsx(_,{children:e.jsxs("div",{className:"state-block","data-tone":"error",role:"alert",children:[e.jsx("div",{className:"state-title",children:"// API data unavailable"}),e.jsx("button",{type:"button",className:"btn-primary mt-3",onClick:()=>void u(),children:"./retry"})]})});if(!s)return e.jsx(k,{to:"/browse",replace:!0});const p=s.apiEndpoints[0],n=s.apiEndpoints.find(t=>t.id===f)??p,x=l??Math.round(s.ratingValue),E=p?X(s.slug,p):null,L=E?`curl -X POST http://localhost:8000/api/v1/account/caller/ \\
  -H "Authorization: Bearer \${IRANAPI_KEY}" \\
  -H "Content-Type: application/json" \\
  --data '${JSON.stringify(E)}'`:"No active endpoint is registered for this API yet.";return e.jsxs(_,{children:[e.jsxs(b,{to:"/browse",className:"inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary",children:[e.jsx(D,{className:"h-3 w-3"})," back to registry"]}),e.jsxs("div",{className:"mt-6 grid gap-6 lg:grid-cols-[1fr,360px]",children:[e.jsxs("div",{className:"min-w-0 space-y-6",children:[e.jsxs("div",{className:"terminal-border rounded-sm bg-card/60 p-6",children:[e.jsxs("div",{className:"text-xs text-muted-foreground",children:[s.org," // ",s.category]}),e.jsx("h1",{className:"mt-2 text-3xl font-black text-primary text-glow",children:s.name}),e.jsx("p",{className:"mt-2 text-foreground/85",children:s.tagline}),e.jsx("p",{className:"mt-4 text-sm text-muted-foreground leading-relaxed",children:s.description}),e.jsxs("div",{className:"mt-5 flex flex-wrap gap-2",children:[s.tags.map(t=>e.jsx($,{color:"cyan",children:t},t)),e.jsx($,{color:s.pricing==="paid"?"magenta":"primary",children:s.pricing})]})]}),e.jsx(w,{title:`~/iranapi/${s.slug}/quickstart.sh`,glow:!0,children:e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsx(R,{children:"export IRANAPI_KEY=<copy-once-from-dashboard>"}),e.jsxs("div",{className:"pl-6 text-muted-foreground text-xs",children:["// ",s.endpoints," catalog endpoints registered"]}),e.jsx(R,{children:p?`${p.method} ${p.path}`:"no endpoint"}),e.jsx(j,{children:L})]})}),e.jsxs("div",{className:"terminal-border rounded-sm bg-card/50 p-6",children:[e.jsx("div",{className:"text-xs uppercase tracking-widest text-primary",children:"// endpoints"}),e.jsx("ul",{className:"mt-3 divide-y divide-border text-sm",children:(s.apiEndpoints.length?s.apiEndpoints:Array.from({length:Math.min(s.endpoints,6)})).map((t,v)=>e.jsxs("li",{className:"grid gap-2 py-3 sm:grid-cols-[1fr,auto] sm:items-center",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx($,{color:(t==null?void 0:t.method)==="POST"?"amber":"primary",children:(t==null?void 0:t.method)??(v%2?"POST":"GET")}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("code",{className:"break-all text-foreground/90",children:(t==null?void 0:t.path)??`/v1/${s.slug.split("-")[0]}/${["create","list","get","update","delete","verify"][v%6]}`}),(t==null?void 0:t.summary)&&e.jsx("div",{className:"mt-1 text-xs text-muted-foreground",children:t.summary})]})]}),e.jsx("span",{className:"text-xs text-muted-foreground",children:(t==null?void 0:t.requires_auth)===!1?"public":"provider auth"})]},(t==null?void 0:t.id)??v))})]}),n&&e.jsxs(w,{title:`~/iranapi/${s.slug}/call-${n.id}`,glow:!0,children:[e.jsxs("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",children:[e.jsxs("label",{className:"block min-w-0 flex-1 text-xs text-muted-foreground",htmlFor:"snippet-endpoint",children:["--endpoint",e.jsx("select",{id:"snippet-endpoint",value:n.id,onChange:t=>y(Number(t.target.value)),className:"field mt-1",children:s.apiEndpoints.map(t=>e.jsxs("option",{value:t.id,children:[t.method," ",t.path]},t.id))})]}),e.jsx("div",{className:"flex flex-wrap gap-1","aria-label":"code language",children:G.map(t=>e.jsx("button",{type:"button",onClick:()=>g(t),className:`rounded-sm border px-2 py-1 text-xs ${h===t?"border-primary bg-primary/10 text-primary":"border-border text-muted-foreground hover:text-foreground"}`,children:q[t]},t))})]}),e.jsxs("div",{className:"mt-4 text-xs text-muted-foreground",children:["// ready-to-run ",q[h]," request"]}),e.jsx(j,{className:"mt-2",children:F(h,s,n)})]}),s.documentations.length>0&&e.jsxs("div",{className:"terminal-border rounded-sm bg-card/50 p-6",children:[e.jsx("div",{className:"text-xs uppercase tracking-widest text-primary",children:"// docs"}),e.jsx("div",{className:"mt-4 grid gap-3",children:s.documentations.slice(0,3).map(t=>e.jsxs("article",{className:"border-b border-border pb-3 last:border-b-0 last:pb-0",children:[e.jsx("h2",{className:"text-sm font-bold text-foreground",children:t.title}),e.jsx("p",{className:"mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground",children:t.content})]},t.id))})]}),p&&e.jsx(w,{title:`~/iranapi/${s.slug}/sample.json`,children:e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("div",{className:"mb-2 text-xs uppercase tracking-widest text-muted-foreground",children:"// request"}),e.jsx(j,{children:JSON.stringify(p.sample_request,null,2)})]}),e.jsxs("div",{children:[e.jsx("div",{className:"mb-2 text-xs uppercase tracking-widest text-muted-foreground",children:"// response"}),e.jsx(j,{children:JSON.stringify(p.sample_response,null,2)})]})]})})]}),e.jsxs("aside",{className:"min-w-0 space-y-4",children:[e.jsxs("div",{className:"terminal-border rounded-sm bg-card/60 p-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:"// vitals"}),e.jsxs("div",{className:"flex items-center gap-1 text-amber text-sm",children:[e.jsx(A,{className:"h-3.5 w-3.5 fill-current"})," ",s.rating]})]}),e.jsxs("dl",{className:"mt-4 space-y-3 text-sm",children:[e.jsx(S,{icon:z,label:"provider auth",value:s.rapidapi.public_auth_scheme}),e.jsx(S,{icon:O,label:"endpoints",value:String(s.endpoints)}),e.jsx(S,{icon:A,label:"catalog views",value:s.views_count.toLocaleString()})]}),e.jsx(b,{to:"/caller",className:"mt-5 block rounded-sm border border-primary bg-primary text-center px-4 py-2 text-sm font-bold text-primary-foreground hover:shadow-glow",children:"./try_endpoint"}),e.jsx(b,{to:"/pricing",className:"mt-2 block rounded-sm border border-border text-center px-4 py-2 text-sm text-foreground/90 hover:border-primary hover:text-primary",children:"view pricing"})]}),e.jsxs("div",{className:"terminal-border rounded-sm bg-card/50 p-5",children:[e.jsx("div",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:"// rate api"}),e.jsxs("div",{className:"mt-3 flex items-center gap-1","aria-label":"rate api",children:[[1,2,3,4,5].map(t=>e.jsx("button",{type:"button",disabled:!d||o.isPending,onClick:()=>{m(t),o.mutate(t)},className:"rounded-sm p-1 text-amber transition-colors hover:bg-amber/10 disabled:cursor-not-allowed disabled:opacity-45","aria-label":`rate ${t} stars`,children:e.jsx(A,{className:`h-4 w-4 ${t<=x?"fill-current":""}`})},t)),o.isPending&&e.jsx(V,{className:"ms-2 h-3.5 w-3.5 animate-spin text-primary"})]}),e.jsx("div",{className:"mt-2 text-xs text-muted-foreground",children:d?`${s.rating_count} ratings`:"sign in to submit rating"}),o.isError&&e.jsx("div",{className:"mt-2 text-xs text-destructive",children:o.error.message})]}),e.jsxs("div",{className:"terminal-border rounded-sm bg-card/40 p-5 text-xs text-muted-foreground space-y-2",children:[e.jsxs("div",{children:["// publication: ",e.jsx("span",{className:"text-primary",children:s.rapidapi.publication_status})]}),e.jsxs("div",{children:["// catalog version: ",e.jsx("span",{className:"text-amber",children:s.rapidapi.canonical_version})]}),e.jsxs("div",{children:["// documentation: ",e.jsx("span",{className:"text-cyan",children:s.documentation_url?"provider link available":"catalog only"})]})]}),c.length>0&&e.jsxs("div",{className:"terminal-border rounded-sm bg-card/40 p-5",children:[e.jsx("div",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:"// similar apis"}),e.jsx("div",{className:"mt-3 grid gap-2",children:c.slice(0,3).map(t=>e.jsxs(b,{to:`/api/${t.slug}`,className:"rounded-sm border border-border bg-background/35 px-3 py-2 text-sm hover:border-primary hover:text-primary",children:[e.jsx("div",{className:"font-bold",children:t.name}),e.jsx("div",{className:"mt-1 truncate text-xs text-muted-foreground",children:t.tagline})]},t.slug))})]})]})]})]})}function S({icon:i,label:s,value:a}){return e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:"flex items-center gap-2 text-muted-foreground",children:[e.jsx(i,{className:"h-3.5 w-3.5 text-primary"})," ",s]}),e.jsx("span",{className:"text-primary text-glow font-bold",children:a})]})}export{re as default};
