import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(user, to_email: str, subject: str, body: str) -> bool:
    """Envoie un email via SMTP"""
    if not user.smtp_host or not user.imap_user or not user.imap_password:
        raise ValueError("Paramètres SMTP non configurés")

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = user.imap_user
        msg['To'] = to_email

        part = MIMEText(body, 'plain', 'utf-8')
        msg.attach(part)

        with smtplib.SMTP(user.smtp_host, user.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(user.imap_user, user.imap_password)
            server.sendmail(user.imap_user, to_email, msg.as_string())

        return True
    except Exception as e:
        raise ConnectionError(f"Erreur SMTP : {str(e)}")


def send_followup(user, original_email, followup_message: str) -> bool:
    """Envoie une relance pour un email sans réponse"""
    subject = f"Re: {original_email.subject}"
    return send_email(
        user=user,
        to_email=original_email.sender,
        subject=subject,
        body=followup_message,
    )