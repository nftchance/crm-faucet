import csv
from django.http import HttpResponse

from source.models import Source, SourceIdentifier

def fill_spout(spout, priority_fields):
    priority_sources = Source.objects.filter(identifier__source_type__in=priority_fields)
    other_sources = Source.objects.none()
    spout_sources = Source.objects.none()

    ## chance is gonna hate me for this one
    ## i hate me for this one
    ## The idea for now is we loop randomly through the priority sources until we find one that isn't already in the spout
    ## If we have looped through all the priority sources and still haven't found one, we move on to the other sources
    priority_exhausted = False
    for unit in range(spout.units):
        runs = 0
        found = False
        while not found and not priority_exhausted:
            runs += 1
            source = priority_sources.order_by('?').first()
            if source not in spout_sources:
                spout_sources.add(source)
                found = True

            if runs >= spout.units:
                priority_exhausted = True
                other_sources = Source.objects.exclude(identifier__source_type__in=priority_fields)

        ## oh boy -- we have a ton of sources so surely this will never be infinite right? :)
        while not found:
            source = other_sources.order_by('?').first()
            if source not in spout_sources:
                spout_sources.add(source)
                found = True
        
    spout.sources = spout_sources
    spout.building = False
    spout.save()
    
def generate_csv_response(spout):
    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': f'attachment; filename="faucet-leads-{spout.token_id}.csv"'},
    )
    writer = csv.writer(response)

    ## write the different source types from SourceIdentifier.SOURCE_TYPES to the first row
    writer.writerow([source_type[1] for source_type in SourceIdentifier.SOURCE_TYPES])

    for source in spout.sources.all():
        ## for each identifier that the source has, write the identifier to the row in the matching column
        ## if the source doesn't have an identifier for a given column, write an empty string
        row = []
        for source_type in SourceIdentifier.SOURCE_TYPES:
            try:
                row.append(source.identifiers.get(source_type=source_type[0]).identifier)
            except SourceIdentifier.DoesNotExist:
                row.append('')
        writer.writerow(row)

    return response