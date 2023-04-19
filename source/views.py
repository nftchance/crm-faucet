from rest_framework import viewsets

from .models import Source
from .serializers import SourceSerializer


class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.with_identifiers().active()
    serializer_class = SourceSerializer
