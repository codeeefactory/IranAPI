from django.contrib.auth import get_user_model

User = get_user_model()
user, created = User.objects.get_or_create(
    username="live-e2e-260914-1600-superuser",
    defaults={"email": "e2e@example.test"},
)
user.is_staff = True
user.is_superuser = True
user.set_password("TempAdmin-260914-X")
user.save()
print("created" if created else "updated")
