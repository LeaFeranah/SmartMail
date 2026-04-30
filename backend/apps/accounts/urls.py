from django.urls import path
from .views import RegisterView, ProfileView, MailSettingsView, DashboardStatsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('mail-settings/', MailSettingsView.as_view(), name='mail-settings'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]