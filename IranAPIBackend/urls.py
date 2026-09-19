import json
import logging
import re

from django.conf import settings
from django.contrib import admin
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.utils import timezone
from django.utils.html import escape
from django.urls import include, path, re_path
from django.views.static import serve


logger = logging.getLogger(__name__)
CLI_PACKAGE_VERSION = "1.1.0"
CLI_PACKAGE_FILENAME = f"iranapi-cli-{CLI_PACKAGE_VERSION}.tgz"


def _request_origin(request):
    """Return the public origin seen by the client, including proxy scheme/host."""
    return request.build_absolute_uri("/").rstrip("/")


def _inject_runtime_urls(html, request):
    """Make every public URL in the SPA shell follow the current temporary host."""
    origin = _request_origin(request)
    page_url = request.build_absolute_uri(request.path)
    social_image = f"{origin}/iranapi-social.svg"

    replacements = (
        (r'(<link\s+rel="canonical"\s+href=")[^"]*(")', page_url),
        (r'(<meta\s+property="og:url"\s+content=")[^"]*(")', page_url),
        (r'(<meta\s+property="og:image"\s+content=")[^"]*(")', social_image),
        (r'(<meta\s+name="twitter:image"\s+content=")[^"]*(")', social_image),
    )
    for pattern, value in replacements:
        html = re.sub(pattern, lambda match: f"{match.group(1)}{escape(value)}{match.group(2)}", html, count=1)

    jsonld_pattern = re.compile(
        r'(<script\b(?=[^>]*\bid="iranapi-jsonld")[^>]*>)(.*?)(</script>)',
        re.DOTALL,
    )

    def replace_jsonld(match):
        try:
            data = json.loads(match.group(2))
            data["url"] = f"{origin}/"
            publisher = data.setdefault("publisher", {})
            publisher["url"] = f"{origin}/"
            publisher["logo"] = social_image
            action = data.get("potentialAction")
            if isinstance(action, dict):
                target = action.get("target")
                if isinstance(target, dict):
                    target["urlTemplate"] = f"{origin}/browse?q={{search_term_string}}"
            payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
            return f"{match.group(1)}{payload}{match.group(3)}"
        except (TypeError, ValueError):
            logger.exception("Failed to inject runtime URLs into JSON-LD")
            return match.group(0)

    return jsonld_pattern.sub(replace_jsonld, html, count=1)


def cli_download(request, filename=CLI_PACKAGE_FILENAME):
    package_path = settings.FRONTEND_DIR / "downloads" / filename
    if not package_path.is_file():
        package_path = settings.BASE_DIR / "api-hub-express" / "public" / "downloads" / filename
    if not package_path.is_file():
        raise Http404("CLI package not found")
    response = FileResponse(
        package_path.open("rb"),
        as_attachment=True,
        filename=package_path.name,
        content_type="application/gzip",
    )
    response["Cache-Control"] = (
        "no-cache, must-revalidate"
        if request.path.endswith("/iranapi-cli.tgz")
        else "public, max-age=31536000, immutable"
    )
    return response


def cli_runtime_manifest(request):
    origin = _request_origin(request)
    download_url = f"{origin}/downloads/iranapi-cli.tgz"
    manifest = {
        "schema_version": 1,
        "generated_at": timezone.now().isoformat(),
        "origin": origin,
        "api_url": f"{origin}/api/v1",
        "cli": {
            "name": "iranapi-cli",
            "version": CLI_PACKAGE_VERSION,
            "download_url": download_url,
            "versioned_download_url": f"{origin}/downloads/{CLI_PACKAGE_FILENAME}",
            "connect_command": f"iranapi connect {origin}",
            "install_command": f"npm install --global {download_url}",
        },
        "temporary_domain": {
            "supported": True,
            "refresh_strategy": "Run `iranapi connect <current-site-url>` after hostname rotation.",
        },
    }
    response = JsonResponse(manifest)
    response["Cache-Control"] = "no-store"
    return response


def frontend_app(request, slug: str | None = None):
    index_path = settings.FRONTEND_DIR / "index.html"
    html = _inject_runtime_urls(index_path.read_text(encoding="utf-8"), request)
    origin = _request_origin(request)
    payload = json.dumps(
        {
            "slug": slug or "",
            "origin": origin,
            "page_url": request.build_absolute_uri(request.path),
            "api_url": f"{origin}/api/v1",
            "cli_manifest_url": f"{origin}/cli/manifest.json",
            "cli_download_url": f"{origin}/downloads/iranapi-cli.tgz",
        },
        ensure_ascii=False,
        separators=(",", ":"),
    ).replace("<", "\\u003c")
    bootstrap = f'<script id="iranapi-bootstrap-data" type="application/json">{payload}</script>'
    html = html.replace("</body>", f"{bootstrap}</body>")
    response = HttpResponse(html)
    response["Cache-Control"] = "no-store"
    return response


def robots_txt(request):
    sitemap_url = request.build_absolute_uri("/sitemap.xml")
    body = """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/v1/account/
Disallow: /api/v1/auth/
Disallow: /api/account/
Disallow: /api/auth/
Sitemap: %s
""" % sitemap_url
    response = HttpResponse(body, content_type="text/plain")
    response["Cache-Control"] = "no-store"
    return response


def sitemap_xml(request):
    try:
        from api.repositories import MongoRepository

        base_url = request.build_absolute_uri("/").rstrip("/")
        entries = []
        for api in MongoRepository().list_apis(include_inactive=False):
            location = escape(f"{base_url}/api/{api['slug']}")
            entries.append(f"  <url><loc>{location}</loc></url>\n")
        urls = "".join(entries)
    except Exception:
        logger.exception("Failed to build dynamic sitemap entries")
        urls = ""
    body = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>%s</loc></url>
%s
</urlset>
""" % (escape(request.build_absolute_uri("/")), urls)
    response = HttpResponse(body, content_type="application/xml")
    response["Cache-Control"] = "no-store"
    return response


urlpatterns = [
    path("admin/", admin.site.urls),
    path("downloads/iranapi-cli.tgz", cli_download, name="cli-download-latest"),
    path("downloads/iranapi-cli-1.1.0.tgz", cli_download, name="cli-download"),
    path(
        "downloads/iranapi-cli-1.0.0.tgz",
        cli_download,
        {"filename": "iranapi-cli-1.0.0.tgz"},
        name="cli-download-legacy",
    ),
    path("cli/manifest.json", cli_runtime_manifest, name="cli-runtime-manifest"),
    re_path(
        r"^api/(?!(?:v1|auth|health|usage|profile|categories|apis|pricing-plans|documentations)/)(?P<slug>[-\w]+)/?$",
        frontend_app,
        name="frontend-api-detail",
    ),
    path("api/", include("api.urls")),
    path("robots.txt", robots_txt, name="robots-txt"),
    path("sitemap.xml", sitemap_xml, name="sitemap-xml"),
    re_path(
        r"^(?!(?:api|admin|robots\.txt|sitemap\.xml)(?:/|$)).*$",
        frontend_app,
        name="frontend-app",
    ),
]

if settings.DEBUG:
    urlpatterns.insert(
        0,
        re_path(
            r"^assets/(?P<path>.*)$",
            serve,
            {"document_root": settings.FRONTEND_DIR / "assets"},
        ),
    )
    urlpatterns.append(path("", frontend_app, name="frontend-root"))
