from django.core.management.base import BaseCommand

from api.persian_catalog import seed_persian_api_catalog
from api.repositories import MongoRepository


class Command(BaseCommand):
    help = "Seed curated Iranian API providers, documentation, and endpoint examples."

    def handle(self, *args, **options):
        repository = MongoRepository()
        owner = repository.get_user_by_username("demo-dev")
        result = seed_persian_api_catalog(repository, owner=owner)
        self.stdout.write(
            self.style.SUCCESS(
                "Persian API catalog ready: "
                f"{result['apis']} APIs, {result['categories']} categories, "
                f"{result['endpoints']} endpoints, {result['documentations']} guides."
            )
        )
