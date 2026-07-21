import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_alter_userprofile_api_key"),
    ]

    operations = [
        migrations.AlterField(
            model_name="api",
            name="rating",
            field=models.DecimalField(
                decimal_places=2,
                default=0.0,
                max_digits=3,
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(5),
                ],
                verbose_name="امتیاز",
            ),
        ),
        migrations.AlterField(
            model_name="api",
            name="rating_count",
            field=models.PositiveIntegerField(default=0, verbose_name="تعداد امتیاز"),
        ),
        migrations.AlterField(
            model_name="api",
            name="views_count",
            field=models.PositiveIntegerField(default=0, verbose_name="تعداد بازدید"),
        ),
        migrations.AlterField(
            model_name="apiusage",
            name="requests_count",
            field=models.PositiveIntegerField(default=0, verbose_name="تعداد درخواست"),
        ),
        migrations.AlterField(
            model_name="category",
            name="color",
            field=models.CharField(
                default="#3b82f6",
                max_length=7,
                validators=[
                    django.core.validators.RegexValidator(
                        message="Color must be a valid 6-digit hex value.",
                        regex="^#[0-9A-Fa-f]{6}$",
                    )
                ],
                verbose_name="رنگ",
            ),
        ),
        migrations.AlterField(
            model_name="pricingplan",
            name="requests_per_day",
            field=models.PositiveIntegerField(
                blank=True, null=True, verbose_name="درخواست در روز"
            ),
        ),
        migrations.AlterField(
            model_name="pricingplan",
            name="requests_per_month",
            field=models.PositiveIntegerField(
                blank=True, null=True, verbose_name="درخواست در ماه"
            ),
        ),
        migrations.AlterField(
            model_name="userprofile",
            name="avatar",
            field=models.URLField(blank=True, null=True, verbose_name="آواتار"),
        ),
    ]
