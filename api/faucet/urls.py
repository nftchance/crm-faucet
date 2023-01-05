from rest_framework import routers

from django.contrib import admin
from django.urls import path

from source.urls import router as source_router
from spout.urls import router as spout_router

router = routers.DefaultRouter()
router.registry.extend(source_router.registry)
router.registry.extend(spout_router.registry)

urlpatterns = router.urls + [
    path("admin/", admin.site.urls),
]
