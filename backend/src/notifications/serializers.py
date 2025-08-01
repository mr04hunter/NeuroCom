from __future__ import annotations
from rest_framework import serializers
from .models import UserNotification, Invitation, ChatroomJoinRequest
from user.serializers import FriendshipSerializer, UserSerializer
from chat.serializers import MessageSerializer
from chatroom.serializers import ChatroomSerializer
from django.contrib.contenttypes.models import ContentType
from .models import FriendshipRequest, Invitation, ChatroomJoinRequest
from chat.models import DirectMessageMessage
from chatroom.models import ChatroomMessage
class UserNotificationsSerializer(serializers.ModelSerializer):
    content_object = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    class Meta:
        model = UserNotification
        fields = '__all__'

    def get_content_object(self,obj):
        serializer: FriendshipSerializer | MessageSerializer | InvitationSerializer | ChatroomJoinRequestSerializer
        if isinstance(obj.content_object, FriendshipRequest):
            serializer = FriendshipSerializer(obj.content_object)
        elif isinstance(obj.content_object, DirectMessageMessage) | isinstance(obj.content_object, ChatroomMessage):
            serializer = MessageSerializer(obj.content_object)
        elif isinstance(obj.content_object, Invitation):
            serializer = InvitationSerializer(obj.content_object)
        elif isinstance(obj.content_object, ChatroomJoinRequest):
            serializer = ChatroomJoinRequestSerializer(obj.content_object)
        else:
            return None
        return serializer.data
    
    def get_user(self,obj):
        user = obj.user
        serialized_user = UserSerializer(user).data
        
        return serialized_user
        
    
class ChatroomJoinRequestSerializer(serializers.ModelSerializer):
    initiator = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    chatroom = serializers.SerializerMethodField()
    class Meta:
        model = ChatroomJoinRequest
        fields = '__all__'

    def get_initiator(self,obj):
        return UserSerializer(obj.initiator).data

    def get_recipient(self,obj):
        serialized_recipient = UserSerializer(obj.recipient).data
        return serialized_recipient

    def get_chatroom(self,obj):
        serialized_chatroom = ChatroomSerializer(obj.chatroom).data
        return serialized_chatroom


class InvitationSerializer(serializers.ModelSerializer):
    initiator = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    chatroom = serializers.SerializerMethodField()
    class Meta:
        model = Invitation
        fields = '__all__'

    def get_initiator(self,obj):
        return UserSerializer(obj.initiator).data
    
    def get_recipient(self,obj):
        serialized_recipient = UserSerializer(obj.recipient).data
        return serialized_recipient
    
    def get_chatroom(self,obj):
        serialized_chatroom = ChatroomSerializer(obj.chatroom).data
        return serialized_chatroom