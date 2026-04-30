import imaplib
import email
from email.header import decode_header
from email.utils import parsedate_to_datetime
import chardet


def decode_str(s):
    if s is None:
        return ''
    if isinstance(s, bytes):
        detected = chardet.detect(s)
        encoding = detected.get('encoding') or 'utf-8'
        return s.decode(encoding, errors='replace')
    return str(s)


def decode_subject(subject):
    parts = decode_header(subject)
    result = ''
    for part, encoding in parts:
        if isinstance(part, bytes):
            result += part.decode(encoding or 'utf-8', errors='replace')
        else:
            result += part
    return result


def get_email_body(msg):
    body_text = ''
    body_html = ''
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            disposition = str(part.get('Content-Disposition', ''))
            if 'attachment' in disposition:
                continue
            payload = part.get_payload(decode=True)
            if payload is None:
                continue
            charset = part.get_content_charset() or 'utf-8'
            text = payload.decode(charset, errors='replace')
            if ctype == 'text/plain':
                body_text += text
            elif ctype == 'text/html':
                body_html += text
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or 'utf-8'
            text = payload.decode(charset, errors='replace')
            if msg.get_content_type() == 'text/html':
                body_html = text
            else:
                body_text = text
    return body_text, body_html


def sync_emails(user, max_emails=50):
    """
    Se connecte à la boîte IMAP de l'utilisateur
    et retourne la liste des emails récents
    """
    if not user.imap_host or not user.imap_user or not user.imap_password:
        raise ValueError("Paramètres IMAP non configurés")

    results = []

    try:
        mail = imaplib.IMAP4_SSL(user.imap_host, user.imap_port)
        mail.login(user.imap_user, user.imap_password)
        mail.select('INBOX')

        _, message_numbers = mail.search(None, 'ALL')
        email_ids = message_numbers[0].split()

        # Prendre les N plus récents
        recent_ids = email_ids[-max_emails:] if len(email_ids) > max_emails else email_ids
        recent_ids = list(reversed(recent_ids))

        for email_id in recent_ids:
            try:
                _, msg_data = mail.fetch(email_id, '(RFC822)')
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)

                message_id = msg.get('Message-ID', '').strip()
                if not message_id:
                    continue

                subject = decode_subject(msg.get('Subject', '(Sans objet)'))
                sender = msg.get('From', '')
                recipients = [msg.get('To', '')]
                cc = [msg.get('Cc', '')] if msg.get('Cc') else []

                date_str = msg.get('Date', '')
                try:
                    received_at = parsedate_to_datetime(date_str)
                except Exception:
                    from django.utils import timezone
                    received_at = timezone.now()

                body_text, body_html = get_email_body(msg)

                results.append({
                    'message_id': message_id,
                    'subject': subject[:500],
                    'sender': sender[:255],
                    'recipients': recipients,
                    'cc': cc,
                    'body_text': body_text[:10000],
                    'body_html': body_html[:50000],
                    'received_at': received_at,
                })
            except Exception:
                continue

        mail.logout()
    except imaplib.IMAP4.error as e:
        raise ConnectionError(f"Erreur IMAP : {str(e)}")

    return results