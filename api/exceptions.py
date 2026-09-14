from rest_framework import status
from rest_framework.exceptions import APIException, NotAuthenticated, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


class DeploymentCapabilityUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = (
        "Project deployment capability is unavailable on this service: "
        "no isolated Docker build worker is connected."
    )
    default_code = "deployment_capability_unavailable"


def _first_error_message(value):
    if isinstance(value, dict):
        if "detail" in value:
            return _first_error_message(value["detail"])
        for nested in value.values():
            return _first_error_message(nested)
    if isinstance(value, (list, tuple)) and value:
        return _first_error_message(value[0])
    return str(value)


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
            "message": _first_error_message(response.data),
            "details": response.data,
        }
    }
    return response
