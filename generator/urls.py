from rest_framework import routers

from .views import GeneratorViewSet

router = routers.DefaultRouter()

router.register(r"generator", GeneratorViewSet)