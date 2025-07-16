from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    username = serializers.CharField(required=True)
    fullName = serializers.CharField(write_only=True)  # This is just for frontend use
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('username', 'fullName', 'email', 'password')

    def create(self, validated_data):
        full_name = validated_data.pop('fullName')  # Remove fullName from validated_data
        first_name = full_name  # or you can split if needed
        user = User.objects.create_user(
            username=validated_data['username'],  # this will now stay 'faiz'
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name  # optional: save fullName in first_name
        )
        return user
