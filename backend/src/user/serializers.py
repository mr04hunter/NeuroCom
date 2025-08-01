from rest_framework import serializers
from  user.models import UserSettings, Friendship
from notifications.models import FriendshipRequest, Invitation
from chatroom.models import ChatRoom, Channel
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q
from neurocom.settings import MEDIA_ROOT
from files.serializers import ProfilePictureSerializer
from django.contrib.auth import get_user_model
from typing import TYPE_CHECKING
from user.models import User


class LogInSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=120, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self,validated_data):
        try:
            user = User(
                username=validated_data['username'],
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                )
            user.set_password(validated_data['password'])
            user.save()
            return user
        except Exception as e:
            import logging as logger
            logger.error(f"Error on RegisterSerializer", str(e), exc_info=True)

    
class UserSerializer(serializers.ModelSerializer):
    profile_picture= serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name','bio',"id","profile_picture","settings")

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return ProfilePictureSerializer(obj.profile_picture).data
        return None
    def get_settings(self,obj):
        user_settings = UserSettings.objects.get(user=obj)
        return UserSettingsSerializer(user_settings).data

class UpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name','bio')

    def update(self, instance, validated_data):
        # Update each field with the new data
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.bio = validated_data.get('bio', instance.bio)

        # Save the instance with the updated data
        instance.save()
        return instance
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self,attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords must match."})
        return attrs

    def validate_old_password(self,value):
        user = self.initial_data['user']
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value
    
class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['message_notifications', 'request_notifications', 'darkmode']


class FriendshipSerializer(serializers.ModelSerializer):
    initiator = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    class Meta:
        model = FriendshipRequest
        fields = '__all__'

    def get_initiator(self, obj):
        serialized_initiator = UserSerializer(obj.initiator).data

        return serialized_initiator
    
    def get_recipient(self, obj):
        serialized_recipient = UserSerializer(obj.recipient).data

        return serialized_recipient

class FriendsSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = '__all__'
    
    def get_created_at(self,obj):
       user = self.context['request'].user
       friendship = Friendship.objects.get(user=user,friend=obj)
       if friendship:
            return friendship.created_at
