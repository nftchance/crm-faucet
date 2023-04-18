import os

ALCHEMY_KEY = os.getenv("ALCHEMY_KEY", "alchemy_key")
PROVIDER = "https://eth-mainnet.alchemyapi.io/v2/{}".format(ALCHEMY_KEY)