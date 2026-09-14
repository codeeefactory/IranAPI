from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("api", "0004_alter_api_slug_alter_category_slug_and_more")]
    operations = [
        migrations.CreateModel(
            name="LiveDataConsole",
            fields=[],
            options={
                "verbose_name": "داده زنده",
                "verbose_name_plural": "کنسول داده زنده",
                "proxy": True,
                "indexes": [],
                "constraints": [],
            },
            bases=("api.category",),
        )
    ]
