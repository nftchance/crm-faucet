import os

ALCHEMY_KEY = os.getenv("ALCHEMY_KEY", None)

if not ALCHEMY_KEY:
    raise ValueError("ALCHEMY_KEY is not set")

PROVIDER = "https://eth-mainnet.alchemyapi.io/v2/{}".format(ALCHEMY_KEY)

SHROOM_KEY = os.getenv("SHROOM_KEY", None)

if not SHROOM_KEY:
    raise ValueError("SHROOM_KEY is not set")