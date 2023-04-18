from shroomdk import ShroomDK
from shroomdk.models import QueryResultSet

SHROOM = ShroomDK("7736f412-5e7b-4c43-8360-3e2231a24e69")


def QUERY(QUERY: str) -> QueryResultSet:
    return SHROOM.query(QUERY)
