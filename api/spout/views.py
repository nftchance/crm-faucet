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
        if self.action != 'retrieve':
            return [IsAdminUser()]
        return []

    def retrieve(self, request, pk=None):
        if Spout.objects.filter(pk=pk).exists():
            instance = Spout.objects.get(pk=pk)

            if not instance.looked and not instance.accepted:
                return Response(
                    {
                        "status": "pending",
                        "data": SpoutSerializer(instance).data,
                    },
                    status=status.HTTP_200_OK,
                )

            # If the spout is being stored in cache to prevent another RPC call assume that data is empty 
            # and return the cached data.
            if instance.looked:
                return Response(
                    {
                        "status": "looked",
                        "data": SpoutSerializer(instance).data,
                    },
                    status=status.HTTP_200_OK,
                )

            if instance.accepted and not instance.built:
                return Response(
                    {
                        "status": "accepted",
                        "data": SpoutSerializer(instance).data,
                    },
                    status=status.HTTP_200_OK,
                )

            # If the spout was built in the last 3 minutes, return building status.
            if (
                instance.built
                < django.utils.timezone.now() - datetime.timedelta(minutes=settings.MINUTES_TO_STALL)
            ):
                # Return the spout's status as building.
                seconds_passed = (
                    django.utils.timezone.now() - instance.built
                ).total_seconds()
                progress = int(100 * seconds_passed / (settings.MINUTES_TO_STALL * 60))

                return Response(
                    {
                        "status": "building",
                        "data": SpoutSerializer(instance).data,
                        "progress": progress,
                    },
                    status=status.HTTP_200_OK,
                )

            # If all conditions have been met, return the spout.
            return Response(
                {
                    "status": "success",
                    "data": SpoutSerializer(instance).data,
                },
                status=status.HTTP_200_OK,
            )

        instance = Spout.objects.create(token_id=pk)

        return Response(
            {
                "status": "pending",
                "data": SpoutSerializer(instance).data,
            },
            status=status.HTTP_200_OK,
        )