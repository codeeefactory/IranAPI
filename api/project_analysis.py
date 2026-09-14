from __future__ import annotations

import hashlib
import io
import os
import re
import tarfile
import zipfile
from pathlib import Path, PurePosixPath
from typing import Any, Iterable

from django.conf import settings


MAX_ARCHIVE_BYTES = 25 * 1024 * 1024
MAX_FILE_COUNT = 500
MAX_UNCOMPRESSED_BYTES = 75 * 1024 * 1024
MAX_SOURCE_FILE_BYTES = 1024 * 1024
SUPPORTED_ARCHIVE_SUFFIXES = (".zip", ".tar", ".tar.gz", ".tgz")
DEPLOYABLE_LANGUAGES = {"java", "javascript", "typescript", "python", "cpp", "csharp"}


class ProjectArchiveError(ValueError):
    pass


LANGUAGE_RULES: dict[str, dict[str, tuple[str, ...]]] = {
    "java": {"extensions": (".java",), "markers": ("pom.xml", "build.gradle", "build.gradle.kts")},
    "javascript": {"extensions": (".js", ".mjs", ".cjs"), "markers": ("package.json",)},
    "typescript": {"extensions": (".ts", ".mts", ".cts"), "markers": ("tsconfig.json",)},
    "python": {"extensions": (".py",), "markers": ("requirements.txt", "pyproject.toml", "pipfile")},
    "cpp": {"extensions": (".cpp", ".cc", ".cxx", ".hpp", ".h"), "markers": ("cmakelists.txt", "makefile")},
    "csharp": {"extensions": (".cs", ".csproj", ".sln"), "markers": ("global.json",)},
}

FRAMEWORK_PATTERNS: dict[str, tuple[tuple[str, str], ...]] = {
    "python": (("FastAPI", r"\bfastapi\b|FastAPI\("), ("Flask", r"\bflask\b|Flask\("), ("Django", r"\bdjango\b")),
    "javascript": (("Express", r"\bexpress\b"), ("Fastify", r"\bfastify\b"), ("NestJS", r"@nestjs/")),
    "typescript": (("Express", r"\bexpress\b"), ("Fastify", r"\bfastify\b"), ("NestJS", r"@nestjs/")),
    "java": (("Spring Boot", r"spring-boot|@RestController|@RequestMapping"), ("Javalin", r"\bjavalin\b")),
    "cpp": (("Crow", r"CROW_ROUTE|crow_all\.h"), ("Drogon", r"drogon"), ("Pistache", r"pistache")),
    "csharp": (("ASP.NET Core", r"Microsoft\.AspNetCore|Map(Get|Post|Put|Patch|Delete)\("),),
}

SECRET_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("private_key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----")),
    ("aws_access_key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("github_token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b")),
    ("telegram_bot_token", re.compile(r"\b\d{8,12}:[A-Za-z0-9_-]{30,}\b")),
)

ROUTE_PATTERNS: dict[str, tuple[re.Pattern[str], ...]] = {
    "python": (
        re.compile(r"@(?:app|router|api)\.(get|post|put|patch|delete)\(\s*[fr]?['\"]([^'\"]+)", re.I),
        re.compile(r"@(?:app|blueprint)\.route\(\s*[fr]?['\"]([^'\"]+)['\"](?:[^\n]*methods\s*=\s*\[['\"](GET|POST|PUT|PATCH|DELETE))?", re.I),
    ),
    "javascript": (re.compile(r"\b(?:app|router|server)\.(get|post|put|patch|delete)\(\s*[`'\"]([^`'\"]+)", re.I),),
    "typescript": (re.compile(r"\b(?:app|router|server)\.(get|post|put|patch|delete)\(\s*[`'\"]([^`'\"]+)", re.I),),
    "java": (
        re.compile(r"@(Get|Post|Put|Patch|Delete)Mapping\(\s*(?:value\s*=\s*)?['\"]([^'\"]+)", re.I),
        re.compile(r"@RequestMapping\(\s*(?:value\s*=\s*)?['\"]([^'\"]+)", re.I),
    ),
    "cpp": (re.compile(r"CROW_ROUTE\([^,]+,\s*['\"]([^'\"]+)['\"]\)(?:\.methods\([^\n]*?(GET|POST|PUT|PATCH|DELETE))?", re.I),),
    "csharp": (
        re.compile(r"\.Map(Get|Post|Put|Patch|Delete)\(\s*['\"]([^'\"]+)", re.I),
        re.compile(r"\[Http(Get|Post|Put|Patch|Delete)(?:\(\s*['\"]([^'\"]*)['\"])?", re.I),
    ),
}


def _safe_member_name(raw_name: str) -> str:
    normalized = raw_name.replace("\\", "/")
    while normalized.startswith("./"):
        normalized = normalized[2:]
    path = PurePosixPath(normalized)
    if not normalized or path.is_absolute() or ".." in path.parts or ":" in path.parts[0] or "\x00" in normalized:
        raise ProjectArchiveError("Archive contains an unsafe file path.")
    return str(path)


def _read_zip(data: bytes) -> tuple[list[tuple[str, bytes]], int]:
    files: list[tuple[str, bytes]] = []
    total = 0
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            members = [member for member in archive.infolist() if not member.is_dir()]
            if len(members) > MAX_FILE_COUNT:
                raise ProjectArchiveError(f"Archive may contain at most {MAX_FILE_COUNT} files.")
            for member in members:
                name = _safe_member_name(member.filename)
                mode = member.external_attr >> 16
                if mode and (mode & 0o170000) == 0o120000:
                    raise ProjectArchiveError("Archive symbolic links are not allowed.")
                total += int(member.file_size)
                if total > MAX_UNCOMPRESSED_BYTES:
                    raise ProjectArchiveError("Archive expands beyond the allowed size.")
                content = archive.read(member) if member.file_size <= MAX_SOURCE_FILE_BYTES else b""
                files.append((name, content))
    except zipfile.BadZipFile as exc:
        raise ProjectArchiveError("Uploaded ZIP archive is invalid.") from exc
    return files, total


def _read_tar(data: bytes) -> tuple[list[tuple[str, bytes]], int]:
    files: list[tuple[str, bytes]] = []
    total = 0
    try:
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:*") as archive:
            members = [member for member in archive.getmembers() if member.isfile() or member.issym() or member.islnk()]
            if len(members) > MAX_FILE_COUNT:
                raise ProjectArchiveError(f"Archive may contain at most {MAX_FILE_COUNT} files.")
            for member in members:
                name = _safe_member_name(member.name)
                if member.issym() or member.islnk():
                    raise ProjectArchiveError("Archive links are not allowed.")
                total += int(member.size)
                if total > MAX_UNCOMPRESSED_BYTES:
                    raise ProjectArchiveError("Archive expands beyond the allowed size.")
                source = archive.extractfile(member) if member.size <= MAX_SOURCE_FILE_BYTES else None
                files.append((name, source.read() if source else b""))
    except (tarfile.TarError, EOFError) as exc:
        raise ProjectArchiveError("Uploaded TAR archive is invalid.") from exc
    return files, total


def _decode_sources(files: Iterable[tuple[str, bytes]]) -> dict[str, str]:
    sources: dict[str, str] = {}
    for name, content in files:
        if not content or b"\x00" in content[:4096]:
            continue
        try:
            sources[name] = content.decode("utf-8")
        except UnicodeDecodeError:
            continue
    return sources


def _detect_language(paths: list[str]) -> tuple[str, float, dict[str, int]]:
    lowered = [path.lower() for path in paths]
    scores: dict[str, int] = {language: 0 for language in LANGUAGE_RULES}
    for language, rules in LANGUAGE_RULES.items():
        for path in lowered:
            name = PurePosixPath(path).name
            if any(path.endswith(extension) for extension in rules["extensions"]):
                scores[language] += 2
            if name in rules["markers"]:
                scores[language] += 6
    if scores["typescript"]:
        scores["javascript"] = max(0, scores["javascript"] - 2)
    language, top_score = max(scores.items(), key=lambda item: item[1])
    if top_score == 0:
        return "unknown", 0.0, scores
    total = sum(scores.values()) or top_score
    confidence = min(0.99, round(0.55 + (top_score / total) * 0.44, 2))
    return language, confidence, scores


def _detect_frameworks(language: str, sources: dict[str, str]) -> list[str]:
    corpus = "\n".join(sources.values())[:5_000_000]
    return [name for name, pattern in FRAMEWORK_PATTERNS.get(language, ()) if re.search(pattern, corpus, re.I)]


def _detect_routes(language: str, sources: dict[str, str]) -> list[dict[str, str]]:
    routes: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for source_path, content in sources.items():
        for pattern in ROUTE_PATTERNS.get(language, ()):
            for match in pattern.finditer(content):
                first = (match.group(1) or "").upper()
                second = match.group(2) or ""
                if first.startswith("/"):
                    path, method = first, second.upper() or "GET"
                else:
                    method, path = first.replace("MAPPING", ""), second or "/"
                method = method if method in {"GET", "POST", "PUT", "PATCH", "DELETE"} else "GET"
                path = path if path.startswith("/") else f"/{path}"
                key = (method, path)
                if key not in seen:
                    seen.add(key)
                    routes.append({"method": method, "path": path, "source": source_path})
                if len(routes) >= 100:
                    return routes
    return routes


def _detect_entrypoints(language: str, paths: list[str]) -> list[str]:
    candidates = {
        "python": ("main.py", "app.py", "manage.py", "wsgi.py", "asgi.py"),
        "javascript": ("server.js", "index.js", "app.js", "main.js"),
        "typescript": ("server.ts", "index.ts", "app.ts", "main.ts"),
        "java": ("application.java",),
        "cpp": ("main.cpp", "main.cc", "main.cxx"),
        "csharp": ("program.cs",),
    }.get(language, ())
    return [path for path in paths if PurePosixPath(path.lower()).name in candidates or (language == "java" and path.lower().endswith("application.java"))][:20]


def _detect_secret_findings(sources: dict[str, str]) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    for path, content in sources.items():
        name = PurePosixPath(path.lower()).name
        if name in {".env", "id_rsa", "id_ed25519"}:
            findings.append({"path": path, "type": "secret_file"})
            continue
        for secret_type, pattern in SECRET_PATTERNS:
            if pattern.search(content):
                findings.append({"path": path, "type": secret_type})
                break
        if len(findings) >= 20:
            break
    return findings


def _start_command(language: str, entrypoints: list[str], frameworks: list[str]) -> str:
    entry = entrypoints[0] if entrypoints else ""
    if language == "python":
        if "FastAPI" in frameworks:
            module = (entry or "main.py").removesuffix(".py").replace("/", ".")
            return f"uvicorn {module}:app --host 0.0.0.0 --port $PORT"
        if "Django" in frameworks or PurePosixPath(entry).name == "manage.py":
            return "python manage.py runserver 0.0.0.0:$PORT"
        return f"python {entry or 'main.py'}"
    if language == "javascript":
        return "npm start"
    if language == "typescript":
        return "npm run build && npm start"
    if language == "java":
        return "java -jar target/*.jar"
    if language == "cpp":
        return "cmake -S . -B build && cmake --build build && ./build/server"
    if language == "csharp":
        return "dotnet run --urls http://0.0.0.0:$PORT"
    return ""


def _detect_port(language: str, sources: dict[str, str]) -> int:
    corpus = "\n".join(sources.values())[:5_000_000]
    patterns = (
        r"\bEXPOSE\s+(\d{2,5})",
        r"\bserver\.port\s*=\s*(\d{2,5})",
        r"\.listen\(\s*(?:process\.env\.PORT\s*\|\|\s*)?(\d{2,5})",
        r"\.port\(\s*(\d{2,5})",
        r"\bPORT\b[^\n]{0,40}(?:\|\||=|:)\s*['\"]?(\d{2,5})",
    )
    for pattern in patterns:
        match = re.search(pattern, corpus, re.I)
        if match:
            port = int(match.group(1))
            if 1024 <= port <= 65535:
                return port
    return {
        "python": 8000,
        "javascript": 3000,
        "typescript": 3000,
        "java": 8080,
        "cpp": 8080,
        "csharp": 8080,
    }.get(language, 8080)


def analyze_project_archive(uploaded_file: Any) -> dict[str, Any]:
    filename = PurePosixPath(str(getattr(uploaded_file, "name", "project.zip")).replace("\\", "/")).name
    lowered_name = filename.lower()
    if not any(lowered_name.endswith(suffix) for suffix in SUPPORTED_ARCHIVE_SUFFIXES):
        raise ProjectArchiveError("Use a .zip, .tar, .tar.gz, or .tgz project archive.")
    data = uploaded_file.read(MAX_ARCHIVE_BYTES + 1)
    try:
        uploaded_file.seek(0)
    except (AttributeError, OSError):
        pass
    if not data:
        raise ProjectArchiveError("Project archive is empty.")
    if len(data) > MAX_ARCHIVE_BYTES:
        raise ProjectArchiveError("Project archive may not exceed 25 MB.")

    archive_format = "zip" if lowered_name.endswith(".zip") else "tar"
    files, total_uncompressed = _read_zip(data) if archive_format == "zip" else _read_tar(data)
    if not files:
        raise ProjectArchiveError("Project archive contains no files.")
    paths = [name for name, _content in files]
    sources = _decode_sources(files)
    language, confidence, scores = _detect_language(paths)
    frameworks = _detect_frameworks(language, sources)
    entrypoints = _detect_entrypoints(language, paths)
    routes = _detect_routes(language, sources)
    manifests = [
        path
        for path in paths
        if PurePosixPath(path.lower()).name
        in {"package.json", "tsconfig.json", "requirements.txt", "pyproject.toml", "pom.xml", "build.gradle", "build.gradle.kts", "cmakelists.txt", "makefile", "global.json"}
        or path.lower().endswith((".csproj", ".sln"))
    ]
    dockerfiles = [path for path in paths if PurePosixPath(path).name.lower() in {"dockerfile", "containerfile"}]
    secret_findings = _detect_secret_findings(sources)
    port = _detect_port(language, sources)
    warnings: list[str] = []
    if language not in DEPLOYABLE_LANGUAGES:
        warnings.append("Language was not recognized as one of the six managed runtimes.")
    if not entrypoints and not dockerfiles:
        warnings.append("No conventional entrypoint or Dockerfile was found.")
    if not routes:
        warnings.append("No HTTP routes were detected statically; dynamic routes may still work.")
    if secret_findings:
        warnings.append("Archive contains potential hard-coded credentials; remove them before deployment.")

    return {
        "filename": filename,
        "fingerprint": hashlib.sha256(data).hexdigest(),
        "archive_format": archive_format,
        "archive_size": len(data),
        "file_count": len(files),
        "uncompressed_size": total_uncompressed,
        "language": language,
        "language_confidence": confidence,
        "language_scores": scores,
        "frameworks": frameworks,
        "entrypoints": entrypoints,
        "manifest_files": manifests[:30],
        "dockerfiles": dockerfiles,
        "routes": routes,
        "warnings": warnings,
        "security": {"secret_findings": secret_findings},
        "deployment": {
            "ready": language in DEPLOYABLE_LANGUAGES and bool(entrypoints or dockerfiles) and not secret_findings,
            "runtime": language,
            "builder": "dockerfile" if dockerfiles else "buildpack",
            "start_command": _start_command(language, entrypoints, frameworks),
            "port": port,
        },
    }


def store_project_archive(uploaded_file: Any, *, user_id: int, fingerprint: str) -> str:
    root = Path(getattr(settings, "PROJECT_ARCHIVE_ROOT", settings.BASE_DIR / ".data" / "project-archives"))
    user_root = root / str(int(user_id))
    user_root.mkdir(parents=True, exist_ok=True)
    suffixes = "".join(Path(str(getattr(uploaded_file, "name", "project.zip"))).suffixes[-2:]) or ".zip"
    target = (user_root / f"{fingerprint}{suffixes.lower()}").resolve()
    if user_root.resolve() not in target.parents:
        raise ProjectArchiveError("Archive storage path is invalid.")
    data = uploaded_file.read(MAX_ARCHIVE_BYTES + 1)
    try:
        uploaded_file.seek(0)
    except (AttributeError, OSError):
        pass
    if len(data) > MAX_ARCHIVE_BYTES:
        raise ProjectArchiveError("Project archive may not exceed 25 MB.")
    temporary = target.with_suffix(target.suffix + ".tmp")
    with temporary.open("wb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    temporary.replace(target)
    return str(target)
