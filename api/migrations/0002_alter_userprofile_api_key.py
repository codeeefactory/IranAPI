# Generated manually to fix api_key unique constraint issue

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='api_key',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True, verbose_name='کلید API'),
        ),
    ]


