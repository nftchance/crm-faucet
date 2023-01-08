from rest_framework import routers

from django.urls import path

from . import views

router = routers.DefaultRouter()
router.register(r'spout', views.SpoutViewSet)

urlpatterns = router.urls