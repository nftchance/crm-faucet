from rest_framework import serializers

from source.serializers import SourceSerializer

from .models import Spout

class SpoutSerializer(serializers.ModelSerializer):
    sources = SourceSerializer(many=True, read_only=True)

    class Meta:
        model = Spout
        fields = "__all__"
        depth = 1