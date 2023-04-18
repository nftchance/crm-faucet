from rest_framework import viewsets

from .models import Generator
from .serializers import GeneratorSerializer

class GeneratorViewSet(viewsets.ModelViewSet):
    queryset = Generator.objects.with_sources()
    serializer_class = GeneratorSerializer
