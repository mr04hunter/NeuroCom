from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from chatroom.models import ChatRoom,Channel
from notifications.models import Invitation
from typing import Any

#Create the main channel when a chatroom is created
@receiver(post_save, sender=ChatRoom)
def create_main_channel(sender: type[ChatRoom], instance: ChatRoom,created: bool, **kwargs: Any):
     if created:
          main_channel = Channel.objects.create(chatroom=instance,name="Main")
          main_channel.save()