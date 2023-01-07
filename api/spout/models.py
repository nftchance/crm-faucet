from django.db import models
from source.models import Source

class Spout(models.Model):
    token_id = models.IntegerField(primary_key=True)

    units = models.IntegerField(default=0)
    referrer = models.CharField(max_length=255, blank=True, null=True)
    tail = models.CharField(max_length=255, blank=True, null=True)

    sources = models.ManyToManyField(
        Source, related_name="spouts", blank=True, null=True
    )

    looked = models.DateTimeField(blank=True, null=True)
    built = models.DateTimeField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.token_id)

    def priorities(self):
        # TODO: Figure out how I am going to calculate this.
        pass
