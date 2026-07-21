from __future__ import annotations


def _error_response(description: str) -> dict:
    return {
        "description": description,
        "content": {
            "application/json": {
                "example": {
                    "error": {
                        "code": "validation_error",
                        "message": "درخواست نامعتبر بود.",
                        "details": {},
                        "request_id": "request-id",
                    }
                }
            }
        },
    }


def _paginated(description: str, item_example: dict) -> dict:
    return {
        "description": description,
        "content": {
            "application/json": {
                "example": {
                    "count": 1,
                    "next": None,
                    "previous": None,
                    "results": [item_example],
                }
            }
        },
    }


def build_openapi_schema() -> dict:
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "IranAPI",
            "version": "1.0.0",
            "description": (
                "MongoDB-backed API surface for the IranAPI vault and developer portal. "
                "Secrets are masked in profile payloads; managed credentials should never be stored in clients."
            ),
        },
        "tags": [
            {"name": "System", "description": "Health and platform metadata."},
            {"name": "Auth", "description": "Session-based account access."},
            {"name": "Catalog", "description": "API discovery, categories, plans, docs, and ratings."},
            {"name": "Account", "description": "Private developer vault, access grants, and usage data."},
        ],
        "paths": {
            "/api/v1/system/health/": {
                "get": {
                    "tags": ["System"],
                    "summary": "Health check",
                    "responses": {
                        "200": {
                            "description": "Service health response",
                            "content": {"application/json": {"example": {"status": "ok", "timestamp": "2026-05-17T00:00:00Z"}}},
                        }
                    },
                }
            },
            "/api/v1/auth/session/": {
                "get": {
                    "tags": ["Auth"],
                    "summary": "Fetch current session",
                    "responses": {"200": {"description": "Current session payload; API keys are masked when present."}},
                },
            },
            "/api/v1/auth/register/": {
                "post": {
                    "tags": ["Auth"],
                    "summary": "Register a new account",
                    "responses": {"201": {"description": "Session created."}, "400": _error_response("Validation failed.")},
                },
            },
            "/api/v1/auth/login/": {
                "post": {
                    "tags": ["Auth"],
                    "summary": "Sign in with username and password",
                    "responses": {"200": {"description": "Session created."}, "400": _error_response("Invalid credentials.")},
                },
            },
            "/api/v1/auth/social/providers/": {
                "get": {"tags": ["Auth"], "summary": "List configured social login providers"},
            },
            "/api/v1/auth/social/{provider}/start/": {
                "get": {"tags": ["Auth"], "summary": "Start a configured provider OAuth flow"},
            },
            "/api/v1/auth/logout/": {
                "post": {"tags": ["Auth"], "summary": "Terminate the current session", "security": [{"sessionCookie": []}]},
            },
            "/api/v1/catalog/categories/": {
                "get": {
                    "tags": ["Catalog"],
                    "summary": "List categories",
                    "parameters": [
                        {"name": "search", "in": "query", "schema": {"type": "string"}},
                        {"name": "ordering", "in": "query", "schema": {"type": "string", "enum": ["name", "created_at", "-created_at", "active_apis_count", "-active_apis_count"]}},
                    ],
                    "responses": {"200": _paginated("Categories.", {"id": 1, "name": "AI", "slug": "ai", "apis_count": 3})},
                },
            },
            "/api/v1/catalog/apis/": {
                "get": {
                    "tags": ["Catalog"],
                    "summary": "List APIs",
                    "description": "Search and filter public API cards. Inactive APIs require staff context.",
                    "parameters": [
                        {"name": "search", "in": "query", "schema": {"type": "string"}},
                        {"name": "category", "in": "query", "schema": {"type": "string"}},
                        {"name": "tag", "in": "query", "schema": {"type": "string"}},
                        {"name": "ordering", "in": "query", "schema": {"type": "string", "enum": ["-rating", "-views_count", "-created_at", "name"]}},
                    ],
                    "responses": {"200": _paginated("API summaries.", {"id": 1, "name": "Speech API", "slug": "speech-api", "status": "active", "rapidapi": {"public_auth_scheme": "api_key"}})},
                },
                "post": {
                    "tags": ["Catalog"],
                    "summary": "Release a new API to Explore",
                    "security": [{"sessionCookie": []}, {"legacyToken": []}],
                    "responses": {"201": {"description": "API created as active and published."}, "400": _error_response("Validation failed.")},
                },
            },
            "/api/v1/catalog/apis/{slug}/": {
                "get": {"tags": ["Catalog"], "summary": "Get API details", "responses": {"404": _error_response("API not found.")}},
            },
            "/api/v1/catalog/apis/{slug}/similar/": {
                "get": {"tags": ["Catalog"], "summary": "List similar APIs"},
            },
            "/api/v1/catalog/apis/{slug}/ratings/": {
                "post": {"tags": ["Catalog"], "summary": "Submit or update a rating", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/catalog/apis/{slug}/plans/": {
                "get": {
                    "tags": ["Catalog"],
                    "summary": "List active pricing plans for one API",
                    "responses": {"200": _paginated("Plans for the selected API.", {"id": 1, "name": "Pro", "api_slug": "speech-api"})},
                },
            },
            "/api/v1/catalog/apis/{slug}/docs/": {
                "get": {
                    "tags": ["Catalog"],
                    "summary": "List documentation records for one API",
                    "responses": {"200": _paginated("Documentation for the selected API.", {"id": 1, "title": "Quick start", "api_slug": "speech-api"})},
                },
            },
            "/api/v1/catalog/apis/{slug}/endpoints/": {
                "get": {
                    "tags": ["Catalog"],
                    "summary": "List callable endpoints for one API",
                    "responses": {
                        "200": _paginated(
                            "Endpoint reference for the selected API.",
                            {"id": 1, "method": "POST", "path": "/speech/transcriptions", "group": "Speech"},
                        )
                    },
                },
            },
            "/api/v1/catalog/pricing-plans/": {
                "get": {"tags": ["Catalog"], "summary": "List active pricing plans"},
            },
            "/api/v1/catalog/subscription-plans/": {
                "get": {"tags": ["Catalog"], "summary": "List active user subscription plans"},
            },
            "/api/v1/catalog/documentations/": {
                "get": {
                    "tags": ["Catalog"],
                    "summary": "List active documentation pages",
                    "parameters": [
                        {"name": "api", "in": "query", "schema": {"type": "string"}},
                        {"name": "search", "in": "query", "schema": {"type": "string"}},
                    ],
                },
            },
            "/api/v1/account/user/": {
                "get": {"tags": ["Account"], "summary": "Fetch current user", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
                "patch": {"tags": ["Account"], "summary": "Update current user", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/profile/": {
                "get": {"tags": ["Account"], "summary": "Fetch profile", "description": "Returns masked API key preview only.", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
                "patch": {"tags": ["Account"], "summary": "Update profile", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/api-key/rotate/": {
                "post": {"tags": ["Account"], "summary": "Rotate API key", "description": "Returns the updated profile with a masked API key preview.", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/access/": {
                "get": {"tags": ["Account"], "summary": "List access grants", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/organizations/": {
                "get": {"tags": ["Account"], "summary": "List organizations", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
                "post": {"tags": ["Account"], "summary": "Create an organization", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/subscription/": {
                "get": {"tags": ["Account"], "summary": "Fetch current user subscription", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
                "post": {"tags": ["Account"], "summary": "Create a subscription checkout", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/subscription/checkout/{checkout_id}/": {
                "get": {"tags": ["Account"], "summary": "Fetch a subscription checkout", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
                "delete": {"tags": ["Account"], "summary": "Cancel a pending subscription checkout", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/subscription/checkout/{checkout_id}/confirm/": {
                "post": {"tags": ["Account"], "summary": "Confirm checkout and activate subscription", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/usage/": {
                "get": {"tags": ["Account"], "summary": "List usage summaries", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/usage/stats/": {
                "get": {"tags": ["Account"], "summary": "Get aggregated usage statistics", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/caller/": {
                "post": {"tags": ["Account"], "summary": "Execute a catalog API sample call and record usage", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/studio/flows/": {
                "get": {"tags": ["Account"], "summary": "List deployed Studio flows", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
                "post": {"tags": ["Account"], "summary": "Deploy a Studio flow and record usage", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
            "/api/v1/account/projects/init/": {
                "get": {"tags": ["Account"], "summary": "List initialized API projects and supported language starters", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
                "post": {"tags": ["Account"], "summary": "Initialize an API project starter in a selected language", "security": [{"sessionCookie": []}, {"legacyToken": []}]},
            },
        },
        "components": {
            "securitySchemes": {
                "sessionCookie": {
                    "type": "apiKey",
                    "in": "cookie",
                    "name": "sessionid",
                },
                "legacyToken": {
                    "type": "apiKey",
                    "in": "header",
                    "name": "Authorization",
                    "description": "Legacy compatibility token. Prefer secure session cookies for first-party UI.",
                },
            }
        },
    }
