from __future__ import annotations

import http.client
import ipaddress
import json
import os
import re
import socket
import ssl
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import parse_qsl, quote, unquote, urlencode, urlsplit, urlunsplit

from django.conf import settings
from rest_framework.exceptions import APIException, ValidationError


_PLACEHOLDER_RE = re.compile(r"\{([A-Za-z_][A-Za-z0-9_]*)\}")
_ALLOWED_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}
_HEADER_NAME_RE = re.compile(r"[!#$%&'*+.^_`|~0-9A-Za-z-]+")
_FORBIDDEN_HEADERS = {
    "connection",
    "content-length",
    "cookie",
    "expect",
    "host",
    "proxy-authorization",
    "proxy-connection",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
}


class CallerProviderNotConfigured(APIException):
    status_code = 503
    default_code = "caller_provider_not_configured"
    default_detail = "Provider credentials are not configured on the server."


class CallerUpstreamError(APIException):
    status_code = 502
    default_code = "caller_upstream_error"
    default_detail = "Provider request failed."


class CallerUpstreamTimeout(APIException):
    status_code = 504
    default_code = "caller_upstream_timeout"
    default_detail = "Provider request timed out."


@dataclass(frozen=True)
class CallerResult:
    status_code: int
    latency_ms: int
    body: Any
    response_size: int
    content_type: str


@dataclass(frozen=True)
class PreparedRequest:
    scheme: str
    hostname: str
    port: int
    target: str
    method: str
    headers: dict[str, str]
    body: bytes | None


def get_provider_config(api_slug: str) -> dict[str, Any]:
    config = getattr(settings, "CALLER_PROVIDERS", {}).get(api_slug)
    if not config:
        raise CallerProviderNotConfigured("This catalog API is not enabled for live caller requests.")
    return dict(config)


def _credential(config: dict[str, Any]) -> str:
    env_name = str(config.get("credential_env") or "").strip()
    if not env_name:
        return ""
    value = os.environ.get(env_name, "").strip()
    if not value:
        raise CallerProviderNotConfigured(
            f"Provider credential is missing. Configure server environment variable {env_name}."
        )
    return value


def _validate_endpoint_path(path: str) -> str:
    decoded_path = unquote(path)
    if (
        not path.startswith("/")
        or path.startswith("//")
        or "\\" in decoded_path
        or "?" in decoded_path
        or "#" in decoded_path
        or any(ord(character) < 32 or ord(character) == 127 for character in decoded_path)
    ):
        raise ValidationError("Catalog endpoint path is invalid.")
    if any(segment in {".", ".."} for segment in decoded_path.split("/")):
        raise ValidationError("Catalog endpoint path is invalid.")
    return path


def _render_endpoint_path(
    template: str,
    path_params: dict[str, Any],
    *,
    auth_placeholder: str,
    credential: str,
) -> str:
    template = _validate_endpoint_path(template)
    safe_params = {str(key): str(value) for key, value in path_params.items() if value is not None}
    if auth_placeholder:
        safe_params[auth_placeholder] = credential

    missing = [name for name in _PLACEHOLDER_RE.findall(template) if name not in safe_params]
    if missing:
        raise ValidationError({"path_params": [f"Missing path parameter: {missing[0]}"]})

    return _PLACEHOLDER_RE.sub(lambda match: quote(safe_params[match.group(1)], safe=""), template)


def _normalize_query(query: dict[str, Any]) -> list[tuple[str, Any]]:
    if len(query) > 50:
        raise ValidationError({"query": ["Too many query parameters."]})

    normalized: list[tuple[str, Any]] = []
    for raw_key, raw_value in query.items():
        key = str(raw_key)
        if not key or len(key) > 100:
            raise ValidationError({"query": ["Query parameter name is invalid."]})
        values = raw_value if isinstance(raw_value, list) else [raw_value]
        if len(values) > 50:
            raise ValidationError({"query": [f"Too many values for query parameter {key}."]})
        for value in values:
            if value is None:
                continue
            if not isinstance(value, (str, int, float, bool)):
                raise ValidationError({"query": [f"Query parameter {key} must contain scalar values."]})
            text = str(value)
            if len(text) > 2000:
                raise ValidationError({"query": [f"Query parameter {key} is too long."]})
            normalized.append((key, text))
    return normalized


def prepare_provider_request(
    *,
    config: dict[str, Any],
    endpoint: dict[str, Any],
    method: str,
    body: Any = None,
    query: dict[str, Any] | None = None,
    path_params: dict[str, Any] | None = None,
) -> PreparedRequest:
    method = method.upper()
    endpoint_method = str(endpoint.get("method") or "GET").upper()
    if method not in _ALLOWED_METHODS or method != endpoint_method:
        raise ValidationError({"method": [f"Method must match catalog endpoint: {endpoint_method}."]})

    credential = _credential(config)
    auth = dict(config.get("auth") or {})
    auth_type = str(auth.get("type") or "none")
    auth_placeholder = str(auth.get("placeholder") or "") if auth_type == "path" else ""
    rendered_path = _render_endpoint_path(
        str(endpoint.get("path") or "/"),
        path_params or {},
        auth_placeholder=auth_placeholder,
        credential=credential,
    )

    base = urlsplit(str(config.get("base_url") or ""))
    expected_host = str(config.get("hostname") or "").lower()
    if (
        base.scheme != "https"
        or not base.hostname
        or base.hostname.lower() != expected_host
        or base.username
        or base.password
        or base.fragment
        or (base.port not in {None, 443})
    ):
        raise CallerProviderNotConfigured("Provider destination configuration is invalid.")

    target_path = f"{base.path.rstrip('/')}/{rendered_path.lstrip('/')}"
    query_pairs = _normalize_query(query or {})
    target = urlunsplit(("", "", target_path, urlencode(query_pairs, doseq=True), ""))
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "identity",
        "Host": expected_host,
        "User-Agent": "IranAPI-Caller/1.0",
    }

    if auth_type == "header":
        header_name = str(auth.get("name") or "").strip()
        if not header_name or not re.fullmatch(r"[A-Za-z0-9-]+", header_name):
            raise CallerProviderNotConfigured("Provider authentication configuration is invalid.")
        headers[header_name] = f"{auth.get('prefix', '')}{credential}"
    elif auth_type == "json_field":
        field_name = str(auth.get("name") or "").strip()
        if not isinstance(body, dict) or not field_name:
            raise ValidationError({"body": ["Provider request body must be a JSON object."]})
        body = {**body, field_name: credential}
    elif auth_type not in {"none", "path"}:
        raise CallerProviderNotConfigured("Provider authentication configuration is invalid.")

    encoded_body: bytes | None = None
    if body is not None and method not in {"GET", "DELETE"}:
        encoding = str(config.get("body_encoding") or "json")
        if encoding == "form":
            if not isinstance(body, dict):
                raise ValidationError({"body": ["Provider request body must be an object."]})
            encoded_body = urlencode(_normalize_query(body), doseq=True).encode("utf-8")
            headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8"
        elif encoding == "json":
            encoded_body = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            headers["Content-Type"] = "application/json; charset=utf-8"
        else:
            raise CallerProviderNotConfigured("Provider body encoding configuration is invalid.")

    max_request_bytes = int(getattr(settings, "CALLER_MAX_REQUEST_BYTES", 64 * 1024))
    if encoded_body is not None and len(encoded_body) > max_request_bytes:
        raise ValidationError({"body": ["Provider request body is too large."]})
    if encoded_body is not None:
        headers["Content-Length"] = str(len(encoded_body))

    return PreparedRequest(
        scheme="https",
        hostname=expected_host,
        port=443,
        target=target,
        method=method,
        headers=headers,
        body=encoded_body,
    )


def _normalize_headers(headers: dict[str, Any]) -> dict[str, str]:
    if len(headers) > 30:
        raise ValidationError({"headers": ["Too many request headers."]})

    normalized: dict[str, str] = {}
    total_size = 0
    for raw_name, raw_value in headers.items():
        name = str(raw_name).strip()
        value = str(raw_value)
        if not name or not _HEADER_NAME_RE.fullmatch(name) or name.lower() in _FORBIDDEN_HEADERS:
            raise ValidationError({"headers": [f"Request header is not allowed: {name or '(empty)' }."]})
        if "\r" in value or "\n" in value or len(value) > 4096:
            raise ValidationError({"headers": [f"Request header value is invalid: {name}."]})
        total_size += len(name) + len(value)
        if total_size > 16 * 1024:
            raise ValidationError({"headers": ["Request headers are too large."]})
        normalized[name] = value
    return normalized


def prepare_public_request(
    *,
    url: str,
    method: str,
    headers: dict[str, Any] | None = None,
    body: Any = None,
    query: dict[str, Any] | None = None,
) -> PreparedRequest:
    method = method.upper()
    if method not in _ALLOWED_METHODS:
        raise ValidationError({"method": ["Unsupported HTTP method."]})
    if "\\" in url or any(ord(character) < 32 or ord(character) == 127 for character in url):
        raise ValidationError({"url": ["URL is invalid."]})

    try:
        parsed = urlsplit(url)
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
    except ValueError as exc:
        raise ValidationError({"url": ["URL is invalid."]}) from exc
    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.fragment
    ):
        raise ValidationError({"url": ["Use a public HTTP(S) URL without credentials or a fragment."]})

    try:
        hostname = parsed.hostname.encode("idna").decode("ascii").lower()
    except UnicodeError as exc:
        raise ValidationError({"url": ["URL hostname is invalid."]}) from exc

    query_pairs = parse_qsl(parsed.query, keep_blank_values=True)
    query_pairs.extend(_normalize_query(query or {}))
    target = urlunsplit(("", "", parsed.path or "/", urlencode(query_pairs, doseq=True), ""))
    default_port = 443 if parsed.scheme == "https" else 80
    host_header = hostname if port == default_port else f"{hostname}:{port}"
    request_headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "identity",
        "Host": host_header,
        "User-Agent": "IranAPI-Public-Caller/1.0",
        **_normalize_headers(headers or {}),
    }

    encoded_body: bytes | None = None
    if body is not None and method not in {"GET", "DELETE"}:
        encoded_body = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        if not any(name.lower() == "content-type" for name in request_headers):
            request_headers["Content-Type"] = "application/json; charset=utf-8"

    max_request_bytes = int(getattr(settings, "CALLER_MAX_REQUEST_BYTES", 64 * 1024))
    if encoded_body is not None and len(encoded_body) > max_request_bytes:
        raise ValidationError({"body": ["Request body is too large."]})
    if encoded_body is not None:
        request_headers["Content-Length"] = str(len(encoded_body))

    return PreparedRequest(
        scheme=parsed.scheme,
        hostname=hostname,
        port=port,
        target=target,
        method=method,
        headers=request_headers,
        body=encoded_body,
    )


def resolve_public_addresses(hostname: str, port: int) -> list[tuple[int, tuple[Any, ...]]]:
    answers = None
    resolution_error: socket.gaierror | None = None
    for attempt in range(2):
        try:
            answers = socket.getaddrinfo(hostname, port, type=socket.SOCK_STREAM)
            break
        except socket.gaierror as exc:
            resolution_error = exc
            if attempt == 0:
                time.sleep(0.1)
    if answers is None:
        raise CallerUpstreamError("Provider hostname could not be resolved.") from resolution_error

    resolved: list[tuple[int, tuple[Any, ...]]] = []
    seen: set[tuple[int, str]] = set()
    for family, socktype, _proto, _canonname, sockaddr in answers:
        if socktype != socket.SOCK_STREAM or family not in {socket.AF_INET, socket.AF_INET6}:
            continue
        address = str(sockaddr[0])
        key = (family, address)
        if key in seen:
            continue
        seen.add(key)
        if not ipaddress.ip_address(address).is_global:
            raise CallerUpstreamError("Provider resolved to a non-public network address.")
        resolved.append((family, sockaddr))

    if not resolved:
        raise CallerUpstreamError("Provider hostname has no public network address.")
    return resolved


def _decode_body(raw: bytes, content_type: str) -> Any:
    charset = "utf-8"
    for part in content_type.split(";")[1:]:
        name, separator, value = part.strip().partition("=")
        if separator and name.lower() == "charset" and value:
            charset = value.strip('"')
            break
    try:
        text = raw.decode(charset, errors="replace")
    except LookupError:
        text = raw.decode("utf-8", errors="replace")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def _execute_prepared_request(prepared: PreparedRequest) -> CallerResult:
    addresses = resolve_public_addresses(prepared.hostname, prepared.port)
    connect_timeout = float(getattr(settings, "CALLER_CONNECT_TIMEOUT_SECONDS", 4.0))
    read_timeout = float(getattr(settings, "CALLER_READ_TIMEOUT_SECONDS", 8.0))
    max_response_bytes = int(getattr(settings, "CALLER_MAX_RESPONSE_BYTES", 512 * 1024))
    tls_context = ssl.create_default_context()
    started = time.perf_counter()
    last_error: OSError | ssl.SSLError | None = None

    for family, sockaddr in addresses:
        raw_socket: socket.socket | None = None
        tls_socket: ssl.SSLSocket | None = None
        connection: http.client.HTTPConnection | None = None
        try:
            raw_socket = socket.socket(family, socket.SOCK_STREAM)
            raw_socket.settimeout(connect_timeout)
            raw_socket.connect(sockaddr)
            if prepared.scheme == "https":
                tls_socket = tls_context.wrap_socket(raw_socket, server_hostname=prepared.hostname)
                tls_socket.settimeout(read_timeout)
            connection = http.client.HTTPConnection(prepared.hostname, prepared.port, timeout=read_timeout)
            connection.sock = tls_socket or raw_socket
            connection.request(
                prepared.method,
                prepared.target,
                body=prepared.body,
                headers=prepared.headers,
            )
            response = connection.getresponse()
            raw = response.read(max_response_bytes + 1)
            if len(raw) > max_response_bytes:
                raise CallerUpstreamError("Provider response exceeded the configured size limit.")
            content_type = response.getheader("Content-Type", "application/octet-stream")
            latency_ms = max(round((time.perf_counter() - started) * 1000), 1)
            return CallerResult(
                status_code=int(response.status),
                latency_ms=latency_ms,
                body=_decode_body(raw, content_type),
                response_size=len(raw),
                content_type=content_type,
            )
        except (TimeoutError, socket.timeout) as exc:
            raise CallerUpstreamTimeout() from exc
        except CallerUpstreamError:
            raise
        except (OSError, ssl.SSLError, http.client.HTTPException) as exc:
            last_error = exc
        finally:
            if connection is not None:
                connection.close()
            elif tls_socket is not None:
                tls_socket.close()
            elif raw_socket is not None:
                raw_socket.close()

    raise CallerUpstreamError() from last_error


def execute_provider_request(
    *,
    config: dict[str, Any],
    endpoint: dict[str, Any],
    method: str,
    body: Any = None,
    query: dict[str, Any] | None = None,
    path_params: dict[str, Any] | None = None,
) -> CallerResult:
    return _execute_prepared_request(
        prepare_provider_request(
            config=config,
            endpoint=endpoint,
            method=method,
            body=body,
            query=query,
            path_params=path_params,
        )
    )


def execute_public_request(
    *,
    url: str,
    method: str,
    headers: dict[str, Any] | None = None,
    body: Any = None,
    query: dict[str, Any] | None = None,
) -> CallerResult:
    return _execute_prepared_request(
        prepare_public_request(url=url, method=method, headers=headers, body=body, query=query)
    )
