from django.contrib import admin

from .models import Spout

admin.site.register(Spout)
class SpoutAdmin(admin.ModelAdmin):
    list_display = ['token_id', 'units', 'created_at']
    list_filter = ['token_id']
    search_fields = ['token_id', 'units', 'created_at']