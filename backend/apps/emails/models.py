from django.db import models
from apps.accounts.models import User

class EmailThread(models.Model):
    """Un fil de discussion (plusieurs emails liés)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='threads')
    subject = models.CharField(max_length=500)
    participants = models.JSONField(default=list)
    last_message_at = models.DateTimeField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject


class Email(models.Model):
    DIRECTION_CHOICES = [
        ('incoming', 'Reçu'),
        ('outgoing', 'Envoyé'),
    ]
    PRIORITY_CHOICES = [
        ('urgent', 'Urgent'),
        ('high', 'Haute'),
        ('normal', 'Normale'),
        ('low', 'Basse'),
    ]
    CATEGORY_CHOICES = [
        ('action_required', 'Action requise'),
        ('waiting_reply', 'En attente de réponse'),
        ('informational', 'Informatif'),
        ('spam', 'Spam'),
        ('newsletter', 'Newsletter'),
        ('other', 'Autre'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emails')
    thread = models.ForeignKey(EmailThread, on_delete=models.CASCADE,
                               related_name='emails', null=True, blank=True)

    # Données brutes
    message_id = models.CharField(max_length=500, unique=True)
    subject = models.CharField(max_length=500)
    sender = models.EmailField()
    recipients = models.JSONField(default=list)
    cc = models.JSONField(default=list)
    body_text = models.TextField(blank=True)
    body_html = models.TextField(blank=True)
    received_at = models.DateTimeField()
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES, default='incoming')

    # Analyse IA
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='other')
    summary = models.TextField(blank=True)        # Résumé généré par LLM
    sentiment = models.CharField(max_length=20, blank=True)  # positif/négatif/neutre
    action_detected = models.BooleanField(default=False)
    is_analyzed = models.BooleanField(default=False)

    # Statut
    is_read = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    needs_reply = models.BooleanField(default=False)
    replied_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-received_at']

    def __str__(self):
        return f"{self.sender} → {self.subject}"


class FollowUp(models.Model):
    """Relances automatiques"""
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('sent', 'Envoyée'),
        ('cancelled', 'Annulée'),
    ]

    email = models.ForeignKey(Email, on_delete=models.CASCADE, related_name='followups')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    scheduled_at = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)

    def __str__(self):
        return f"Relance pour: {self.email.subject}"