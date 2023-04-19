# Generated by Django 4.2 on 2023-04-19 05:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('source', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Generator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True)),
                ('name', models.CharField(max_length=255)),
                ('trigger', models.CharField(choices=[('* * * * *', 'Every Minute'), ('0 * * * *', 'Every Hour'), ('0 0 * * *', 'Every Day'), ('0 0 * * 0', 'Every Week'), ('0 0 1 * *', 'Every Month'), ('0 0 1 1 *', 'Every Year')], default='* * * * *', max_length=255)),
                ('request_type', models.CharField(choices=[('sql', 'SQL')], default='sql', max_length=255)),
                ('request_body', models.TextField(blank=True, null=True)),
                ('response_column', models.CharField(blank=True, max_length=256, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('sources', models.ManyToManyField(blank=True, to='source.source')),
            ],
        ),
    ]
