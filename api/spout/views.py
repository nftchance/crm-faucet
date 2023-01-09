import datetime
import django

from django.conf import settings

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

from web3 import Web3

from eth_account.messages import encode_defunct

from .models import Spout
from .serializers import SpoutSerializer

w3 = Web3(Web3.HTTPProvider(settings.MAINNET_PROVIDER))

class SpoutViewSet(viewsets.ModelViewSet):
    queryset = Spout.objects.all()
    serializer_class = SpoutSerializer

    def get_permissions(self):
        if self.action == "authorize":
            return [AllowAny()]
        if self.action != "retrieve" and self.action is not None:
            return [IsAdminUser()]
        return [AllowAny()]

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

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
    )
    def authorize(self, request, pk=None):
        data = request.data

        if not data:
            return Response(
                {
                    "status": "error",
                    "message": "No data provided.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        array = w3.solidityKeccak(
            [
                "address",
                "uint256",
                "uint256",
                "address",
                "bytes",
            ],
            [
                data["caller"],
                data["nonce"],
                data["size"],
                data["referrer"],
                data["tail"],
            ],
        )

        account = w3.eth.account.privateKeyToAccount(settings.SIGNER_PRIVATE_KEY)
        message = encode_defunct(bytes.fromhex(array.hex()[2:]))
        signature = account.sign_message(message)

        return Response(
            {
                "status": "success",
                "signature": signature.signature.hex(),
            },
            status=status.HTTP_200_OK,
        )
