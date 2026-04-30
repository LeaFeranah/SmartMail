from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Email, EmailThread, FollowUp
from .serializers import EmailSerializer, EmailThreadSerializer, FollowUpSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated




class EmailListView(generics.ListAPIView):
    serializer_class = EmailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Email.objects.filter(user=self.request.user)
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        is_read = self.request.query_params.get('is_read')
        needs_reply = self.request.query_params.get('needs_reply')

        if category:
            qs = qs.filter(category=category)
        if priority:
            qs = qs.filter(priority=priority)
        if is_read is not None:
            qs = qs.filter(is_read=is_read == 'true')
        if needs_reply is not None:
            qs = qs.filter(needs_reply=needs_reply == 'true')
        return qs


class EmailDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = EmailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Email.objects.filter(user=self.request.user)


class EmailThreadListView(generics.ListAPIView):
    serializer_class = EmailThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmailThread.objects.filter(user=self.request.user)


class FollowUpListView(generics.ListCreateAPIView):
    serializer_class = FollowUpSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FollowUp.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MarkEmailReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            email = Email.objects.get(pk=pk, user=request.user)
            email.is_read = True
            email.save()
            return Response({'status': 'ok'})
        except Email.DoesNotExist:
            return Response({'error': 'Email non trouvé'},
                            status=status.HTTP_404_NOT_FOUND)


class MarkNeedsReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            email = Email.objects.get(pk=pk, user=request.user)
            email.needs_reply = not email.needs_reply
            email.save()
            return Response({'needs_reply': email.needs_reply})
        except Email.DoesNotExist:
            return Response({'error': 'Email non trouvé'},
                            status=status.HTTP_404_NOT_FOUND)
        


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_emails_view(request):
    """Lance la sync IMAP immédiatement"""
    from .imap_client import sync_emails
    from .models import Email
    try:
        emails_data = sync_emails(request.user)
        created = 0
        for data in emails_data:
            _, was_created = Email.objects.get_or_create(
                message_id=data['message_id'],
                defaults={
                    'user': request.user,
                    'subject': data['subject'],
                    'sender': data['sender'],
                    'recipients': data['recipients'],
                    'cc': data['cc'],
                    'body_text': data['body_text'],
                    'body_html': data['body_html'],
                    'received_at': data['received_at'],
                    'direction': 'incoming',
                }
            )
            if was_created:
                created += 1
        return Response({'synced': created, 'total': len(emails_data)})
    except Exception as e:
        return Response({'error': str(e)}, status=400)


class ScheduleFollowUpView(APIView):
    """Planifier manuellement une relance pour un email"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from apps.analysis.llm_engine import generate_followup_message
        from django.utils import timezone
        from datetime import timedelta

        try:
            email = Email.objects.get(pk=pk, user=request.user)
        except Email.DoesNotExist:
            return Response(
                {'error': 'Email non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Générer le message de relance avec l'IA
        try:
            message = generate_followup_message(
                original_subject=email.subject,
                original_body=email.body_text,
                recipient=email.sender,
            )
        except Exception:
            message = f"Bonjour,\n\nJe me permets de revenir vers vous concernant mon email : {email.subject}.\nN'hésitez pas à me contacter.\n\nCordialement"

        delay_days = request.user.followup_delay_days or 3
        scheduled_at = timezone.now() + timedelta(days=delay_days)

        followup = FollowUp.objects.create(
            email=email,
            user=request.user,
            scheduled_at=scheduled_at,
            message=message,
            status='pending',
        )

        return Response({
            'success': True,
            'followup_id': followup.id,
            'scheduled_at': followup.scheduled_at,
            'message': followup.message,
        })


class SendFollowUpNowView(APIView):
    """Envoyer une relance immédiatement"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from apps.emails.smtp_client import send_followup
        from django.utils import timezone

        try:
            followup = FollowUp.objects.get(pk=pk, user=request.user)
        except FollowUp.DoesNotExist:
            return Response(
                {'error': 'Relance non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            send_followup(
                user=request.user,
                original_email=followup.email,
                followup_message=followup.message,
            )
            followup.status = 'sent'
            followup.sent_at = timezone.now()
            followup.save()
            return Response({'success': True, 'status': 'sent'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )