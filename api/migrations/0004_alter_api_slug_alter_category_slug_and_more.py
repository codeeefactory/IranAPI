import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_alter_api_rating_alter_api_rating_count_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="api",
            name="slug",
            field=models.SlugField(allow_unicode=True, blank=True, unique=True),
        ),
        migrations.AlterField(
            model_name="category",
            name="slug",
            field=models.SlugField(allow_unicode=True, blank=True, unique=True),
        ),
        migrations.AlterField(
            model_name="documentation",
            name="order",
            field=models.PositiveIntegerField(default=0, verbose_name="ترتیب"),
        ),
        migrations.AlterField(
            model_name="documentation",
            name="slug",
            field=models.SlugField(allow_unicode=True, blank=True),
        ),
        migrations.AlterField(
            model_name="pricingplan",
            name="currency",
            field=models.CharField(
                default="IRR",
                max_length=3,
                validators=[
                    django.core.validators.RegexValidator(
                        message="Currency must be a 3-letter ISO code.",
                        regex="^[A-Z]{3}$",
                    )
                ],
                verbose_name="ارز",
            ),
        ),
        migrations.AlterField(
            model_name="pricingplan",
            name="price",
            field=models.DecimalField(
                decimal_places=2,
                default=0.0,
                max_digits=10,
                validators=[django.core.validators.MinValueValidator(0)],
                verbose_name="قیمت",
            ),
        ),
    ]
