from django.urls import path
from .views import (
    EmailListView, EmailDetailView, EmailThreadListView,
    FollowUpListView, MarkEmailReadView, MarkNeedsReplyView,
    sync_emails_view, ScheduleFollowUpView, SendFollowUpNowView
)

urlpatterns = [
    path('', EmailListView.as_view(), name='email-list'),
    path('<int:pk>/', EmailDetailView.as_view(), name='email-detail'),
    path('<int:pk>/mark-read/', MarkEmailReadView.as_view(), name='mark-read'),
    path('<int:pk>/needs-reply/', MarkNeedsReplyView.as_view(), name='needs-reply'),
    path('<int:pk>/schedule-followup/', ScheduleFollowUpView.as_view(), name='schedule-followup'),
    path('threads/', EmailThreadListView.as_view(), name='thread-list'),
    path('followups/', FollowUpListView.as_view(), name='followup-list'),
    path('followups/<int:pk>/send/', SendFollowUpNowView.as_view(), name='send-followup'),
    path('sync/', sync_emails_view, name='sync-emails'),
]