from django.db import models
from source.models import Source

class Spout(models.Model):
    token_id = models.IntegerField(primary_key=True)
    units = models.IntegerField(default=0)

    building = models.BooleanField(default=False)

    sources = models.ManyToManyField(Source, related_name='spouts', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.token_id)