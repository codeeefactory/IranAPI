from __future__ import annotations

from typing import Any


SUPPORTED_PROJECT_LANGUAGES = [
    {"slug": "python", "label": "Python / FastAPI", "runtime": "python"},
    {"slug": "node", "label": "Node.js / Express", "runtime": "node"},
    {"slug": "go", "label": "Go / net/http", "runtime": "go"},
    {"slug": "rust", "label": "Rust / Axum", "runtime": "rust"},
    {"slug": "java", "label": "Java / Spring Boot", "runtime": "java"},
    {"slug": "csharp", "label": "C# / ASP.NET Core", "runtime": "dotnet"},
    {"slug": "php", "label": "PHP / Slim", "runtime": "php"},
    {"slug": "ruby", "label": "Ruby / Sinatra", "runtime": "ruby"},
    {"slug": "custom", "label": "Custom HTTP starter", "runtime": "generic"},
]

SUPPORTED_LANGUAGE_SLUGS = {language["slug"] for language in SUPPORTED_PROJECT_LANGUAGES}


def normalize_language(value: str) -> str:
    slug = (value or "custom").strip().lower().replace("#", "sharp").replace(".", "")
    aliases = {
        "js": "node",
        "javascript": "node",
        "typescript": "node",
        "py": "python",
        "golang": "go",
        "c#": "csharp",
        "dotnet": "csharp",
        "net": "csharp",
    }
    return aliases.get(slug, slug)


def project_file(path: str, content: str) -> dict[str, str]:
    return {"path": path, "content": content.strip() + "\n"}


def build_project_files(payload: dict[str, Any]) -> list[dict[str, str]]:
    language = normalize_language(payload.get("language", "custom"))
    if language not in SUPPORTED_LANGUAGE_SLUGS:
        language = "custom"

    package_name = payload["package_name"]
    api_slug = payload.get("api_slug") or "your-api"
    base_url = payload.get("base_url") or "https://api.example.dev/v1"
    auth_header = payload.get("auth_header", "X-API-Key")
    include_docker = bool(payload.get("include_docker", True))

    builders = {
        "python": _python_files,
        "node": _node_files,
        "go": _go_files,
        "rust": _rust_files,
        "java": _java_files,
        "csharp": _csharp_files,
        "php": _php_files,
        "ruby": _ruby_files,
        "custom": _custom_files,
    }
    files = builders[language](package_name, api_slug, base_url, auth_header)
    files.append(
        project_file(
            ".env.example",
            f"""
IRANAPI_BASE_URL={base_url}
IRANAPI_API_KEY=replace-me
IRANAPI_AUTH_HEADER={auth_header}
""",
        )
    )
    files.append(
        project_file(
            "README.md",
            f"""
# {package_name}

Starter prepared by IranAPI.

- API: `{api_slug}`
- Base URL: `{base_url}`
- Auth header: `{auth_header}`

Copy `.env.example` to `.env`, add your API key, then run language-specific commands in project files.
""",
        )
    )
    if include_docker:
        files.append(_dockerfile(language, package_name))
    return files


def _python_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file("requirements.txt", "fastapi==0.115.6\nuvicorn[standard]==0.34.0\nhttpx==0.28.1\npython-dotenv==1.0.1"),
        project_file(
            "main.py",
            f"""
import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()
app = FastAPI(title="{package_name}")

BASE_URL = os.getenv("IRANAPI_BASE_URL", "{base_url}")
API_KEY = os.getenv("IRANAPI_API_KEY", "")
AUTH_HEADER = os.getenv("IRANAPI_AUTH_HEADER", "{auth_header}")


@app.get("/health")
async def health():
    return {{"ok": True, "service": "{package_name}"}}


@app.get("/proxy/ping")
async def proxy_ping():
    headers = {{AUTH_HEADER: API_KEY}} if API_KEY else {{}}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"{{BASE_URL}}/ping", headers=headers)
    return {{"status_code": response.status_code, "body": response.text}}
""",
        ),
    ]


def _node_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file("package.json", f'{{"name":"{package_name}","type":"module","scripts":{{"dev":"node server.js"}},"dependencies":{{"dotenv":"^16.4.7","express":"^4.21.2"}}}}'),
        project_file(
            "server.js",
            f"""
import "dotenv/config";
import express from "express";

const app = express();
const baseUrl = process.env.IRANAPI_BASE_URL || "{base_url}";
const apiKey = process.env.IRANAPI_API_KEY || "";
const authHeader = process.env.IRANAPI_AUTH_HEADER || "{auth_header}";

app.get("/health", (_req, res) => res.json({{ ok: true, service: "{package_name}" }}));
app.get("/proxy/ping", async (_req, res) => {{
  const headers = apiKey ? {{ [authHeader]: apiKey }} : {{}};
  const response = await fetch(`${{baseUrl}}/ping`, {{ headers }});
  res.json({{ status_code: response.status, body: await response.text() }});
}});

app.listen(process.env.PORT || 3000);
""",
        ),
    ]


def _go_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file("go.mod", f"module {package_name}\n\ngo 1.22"),
        project_file(
            "main.go",
            f"""
package main

import (
	"io"
	"net/http"
	"os"
)

func main() {{
	baseURL := env("IRANAPI_BASE_URL", "{base_url}")
	authHeader := env("IRANAPI_AUTH_HEADER", "{auth_header}")
	apiKey := os.Getenv("IRANAPI_API_KEY")

	http.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {{
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, `{{"ok":true,"service":"{package_name}"}}`)
	}})
	http.HandleFunc("/proxy/ping", func(w http.ResponseWriter, _ *http.Request) {{
		req, _ := http.NewRequest("GET", baseURL+"/ping", nil)
		if apiKey != "" {{ req.Header.Set(authHeader, apiKey) }}
		resp, err := http.DefaultClient.Do(req)
		if err != nil {{ http.Error(w, err.Error(), 502); return }}
		defer resp.Body.Close()
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	}})
	http.ListenAndServe(":8080", nil)
}}

func env(key, fallback string) string {{
	if value := os.Getenv(key); value != "" {{ return value }}
	return fallback
}}
""",
        ),
    ]


def _rust_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file("Cargo.toml", f'[package]\nname = "{package_name}"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\naxum = "0.7"\ntokio = {{ version = "1", features = ["full"] }}\nreqwest = "0.12"\n'),
        project_file(
            "src/main.rs",
            f"""
use axum::{{routing::get, Router}};

#[tokio::main]
async fn main() {{
    let app = Router::new().route("/health", get(|| async {{ "{{\\"ok\\":true,\\"service\\":\\"{package_name}\\"}}" }}));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}}

// Upstream defaults:
// IRANAPI_BASE_URL={base_url}
// IRANAPI_AUTH_HEADER={auth_header}
""",
        ),
    ]


def _java_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file("pom.xml", f"<project><modelVersion>4.0.0</modelVersion><groupId>dev.iranapi</groupId><artifactId>{package_name}</artifactId><version>0.1.0</version></project>"),
        project_file("src/main/resources/application.properties", f"iranapi.base-url={base_url}\niranapi.auth-header={auth_header}"),
    ]


def _csharp_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file(f"{package_name}.csproj", '<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>'),
        project_file("Program.cs", f'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\napp.MapGet("/health", () => Results.Ok(new {{ ok = true, service = "{package_name}" }}));\napp.Run();\n// IRANAPI_BASE_URL={base_url}\n// IRANAPI_AUTH_HEADER={auth_header}'),
    ]


def _php_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file("composer.json", f'{{"name":"iranapi/{package_name}","require":{{"slim/slim":"^4.14","slim/psr7":"^1.7"}}}}'),
        project_file("public/index.php", f'<?php\nrequire __DIR__ . "/../vendor/autoload.php";\n$app = Slim\\Factory\\AppFactory::create();\n$app->get("/health", fn($req, $res) => $res->withHeader("Content-Type", "application/json")->write(json_encode(["ok" => true, "service" => "{package_name}"])));\n$app->run();\n// IRANAPI_BASE_URL={base_url}\n// IRANAPI_AUTH_HEADER={auth_header}'),
    ]


def _ruby_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file("Gemfile", 'source "https://rubygems.org"\ngem "sinatra"\ngem "dotenv"'),
        project_file("app.rb", f'require "sinatra"\nrequire "json"\nget("/health") {{ {{ ok: true, service: "{package_name}" }}.to_json }}\n# IRANAPI_BASE_URL={base_url}\n# IRANAPI_AUTH_HEADER={auth_header}'),
    ]


def _custom_files(package_name: str, _api_slug: str, base_url: str, auth_header: str) -> list[dict[str, str]]:
    return [
        project_file(
            "HTTP.md",
            f"""
# Generic HTTP starter for {package_name}

Health route:

```http
GET /health
```

Proxy upstream:

```http
GET {base_url}/ping
{auth_header}: $IRANAPI_API_KEY
```
""",
        )
    ]


def _dockerfile(language: str, package_name: str) -> dict[str, str]:
    dockerfiles = {
        "python": "FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
        "node": "FROM node:22-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD [\"npm\", \"run\", \"dev\"]",
        "go": "FROM golang:1.22\nWORKDIR /app\nCOPY . .\nRUN go build -o server .\nCMD [\"./server\"]",
        "rust": "FROM rust:1.82\nWORKDIR /app\nCOPY . .\nRUN cargo build --release\nCMD [\"./target/release/%s\"]" % package_name,
    }
    return project_file("Dockerfile", dockerfiles.get(language, "FROM alpine:3.20\nWORKDIR /app\nCOPY . .\nCMD [\"sh\"]"))
