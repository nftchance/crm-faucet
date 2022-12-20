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

    source_type = models.CharField(max_length=255, choices=SOURCE_TYPES, default="twitter")
    identifier = models.CharField(max_length=255, blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.source_type}:{self.identifier}"

class SourceHolding(models.Model):
    chain = models.CharField(max_length=255, blank=True, null=True)
    contract = models.CharField(max_length=255, blank=True, null=True)
    token_id = models.CharField(max_length=255, blank=True, null=True)

    wallet_address = models.CharField(max_length=255, blank=True, null=True)

    balance = models.DecimalField(max_digits=255, decimal_places=0, blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.token_id:
            return f"{self.chain}:{self.contract}:{self.token_id}"
        return f"{self.chain}:{self.contract}"

class SourceLabel(models.Model):
    label = models.CharField(max_length=255, blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.label}"

class Source(models.Model):
    BUCKETS = (
        ("nft", "NFT"),
        ("defi", "Defi"),
        ("social", "Social"),
    )

    is_active = models.BooleanField(default=True)
    bucket = models.CharField(max_length=255, choices=BUCKETS, default="nft")

    identifiers = models.ManyToManyField(SourceIdentifier, blank=True)
    holdings = models.ManyToManyField(SourceHolding, blank=True)
    labels = models.ManyToManyField(SourceLabel, blank=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        # return twitter_username identifier if it exists
        if self.identifiers.filter(source_type="twitter_username").exists():
            return self.identifiers.get(source_type="twitter_username").identifier
        return "Tracking..."