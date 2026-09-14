import type { ApiItem, CatalogEndpoint } from "@/types/catalog";

export const CALL_LANGUAGES = ["java", "javascript", "typescript", "python", "cpp", "csharp"] as const;
export type CallLanguage = (typeof CALL_LANGUAGES)[number];

export const CALL_LANGUAGE_LABELS: Record<CallLanguage, string> = {
  java: "Java",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  cpp: "C++",
  csharp: "C#",
};

function requestDetails(api: ApiItem, endpoint: CatalogEndpoint) {
  const sample = endpoint.sample_request ?? {};
  const pathParams = typeof sample.path === "object" && sample.path && !Array.isArray(sample.path)
    ? sample.path as Record<string, unknown>
    : {};
  const query = typeof sample.query === "object" && sample.query && !Array.isArray(sample.query)
    ? sample.query as Record<string, unknown>
    : {};
  const renderedPath = endpoint.path.replace(/\{([^}]+)\}/g, (match, key: string) =>
    pathParams[key] === undefined ? match : encodeURIComponent(String(pathParams[key])),
  );
  const queryString = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => [key, String(value)]),
  ).toString();
  const url = `${api.base_url.replace(/\/$/, "")}/${renderedPath.replace(/^\//, "")}${queryString ? `?${queryString}` : ""}`;
  const method = endpoint.method.toUpperCase();
  const explicitBody = sample.body ?? sample.form;
  const remainingBody = Object.fromEntries(
    Object.entries(sample).filter(([key]) => !["query", "path", "headers", "body", "form"].includes(key)),
  );
  const bodyValue = explicitBody ?? (Object.keys(remainingBody).length ? remainingBody : undefined);
  const body = method === "GET" || method === "DELETE" || bodyValue === undefined ? "" : JSON.stringify(bodyValue, null, 2);
  const authHeader = api.rapidapi.public_auth_scheme === "bearer" || api.rapidapi.public_auth_scheme === "oauth2"
    ? "Authorization"
    : "X-API-Key";
  const authValue = authHeader === "Authorization" ? "Bearer YOUR_API_KEY" : "YOUR_API_KEY";
  return { url, method, body, authHeader, authValue, authenticated: endpoint.requires_auth };
}

function jsObject(body: string) {
  return body || "{}";
}

export function buildCallSnippet(language: CallLanguage, api: ApiItem, endpoint: CatalogEndpoint): string {
  const request = requestDetails(api, endpoint);
  const authLine = request.authenticated ? `"${request.authHeader}": "${request.authValue}",` : "";
  const bodyOption = request.body ? `,\n  body: JSON.stringify(${jsObject(request.body)})` : "";

  if (language === "javascript") {
    return `const response = await fetch("${request.url}", {
  method: "${request.method}",
  headers: { ${authLine} "Content-Type": "application/json" }${bodyOption}
});

if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
console.log(await response.json());`;
  }
  if (language === "typescript") {
    return `type ApiResponse = Record<string, unknown>;

const response = await fetch("${request.url}", {
  method: "${request.method}",
  headers: { ${authLine} "Content-Type": "application/json" }${bodyOption}
});

if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
const data: ApiResponse = await response.json();
console.log(data);`;
  }
  if (language === "python") {
    const headers = request.authenticated
      ? `{\n    "${request.authHeader}": "${request.authValue}",\n    "Content-Type": "application/json",\n}`
      : `{"Content-Type": "application/json"}`;
    const body = request.body ? `, json=${request.body}` : "";
    return `import requests

response = requests.request(
    "${request.method}",
    "${request.url}",
    headers=${headers}${body},
    timeout=30,
)
response.raise_for_status()
print(response.json())`;
  }
  if (language === "java") {
    const bodyPublisher = request.body
      ? `HttpRequest.BodyPublishers.ofString("${request.body.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "")}")`
      : "HttpRequest.BodyPublishers.noBody()";
    const javaAuth = request.authenticated ? `\n    .header("${request.authHeader}", "${request.authValue}")` : "";
    return `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
  public static void main(String[] args) throws Exception {
    var request = HttpRequest.newBuilder(URI.create("${request.url}"))
        .method("${request.method}", ${bodyPublisher})${javaAuth}
        .header("Content-Type", "application/json")
        .build();
    var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    System.out.println(response.body());
  }
}`;
  }
  if (language === "cpp") {
    const cppAuth = request.authenticated ? `\n    headers = curl_slist_append(headers, "${request.authHeader}: ${request.authValue}");` : "";
    const cppBody = request.body ? `\n    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, R"json(${request.body})json");` : "";
    return `#include <curl/curl.h>

int main() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    CURL* curl = curl_easy_init();
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");${cppAuth}
    curl_easy_setopt(curl, CURLOPT_URL, "${request.url}");
    curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "${request.method}");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);${cppBody}
    CURLcode result = curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    curl_global_cleanup();
    return result == CURLE_OK ? 0 : 1;
}`;
  }

  const csharpAuth = request.authenticated
    ? request.authHeader === "Authorization"
      ? `\nclient.DefaultRequestHeaders.Authorization = new("Bearer", "YOUR_API_KEY");`
      : `\nclient.DefaultRequestHeaders.Add("${request.authHeader}", "${request.authValue}");`
    : "";
  const csharpContent = request.body
    ? `new StringContent("${request.body.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "")}", Encoding.UTF8, "application/json")`
    : "null";
  return `using System.Net.Http;
using System.Text;

using var client = new HttpClient();${csharpAuth}
using var request = new HttpRequestMessage(HttpMethod.${request.method[0]}${request.method.slice(1).toLowerCase()}, "${request.url}") {
    Content = ${csharpContent}
};
using var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());`;
}
