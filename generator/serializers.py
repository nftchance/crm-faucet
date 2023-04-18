from rest_framework import serializers

from .models import Generator

class GeneratorSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name="generator-detail",
        lookup_field="pk",
    )

    class Meta:
        model = Generator
        fields = "__all__"