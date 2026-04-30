from rest_framework import serializers
from .models import Email, EmailThread, FollowUp


class EmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Email
        fields = [
            'id', 'message_id', 'subject', 'sender', 'recipients',
            'cc', 'body_text', 'received_at', 'direction',
            'priority', 'category', 'summary', 'sentiment',
            'action_detected', 'is_analyzed',
            'is_read', 'is_starred', 'needs_reply', 'replied_at',
            'thread', 'created_at',
        ]
        read_only_fields = ['id', 'is_analyzed', 'summary',
                            'sentiment', 'priority', 'category']


class EmailThreadSerializer(serializers.ModelSerializer):
    emails = EmailSerializer(many=True, read_only=True)
    email_count = serializers.SerializerMethodField()

    class Meta:
        model = EmailThread
        fields = ['id', 'subject', 'participants', 'last_message_at',
                  'is_resolved', 'emails', 'email_count', 'created_at']

    def get_email_count(self, obj):
        return obj.emails.count()


class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = ['id', 'email', 'scheduled_at', 'sent_at',
                  'status', 'message']
        read_only_fields = ['id', 'sent_at']