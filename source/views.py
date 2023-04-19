from rest_framework import viewsets

from .models import Source
from .serializers import SourceSerializer


class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.with_identifiers().active()
    serializer_class = SourceSerializer
    filterset_fields = ["address", "identifiers__source_type", "identifiers__value"]
    search_fields = filterset_fields
