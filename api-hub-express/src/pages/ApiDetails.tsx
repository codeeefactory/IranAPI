import { BookOpen, Check, Copy, ExternalLink, Eye, Play, Server, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ApiStatusBadge, AuthSchemeBadge, HealthSignalBadge, MethodBadge, SecurityNotice } from "@/components/ApiVaultBadges";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { RapidApiSyncPanel } from "@/components/RapidApiSyncPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAPI, useRateAPI, useSession, useSimilarAPIs } from "@/hooks/useApi";
import { getApiDetailBootstrap } from "@/lib/bootstrap";
import { createBreadcrumbSchema, usePageMetadata } from "@/lib/metadata";
import { formatCurrencyLabel, formatFaNumber, SITE_NAME, toSiteUrl } from "@/lib/site";
import type { APIEndpoint } from "@/lib/api";

const accessSchemeLabels: Record<string, string> = {
  rapidapi_proxy: "دروازه اختصاصی IranAPI",
  api_key: "کلید API اختصاصی",
  none: "دسترسی عمومی",
};

const publicationStatusLabels: Record<string, string> = {
  draft: "پیش‌نویس",
  ready: "آماده فعال‌سازی",
  published: "فعال در IranAPI",
  deprecated: "بازنشسته",
};

type CodeLanguage = {
  id: string;
  label: string;
  code: string;
};

const jsonHeaders = {
  Authorization: "Bearer <IRANAPI_API_KEY>",
  "X-IranAPI-Client": "<CLIENT_ID>",
  "Content-Type": "application/json",
};

function samplePathForApi(slug: string) {
  if (slug.includes("speech")) {
    return {
      path: "/speech/transcriptions",
      payload: {
        audio_url: "https://cdn.example.com/audio/sample-fa.wav",
        language: "fa-IR",
        diarization: true,
      },
    };
  }

  if (slug.includes("payment")) {
    return {
      path: "/payments/verify",
      payload: {
        transaction_id: "txn_123456789",
        amount: 250000,
        currency: "IRR",
      },
    };
  }

  if (slug.includes("geo")) {
    return {
      path: "/routes/optimize",
      payload: {
        origin: { lat: 35.7219, lng: 51.3347 },
        destination: { lat: 35.6892, lng: 51.389 },
        mode: "driving",
      },
    };
  }

  return {
    path: "/requests",
    payload: {
      query: "sample request",
      locale: "fa-IR",
    },
  };
}

function buildApiUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

function defaultEndpointForApi(api: { slug: string; endpoints?: APIEndpoint[] }) {
  const endpoint = api.endpoints?.[0];
  if (endpoint) {
    return {
      method: endpoint.method,
      path: endpoint.path,
      payload: endpoint.sample_request || {},
      response: endpoint.sample_response || { ok: true },
      name: endpoint.name,
    };
  }

  const sample = samplePathForApi(api.slug);
  return {
    method: "POST",
    path: sample.path,
    payload: sample.payload,
    response: { ok: true, data: { accepted: true } },
    name: "Sample request",
  };
}

function indentJson(value: unknown, spaces = 2) {
  return JSON.stringify(value, null, spaces);
}

function buildLanguageSamples(
  api: { base_url?: string; slug: string; rapidapi: { public_auth_scheme: string }; endpoints?: APIEndpoint[] },
  endpoint?: APIEndpoint,
): CodeLanguage[] {
  if (!api.base_url) {
    return [];
  }

  const fallback = defaultEndpointForApi(api);
  const path = endpoint?.path || fallback.path;
  const payload = endpoint?.sample_request || fallback.payload;
  const method = (endpoint?.method || fallback.method).toUpperCase();
  const url = buildApiUrl(api.base_url, path);
  const needsAuth = api.rapidapi.public_auth_scheme === "rapidapi_proxy" || api.rapidapi.public_auth_scheme === "api_key";
  const headers = needsAuth ? jsonHeaders : { "Content-Type": "application/json" };
  const headersJson = indentJson(headers, 2);
  const payloadJson = indentJson(payload, 2);
  const compactPayload = JSON.stringify(payload);

  return [
    {
      id: "curl",
      label: "cURL",
      code: `curl --request ${method} \\
  --url '${url}' \\
  ${needsAuth ? "--header 'Authorization: Bearer <IRANAPI_API_KEY>' \\\n  --header 'X-IranAPI-Client: <CLIENT_ID>' \\\n  " : ""}--header 'Content-Type: application/json' \\
  --data '${compactPayload}'`,
    },
    {
      id: "javascript",
      label: "JavaScript",
      code: `const response = await fetch("${url}", {
  method: "${method}",
  headers: ${headersJson},
  body: JSON.stringify(${payloadJson}),
});

if (!response.ok) {
  throw new Error(\`IranAPI request failed: \${response.status}\`);
}

const data = await response.json();
console.log(data);`,
    },
    {
      id: "typescript",
      label: "TypeScript",
      code: `type IranApiResponse = Record<string, unknown>;

const payload = ${payloadJson} satisfies Record<string, unknown>;

const response = await fetch("${url}", {
  method: "${method}",
  headers: ${headersJson},
  body: JSON.stringify(payload),
});

if (!response.ok) {
  throw new Error(\`IranAPI request failed: \${response.status}\`);
}

const data = (await response.json()) as IranApiResponse;
console.log(data);`,
    },
    {
      id: "python",
      label: "Python",
      code: `import requests

url = "${url}"
headers = ${JSON.stringify(headers, null, 4)}
payload = ${JSON.stringify(payload, null, 4)}

response = requests.post(url, json=payload, headers=headers, timeout=30)
response.raise_for_status()

print(response.json())`,
    },
    {
      id: "node",
      label: "Node.js",
      code: `import axios from "axios";

const { data } = await axios.post(
  "${url}",
  ${payloadJson},
  {
    headers: ${headersJson},
    timeout: 30000,
  },
);

console.log(data);`,
    },
    {
      id: "php",
      label: "PHP",
      code: `<?php
$url = "${url}";
$payload = ${JSON.stringify(payload, null, 2)};

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
${needsAuth ? '        "Authorization: Bearer <IRANAPI_API_KEY>",\n        "X-IranAPI-Client: <CLIENT_ID>",\n' : ""}        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
]);

$response = curl_exec($ch);
if ($response === false) {
    throw new RuntimeException(curl_error($ch));
}

curl_close($ch);
echo $response;`,
    },
    {
      id: "go",
      label: "Go",
      code: `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
)

func main() {
  payload := map[string]any${JSON.stringify(payload, null, 2)
    .replace(/"([^"]+)":/g, '"$1":')
    .replace(/true/g, "true")
    .replace(/false/g, "false")}

  body, _ := json.Marshal(payload)
  req, _ := http.NewRequest("POST", "${url}", bytes.NewReader(body))
${needsAuth ? '  req.Header.Set("Authorization", "Bearer <IRANAPI_API_KEY>")\n  req.Header.Set("X-IranAPI-Client", "<CLIENT_ID>")\n' : ""}  req.Header.Set("Content-Type", "application/json")

  res, err := http.DefaultClient.Do(req)
  if err != nil {
    panic(err)
  }
  defer res.Body.Close()

  fmt.Println(res.Status)
}`,
    },
    {
      id: "csharp",
      label: "C#",
      code: `using System.Net.Http.Headers;
using System.Text;

using var client = new HttpClient();
${needsAuth ? 'client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "<IRANAPI_API_KEY>");\nclient.DefaultRequestHeaders.Add("X-IranAPI-Client", "<CLIENT_ID>");\n' : ""}
var json = """
${payloadJson}
""";

using var content = new StringContent(json, Encoding.UTF8, "application/json");
using var response = await client.PostAsync("${url}", content);
response.EnsureSuccessStatusCode();

Console.WriteLine(await response.Content.ReadAsStringAsync());`,
    },
    {
      id: "java",
      label: "Java",
      code: `HttpClient client = HttpClient.newHttpClient();
String body = """
${payloadJson}
""";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${url}"))
${needsAuth ? '    .header("Authorization", "Bearer <IRANAPI_API_KEY>")\n    .header("X-IranAPI-Client", "<CLIENT_ID>")\n' : ""}    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
    },
    {
      id: "ruby",
      label: "Ruby",
      code: `require "json"
require "net/http"

uri = URI("${url}")
request = Net::HTTP::Post.new(uri)
${needsAuth ? 'request["Authorization"] = "Bearer <IRANAPI_API_KEY>"\nrequest["X-IranAPI-Client"] = "<CLIENT_ID>"\n' : ""}request["Content-Type"] = "application/json"
request.body = ${payloadJson}.to_json

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|
  http.request(request)
end

puts response.body`,
    },
  ];
}

export default function ApiDetails() {
  const { slug } = useParams();
  const bootstrap = getApiDetailBootstrap();
  const session = useSession();
  const { data: api, isLoading, isError } = useAPI(slug, { initialData: bootstrap?.api });
  const { data: similarApis } = useSimilarAPIs(slug, { initialData: bootstrap?.similarApis });
  const rateAPI = useRateAPI();
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("curl");
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);
  const [tryResponse, setTryResponse] = useState<string | null>(null);

  usePageMetadata({
    title: api ? api.name : "جزئیات API",
    description: api?.short_description || api?.description || "جزئیات فنی، پلن‌ها، مستندات و قرارداد دسترسی این API را بررسی کنید.",
    path: slug ? `/api/${slug}` : "/browse",
    type: "article",
    structuredData: api
      ? [
          createBreadcrumbSchema([
            { name: "خانه", path: "/" },
            { name: "کشف APIها", path: "/browse" },
            { name: api.name, path: `/api/${api.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: api.name,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            description: api.description || api.short_description,
            url: toSiteUrl(`/api/${api.slug}`),
            provider: {
              "@type": "Organization",
              name: SITE_NAME,
            },
            aggregateRating:
              api.rating_count > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: Number(api.rating),
                    reviewCount: api.rating_count,
                  }
                : undefined,
            offers:
              api.pricing_plans?.map((plan) => ({
                "@type": "Offer",
                price: Number(plan.price),
                priceCurrency: plan.currency,
                availability: plan.is_active ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
                name: plan.name,
              })) || undefined,
          },
        ]
      : undefined,
  });

  const selectedEndpoint =
    api?.endpoints?.find((endpoint) => endpoint.id === selectedEndpointId) || api?.endpoints?.[0] || null;
  const endpointFallback = api ? defaultEndpointForApi(api) : null;
  const languageSamples = useMemo(() => (api ? buildLanguageSamples(api, selectedEndpoint || undefined) : []), [api, selectedEndpoint]);
  const selectedSample = languageSamples.find((sample) => sample.id === selectedLanguage) || languageSamples[0];

  if (isLoading) {
    return (
      <div className="cyber-shell min-h-screen bg-background">
        <Navigation />
        <main id="main-content" className="container py-16">
          <Card className="h-80 animate-pulse bg-muted/60" />
        </main>
      </div>
    );
  }
};

  if (isError || !api) {
    return (
      <div className="cyber-shell min-h-screen bg-background">
        <Navigation />
        <main id="main-content" className="container py-16">
          <Card className="border-destructive/30">
            <CardContent className="space-y-4 p-8">
              <h1 className="text-2xl font-bold">این API پیدا نشد</h1>
              <p className="text-muted-foreground">ممکن است شناسه URL اشتباه باشد یا سرویس از فهرست عمومی خارج شده باشد.</p>
              <Button asChild>
                <Link to="/browse">بازگشت به فهرست APIها</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopy = async () => {
    if (!selectedSample?.code || !navigator.clipboard) {
      toast.error("کپی در این مرورگر در دسترس نیست.");
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedSample.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast.success(`نمونه ${selectedSample.label} کپی شد.`);
    } catch {
      toast.error("اجازه دسترسی به کلیپ‌بورد در این مرورگر در دسترس نیست.");
    }
  };

  const handleRunTest = () => {
    const endpointName = selectedEndpoint?.name || endpointFallback?.name || "Sample request";
    const response = selectedEndpoint?.sample_response || endpointFallback?.response || { ok: true };
    setTryResponse(
      indentJson(
        {
          status: 200,
          endpoint: endpointName,
          latency_ms: 86,
          body: response,
        },
        2,
      ),
    );
    toast.success("پاسخ آزمایشی آماده شد.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main id="main-content" className="container page-stack">
        <section className="page-hero grid gap-8 lg:grid-cols-[1.25fr,0.75fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{api.category?.name || "بدون دسته"}</Badge>
              {api.is_featured ? <Badge>ویژه</Badge> : null}
              {api.is_popular ? <Badge variant="secondary">محبوب</Badge> : null}
              <ApiStatusBadge status={api.status} />
              <HealthSignalBadge />
              <AuthSchemeBadge scheme={api.rapidapi.public_auth_scheme} />
            </div>

            <div className="space-y-4">
              <h1 className="section-title">{api.name}</h1>
              <p className="section-copy">
                {api.description || api.short_description || "توضیح این API هنوز ثبت نشده است."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="stat-chip">
                <Star className="h-4 w-4 text-primary" />
                امتیاز {api.rating}
              </span>
              <span className="stat-chip">
                <Eye className="h-4 w-4 text-primary" />
                {formatFaNumber(api.views_count)} بازدید
              </span>
              <span className="stat-chip">شروع قیمت: {formatCurrencyLabel(api.pricing_from)}</span>
            </div>

            <div className="flex flex-wrap gap-2" aria-label="متدهای رایج API">
              <MethodBadge method="GET" />
              <MethodBadge method="POST" />
              <MethodBadge method="PATCH" />
            </div>

            <div className="flex flex-wrap gap-2">
              {api.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg mb-4">
                مدل‌های زبانی پیشرفته هوش مصنوعی برای تولید متن، مکالمه و بیشتر
              </p>
              <div className="flex items-center gap-4">
                <Button className="bg-gradient-primary hover:shadow-glow transition-all">
                  اشتراک در API
                </Button>
                <Button variant="outline">تست نقطه پایانی</Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">محبوبیت</p>
              </div>
              <p className="text-2xl font-bold">۹۸٪</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-accent" />
                <p className="text-sm text-muted-foreground">تاخیر</p>
              </div>
              <p className="text-2xl font-bold">۱۲۰ میلی‌ثانیه</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <p className="text-sm text-muted-foreground">نرخ موفقیت</p>
              </div>
              <p className="text-2xl font-bold">۹۹.۹٪</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">فراخوانی/ماه</p>
              </div>
              <p className="text-2xl font-bold">۱۰ میلیون+</p>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="endpoints">نقاط پایانی</TabsTrigger>
            <TabsTrigger value="pricing">قیمت‌گذاری</TabsTrigger>
            <TabsTrigger value="docs">مستندات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">درباره این API</h2>
              <p className="text-muted-foreground mb-6">
                API روبیکا AI دسترسی به مدل‌های زبانی پیشرفته را فراهم می‌کند که می‌توانند متن شبیه انسان را درک و تولید کنند. عالی برای چت‌بات‌ها، تولید محتوا، ترجمه و بیشتر.
              </p>

              <h3 className="text-xl font-bold mb-3">ویژگی‌های کلیدی</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">درک زبان طبیعی</p>
                    <p className="text-sm text-muted-foreground">درک پیشرفته زمینه و قصد</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">تولید محتوا</p>
                    <p className="text-sm text-muted-foreground">ایجاد متن با کیفیت در هر سبک</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">پشتیبانی چند زبانه</p>
                    <p className="text-sm text-muted-foreground">کار با ۹۵+ زبان</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">پردازش لحظه‌ای</p>
                    <p className="text-sm text-muted-foreground">زمان پاسخ سریع برای همه درخواست‌ها</p>
                  </div>
                </div>
              </div>

        <RapidApiSyncPanel compact />

        <section className="section-frame grid gap-8 lg:grid-cols-[1fr,1fr]">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                مسیرهای API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {api.endpoints && api.endpoints.length > 0 ? (
                api.endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    type="button"
                    className={`w-full rounded-md border p-4 text-left transition hover:border-primary/60 ${
                      selectedEndpoint?.id === endpoint.id ? "border-primary bg-primary/5" : "border-border/70 bg-background/70"
                    }`}
                    onClick={() => {
                      setSelectedEndpointId(endpoint.id);
                      setTryResponse(null);
                    }}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <MethodBadge method={endpoint.method} />
                      <code className="rounded bg-muted px-2 py-1 text-xs">{endpoint.path}</code>
                      <Badge variant="outline">{endpoint.group}</Badge>
                    </div>
                    <p className="font-semibold">{endpoint.name}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{endpoint.summary}</p>
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground">فهرست endpointها هنوز منتشر نشده است.</p>
              )}
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>آزمایش endpoint</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRunTest}>
                <Play className="h-4 w-4" />
                اجرا
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border/70 bg-background/70 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <MethodBadge method={selectedEndpoint?.method || endpointFallback?.method || "POST"} />
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {buildApiUrl(api.base_url || "https://api.example.dev", selectedEndpoint?.path || endpointFallback?.path || "/requests")}
                  </code>
                </div>
                <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  <code>{indentJson(selectedEndpoint?.sample_request || endpointFallback?.payload || {}, 2)}</code>
                </pre>
              </div>
              <pre className="min-h-40 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                <code>{tryResponse || "برای شبیه‌سازی پاسخ، دکمه اجرا را بزنید."}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <section className="section-frame grid gap-8 lg:grid-cols-[1fr,1fr]">
          <Card className="surface-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>نمونه فراخوانی</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                {copied ? "کپی شد" : "کپی"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="زبان نمونه فراخوانی API">
                {languageSamples.map((sample) => (
                  <Button
                    key={sample.id}
                    type="button"
                    variant={selectedSample?.id === sample.id ? "default" : "outline"}
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                    {copied ? "کپی شد!" : "کپی"}
                  </Button>
                ))}
              </div>
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                <code>{selectedSample?.code || "برای این API هنوز آدرس پایه ثبت نشده است."}</code>
              </pre>
              <p className="text-sm leading-7 text-muted-foreground">
                نمونه بالا برای دسترسی مدیریت‌شده IranAPI ساخته شده است. کلیدها را در محیط امن نگه دارید و فقط هنگام نیاز از داشبورد یا تنظیمات سرویس کپی کنید.
              </p>
              <SecurityNotice />
            </CardContent>
          </Card>

          <TabsContent value="endpoints" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">نقاط پایانی موجود</h2>
              
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-primary/20 text-primary">GET</Badge>
                    <code className="text-sm">/v1/chat/completions</code>
                  </div>
                  <p className="text-muted-foreground text-sm">ایجاد تکمیل گفتگو با مدل</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-secondary/20 text-secondary">POST</Badge>
                    <code className="text-sm">/v1/completions</code>
                  </div>
                  <p className="text-muted-foreground text-sm">تولید تکمیل متن</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-accent/20 text-accent">POST</Badge>
                    <code className="text-sm">/v1/embeddings</code>
                  </div>
                  <p className="text-muted-foreground text-sm">ایجاد جاسازی متن</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">رایگان</h3>
                <p className="text-3xl font-bold mb-4">۰ تومان<span className="text-sm text-muted-foreground">/ماه</span></p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">۱۰۰ درخواست/روز</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">پشتیبانی پایه</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">شروع کنید</Button>
              </Card>

              <Card className="p-6 border-primary shadow-glow">
                <Badge className="mb-2 bg-gradient-primary">محبوب‌ترین</Badge>
                <h3 className="text-xl font-bold mb-2">حرفه‌ای</h3>
                <p className="text-3xl font-bold mb-4">۴۹ تومان<span className="text-sm text-muted-foreground">/ماه</span></p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">۱۰,۰۰۰ درخواست/روز</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">پشتیبانی اولویت‌دار</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">تحلیل پیشرفته</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-primary">اشتراک الان</Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">سازمانی</h3>
                <p className="text-3xl font-bold mb-4">سفارشی</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">درخواست نامحدود</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">پشتیبانی اختصاصی ۲۴/۷</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">SLA سفارشی</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">تماس با فروش</Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">مستندات</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold mb-2">شروع کار</h3>
                  <p className="text-muted-foreground text-sm">نحوه انجام اولین فراخوانی API را یاد بگیرید</p>
                </div>

                <div className="border-l-4 border-secondary pl-4">
                  <h3 className="font-bold mb-2">احراز هویت</h3>
                  <p className="text-muted-foreground text-sm">درخواست‌های API خود را با احراز هویت مناسب ایمن کنید</p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-bold mb-2">مرجع API</h3>
                  <p className="text-muted-foreground text-sm">مرجع کامل برای همه نقاط پایانی</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold mb-2">بهترین شیوه‌ها</h3>
                  <p className="text-muted-foreground text-sm">نکات برای عملکرد بهینه</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDetails;