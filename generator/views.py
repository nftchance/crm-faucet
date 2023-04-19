from rest_framework import viewsets

from .models import Generator
from .serializers import GeneratorSerializer

class GeneratorViewSet(viewsets.ModelViewSet):
    queryset = Generator.objects.with_sources()
    serializer_class = GeneratorSerializer
    filterset_fields = [
        "is_active",
        "name", 
        "sources__address", 
        "sources__identifiers__source_type", 
        "sources__identifiers__value",
        "trigger",
        "request_type",
        "response_column"
    ]
    search_fields = filterset_fields