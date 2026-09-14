import json
import logging

from django.conf import settings
from django.contrib import admin
from django.http import FileResponse, Http404, HttpResponse
from django.utils.html import escape
from django.urls import include, path, re_path
from django.views.static import serve


logger = logging.getLogger(__name__)


def cli_download(_request):
    package_path = settings.FRONTEND_DIR / "downloads" / "iranapi-cli-1.0.0.tgz"
    if not package_path.is_file():
        raise Http404("CLI package not found")
    return FileResponse(
        package_path.open("rb"),
        as_attachment=True,
        filename=package_path.name,
        content_type="application/gzip",
    )


def frontend_app(request, slug: str | None = None):
    index_path = settings.FRONTEND_DIR / "index.html"
    html = index_path.read_text(encoding="utf-8")
    payload = json.dumps({"slug": slug or ""}, ensure_ascii=False)
    bootstrap = f'<script id="iranapi-bootstrap-data" type="application/json">{payload}</script>'
    html = html.replace("</body>", f"{bootstrap}</body>")
    return HttpResponse(html)


def robots_txt(_request):
    body = """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/v1/account/
Disallow: /api/v1/auth/
Disallow: /api/account/
Disallow: /api/auth/
Sitemap: /sitemap.xml
"""
    response = HttpResponse(body, content_type="text/plain")
    response["Cache-Control"] = "public, max-age=3600"
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
    return HttpResponse(body, content_type="application/xml")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("downloads/iranapi-cli-1.0.0.tgz", cli_download, name="cli-download"),
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
