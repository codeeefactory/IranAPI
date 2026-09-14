from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend

from .repositories import MongoRepository


class MongoDeveloperBackend(BaseBackend):
    """Authenticate API developers against the primary Mongo user record."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        user_doc = MongoRepository().authenticate_user(str(username), str(password))
        if not user_doc or user_doc.get("account_type") != "api_developer":
            return None

        user_model = get_user_model()
        existing = user_model.objects.filter(username=user_doc["username"]).first()
        if existing and existing.is_superuser:
            return None

        user = existing or user_model(username=user_doc["username"])
        user.email = user_doc.get("email", "")
        user.first_name = user_doc.get("first_name", "")
        user.last_name = user_doc.get("last_name", "")
        user.is_active = bool(user_doc.get("is_active", True))
        user.is_staff = True
        user.is_superuser = False
        user.set_unusable_password()
        user.save()
        return user

    def get_user(self, user_id):
        user_model = get_user_model()
        try:
            return user_model.objects.get(pk=user_id)
        except user_model.DoesNotExist:
            return None
