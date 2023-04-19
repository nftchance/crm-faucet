from shroomdk import ShroomDK
from shroomdk.models import QueryResultSet

from django.conf import settings

SHROOM = ShroomDK(settings.SHROOM_KEY)

def QUERY(QUERY: str) -> QueryResultSet:
    return SHROOM.query(QUERY)
