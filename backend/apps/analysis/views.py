from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.emails.models import Email
from apps.tasks_app.models import Task
from .llm_engine import analyze_email


class AnalyzeEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            email = Email.objects.get(pk=pk, user=request.user)
        except Email.DoesNotExist:
            return Response(
                {'error': 'Email non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            result = analyze_email(
                email_subject=email.subject,
                email_body=email.body_text,
                sender=email.sender,
            )

            # Sauvegarder les résultats
            email.category = result.get('category', 'other')
            email.priority = result.get('priority', 'normal')
            email.summary = result.get('summary', '')
            email.sentiment = result.get('sentiment', 'neutre')
            email.action_detected = result.get('action_detected', False)
            email.needs_reply = result.get('needs_reply', False)
            email.is_analyzed = True
            email.save()

            # Créer automatiquement des tâches si actions détectées
            tasks_created = []
            detected_actions = result.get('detected_actions', [])

            if email.action_detected and detected_actions:
                for action in detected_actions[:3]:  # max 3 tâches
                    task = Task.objects.create(
                        user=request.user,
                        source_email=email,
                        title=action[:500],
                        description=f"Détecté automatiquement depuis : {email.subject}\nDe : {email.sender}",
                        priority=email.priority,
                        status='todo',
                        is_auto_detected=True,
                    )
                    tasks_created.append({
                        'id': task.id,
                        'title': task.title,
                    })

            # Si needs_reply → créer une tâche de réponse
            if email.needs_reply:
                suggested = result.get('suggested_reply', '')
                task = Task.objects.create(
                    user=request.user,
                    source_email=email,
                    title=f"Répondre à : {email.subject}",
                    description=f"De : {email.sender}\n\nSuggestion IA :\n{suggested}",
                    priority=email.priority,
                    status='todo',
                    is_auto_detected=True,
                )
                tasks_created.append({
                    'id': task.id,
                    'title': task.title,
                })

            return Response({
                'success': True,
                'analysis': result,
                'email_id': email.id,
                'tasks_created': tasks_created,
                'tasks_count': len(tasks_created),
            })

        except Exception as e:
            return Response(
                {'error': f'Erreur analyse IA : {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalyzeBatchView(APIView):
    """Analyser tous les emails non encore analysés"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        emails = Email.objects.filter(
            user=request.user,
            is_analyzed=False
        )[:10]

        results = []
        for email in emails:
            try:
                result = analyze_email(
                    email_subject=email.subject,
                    email_body=email.body_text,
                    sender=email.sender,
                )
                email.category = result.get('category', 'other')
                email.priority = result.get('priority', 'normal')
                email.summary = result.get('summary', '')
                email.sentiment = result.get('sentiment', 'neutre')
                email.action_detected = result.get('action_detected', False)
                email.needs_reply = result.get('needs_reply', False)
                email.is_analyzed = True
                email.save()

                # Créer tâches automatiquement
                detected_actions = result.get('detected_actions', [])
                if email.action_detected and detected_actions:
                    for action in detected_actions[:2]:
                        Task.objects.get_or_create(
                            user=request.user,
                            source_email=email,
                            title=action[:500],
                            defaults={
                                'description': f"Depuis : {email.subject}\nDe : {email.sender}",
                                'priority': email.priority,
                                'status': 'todo',
                                'is_auto_detected': True,
                            }
                        )

                if email.needs_reply:
                    Task.objects.get_or_create(
                        user=request.user,
                        source_email=email,
                        title=f"Répondre à : {email.subject}",
                        defaults={
                            'description': f"De : {email.sender}",
                            'priority': email.priority,
                            'status': 'todo',
                            'is_auto_detected': True,
                        }
                    )

                results.append({'email_id': email.id, 'status': 'ok'})
            except Exception as e:
                results.append({'email_id': email.id, 'status': 'error', 'msg': str(e)})

        return Response({'analyzed': len(results), 'results': results})