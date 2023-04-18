from dotenv import load_dotenv

load_dotenv()

from .base import *
from .static import *
from .apps import *
from .middleware import *
from .network import *
from .database import *
from .auth import *
from .startup import *
from .tz import *
from .web3 import *

if LOCAL:
    from .local import *
else:
    from .production import *