from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from user.serializers import UserSerializer
from .models import File, Channel, ChatRoom
from chat.serializers import ChatFileSerializer
from .models import ChatroomMessage, UserChatRoom


class ChatroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = '__all__'
        extra_kwargs = {
            'name': {'max_length': 100},
            'max_members': {'min_value': 1, 'max_value': 1000}
        }

class ChatroomSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['name','title','description','is_public','allow_file_sharing','message_retention_days','mute_notifications','max_members']

class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ['name','chatroom',"is_public","id"]

    
    def get_chatroom(self, obj):
        chatroom = obj.chatroom
        serialized_chatroom = ChatroomSerializer(chatroom).data

        return serialized_chatroom
    
class CreateChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = '__all__'


class UpdateChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ['name','is_public']




    
class MembershipSerializer(serializers.ModelSerializer):
    chatroom = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    class Meta:
        model = UserChatRoom
        fields = '__all__'

    def get_chatroom(self,obj):
        serialized_chatroom = ChatroomSerializer(obj.chatroom).data
        return serialized_chatroom
    
    def get_user(self,obj):
        serialized_user =UserSerializer(obj.user).data
        return serialized_user

class ChatroomMessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    class Meta:
        model = ChatroomMessage
        fields = '__all__'

    def get_sender(self,obj):
        return UserSerializer(obj.sender).data
    def get_file(self, obj):
        # Get the first file if it exists
        file = obj.file.first()
        if file:
            return ChatFileSerializer(file).data  # Serialize the file
        return None
    
    def create(self, validated_data):
        message = ChatroomMessage.objects.create(**validated_data)
        return message