from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'imap_host', 'imap_port', 'imap_user',
            'smtp_host', 'smtp_port',
            'auto_followup_enabled', 'followup_delay_days',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2',
                  'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class MailSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'imap_host', 'imap_port', 'imap_user', 'imap_password',
            'smtp_host', 'smtp_port',
            'auto_followup_enabled', 'followup_delay_days',
        ]