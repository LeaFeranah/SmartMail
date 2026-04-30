from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, RegisterSerializer, MailSettingsSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class MailSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = MailSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from apps.emails.models import Email, FollowUp
        from apps.tasks_app.models import Task

        stats = {
            'total_emails': Email.objects.filter(user=user).count(),
            'unread_emails': Email.objects.filter(user=user, is_read=False).count(),
            'needs_reply': Email.objects.filter(user=user, needs_reply=True).count(),
            'urgent_emails': Email.objects.filter(user=user, priority='urgent').count(),
            'pending_tasks': Task.objects.filter(user=user, status='todo').count(),
            'in_progress_tasks': Task.objects.filter(user=user, status='in_progress').count(),
            'pending_followups': FollowUp.objects.filter(user=user, status='pending').count(),
        }
        return Response(stats)