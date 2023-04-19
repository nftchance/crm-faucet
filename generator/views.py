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
    def csv(self, request, pk=None):
        generator = self.get_object()

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{generator.name}.csv"'

        # writer = csv.writer(response)
        # writer.writerow(generator.response_column)
        # for row in generator.get_results():
        #     writer.writerow(row)

        return response
