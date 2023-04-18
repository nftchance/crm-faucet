from django.db import models

from source.models import Source
from utils.shroom import QUERY

class GeneratorQuerySet(models.QuerySet):
    def active(self) -> "GeneratorQuerySet":
        return self.filter(is_active=True)

    def inactive(self) -> "GeneratorQuerySet":
        return self.filter(is_active=False)

    def with_sources(self) -> "GeneratorQuerySet":
        return self.prefetch_related("sources")

class GeneratorManager(models.Manager):
    def get_queryset(self) -> GeneratorQuerySet:
        return GeneratorQuerySet(self.model, using=self._db)

    def active(self) -> GeneratorQuerySet:
        return self.get_queryset().active()

    def inactive(self) -> GeneratorQuerySet:
        return self.get_queryset().inactive()

    def with_sources(self) -> GeneratorQuerySet:
        return self.get_queryset().with_sources()

class Generator(models.Model):
    def save(self, *args, **kwargs) -> None:
        super().save(*args, **kwargs)

        if not self.request_body or not self.response_column:
            self.is_active = False

    EVERY_MINUTE = "* * * * *"
    EVERY_HOUR = "0 * * * *"
    EVERY_DAY = "0 0 * * *"
    EVERY_WEEK = "0 0 * * 0"
    EVERY_MONTH = "0 0 1 * *"
    EVERY_YEAR = "0 0 1 1 *"
    TRIGGERS = (
        (EVERY_MINUTE, "Every Minute"),        
        (EVERY_HOUR, "Every Hour"),
        (EVERY_DAY, "Every Day"),
        (EVERY_WEEK, "Every Week"),
        (EVERY_MONTH, "Every Month"),
        (EVERY_YEAR, "Every Year"),
    )

    SQL = "sql"
    REQUEST_TYPES = (
        (SQL, "SQL"),
    )

    is_active = models.BooleanField(default=True)

    name = models.CharField(max_length=255, blank=False, null=False)
    sources = models.ManyToManyField(Source, blank=True)

    trigger = models.CharField(max_length=255, choices=TRIGGERS, default=EVERY_MINUTE)

    request_type = models.CharField(max_length=255, choices=REQUEST_TYPES, default=SQL)
    request_body = models.TextField(blank=True, null=True)

    response_column = models.CharField(max_length=256, blank=True, null=True)
    
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = GeneratorManager()

    def __str__(self) -> str:
        return self.name

    def ready(self) -> None:
        if self.request_type == self.SQL:
            self._ready_sql()

    def _ready_sql(self) -> None:
        response = QUERY(self.request_body)

        if not response:
            return

        self.sources.bulk_create([
            Source(address=address)
            for address in [record[self.response_column] for record in response.records]
            if not Source.objects.filter(address=address).exists()
        ])