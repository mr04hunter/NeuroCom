from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import DirectMessage, DirectMessageMessage
from user.serializers import UserSerializer

from .models import File
from django.contrib.auth import get_user_model
from files.serializers import ChatFileSerializer

user_model= get_user_model()

#SERIALIZERS FOR CHAT


    
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()

    class Meta:
        model = DirectMessageMessage
        fields = '__all__'

    def get_sender(self,obj):
        sender = UserSerializer(obj.sender).data


        return sender
    
    def get_file(self, obj):
        # Get the first file if it exists
        file = obj.file.first()
        if file:
            return ChatFileSerializer(file).data  # Serialize the file
        return None
    
    def create(self, validated_data):
        file_data = validated_data.pop('file', None)
        message = DirectMessageMessage.objects.create(**validated_data)

        if file_data:
            file_serializer = ChatFileSerializer(data=file_data)
            file_serializer.is_valid(raise_exception=True)
            file_instance = file_serializer.save()
            message.file = file_instance
            message.save()

        return message





class DirectMessageSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    class Meta:
        model = DirectMessage
        fields = '__all__'


    def get_other_user(self,obj):
        user_id = obj.user1.id
        user = user_model.objects.get(id=user_id)

        if user == self.context['request'].user:
            return UserSerializer(obj.user2).data
        else:
            return UserSerializer(user).data


