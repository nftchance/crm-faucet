from django.db import models


class SourceQuerySet(models.QuerySet):
    def with_identifiers(self):
        return self.prefetch_related("identifiers")

    def active(self):
        return self.filter(is_active=True)

    def inactive(self):
        return self.filter(is_active=False)


class SourceManager(models.Manager):
    def get_queryset(self):
        return SourceQuerySet(self.model, using=self._db)

    def with_identifiers(self):
        return self.get_queryset().with_identifiers()

    def active(self):
        return self.get_queryset().active()

    def inactive(self):
        return self.get_queryset().inactive()


class Source(models.Model):
    is_active = models.BooleanField(default=True)

    address = models.CharField(max_length=256, blank=False, null=False)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = SourceManager()

    def __str__(self) -> str:
        return self.address

    class Meta:
        ordering = ["-updated", "-created", "is_active"]


class SourceIdentifier(models.Model):
    SOURCE_TYPES = (
        ("twitter_id", "Twitter ID"),
        ("twitter_username", "Twitter Username"),
        ("twitter_handle", "Twitter Handle"),
        ("github_username", "Github Username"),
        ("ens_name", "ENS Name"),
        ("linkedin_username", "LinkedIn Username"),
        ("discord_username", "Discord Username"),
        ("reddit_username", "Reddit Username"),
        ("telegram_username", "Telegram Username"),
        ("email", "Email"),
        ("lens_handle", "Lens Handle"),
    )

    source = models.ForeignKey(
        Source, on_delete=models.CASCADE, related_name="identifiers"
    )

    source_type = models.CharField(max_length=255, choices=SOURCE_TYPES)
    value = models.CharField(max_length=255, blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.source_type}:{self.identifier}"

    class Meta:
        ordering = ["-updated", "-created"]
