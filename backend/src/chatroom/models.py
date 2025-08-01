from __future__ import annotations
from django.db import models
from neurocom.settings import AUTH_USER_MODEL
from neurocom.utils import BlockAwareManager
from chat.models import File
from django.utils import timezone
from neurocom.utils import user_directory_path
from chat.models import BaseMessage
from django.db.models import QuerySet
from django.contrib.auth import get_user_model
from datetime import datetime
from typing import TYPE_CHECKING, cast



if TYPE_CHECKING:
    from user.models import User



class ChatRoom(models.Model):
    name = models.CharField(max_length=100,unique=True)
    users: models.ManyToManyField[User, "UserChatRoom"] = models.ManyToManyField(AUTH_USER_MODEL, through='UserChatRoom')
    title = models.CharField(max_length=200, blank=True, null=True)  # Title of the chatroom
    description = models.TextField(blank=True, null=True)  # Description of the chatroom
    created_at = models.DateTimeField(auto_now_add=True)
    user: models.ForeignKey[User] = models.ForeignKey(AUTH_USER_MODEL, related_name='admin_chatrooms', on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)
    #TODO category = models.CharField(max_length=100, blank=True, null=True)
    allow_file_sharing = models.BooleanField(default=True)
    message_retention_days = models.PositiveIntegerField(default=30)
    #TODO pinned_message = models.ForeignKey('Message', related_name='pinned_in_chatrooms', on_delete=models.SET_NULL, null=True, blank=True)
    mute_notifications = models.BooleanField(default=False)
    #TODO notification_settings = models.JSONField(default=dict)
    #TODO tags = models.ManyToManyField('Tag', blank=True)
    is_archived = models.BooleanField(default=False)
    max_members = models.PositiveIntegerField(default=50)
    #TODO image = models.ImageField(upload_to='chatroom_images/', blank=True, null=True)
    language = models.CharField(max_length=50, default='en')
    objects: BlockAwareManager = BlockAwareManager() #To remove the chatroom from the chatrooms section of blocked users


    def add_member(self, user) -> None:
        if self.users.count() >= self.max_members:
            raise ValueError("Max members reached.")
        elif user not in self.users.all():
            self.users.add(user)

    def remove_member(self, user) -> None:
        if user in self.users.all():
            self.users.remove(user)

    def is_member(self,user) -> bool:
        return self.users.filter(pk=user.pk).exists()

    def __str__(self) -> str:
        return self.name


class Channel(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_public = models.BooleanField(default=True)
    chatroom: models.ForeignKey[ChatRoom] = models.ForeignKey(ChatRoom, related_name='channels', on_delete=models.CASCADE) #Which chatroom the channel belongs to
    

class ChatroomMessage(BaseMessage):
    channel: models.ForeignKey[Channel] = models.ForeignKey(Channel,related_name='messages',on_delete=models.CASCADE)
    def __str__(self) -> str:
        channel = cast(Channel, self.channel)
        return f"Message from {self.sender.username} at {self.timestamp} in {channel.name}"


class UserChatRoom(models.Model):
    user: models.ForeignKey[User] = models.ForeignKey(AUTH_USER_MODEL, related_name="memberships", on_delete=models.CASCADE)
    chatroom: models.ForeignKey[ChatRoom] = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    joined_at: models.DateTimeField[str, datetime] = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'chatroom')

    def __str__(self) -> str:
        user = cast(User, self.user)
        chatroom = cast(ChatRoom, self.chatroom)
        return f"{user.username} in {chatroom.name}"
    
