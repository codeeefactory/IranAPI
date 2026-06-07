from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.utils.html import escape


def frontend_app(request, slug: str | None = None):
    index_path = settings.FRONTEND_DIR / "index.html"
    html = index_path.read_text(encoding="utf-8")
    bootstrap = f'<script id="iranapi-bootstrap-data" type="application/json">{{"slug":"{escape(slug or "")}"}}</script>'
    html = html.replace("</body>", f"{bootstrap}</body>")
    return HttpResponse(html)


def robots_txt(_request):
    return HttpResponse("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n", content_type="text/plain")


def sitemap_xml(_request):
    try:
        from api.repositories import MongoRepository

        urls = "".join(
            f"  <url><loc>http://localhost:8000/api/{api['slug']}</loc></url>\n"
            for api in MongoRepository().list_apis(include_inactive=False)
        )
    except Exception:
        urls = ""
    body = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://localhost:8000/</loc></url>
%s
</urlset>
""" % urls
    return HttpResponse(body, content_type="application/xml")


urlpatterns = [
    path("admin/", admin.site.urls),
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
    urlpatterns.append(path("", frontend_app, name="frontend-root"))
