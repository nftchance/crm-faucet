from models import Spout
from source.models import Source

def fill_spout(spout, priority_fields):
    priority_sources = Source.objects.filter(identifier__source_type__in=priority_fields)
    other_sources = Source.objects.none()
    spout_sources = Source.objects.none()

    ## what if we have less sources than units?
    priority_exhausted = False
    for unit in range(spout.units):
        ## chance is gonna hate me for this one
        ## i hate me for this one
        runs = 0
        found = False
        while not found and not priority_exhausted:
            source = priority_sources.order_by('?').first()
            if source not in spout_sources:
                spout_sources.add(source)
                found = True

            if runs > spout.units:
                priority_exhausted = True
                other_sources = Source.objects.exclude(identifier__source_type__in=priority_fields)

            

        if not found:
            spout_sources.add(source)
            

    spout.sources = spout_sources
    spout.save()
        

def generate_csv(spout):
    pass