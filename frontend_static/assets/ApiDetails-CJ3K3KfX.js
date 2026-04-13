import{m as R,n as G,o as V,p as W,q as Q,s as Z,v as F,r as _,c as ee,d as se,t as ae,S as re,j as e,N as S,C as d,e as m,B as h,L as O,F as B,h as y,f as $,l as D,i as j,k as f,w as P}from"./index-BTiStY5Z.js";import{A as te,H as ne,a as ie,M as I,S as le}from"./ApiVaultBadges-B95GS2H2.js";import{E as ce}from"./eye-By_nSurl.js";import{E as oe,B as de}from"./external-link-BeLHreZj.js";import{C as pe}from"./check-C4_PvzU_.js";import{C as ue}from"./copy-BzYI8Qv2.js";import"./triangle-alert-BmZk54Zu.js";import"./circle-check-BLpiUT9s.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=R("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=R("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=R("Star",[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]]),ge={rapidapi_proxy:"دروازه اختصاصی IranAPI",api_key:"کلید API اختصاصی",none:"دسترسی عمومی"},je={draft:"پیش‌نویس",ready:"آماده فعال‌سازی",published:"فعال در IranAPI",deprecated:"بازنشسته"},fe={Authorization:"Bearer <IRANAPI_API_KEY>","X-IranAPI-Client":"<CLIENT_ID>","Content-Type":"application/json"};function ye(t){return t.includes("speech")?{path:"/speech/transcriptions",payload:{audio_url:"https://cdn.example.com/audio/sample-fa.wav",language:"fa-IR",diarization:!0}}:t.includes("payment")?{path:"/payments/verify",payload:{transaction_id:"txn_123456789",amount:25e4,currency:"IRR"}}:t.includes("geo")?{path:"/routes/optimize",payload:{origin:{lat:35.7219,lng:51.3347},destination:{lat:35.6892,lng:51.389},mode:"driving"}}:{path:"/requests",payload:{query:"sample request",locale:"fa-IR"}}}function z(t,r){return`${t.replace(/\/+$/,"")}${r}`}function J(t){var s;const r=(s=t.endpoints)==null?void 0:s[0];if(r)return{method:r.method,path:r.path,payload:r.sample_request||{},response:r.sample_response||{ok:!0},name:r.name};const p=ye(t.slug);return{method:"POST",path:p.path,payload:p.payload,response:{ok:!0,data:{accepted:!0}},name:"Sample request"}}function v(t,r=2){return JSON.stringify(t,null,r)}function Ne(t,r){if(!t.base_url)return[];const p=J(t),s=(r==null?void 0:r.path)||p.path,x=(r==null?void 0:r.sample_request)||p.payload,N=((r==null?void 0:r.method)||p.method).toUpperCase(),l=z(t.base_url,s),o=t.rapidapi.public_auth_scheme==="rapidapi_proxy"||t.rapidapi.public_auth_scheme==="api_key",b=o?fe:{"Content-Type":"application/json"},g=v(b,2),u=v(x,2),w=JSON.stringify(x);return[{id:"curl",label:"cURL",code:`curl --request ${N} \\
  --url '${l}' \\
  ${o?`--header 'Authorization: Bearer <IRANAPI_API_KEY>' \\
  --header 'X-IranAPI-Client: <CLIENT_ID>' \\
  `:""}--header 'Content-Type: application/json' \\
  --data '${w}'`},{id:"javascript",label:"JavaScript",code:`const response = await fetch("${l}", {
  method: "${N}",
  headers: ${g},
  body: JSON.stringify(${u}),
});

if (!response.ok) {
  throw new Error(\`IranAPI request failed: \${response.status}\`);
}

const data = await response.json();
console.log(data);`},{id:"typescript",label:"TypeScript",code:`type IranApiResponse = Record<string, unknown>;

const payload = ${u} satisfies Record<string, unknown>;

const response = await fetch("${l}", {
  method: "${N}",
  headers: ${g},
  body: JSON.stringify(payload),
});

if (!response.ok) {
  throw new Error(\`IranAPI request failed: \${response.status}\`);
}

const data = (await response.json()) as IranApiResponse;
console.log(data);`},{id:"python",label:"Python",code:`import requests

url = "${l}"
headers = ${JSON.stringify(b,null,4)}
payload = ${JSON.stringify(x,null,4)}

response = requests.post(url, json=payload, headers=headers, timeout=30)
response.raise_for_status()

print(response.json())`},{id:"node",label:"Node.js",code:`import axios from "axios";

const { data } = await axios.post(
  "${l}",
  ${u},
  {
    headers: ${g},
    timeout: 30000,
  },
);

console.log(data);`},{id:"php",label:"PHP",code:`<?php
$url = "${l}";
$payload = ${JSON.stringify(x,null,2)};

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
${o?`        "Authorization: Bearer <IRANAPI_API_KEY>",
        "X-IranAPI-Client: <CLIENT_ID>",
`:""}        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
]);

$response = curl_exec($ch);
if ($response === false) {
    throw new RuntimeException(curl_error($ch));
}

curl_close($ch);
echo $response;`},{id:"go",label:"Go",code:`package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
)

func main() {
  payload := map[string]any${JSON.stringify(x,null,2).replace(/"([^"]+)":/g,'"$1":').replace(/true/g,"true").replace(/false/g,"false")}

  body, _ := json.Marshal(payload)
  req, _ := http.NewRequest("POST", "${l}", bytes.NewReader(body))
${o?`  req.Header.Set("Authorization", "Bearer <IRANAPI_API_KEY>")
  req.Header.Set("X-IranAPI-Client", "<CLIENT_ID>")
`:""}  req.Header.Set("Content-Type", "application/json")

  res, err := http.DefaultClient.Do(req)
  if err != nil {
    panic(err)
  }
  defer res.Body.Close()

  fmt.Println(res.Status)
}`},{id:"csharp",label:"C#",code:`using System.Net.Http.Headers;
using System.Text;

using var client = new HttpClient();
${o?`client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "<IRANAPI_API_KEY>");
client.DefaultRequestHeaders.Add("X-IranAPI-Client", "<CLIENT_ID>");
`:""}
var json = """
${u}
""";

using var content = new StringContent(json, Encoding.UTF8, "application/json");
using var response = await client.PostAsync("${l}", content);
response.EnsureSuccessStatusCode();

Console.WriteLine(await response.Content.ReadAsStringAsync());`},{id:"java",label:"Java",code:`HttpClient client = HttpClient.newHttpClient();
String body = """
${u}
""";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${l}"))
${o?`    .header("Authorization", "Bearer <IRANAPI_API_KEY>")
    .header("X-IranAPI-Client", "<CLIENT_ID>")
`:""}    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`},{id:"ruby",label:"Ruby",code:`require "json"
require "net/http"

uri = URI("${l}")
request = Net::HTTP::Post.new(uri)
${o?`request["Authorization"] = "Bearer <IRANAPI_API_KEY>"
request["X-IranAPI-Client"] = "<CLIENT_ID>"
`:""}request["Content-Type"] = "application/json"
request.body = ${u}.to_json

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|
  http.request(request)
end

puts response.body`}]}function Se(){var q,k,H,L,E;const{slug:t}=G(),r=V(),p=W(),{data:s,isLoading:x,isError:N}=Q(t,{initialData:r==null?void 0:r.api}),{data:l}=Z(t,{initialData:r==null?void 0:r.similarApis}),o=F(),[b,g]=_.useState(!1),[u,w]=_.useState("curl"),[U,K]=_.useState(null),[M,T]=_.useState(null);ee({title:s?s.name:"جزئیات API",description:(s==null?void 0:s.short_description)||(s==null?void 0:s.description)||"جزئیات فنی، پلن‌ها، مستندات و قرارداد دسترسی این API را بررسی کنید.",path:t?`/api/${t}`:"/browse",type:"article",structuredData:s?[se([{name:"خانه",path:"/"},{name:"کشف APIها",path:"/browse"},{name:s.name,path:`/api/${s.slug}`}]),{"@context":"https://schema.org","@type":"SoftwareApplication",name:s.name,applicationCategory:"DeveloperApplication",operatingSystem:"Web",description:s.description||s.short_description,url:ae(`/api/${s.slug}`),provider:{"@type":"Organization",name:re},aggregateRating:s.rating_count>0?{"@type":"AggregateRating",ratingValue:Number(s.rating),reviewCount:s.rating_count}:void 0,offers:((q=s.pricing_plans)==null?void 0:q.map(a=>({"@type":"Offer",price:Number(a.price),priceCurrency:a.currency,availability:a.is_active?"https://schema.org/InStock":"https://schema.org/PreOrder",name:a.name})))||void 0}]:void 0});const n=((k=s==null?void 0:s.endpoints)==null?void 0:k.find(a=>a.id===U))||((H=s==null?void 0:s.endpoints)==null?void 0:H[0])||null,i=s?J(s):null,C=_.useMemo(()=>s?Ne(s,n||void 0):[],[s,n]),c=C.find(a=>a.id===u)||C[0];if(x)return e.jsxs("div",{className:"cyber-shell min-h-screen bg-background",children:[e.jsx(S,{}),e.jsx("main",{id:"main-content",className:"container py-16",children:e.jsx(d,{className:"h-80 animate-pulse bg-muted/60"})})]});if(N||!s)return e.jsxs("div",{className:"cyber-shell min-h-screen bg-background",children:[e.jsx(S,{}),e.jsx("main",{id:"main-content",className:"container py-16",children:e.jsx(d,{className:"border-destructive/30",children:e.jsxs(m,{className:"space-y-4 p-8",children:[e.jsx("h1",{className:"text-2xl font-bold",children:"این API پیدا نشد"}),e.jsx("p",{className:"text-muted-foreground",children:"ممکن است شناسه URL اشتباه باشد یا سرویس از فهرست عمومی خارج شده باشد."}),e.jsx(h,{asChild:!0,children:e.jsx(O,{to:"/browse",children:"بازگشت به فهرست APIها"})})]})})}),e.jsx(B,{})]});const X=async()=>{if(!(c!=null&&c.code)||!navigator.clipboard){P.error("کپی در این مرورگر در دسترس نیست.");return}try{await navigator.clipboard.writeText(c.code),g(!0),window.setTimeout(()=>g(!1),1600),P.success(`نمونه ${c.label} کپی شد.`)}catch{P.error("اجازه دسترسی به کلیپ‌بورد در این مرورگر در دسترس نیست.")}},Y=()=>{const a=(n==null?void 0:n.name)||(i==null?void 0:i.name)||"Sample request",A=(n==null?void 0:n.sample_response)||(i==null?void 0:i.response)||{ok:!0};T(v({status:200,endpoint:a,latency_ms:86,body:A},2)),P.success("پاسخ آزمایشی آماده شد.")};return e.jsxs("div",{className:"cyber-shell min-h-screen bg-background",children:[e.jsx(S,{}),e.jsxs("main",{id:"main-content",className:"container page-stack",children:[e.jsxs("section",{className:"page-hero grid gap-8 lg:grid-cols-[1.25fr,0.75fr]",children:[e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(y,{variant:"outline",children:((L=s.category)==null?void 0:L.name)||"بدون دسته"}),s.is_featured?e.jsx(y,{children:"ویژه"}):null,s.is_popular?e.jsx(y,{variant:"secondary",children:"محبوب"}):null,e.jsx(te,{status:s.status}),e.jsx(ne,{}),e.jsx(ie,{scheme:s.rapidapi.public_auth_scheme})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h1",{className:"section-title",children:s.name}),e.jsx("p",{className:"section-copy",children:s.description||s.short_description||"توضیح این API هنوز ثبت نشده است."})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("span",{className:"stat-chip",children:[e.jsx(xe,{className:"h-4 w-4 text-primary"}),"امتیاز ",s.rating]}),e.jsxs("span",{className:"stat-chip",children:[e.jsx(ce,{className:"h-4 w-4 text-primary"}),$(s.views_count)," بازدید"]}),e.jsxs("span",{className:"stat-chip",children:["شروع قیمت: ",D(s.pricing_from)]})]}),e.jsxs("div",{className:"flex flex-wrap gap-2","aria-label":"متدهای رایج API",children:[e.jsx(I,{method:"GET"}),e.jsx(I,{method:"POST"}),e.jsx(I,{method:"PATCH"})]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:s.tags.map(a=>e.jsx(y,{variant:"outline",children:a},a))}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[s.base_url?e.jsx(h,{asChild:!0,children:e.jsxs("a",{href:s.base_url,target:"_blank",rel:"noreferrer",className:"gap-2",children:["آدرس سرویس",e.jsx(oe,{className:"h-4 w-4"})]})}):null,s.documentation_url?e.jsx(h,{variant:"outline",asChild:!0,children:e.jsx("a",{href:s.documentation_url,target:"_blank",rel:"noreferrer",children:"مستندات مرجع"})}):null]})]}),e.jsxs(d,{className:"surface-card",children:[e.jsx(j,{children:e.jsx(f,{children:"خلاصه تصمیم‌گیری"})}),e.jsxs(m,{className:"content-list text-sm leading-7 text-muted-foreground",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("p",{className:"mb-1 font-semibold text-foreground",children:"روش دسترسی عمومی"}),e.jsx("p",{children:ge[s.rapidapi.public_auth_scheme]||"مدیریت‌شده در IranAPI"})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("p",{className:"mb-1 font-semibold text-foreground",children:"نسخه کانونی"}),e.jsx("p",{children:s.rapidapi.canonical_version})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("p",{className:"mb-1 font-semibold text-foreground",children:"وضعیت انتشار"}),e.jsx("p",{children:je[s.rapidapi.publication_status]||s.rapidapi.publication_status})]}),e.jsxs("div",{className:"space-y-3 rounded-md bg-muted/50 p-4",children:[e.jsx("p",{className:"font-semibold text-foreground",children:"امتیازدهی"}),e.jsx("p",{children:(E=p.data)!=null&&E.authenticated?"اگر با این سرویس کار کرده‌اید، امتیاز شما به کیفیت پیشنهادها و رتبه‌بندی کمک می‌کند.":"برای ثبت امتیاز ابتدا وارد حساب خود شوید."}),e.jsx("div",{className:"flex flex-wrap gap-2",children:[1,2,3,4,5].map(a=>e.jsx(h,{variant:"outline",size:"sm",onClick:()=>t&&o.mutate({slug:t,rating:a}),disabled:o.isPending,children:a},a))})]})]})]})]}),e.jsxs("section",{className:"section-frame grid gap-8 lg:grid-cols-[1fr,1fr]",children:[e.jsxs(d,{className:"surface-card",children:[e.jsx(j,{children:e.jsxs(f,{className:"flex items-center gap-2",children:[e.jsx(he,{className:"h-5 w-5 text-primary"}),"مسیرهای API"]})}),e.jsx(m,{className:"space-y-4",children:s.endpoints&&s.endpoints.length>0?s.endpoints.map(a=>e.jsxs("button",{type:"button",className:`w-full rounded-md border p-4 text-left transition hover:border-primary/60 ${(n==null?void 0:n.id)===a.id?"border-primary bg-primary/5":"border-border/70 bg-background/70"}`,onClick:()=>{K(a.id),T(null)},children:[e.jsxs("div",{className:"mb-2 flex flex-wrap items-center gap-2",children:[e.jsx(I,{method:a.method}),e.jsx("code",{className:"rounded bg-muted px-2 py-1 text-xs",children:a.path}),e.jsx(y,{variant:"outline",children:a.group})]}),e.jsx("p",{className:"font-semibold",children:a.name}),e.jsx("p",{className:"mt-1 text-sm leading-6 text-muted-foreground",children:a.summary})]},a.id)):e.jsx("p",{className:"text-muted-foreground",children:"فهرست endpointها هنوز منتشر نشده است."})})]}),e.jsxs(d,{className:"surface-card",children:[e.jsxs(j,{className:"flex flex-row items-center justify-between",children:[e.jsx(f,{children:"آزمایش endpoint"}),e.jsxs(h,{variant:"outline",size:"sm",className:"gap-2",onClick:Y,children:[e.jsx(me,{className:"h-4 w-4"}),"اجرا"]})]}),e.jsxs(m,{className:"space-y-4",children:[e.jsxs("div",{className:"rounded-md border border-border/70 bg-background/70 p-4",children:[e.jsxs("div",{className:"mb-3 flex flex-wrap items-center gap-2",children:[e.jsx(I,{method:(n==null?void 0:n.method)||(i==null?void 0:i.method)||"POST"}),e.jsx("code",{className:"rounded bg-muted px-2 py-1 text-xs",children:z(s.base_url||"https://api.example.dev",(n==null?void 0:n.path)||(i==null?void 0:i.path)||"/requests")})]}),e.jsx("pre",{className:"overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-7 text-slate-100",children:e.jsx("code",{children:v((n==null?void 0:n.sample_request)||(i==null?void 0:i.payload)||{},2)})})]}),e.jsx("pre",{className:"min-h-40 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-7 text-slate-100",children:e.jsx("code",{children:M||"برای شبیه‌سازی پاسخ، دکمه اجرا را بزنید."})})]})]})]}),e.jsxs("section",{className:"section-frame grid gap-8 lg:grid-cols-[1fr,1fr]",children:[e.jsxs(d,{className:"surface-card",children:[e.jsxs(j,{className:"flex flex-row items-center justify-between",children:[e.jsx(f,{children:"نمونه فراخوانی"}),e.jsxs(h,{variant:"outline",size:"sm",className:"gap-2",onClick:X,children:[b?e.jsx(pe,{className:"h-4 w-4 text-accent"}):e.jsx(ue,{className:"h-4 w-4"}),b?"کپی شد":"کپی"]})]}),e.jsxs(m,{className:"space-y-4",children:[e.jsx("div",{className:"flex flex-wrap gap-2",role:"tablist","aria-label":"زبان نمونه فراخوانی API",children:C.map(a=>e.jsx(h,{type:"button",variant:(c==null?void 0:c.id)===a.id?"default":"outline",size:"sm",role:"tab","aria-selected":(c==null?void 0:c.id)===a.id,onClick:()=>{g(!1),w(a.id)},children:a.label},a.id))}),e.jsx("pre",{className:"overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-7 text-slate-100",children:e.jsx("code",{children:(c==null?void 0:c.code)||"برای این API هنوز آدرس پایه ثبت نشده است."})}),e.jsx("p",{className:"text-sm leading-7 text-muted-foreground",children:"نمونه بالا برای دسترسی مدیریت‌شده IranAPI ساخته شده است. کلیدها را در محیط امن نگه دارید و فقط هنگام نیاز از داشبورد یا تنظیمات سرویس کپی کنید."}),e.jsx(le,{})]})]}),e.jsxs(d,{className:"surface-card",children:[e.jsx(j,{children:e.jsx(f,{children:"پلن‌های قیمت‌گذاری"})}),e.jsx(m,{className:"space-y-4",children:s.pricing_plans&&s.pricing_plans.length>0?s.pricing_plans.map(a=>e.jsxs("div",{className:"rounded-md border border-border/70 bg-background/70 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold",children:a.name}),e.jsx("p",{className:"text-sm text-muted-foreground",children:a.plan_type})]}),e.jsx(y,{children:D(a.price,a.currency)})]}),e.jsxs("div",{className:"grid gap-2 text-sm text-muted-foreground sm:grid-cols-2",children:[e.jsxs("p",{children:["درخواست روزانه: ",a.requests_per_day?$(a.requests_per_day):"نامشخص"]}),e.jsxs("p",{children:["درخواست ماهانه: ",a.requests_per_month?$(a.requests_per_month):"نامشخص"]})]}),a.features.length>0?e.jsx("ul",{className:"mt-3 grid gap-2 text-sm text-muted-foreground",children:a.features.map(A=>e.jsxs("li",{children:["• ",A]},A))}):null]},a.id)):e.jsx("p",{className:"text-muted-foreground",children:"برای این سرویس هنوز پلن فعالی ثبت نشده است."})})]})]}),e.jsxs("section",{className:"section-frame grid gap-8 lg:grid-cols-[1.2fr,0.8fr]",children:[e.jsxs(d,{className:"surface-card",children:[e.jsx(j,{children:e.jsxs(f,{className:"flex items-center gap-2",children:[e.jsx(de,{className:"h-5 w-5 text-primary"}),"مستندات داخلی"]})}),e.jsx(m,{className:"space-y-4",children:s.documentations&&s.documentations.length>0?s.documentations.map(a=>e.jsxs("article",{className:"rounded-md border border-border/70 bg-background/70 p-5",children:[e.jsx("h3",{className:"mb-3 text-lg font-semibold",children:a.title}),e.jsx("p",{className:"whitespace-pre-wrap text-sm leading-7 text-muted-foreground",children:a.content})]},a.slug)):e.jsx("p",{className:"text-muted-foreground",children:"مستندات داخلی برای این API هنوز تکمیل نشده است."})})]}),e.jsxs(d,{className:"surface-card",children:[e.jsx(j,{children:e.jsx(f,{children:"سرویس‌های پیشنهادی مشابه"})}),e.jsxs(m,{className:"space-y-4",children:[e.jsx("div",{className:"rounded-md bg-muted/50 p-4 text-sm leading-7 text-muted-foreground",children:"سرویس‌های مشابه بر اساس دسته‌بندی و برچسب‌ها پیشنهاد می‌شوند تا ارزیابی گزینه‌های جایگزین ساده‌تر شود."}),l&&l.length>0?l.map(a=>e.jsxs("div",{className:"rounded-md border border-border/70 bg-background/70 p-4",children:[e.jsx("p",{className:"font-semibold",children:a.name}),e.jsx("p",{className:"mt-2 text-sm leading-7 text-muted-foreground",children:a.short_description||"بدون توضیح کوتاه"}),e.jsx(h,{variant:"link",className:"px-0",asChild:!0,children:e.jsx(O,{to:`/api/${a.slug}`,children:"مشاهده جزئیات"})})]},a.slug)):e.jsx("p",{className:"text-muted-foreground",children:"برای این API مورد مشابهی پیدا نشد."})]})]})]})]}),e.jsx(B,{})]})}export{Se as default};
