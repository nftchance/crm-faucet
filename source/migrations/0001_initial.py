# Generated by Django 4.2 on 2023-04-19 03:41

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SourceIdentifier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_type', models.CharField(choices=[('twitter_id', 'Twitter ID'), ('twitter_username', 'Twitter Username'), ('twitter_handle', 'Twitter Handle'), ('github_username', 'Github Username'), ('ens_name', 'ENS Name'), ('linkedin_username', 'LinkedIn Username'), ('discord_username', 'Discord Username'), ('reddit_username', 'Reddit Username'), ('telegram_username', 'Telegram Username'), ('email', 'Email'), ('lens_handle', 'Lens Handle')], max_length=255)),
                ('value', models.CharField(blank=True, max_length=255, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Source',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True)),
                ('address', models.CharField(max_length=256)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('identifiers', models.ManyToManyField(blank=True, to='source.sourceidentifier')),
            ],
            options={
                'ordering': ['-created'],
            },
        ),
    ]
