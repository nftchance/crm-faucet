from web3 import Web3

from django.conf import settings

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

WEB3 = Web3(Web3.HTTPProvider(settings.PROVIDER))

SMART_CONTRACT = None

try:
    SMART_CONTRACT = WEB3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=POURED_ABI,
    )
except:
    pass

def get_poured_events(token_id):
    # Validate that the spout exists on the blockchain.
    # Get the latest transfer event for this token.
    events = SMART_CONTRACT.events.Poured.getLogs(
        fromBlock=0,
        argument_filters={"tokenId": token_id},
    )

    latest = None
    if events:
        latest = events[0]

    return (events, latest)