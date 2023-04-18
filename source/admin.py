from django.contrib import admin

from .models import Source, SourceIdentifier


@admin.register(SourceIdentifier)
class SourceIdentifierAdmin(admin.ModelAdmin):
    list_display = ["id", "source_type", "identifier"]
    list_filter = ["source_type"]
    search_fields = ["id", "source_type", "identifier"]


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ["id", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["id"]
