from rest_framework import serializers

from .models import Source, SourceIdentifier


class SourceIdentiferSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceIdentifier
        fields = "__all__"


class SourceSerializer(serializers.ModelSerializer):
    identifiers = SourceIdentiferSerializer(many=True, read_only=True)

    class Meta:
        model = Source
        fields = "__all__"
        depth = 1
