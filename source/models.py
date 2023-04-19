from django.db import models

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

    source_type = models.CharField(max_length=255, choices=SOURCE_TYPES)
    value = models.CharField(max_length=255, blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.source_type}:{self.identifier}"


class Source(models.Model):
    is_active = models.BooleanField(default=True)

    address = models.CharField(max_length=256, blank=False, null=False)
    identifiers = models.ManyToManyField(SourceIdentifier, blank=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.address

    class Meta:
        ordering = ["-created"]
