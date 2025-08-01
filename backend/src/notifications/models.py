from __future__ import annotations
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
from django.conf import settings
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from user.models import User
    from chatroom.models import ChatRoom

from django.contrib.auth import get_user_model
from typing import Any



class UserNotification(models.Model):
    NOTIFICATION_TYPES = [
        ('message', 'Message'),
        ('chatroom_invitation', 'Invitation'),
        ('chatroom_join_request', 'Join Request'),
        ('friend_request', 'Friend Request'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES,
        default='message'
    )
    is_read = models.BooleanField(default=False)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    created_at = models.DateTimeField(auto_now=True)
    notification_message = models.TextField(max_length=100, blank=True)
    priority = models.IntegerField(default=1)  # For future sorting

    def __str__(self) -> str:
        return f"{self.notification_type} notification for {self.user}"


class BaseRequest(models.Model):
    class Meta:
        abstract = True
        ordering = ["-created_at"]

    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
    ]

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=PENDING
    )
    is_removed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # These are used for serializer customization or view logic, not models
    initiator_related_name = "base_initiated_requests"
    recipient_related_name = "base_received_requests"


class FriendshipRequest(BaseRequest):
    class Meta:
        db_table = 'requests_friendship_requests'
        verbose_name = 'FriendshipRequest'
        verbose_name_plural = 'FriendshipRequests'

    initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="initiated_friendships",
        on_delete=models.CASCADE
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="received_friendships",
        on_delete=models.CASCADE
    )

    def accept(self) -> None:
        self.status = self.ACCEPTED
        self.save()
        self.initiator.add_friend(self.recipient)

    def reject(self) -> None:
        self.status = self.REJECTED
        self.save()

    def __str__(self) -> str:
        return f'{self.initiator} -> {self.recipient} ({self.status})'


class Invitation(BaseRequest):
    class Meta:
        db_table = 'requests_invitation'
        verbose_name = 'Invitation'
        verbose_name_plural = 'Invitations'

    initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='initiated_invitations',
        on_delete=models.CASCADE
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='received_invitations',
        on_delete=models.CASCADE
    )
    chatroom = models.ForeignKey(
        'chatroom.ChatRoom',
        related_name="sent_invitations",
        on_delete=models.CASCADE
    )

    def __str__(self) -> str:
        return f'{self.initiator} invited {self.recipient} to {self.chatroom} ({self.status})'


class ChatroomJoinRequest(BaseRequest):
    class Meta:
        db_table = 'requests_chatroom_join_requests'
        verbose_name = 'ChatroomJoinRequest'
        verbose_name_plural = 'ChatroomJoinRequests'

    initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='initiated_chatroom_requests',
        on_delete=models.CASCADE
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='received_chatroom_requests',
        on_delete=models.CASCADE
    )
    chatroom = models.ForeignKey(
        'chatroom.ChatRoom',
        related_name="join_requests",
        on_delete=models.CASCADE
    )

    def __str__(self) -> str:
        return f'{self.initiator} requests to join {self.chatroom} ({self.status})'
