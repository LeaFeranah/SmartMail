from django.urls import path
from .views import AnalyzeEmailView, AnalyzeBatchView

urlpatterns = [
    path('email/<int:pk>/', AnalyzeEmailView.as_view(), name='analyze-email'),
    path('batch/', AnalyzeBatchView.as_view(), name='analyze-batch'),
]