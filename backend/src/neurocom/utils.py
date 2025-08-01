from typing import TYPE_CHECKING
from django.db.models import Q
from django.db.models import Manager
from django.db import models
from .settings import MEDIA_ROOT
import os
from django.apps import apps

if TYPE_CHECKING:
    from django.db.models import Model
    from django.contrib.auth.models import AbstractUser

# Upload to the user specific location
def user_directory_path(instance, filename):
    print(instance)
    User = apps.get_model('user', "User")
    if isinstance(instance, User):
        return f'{instance.username}/profile_photos/{filename}'
    if instance.user:
        return f'{instance.user.username}/{filename}'
    else:
        return f'{"unassigned"}/{filename}'


class BlockUserQuerySetMixin:
    """
    Mixin to filter out content from blocked users.
    Add this to your model's custom QuerySet class.
    """
    
    def exclude_blocked(self, user):
        if user.is_authenticated:
            if hasattr(self.model, "user"):  # type: ignore[attr-defined]
                return self.exclude(  # type: ignore[attr-defined]
                    user__blocked_user__user=user  # Exclude content where creator is blocked by current user
                ).exclude(  # type: ignore[attr-defined]
                    user__blocked_by__blocked_user=user  # Exclude content where creator has blocked current user
                )
            elif hasattr(self.model, "user1"):  # type: ignore[attr-defined]
                return self.exclude(  # type: ignore[attr-defined]
                    Q(user1__blocked_user__user=user) |  # user1 has blocked the current user
                    Q(user2__blocked_user__user=user) |  # user2 has blocked the current user
                    Q(user1__blocked_by__blocked_user=user) |  # The current user has blocked user1
                    Q(user2__blocked_by__blocked_user=user)  # The current user has blocked user2
                )
            elif hasattr(self.model, "username"):  # type: ignore[attr-defined]
                return self.exclude(  # type: ignore[attr-defined]
                    Q(blocked_by__user=user) |
                    Q(blocked_by__blocked_user=user)
                )
        return self


class BlockAwareQuerySet(BlockUserQuerySetMixin, models.QuerySet):
    """
    Custom QuerySet that inherits from both the mixin and Django's QuerySet.
    Note: Mixin should come first in the inheritance order.
    """
    pass


class BlockAwareManager(Manager):  # type: ignore
    def get_queryset(self):  # type: ignore
        return BlockAwareQuerySet(self.model, using=self._db)  # type: ignore
    
    def exclude_blocked(self, user):  # type: ignore
        return self.get_queryset().exclude_blocked(user)  # type: ignore

