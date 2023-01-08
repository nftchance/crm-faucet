import json

from django.db import models
from django.utils import timezone

from source.models import Source

from .utils import get_poured_events

class SpoutQuerySet(models.QuerySet):
    def accept_spouts(self):
        for spout in self.filter(looked__isnull=True, accepted__isnull=True):
            (events, latest) = get_poured_events(spout.token_id)
            
            # Caching the spout lookup to prevent another RPC call and move on.
            if latest is None:
                spout.looked = timezone.now()
                spout.save()

                continue

            spout.accepted = timezone.now()
            spout.cached_body = json.dumps(latest)
            
            spout.save()

    def fill_spouts(self):
        for spout in self.filter(accepted__isnull=False, built__isnull=True):
            # Decode the cached body to determine the priorities.

            spout.built = timezone.now()
            spout.save()

    def delete_old_looked_spouts(self, max_age=60 * 60):
        self.filter(looked__lt=timezone.now() -
                    timezone.timedelta(seconds=max_age)).delete()


class SpoutManager(models.Manager):
    def get_queryset(self):
        return SpoutQuerySet(self.model, using=self._db)

    def accept_spouts(self):
        self.get_queryset().accept_spouts()

    def delete_old_looked_spouts(self, max_age=60 * 60):
        self.get_queryset().delete_old_looked_spouts(max_age)


class Spout(models.Model):
    token_id = models.IntegerField(primary_key=True)

    units = models.IntegerField(default=0)
    referrer = models.CharField(max_length=255, blank=True, null=True)
    tail = models.CharField(max_length=255, blank=True, null=True)

    sources = models.ManyToManyField(
        Source, related_name="spouts", blank=True
    )

    cache_body = models.TextField(blank=True, null=True)

    looked = models.DateTimeField(blank=True, null=True)
    accepted = models.DateTimeField(blank=True, null=True)
    built = models.DateTimeField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = SpoutManager()

    def __str__(self):
        return str(self.token_id)

    def priorities(self):
        # TODO: Figure out how I am going to calculate this.
        pass
