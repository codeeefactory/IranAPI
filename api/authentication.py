from rest_framework.authentication import BaseAuthentication

from .repositories import MongoRepository


class MongoSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        repository = MongoRepository()
        header = request.META.get("HTTP_AUTHORIZATION", "")
        if header:
            parts = header.split()
            if len(parts) == 2 and parts[0].lower() in {"token", "bearer"}:
                user_doc = repository.get_user_for_token(parts[1])
                if user_doc:
                    return repository.build_mongo_user(user_doc), None

        session_id = request.COOKIES.get("sessionid", "")
        if session_id:
            user_doc = repository.session_user(session_id)
            if user_doc:
                return repository.build_mongo_user(user_doc), None
        return None
