from rest_framework import serializers

from source.serializers import SourceSerializer
from .models import Spout

class SpoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spout
        fields = (
            'token_id',
            'sources',
            'created_at', 
            'updated_at'
        )
        depth = 1