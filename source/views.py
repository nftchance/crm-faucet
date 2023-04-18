from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .models import Source
from .serializers import SourceSerializer

class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    permission_classes = [IsAdminUser]