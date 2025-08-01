from __future__ import annotations
from django.db import models
from neurocom.settings import AUTH_USER_MODEL
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from neurocom.utils import BlockAwareManager
from neurocom.utils import user_directory_path
from polymorphic.models import PolymorphicModel
from django.forms import ValidationError
from files.models import File
from django.contrib.contenttypes.fields import GenericRelation
from datetime import datetime
from typing import Any, TYPE_CHECKING, cast

if TYPE_CHECKING:
    from user.models import User
# Create your models here.

class DirectMessage(models.Model):
    user1 = models.ForeignKey(AUTH_USER_MODEL,related_name='dm_user1',on_delete=models.CASCADE)
    user2 = models.ForeignKey(AUTH_USER_MODEL,related_name='dm_user2',on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    last_interaction= models.DateTimeField(default=timezone.now)
    group_name = models.CharField(max_length=100, unique=True)
    objects = BlockAwareManager()
    class Meta:
        unique_together = ('user1', 'user2')
        indexes = [
            models.Index(fields=['last_interaction']),
            models.Index(fields=['user1', 'user2']),
        ]
    
    def save(self, *args, **kwargs) -> None:
        # Sort user IDs and generate the group name based on IDs
        sorted_users = sorted([self.user1.id, self.user2.id])
        self.group_name = f"dm_{sorted_users[0]}_{sorted_users[1]}"
        super().save(*args, **kwargs)


    def update_interaction(self) -> None:
        self.last_interaction = timezone.now()
        self.save()

    def __str__(self) -> str:
        return f"DM between {self.user1.username} and {self.user2.username}"



    

class BaseMessage(models.Model):
    class Meta:
        abstract = True
        ordering = ['-timestamp']
    sender = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    file: GenericRelation = GenericRelation(
        'files.ChatFile',
        content_type_field='message_content_type',
        object_id_field='message_object_id'
    )
    
    def __str__(self) -> str:
        return f"{self.sender.username}: {self.content[:50]}..."

class DirectMessageMessage(BaseMessage):
    direct_message = models.ForeignKey(DirectMessage, related_name='messages', on_delete=models.CASCADE)
