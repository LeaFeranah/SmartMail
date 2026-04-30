from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


@shared_task
def sync_user_emails(user_id):
    from apps.emails.imap_client import sync_emails
    from apps.emails.models import Email

    try:
        user = User.objects.get(id=user_id)
        emails_data = sync_emails(user)
        created = 0
        for data in emails_data:
            _, was_created = Email.objects.get_or_create(
                message_id=data['message_id'],
                defaults={
                    'user': user,
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
        return {'synced': created, 'total': len(emails_data)}
    except Exception as e:
        return {'error': str(e)}


@shared_task
def sync_all_emails():
    users = User.objects.filter(
        imap_host__isnull=False
    ).exclude(imap_host='')
    for user in users:
        sync_user_emails.delay(user.id)


@shared_task
def process_followups():
    """Envoie les relances automatiques planifiées"""
    from apps.emails.models import FollowUp
    from apps.emails.smtp_client import send_followup

    now = timezone.now()
    pending = FollowUp.objects.filter(
        status='pending',
        scheduled_at__lte=now
    ).select_related('user', 'email')

    sent = 0
    for followup in pending:
        try:
            send_followup(
                user=followup.user,
                original_email=followup.email,
                followup_message=followup.message,
            )
            followup.status = 'sent'
            followup.sent_at = now
            followup.save()
            sent += 1
        except Exception as e:
            print(f"Erreur relance {followup.id}: {e}")

    return {'sent': sent}


@shared_task
def schedule_followups():
    """Planifie des relances pour les emails sans réponse"""
    from apps.emails.models import Email, FollowUp
    from apps.analysis.llm_engine import generate_followup_message

    emails_needing_followup = Email.objects.filter(
        needs_reply=True,
        replied_at__isnull=True,
        direction='incoming',
    ).exclude(
        followups__status__in=['pending', 'sent']
    ).select_related('user')

    scheduled = 0
    for email in emails_needing_followup:
        user = email.user
        if not user.auto_followup_enabled:
            continue

        delay_days = user.followup_delay_days or 3
        from datetime import timedelta
        scheduled_at = email.received_at + timedelta(days=delay_days)

        if scheduled_at <= timezone.now():
            try:
                message = generate_followup_message(
                    original_subject=email.subject,
                    original_body=email.body_text,
                    recipient=email.sender,
                )
                FollowUp.objects.create(
                    email=email,
                    user=user,
                    scheduled_at=scheduled_at,
                    message=message,
                    status='pending',
                )
                scheduled += 1
            except Exception as e:
                print(f"Erreur planification relance: {e}")

    return {'scheduled': scheduled}