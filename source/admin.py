from django.contrib import admin

from .models import Source, SourceIdentifier, SourceLabel, SourceHolding

@admin.register(SourceIdentifier)
class SourceIdentifierAdmin(admin.ModelAdmin):
    list_display = ["id", "source_type", "identifier"]
    list_filter = ["source_type"]
    search_fields = ["id", "source_type", "identifier"]

@admin.register(SourceLabel)
class SourceLabelAdmin(admin.ModelAdmin):
    list_display = ["id", "label"]
    search_fields = ["id", "label"]

@admin.register(SourceHolding)
class SourceHoldingAdmin(admin.ModelAdmin):
    list_display = ["id", "chain", "contract", "token_id", "wallet_address"]
    list_filter = ["chain", "contract", "wallet_address"]
    search_fields = ["id", "chain", "contract", "token_id", "wallet_address"]


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ["id", "is_active", "bucket"]
    list_filter = ["is_active", "bucket"]
    search_fields = ["id", "bucket"]