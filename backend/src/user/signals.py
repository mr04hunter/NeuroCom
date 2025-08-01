from __future__ import annotations
from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import UserSettings
from notifications.models import UserNotification

from django.contrib.auth import get_user_model
from typing import Any, TYPE_CHECKING

from .models import User

@receiver(post_save, sender=User)
def create_user_settings(sender: type[User], instance: User, created: bool, **kwargs: Any) -> None:
    if created:
        import logging
        logging.info("CREATEDD SETTINGSS")
        UserSettings.objects.create(user=instance)



           