# Generated by Django 4.1.4 on 2022-12-20 04:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("source", "0003_sourcelabel_sourceholding_created_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="source",
            name="wallet_address",
        ),
        migrations.AddField(
            model_name="sourceholding",
            name="wallet_address",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
