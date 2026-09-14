from django.conf import settings


class RequestContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)


class PublicFrontendGZipMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)


class SecurityHeadersMiddleware:
    """Apply browser security policy and explicit UTF-8 metadata to responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        csp = (
            settings.ADMIN_CONTENT_SECURITY_POLICY
            if request.path.startswith("/admin/")
            else settings.CONTENT_SECURITY_POLICY
        )
        response.setdefault("Content-Security-Policy", csp)
        response.setdefault("Permissions-Policy", settings.PERMISSIONS_POLICY)
        content_type = response.get("Content-Type", "")
        media_type = content_type.split(";", 1)[0].strip().lower()
        if media_type in {
            "text/html",
            "text/plain",
            "text/css",
            "application/javascript",
            "application/json",
            "application/xml",
            "image/svg+xml",
        } and "charset=" not in content_type.lower():
            response["Content-Type"] = f"{media_type}; charset=utf-8"
        return response
