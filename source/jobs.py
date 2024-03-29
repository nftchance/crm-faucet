import django

from typing import List

from django_apscheduler import util

from utils.jobs import Job, JobManager
from utils.queries import ENS
from utils.shroom import QUERY

from .models import Source, SourceIdentifier

@util.close_old_connections
def ens() -> None:
    addresses = list(Source.objects.active().values_list("address", flat=True))
    response = QUERY(ENS.format(",".join([f"lower('{address}')" for address in addresses])))

    if not response:
        return

    sources = {source.address: source for source in Source.objects.filter(address__in=[record.get('address') for record in response.records])}
    identifiers: List[SourceIdentifier] = []

    if isinstance(response.records, list):
        response.records = {record.get('address'): record for record in response.records}

    for record in response.records.values():
        address = record.get('address')
        source = sources.get(address)

        if source:
            for column, value in record.items():
                if column != 'address' and value:
                    if not SourceIdentifier.objects.filter(source=source, source_type=column).exists():
                        identifiers.append(SourceIdentifier(source=source, source_type=column, value=value))

    SourceIdentifier.objects.bulk_create(identifiers)

@util.close_old_connections
def delete_stale_sources() -> None:
    Source.objects.filter(updated__lte=django.utils.timezone.now() - django.utils.timezone.timedelta(days=30)).order_by('updated').delete()

@util.close_old_connections
def delete_stale_source_identifiers() -> None:
    SourceIdentifier.objects.filter(updated__lte=django.utils.timezone.now() - django.utils.timezone.timedelta(days=30)).order_by('updated').delete()

jobs: List[Job] = [
    Job("ens", ens, trigger="*/59 * * * *"),
    Job("delete_stale_sources", delete_stale_sources, trigger="*/59 * * * *"),
    Job("delete_stale_source_identifiers", delete_stale_source_identifiers, trigger="*/59 * * * *"),
]

manager = JobManager(jobs, force=False)