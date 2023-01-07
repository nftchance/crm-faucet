import datetime
import django

from rest_framework import status
from rest_framework.response import Response
from web3 import Web3

from .models import Spout
from .serializers import SpoutSerializer

MINUTES_TO_STALL = 3

PROVIDER = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
POURED_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "uint256",
                "name": "units",
                "type": "uint256",
            },
            {
                "indexed": True,
                "internalType": "address",
                "name": "referrer",
                "type": "address",
            },
            {
                "indexed": True,
                "internalType": "bytes",
                "name": "tail",
                "type": "bytes",
            },
        ],
        "name": "Poured",
        "type": "event",
    }
]  

web3 = Web3(Web3.HTTPProvider(PROVIDER))

try:
    contract = web3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=POURED_ABI,
    )
except:
    contract = None

def get_spout(request, pk):
    if contract == None:
        return Response(
            {
                "status": "error",
                "message": "Contract not found.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # if the instance exists and finished building more than 3 minutes ago.
    if Spout.objects.filter(pk=pk).exists():
        instance = Spout.objects.get(pk=pk)

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

        # If the spout was built in the last 3 minutes, return building status.
        if (
            instance.built
            < django.utils.timezone.now() - datetime.timedelta(minutes=MINUTES_TO_STALL)
        ):
            # Return the spout's status as building.
            seconds_passed = (
                django.utils.timezone.now() - instance.built
            ).total_seconds()
            progress = int(100 * seconds_passed / (MINUTES_TO_STALL * 60))

            return Response(
                {
                    "status": "pending",
                    "data": SpoutSerializer(instance).data,
                    "progress": progress,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        return Response(
            {
                "status": "success",
                "data": SpoutSerializer(instance).data,
            },
            status=status.HTTP_200_OK,
        )

    # Validate that the spout exists on the blockchain.
    # Get the latest transfer event for this token.
    events = contract.events.Poured.getLogs(
        fromBlock=0,
        argument_filters={"tokenId": pk},
    )

    # If the spout does not exist on the blockchain store the looked object in the database to prevent spammers that blow through RPC calls.
    if not events:
        instance = Spout.objects.create(pk=pk, looked=django.utils.timezone.now())

        return Response(
            {
                "status": "looked",
                "data": SpoutSerializer(instance).data,
            },
            status=status.HTTP_200_OK,
        )

    # Get the deconstructed poured event data.
    event = contract.events.Poured().processReceipt(events[0])

    units = event[0]["args"]["units"]
    referrer = event[0]["args"]["referrer"]
    tail = event[0]["args"]["tail"]

    print(units, referrer, tail)

    # If the spout exists on the blockchain, create the spout in the database and return the building status.
    instance = Spout.objects.create(
        pk=pk,
        units=units,
        referrer=referrer,
        tail=tail,
    )

    return Response(
        {
            "status": "pending",
            "data": SpoutSerializer(instance).data,
            "progress": 0,
        },
        status=status.HTTP_202_ACCEPTED,
    )