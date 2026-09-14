from __future__ import annotations

import json
import shutil
import socket
import subprocess
import tarfile
import tempfile
import time
import zipfile
from pathlib import Path
from typing import Any

from django.conf import settings
from django.utils import timezone

from .project_analysis import (
    MAX_FILE_COUNT,
    MAX_UNCOMPRESSED_BYTES,
    ProjectArchiveError,
    _safe_member_name,
)
from .repositories import MongoRepository


MAX_BUILD_LOG_BYTES = 24_000
STARTUP_STABILITY_SECONDS = 5


class ProjectDeploymentError(RuntimeError):
    pass


def _available_host_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listener:
        listener.bind(("127.0.0.1", 0))
        return int(listener.getsockname()[1])


def _wait_for_startup(docker: str, container_name: str) -> None:
    deadline = time.monotonic() + STARTUP_STABILITY_SECONDS
    while True:
        running = _run(
            [docker, "inspect", "--format", "{{.State.Running}}", container_name],
            timeout=10,
            allow_failure=True,
        ).strip()
        if running.lower() != "true":
            logs = _run([docker, "logs", container_name], timeout=30, allow_failure=True)
            raise ProjectDeploymentError(f"Container exited during startup.\n{logs}")
        if time.monotonic() >= deadline:
            return
        time.sleep(1)


def _write_member(destination: Path, name: str, source: Any, size: int) -> None:
    relative = _safe_member_name(name)
    target = (destination / relative).resolve()
    if destination.resolve() not in target.parents:
        raise ProjectArchiveError("Archive contains an unsafe file path.")
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wb") as output:
        shutil.copyfileobj(source, output, length=1024 * 1024)
    if target.stat().st_size != size:
        raise ProjectArchiveError("Archive member size changed during extraction.")


def extract_project_archive(archive_path: Path, destination: Path) -> None:
    lowered = archive_path.name.lower()
    total = 0
    if lowered.endswith(".zip"):
        with zipfile.ZipFile(archive_path) as archive:
            members = [item for item in archive.infolist() if not item.is_dir()]
            if len(members) > MAX_FILE_COUNT:
                raise ProjectArchiveError(f"Archive may contain at most {MAX_FILE_COUNT} files.")
            for member in members:
                mode = member.external_attr >> 16
                if mode and (mode & 0o170000) == 0o120000:
                    raise ProjectArchiveError("Archive symbolic links are not allowed.")
                total += int(member.file_size)
                if total > MAX_UNCOMPRESSED_BYTES:
                    raise ProjectArchiveError("Archive expands beyond the allowed size.")
                with archive.open(member) as source:
                    _write_member(destination, member.filename, source, int(member.file_size))
        return

    with tarfile.open(archive_path, mode="r:*") as archive:
        members = [item for item in archive.getmembers() if item.isfile() or item.issym() or item.islnk()]
        if len(members) > MAX_FILE_COUNT:
            raise ProjectArchiveError(f"Archive may contain at most {MAX_FILE_COUNT} files.")
        for member in members:
            if member.issym() or member.islnk():
                raise ProjectArchiveError("Archive links are not allowed.")
            total += int(member.size)
            if total > MAX_UNCOMPRESSED_BYTES:
                raise ProjectArchiveError("Archive expands beyond the allowed size.")
            source = archive.extractfile(member)
            if source is None:
                raise ProjectArchiveError("Archive member could not be read.")
            with source:
                _write_member(destination, member.name, source, int(member.size))


def _project_root(extracted: Path) -> Path:
    entries = list(extracted.iterdir())
    return entries[0] if len(entries) == 1 and entries[0].is_dir() else extracted


def _generated_dockerfile(analysis: dict[str, Any]) -> str:
    language = str(analysis.get("language") or "unknown")
    port = int(analysis.get("deployment", {}).get("port") or 8080)
    start = str(analysis.get("deployment", {}).get("start_command") or "")
    shell_command = json.dumps(["sh", "-c", start])
    if language == "python":
        return f'''FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; elif [ -f pyproject.toml ]; then pip install --no-cache-dir .; else pip install --no-cache-dir fastapi uvicorn flask django; fi
ENV PORT={port}
EXPOSE {port}
CMD {shell_command}
'''
    if language in {"javascript", "typescript"}:
        build = "RUN npm run build\n" if language == "typescript" else ""
        return f'''FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
{build}ENV PORT={port}
EXPOSE {port}
CMD {shell_command}
'''
    if language == "java":
        return f'''FROM gradle:8.14-jdk21 AS build
USER root
RUN apt-get update && apt-get install -y --no-install-recommends maven && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN set -eux; mkdir -p /out; \
    if [ -f mvnw ]; then chmod +x mvnw && ./mvnw -DskipTests package && cp target/*.jar /out/app.jar; \
    elif [ -f pom.xml ]; then mvn -DskipTests package && cp target/*.jar /out/app.jar; \
    elif [ -f gradlew ]; then chmod +x gradlew && ./gradlew bootJar -x test && cp build/libs/*.jar /out/app.jar; \
    elif [ -f build.gradle ] || [ -f build.gradle.kts ]; then gradle bootJar -x test && cp build/libs/*.jar /out/app.jar; \
    else echo 'No Maven or Gradle project found.' >&2; exit 1; fi
FROM eclipse-temurin:21-jre
COPY --from=build /out/app.jar /app.jar
ENV PORT={port}
ENV SERVER_PORT={port}
EXPOSE {port}
CMD ["java", "-jar", "/app.jar"]
'''
    if language == "csharp":
        return f'''FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /out
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY --from=build /out /app
WORKDIR /app
ENV PORT={port}
ENV ASPNETCORE_URLS=http://0.0.0.0:{port}
EXPOSE {port}
CMD ["sh", "-c", "dotnet $(find . -maxdepth 1 -name '*.dll' ! -name '*test*' | head -1)"]
'''
    if language == "cpp":
        return f'''FROM gcc:14 AS build
RUN apt-get update && apt-get install -y --no-install-recommends cmake
WORKDIR /src
COPY . .
RUN cmake -S . -B build && cmake --build build --config Release
FROM debian:bookworm-slim
COPY --from=build /src/build /app/build
WORKDIR /app
ENV PORT={port}
EXPOSE {port}
CMD {shell_command}
'''
    raise ProjectDeploymentError("No managed buildpack exists for this project language; add a Dockerfile.")


def _run(command: list[str], *, timeout: int, allow_failure: bool = False) -> str:
    try:
        result = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise ProjectDeploymentError(f"Deployment command failed: {exc}") from exc
    output = f"{result.stdout}\n{result.stderr}".strip()
    if result.returncode and not allow_failure:
        raise ProjectDeploymentError(output[-MAX_BUILD_LOG_BYTES:] or f"Command exited {result.returncode}.")
    return output[-MAX_BUILD_LOG_BYTES:]


def deploy_project(deployment: dict[str, Any]) -> dict[str, Any]:
    docker = shutil.which("docker")
    if not docker:
        raise ProjectDeploymentError("Docker CLI is not available to the deployment worker.")
    archive_path = Path(str(deployment.get("archive_path") or "")).resolve()
    archive_root = Path(settings.PROJECT_ARCHIVE_ROOT).resolve()
    if archive_root not in archive_path.parents or not archive_path.is_file():
        raise ProjectDeploymentError("Deployment archive is missing or outside managed storage.")

    analysis = deployment.get("analysis") or {}
    port = int(analysis.get("deployment", {}).get("port") or 8080)
    deployment_id = int(deployment["_id"])
    fingerprint = str(deployment.get("archive_fingerprint") or "")[:12]
    image_tag = f"iranapi-project-{deployment_id}:{fingerprint or 'latest'}"
    container_name = f"iranapi-deployment-{deployment_id}"
    build_timeout = int(getattr(settings, "PROJECT_DEPLOYMENT_BUILD_TIMEOUT_SECONDS", 900))

    with tempfile.TemporaryDirectory(prefix=f"iranapi-deploy-{deployment_id}-") as temp_name:
        extracted = Path(temp_name)
        extract_project_archive(archive_path, extracted)
        project_root = _project_root(extracted)
        dockerfiles = sorted(
            (path for path in project_root.rglob("*") if path.is_file() and path.name.lower() in {"dockerfile", "containerfile"}),
            key=lambda path: len(path.parts),
        )
        if dockerfiles:
            dockerfile = dockerfiles[0]
            context = project_root
        else:
            dockerfile = project_root / ".iranapi.Dockerfile"
            dockerfile.write_text(_generated_dockerfile(analysis), encoding="utf-8")
            context = project_root

        build_log = _run(
            [docker, "build", "--pull", "--tag", image_tag, "--file", str(dockerfile), str(context)],
            timeout=build_timeout,
        )

    _run([docker, "rm", "--force", container_name], timeout=30, allow_failure=True)
    host_port = _available_host_port()
    container_id = _run(
        [
            docker,
            "run",
            "--detach",
            "--name",
            container_name,
            "--restart",
            "no",
            "--memory",
            str(getattr(settings, "PROJECT_DEPLOYMENT_MEMORY", "512m")),
            "--cpus",
            str(getattr(settings, "PROJECT_DEPLOYMENT_CPUS", "1.0")),
            "--pids-limit",
            "256",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges:true",
            "--tmpfs",
            "/tmp:rw,noexec,nosuid,size=64m",
            "--env",
            f"PORT={port}",
            "--publish",
            f"127.0.0.1:{host_port}:{port}",
            image_tag,
        ],
        timeout=60,
    ).strip()
    _wait_for_startup(docker, container_name)
    _run([docker, "update", "--restart", "unless-stopped", container_name], timeout=30)
    public_host = str(getattr(settings, "PROJECT_DEPLOYMENT_PUBLIC_HOST", "http://localhost")).rstrip("/")
    deployment_url = public_host.format(port=host_port) if "{port}" in public_host else f"{public_host}:{host_port}"
    return {
        "status": "deployed",
        "deployment_url": deployment_url,
        "container_id": container_id,
        "container_name": container_name,
        "image_tag": image_tag,
        "host_port": host_port,
        "build_log": build_log,
        "failure_reason": "",
        "deployed_at": timezone.now(),
    }


def process_next_deployment(repository: MongoRepository | None = None) -> dict[str, Any] | None:
    repo = repository or MongoRepository()
    deployment = repo.claim_next_project_deployment()
    if not deployment:
        return None
    try:
        fields = deploy_project(deployment)
    except Exception as exc:
        failure = str(exc)[-MAX_BUILD_LOG_BYTES:]
        return repo.update_project_deployment(
            int(deployment["_id"]),
            status="failed",
            failure_reason=failure,
            build_log=failure,
        )
    return repo.update_project_deployment(int(deployment["_id"]), **fields)
