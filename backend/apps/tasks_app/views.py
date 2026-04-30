from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user)
        task_status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        if task_status:
            qs = qs.filter(status=task_status)
        if priority:
            qs = qs.filter(priority=priority)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


class TaskStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk, user=request.user)
            new_status = request.data.get('status')
            if new_status not in ['todo', 'in_progress', 'done', 'cancelled']:
                return Response(
                    {'error': 'Statut invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            task.status = new_status
            task.save()
            return Response(TaskSerializer(task).data)
        except Task.DoesNotExist:
            return Response(
                {'error': 'Tâche non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )