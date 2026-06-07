from rest_framework import status
from rest_framework.exceptions import NotAuthenticated, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, ValidationError):
        code = "validation_error"
    elif isinstance(exc, NotAuthenticated):
        code = "not_authenticated"
    elif isinstance(exc, PermissionDenied):
        code = "permission_denied"
    else:
        code = getattr(getattr(exc, "default_code", None), "value", None) or getattr(exc, "default_code", "error")

    response.data = {
        "error": {
            "code": code,
            "message": str(response.data.get("detail", exc)) if isinstance(response.data, dict) else str(exc),
            "details": response.data,
        }
    }
    return response
