from rest_framework import serializers

from .models import Source, SourceIdentifier, SourceHolding, SourceLabel

class SourceIdentiferSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceIdentifier
        fields = "__all__"

class SourceHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceHolding
        fields = "__all__"

class SourceLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceLabel
        fields = "__all__"

class SourceSerializer(serializers.ModelSerializer):
    identifiers = SourceIdentiferSerializer(many=True, read_only=True)
    holdings = SourceHoldingSerializer(many=True, read_only=True)
    label = SourceLabelSerializer(many=True, read_only=True)

    class Meta:
        model = Source
        fields = "__all__"
        depth = 1