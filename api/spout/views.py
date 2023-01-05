from rest_framework import viewsets
from rest_framework.response import Response

from .models import Spout
from .serializers import SpoutSerializer
from .scripts import fill_spout

class SpoutViewSet(viewsets.ModelViewSet):
    queryset = Spout.objects.all()
    serializer_class = SpoutSerializer

    def retrieve(self, request, pk=None):
        instance, created = Spout.objects.get_or_create(pk=pk)
        serializer = self.get_serializer(instance)

        if created:
            instance.units=request.data['units']
            instance.building = True
            instance.save()
            fill_spout(instance)


        return Response(serializer.data)