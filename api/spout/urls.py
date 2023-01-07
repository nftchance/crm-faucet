from django.urls import path

from . import views

urlpatterns = [
    path('spout/<int:pk>/', views.get_spout, name='get_spout'),
]