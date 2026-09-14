from __future__ import annotations

import time

from django.conf import settings
from django.core.management.base import BaseCommand

from api.project_deployer import process_next_deployment


class Command(BaseCommand):
    help = "Process queued API project deployments with the isolated Docker worker."

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true", help="Process at most one queued deployment, then exit.")

    def handle(self, *args, **options):
        poll_seconds = max(1.0, float(getattr(settings, "PROJECT_DEPLOYMENT_POLL_SECONDS", 2.0)))
        while True:
            deployment = process_next_deployment()
            if deployment:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Deployment {deployment.get('slug', deployment.get('_id'))}: {deployment.get('status')}"
                    )
                )
            if options["once"]:
                return
            if not deployment:
                time.sleep(poll_seconds)
