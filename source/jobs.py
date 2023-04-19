from typing import List

from django_apscheduler import util

from utils.jobs import Job, JobManager
from utils.queries import ENS
from utils.shroom import QUERY

@util.close_old_connections
def ens() -> None:
    address_str = ",".join([f"lower('{address}')" for address in ENS.addresses])

    response = QUERY(ENS.format(address_str))

    if not response:
        return
    
    identifiers = {record["address"] for record in response.records}

    print(identifiers)

jobs: List[Job] = [
    Job("ens", ens, trigger="*/59 * * * *"),
]

manager = JobManager(jobs, force=False)