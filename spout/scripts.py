import csv
from django.http import HttpResponse

from source.models import Source, SourceIdentifier

def fill_spout(spout):
    return None
    
def generate_csv_response(spout):
    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': f'attachment; filename="faucet-leads-{spout.token_id}.csv"'},
    )

    writer = csv.writer(response)

    # write the different source types from SourceIdentifier.SOURCE_TYPES to the first row
    writer.writerow([source_type[1] for source_type in SourceIdentifier.SOURCE_TYPES])

    for source in spout.sources.all():
        row = []
        for source_type in SourceIdentifier.SOURCE_TYPES:
            try:
                row.append(source.identifiers.get(source_type=source_type[0]).identifier)
            except SourceIdentifier.DoesNotExist:
                row.append('')
        
        writer.writerow(row)

    return response