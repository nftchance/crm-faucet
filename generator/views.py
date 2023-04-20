import csv

from rest_framework import viewsets
from rest_framework.decorators import action

from django.http import HttpResponse

from .models import Generator
from .serializers import GeneratorSerializer


class GeneratorViewSet(viewsets.ModelViewSet):
    queryset = Generator.objects.with_sources()
    serializer_class = GeneratorSerializer
    filterset_fields = [
        "is_active",
        "name",
        "sources__address",
        "sources__identifiers__source_type",
        "sources__identifiers__value",
        "trigger",
        "request_type",
        "response_column",
    ]
    search_fields = filterset_fields

    @action(detail=True, methods=["get"], url_path="csv")
    def download_csv(self, request, pk=None):
        generator = self.get_object()

        response = HttpResponse(content_type="text/csv", charset="utf-8")
        response["Content-Disposition"] = f'attachment; filename="{generator.name}.csv"'

        headers = ["address"]
        identifier_headers = set(
            generator.sources.exclude(identifiers__source_type=None)
            .values_list("identifiers__source_type", flat=True)
            .distinct()
        )
        headers.extend(identifier_headers)

        writer = csv.writer(response)
        writer.writerow(headers)

        for source in generator.sources.all():
            row = [source.address, ""]
            identifiers = source.identifiers.exclude(source_type=None).values_list(
                "source_type", "value"
            )
            identifier_values = {
                source_type: value for source_type, value in identifiers
            }
            row.extend(
                identifier_values.get(source_type, "")
                for source_type, _ in identifier_headers
            )
            writer.writerow(row)

        return response
