from rest_framework import routers
from rest_framework.schemas import get_schema_view

from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

from generator.urls import router as generator_router
from source.urls import router as source_router

router = routers.DefaultRouter()
router.registry.extend(generator_router.registry)
router.registry.extend(source_router.registry)

schema_view = get_schema_view(
    title="Faucet",
    description="Faucet is a CRM-seeding mechanism that constantly watches the social-doxxing endpoints of the public graph found in Web3.",
    version="0.1",
    public=True,
)

urlpatterns = router.urls + [
    path("admin/", admin.site.urls),
    # Performance debug urls
    path('__debug__/', include('debug_toolbar.urls')),
    # Documentation urls
    path(
        "docs/",
        TemplateView.as_view(
            template_name="docs.html", extra_context={"schema_url": "openapi-schema"}
        ),
        name="docs",
    ),
    path("openapi", schema_view, name="openapi-schema"),
]