from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("api", "0005_livedataconsole")]

    operations = [
        migrations.CreateModel(
            name="CategoriesSection",
            fields=[],
            options={"verbose_name": "دسته‌بندی", "verbose_name_plural": "دسته‌بندی‌ها", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="ApisSection",
            fields=[],
            options={"verbose_name": "API", "verbose_name_plural": "APIها", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="PricingPlansSection",
            fields=[],
            options={"verbose_name": "پلن قیمت API", "verbose_name_plural": "پلن‌های قیمت API", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="SubscriptionPlansSection",
            fields=[],
            options={"verbose_name": "پلن اشتراک", "verbose_name_plural": "پلن‌های اشتراک", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="DocumentationsSection",
            fields=[],
            options={"verbose_name": "مستند", "verbose_name_plural": "مستندات", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="ApiEndpointsSection",
            fields=[],
            options={"verbose_name": "Endpoint", "verbose_name_plural": "Endpointها", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="AccessGrantsSection",
            fields=[],
            options={"verbose_name": "دسترسی", "verbose_name_plural": "دسترسی‌ها", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="UserSubscriptionsSection",
            fields=[],
            options={"verbose_name": "اشتراک کاربر", "verbose_name_plural": "اشتراک کاربران", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="SubscriptionCheckoutsSection",
            fields=[],
            options={"verbose_name": "پرداخت اشتراک", "verbose_name_plural": "پرداخت‌های اشتراک", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="OrganizationsSection",
            fields=[],
            options={"verbose_name": "سازمان", "verbose_name_plural": "سازمان‌ها", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="StudioFlowsSection",
            fields=[],
            options={"verbose_name": "Flow استودیو", "verbose_name_plural": "Flowهای Studio", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="ApiProjectsSection",
            fields=[],
            options={"verbose_name": "پروژه تولیدشده", "verbose_name_plural": "پروژه‌های تولیدشده", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
        migrations.CreateModel(
            name="ApiUsageSection",
            fields=[],
            options={"verbose_name": "مصرف API", "verbose_name_plural": "مصرف API", "proxy": True, "indexes": [], "constraints": []},
            bases=("api.category",),
        ),
    ]
