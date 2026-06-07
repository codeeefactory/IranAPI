from __future__ import annotations

import re
from typing import Any


SENSITIVE_KEYS = {"password", "api_key", "token", "secret", "authorization"}
INLINE_SECRET_RE = re.compile(r"(Bearer\s+)[A-Za-z0-9._~+/=-]{16,}", re.I)


def redact_secrets(value: Any):
    if isinstance(value, dict):
        redacted = {}
        for key, item in value.items():
            if str(key).lower() in SENSITIVE_KEYS:
                redacted[key] = "[REDACTED]"
            else:
                redacted[key] = redact_secrets(item)
        return redacted
    if isinstance(value, list):
        return [redact_secrets(item) for item in value]
    if isinstance(value, tuple):
        return tuple(redact_secrets(item) for item in value)
    if isinstance(value, str):
        return INLINE_SECRET_RE.sub(r"\1[REDACTED]", value)
    return value
