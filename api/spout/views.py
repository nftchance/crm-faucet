import datetime
import django

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from django.conf import settings

from .models import Spout
from .serializers import SpoutSerializer


class SpoutViewSet(viewsets.ModelViewSet):
    queryset = Spout.objects.all()
    serializer_class = SpoutSerializer

    def get_permissions(self):
        if self.action != "retrieve":
            return [IsAdminUser()]
        return []

    def _return(status, instance):
        return Response(
            {
                "status": status,
                "data": SpoutSerializer(instance).data,
            },
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        if Spout.objects.filter(pk=pk).exists():
            instance = Spout.objects.get(pk=pk)

            if not instance.looked and not instance.accepted:
                return self._return("pending", instance)

            # If the spout is being stored in cache to prevent another RPC call assume 
            # that data is empty and return the cached data.
            if instance.looked:
                return self._return("empty", instance)

            if instance.accepted and not instance.built:
                return self._return("accepted", instance)

            # If the spout was built in the last 3 minutes, return building status.
            if instance.built < django.utils.timezone.now() - datetime.timedelta(
                minutes=settings.MINUTES_TO_STALL
            ):
                # Return the spout's status as building.
                return self._return("building", instance) 

            # If all conditions have been met, return the spout.
            return self._return("success", instance)

        instance = Spout.objects.create(token_id=pk)

        return self._return("pending", instance)
