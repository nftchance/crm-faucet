from rest_framework import routers

from django.contrib import admin
from django.urls import include, path

from generator.urls import router as generator_router
from source.urls import router as source_router

router = routers.DefaultRouter()
router.registry.extend(generator_router.registry)
router.registry.extend(source_router.registry)

urlpatterns = router.urls + [
    path("admin/", admin.site.urls),
    path('__debug__/', include('debug_toolbar.urls')),
]