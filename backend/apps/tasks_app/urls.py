from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskStatusUpdateView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/status/', TaskStatusUpdateView.as_view(), name='task-status'),
]