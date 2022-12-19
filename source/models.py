from django.db import models


URLS = {
    "MEMBERS": "http://www.nftinspect.xyz/api/collections/members/{0}?limit=2000&onlyNewMembers=false",
    "DETAILS": "https://www.nftinspect.xyz/api/collections/details/{0}"
}

class SourceAttribute(models.Model):
    chain = models.CharField(max_length=255, blank=True, null=True)
    contract = models.CharField(max_length=255, blank=True, null=True)
    token_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        if self.token_id:
            return f"{self.chain}:{self.contract}:{self.token_id}"
        return f"{self.chain}:{self.contract}"

class Source(models.Model):
    BUCKETS = (
        ("nft", "NFT"),
        ("defi", "Defi"),
        ("social", "Social"),
    )

    is_active = models.BooleanField(default=True)
    bucket = models.CharField(max_length=255, choices=BUCKETS, default="nft")

    wallet_address = models.CharField(max_length=255, blank=True, null=True)

    twitter_identifier = models.CharField(max_length=255, blank=True, null=True)
    inspect_identifier = models.CharField(max_length=255, blank=True, null=True)

    attributes = models.ManyToManyField(SourceAttribute, blank=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name