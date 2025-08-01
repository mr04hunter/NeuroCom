from __future__ import annotations
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db.models import Q
from django.utils import timezone
from neurocom.utils import BlockAwareManager
from neurocom.utils import user_directory_path
from neurocom import settings
from django.db.models import QuerySet
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.db.models import QuerySet
from typing import TYPE_CHECKING, Optional
from datetime import datetime
if TYPE_CHECKING:
    from files.models import ProfileImage  


class User(AbstractUser):
    profile_picture = models.ForeignKey(
        "files.ProfileImage", 
        null=True,
        on_delete=models.SET_NULL,
        default=None,
        related_name='profile_picture'
    )
    bio = models.TextField(max_length=100, blank=True)
    friends: models.ManyToManyField[User, Friendship] = models.ManyToManyField(
        'self',
        blank=True,
        through='Friendship',
        symmetrical=True,
        related_name='friend_of'
    )
    blocked_users: models.ManyToManyField[User, Friendship] = models.ManyToManyField(
        'self',
        blank=True,
        through='UserBlock',
        symmetrical=False,
        related_name='blocked_users_set'
    )
    is_online = models.BooleanField(default=False)
    last_active = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'username'
    
    
    
    def __str__(self) -> str:
        return self.username
    
    def add_friend(self, profile: User) -> None:
        if profile not in self.friends.all():
            self.friends.add(profile)
    
    def remove_friend(self, profile: User) -> None:
        if profile in self.friends.all():
            self.friends.remove(profile)
    
    def is_friend(self, profile: User) -> bool:
        return profile in self.friends.all()
    
    def block_user(self, user: User) -> None:
        if self != user:
            self.blocked_users.add(user)
    
    def unblock_user(self, user: User) -> None:
        if self != user and user in self.blocked_users.all():
            self.blocked_users.remove(user)
    
    def is_blocked(self, user: User) -> bool:
        return user in self.blocked_users.all()
    
    def get_friends_list(self) -> QuerySet[User]:
        return self.friends.all()
    
    def get_blocked_users_list(self) -> QuerySet[User]:
        return self.blocked_users.all()
    
    def can_send_message(self, recipient: User) -> bool:
        """Check if this user can send a message to recipient"""
        return not recipient.is_blocked(self) and not self.is_blocked(recipient)


class UserBlock(models.Model):
    user: models.ForeignKey[User] = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="blocked_by",
        on_delete=models.CASCADE
    )
    blocked_user: models.ForeignKey[User] = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="blocked_user",
        on_delete=models.CASCADE
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'blocked_user')
    
    def __str__(self) -> str:
        return f'{self.user} blocked {self.blocked_user}'


class Friendship(models.Model):
    friend: models.ForeignKey[User] = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='friend',
        on_delete=models.CASCADE
    )
    user: models.ForeignKey[User] = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='friends_of',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self) -> str:
        return f'{self.user} and {self.friend} are friends'



class UserSettings(models.Model):
    user: models.OneToOneField[User] = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    message_notifications = models.BooleanField(default=True)
    request_notifications = models.BooleanField(default=True)
    darkmode = models.BooleanField(default=True)
    
    def __str__(self) -> str:
        return f"{self.user.username}'s settings"
    
    class Meta:
        verbose_name_plural = "User settings"