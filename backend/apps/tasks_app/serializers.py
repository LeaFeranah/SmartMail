from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    source_email_subject = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status',
            'due_date', 'is_auto_detected', 'source_email',
            'source_email_subject', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_source_email_subject(self, obj):
        if obj.source_email:
            return obj.source_email.subject
        return None