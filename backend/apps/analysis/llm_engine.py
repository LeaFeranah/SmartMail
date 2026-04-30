from groq import Groq
from django.conf import settings
import json

client = Groq(api_key=settings.GROQ_API_KEY)

def analyze_email(email_subject: str, email_body: str, sender: str) -> dict:
    prompt = f"""Tu es un assistant intelligent de gestion d'emails professionnels.

Analyse cet email et réponds UNIQUEMENT en JSON avec cette structure exacte :
{{
  "category": "action_required|waiting_reply|informational|spam|newsletter|other",
  "priority": "urgent|high|normal|low",
  "summary": "résumé en 1-2 phrases maximum",
  "sentiment": "positif|neutre|negatif",
  "action_detected": true|false,
  "needs_reply": true|false,
  "detected_actions": ["liste des actions à faire"],
  "suggested_reply": "courte suggestion de réponse si needs_reply est true, sinon null"
}}

EMAIL À ANALYSER :
De : {sender}
Objet : {email_subject}
Corps : {email_body[:2000]}

Réponds uniquement avec le JSON, sans texte supplémentaire."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        temperature=0.1,
    )

    response_text = response.choices[0].message.content.strip()

    # Nettoyer si le LLM ajoute des backticks
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]

    return json.loads(response_text.strip())


def generate_followup_message(
    original_subject: str,
    original_body: str,
    recipient: str
) -> str:
    prompt = f"""Tu es un assistant professionnel.
Génère un message de relance poli et professionnel en français pour cet email sans réponse.
Le message doit être court (3-4 lignes maximum), naturel et non agressif.

Email original :
Destinataire : {recipient}
Objet : {original_subject}
Contenu : {original_body[:500]}

Génère uniquement le corps du message de relance, sans objet ni salutation."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()