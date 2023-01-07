from rest_framework import routers

from django.contrib import admin
from django.urls import include, path

from source.urls import router as source_router

router = routers.DefaultRouter()
router.registry.extend(source_router.registry)

urlpatterns = router.urls + [
    path("admin/", admin.site.urls),
    # first party views
    path("", include('spout.urls')),
]
