from __future__ import annotations
from .models import UserNotification, FriendshipRequest, Invitation, ChatroomJoinRequest
from django.db.models.signals import post_save,post_delete,pre_save
from django.dispatch import receiver
from chatroom.models import ChatRoom,Channel
from django.contrib.contenttypes.models import ContentType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import asyncio
from .serializers import UserNotificationsSerializer
from chat.models import DirectMessage
from chat.models import DirectMessageMessage
from asgiref.sync import sync_to_async
import redis.client
from django.conf import settings
from django.db.models import Q
from typing import Any, cast, Union, Protocol
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser


from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from user.models import User
else:
    User = get_user_model()

# Fucking Protocol to ensure all content objects have an id
class ContentObjectProtocol(Protocol):
    id: int

#Signal to create a holding friendship object
@receiver(post_save, sender=FriendshipRequest)
def create_friendship(sender: type[FriendshipRequest], instance: FriendshipRequest,created: bool, **kwargs: Any) -> None:
    if created:
        recipient = instance.recipient
        create_notification(recipient,'friend_request',instance, not(recipient.settings.request_notifications))
      

#Signal for Invitation object
@receiver(post_save, sender=Invitation)
def create_invitation(sender: type[Invitation], instance: Invitation,created: bool, **kwargs: Any) -> None:
     if created:
        recipient = instance.recipient
        create_notification(recipient,'chatroom_invitation',instance, not (recipient.settings.request_notifications))

#Signal for chatroom request object
@receiver(post_save, sender=ChatroomJoinRequest)
def create_chatroom_request(sender: type[ChatroomJoinRequest], instance: ChatroomJoinRequest,created: bool, **kwargs: Any) -> None:
     if created:
        recipient = instance.recipient
        create_notification(recipient,'chatroom_join_request',instance, not (recipient.settings.request_notifications))


#Signal for message object
@receiver(post_save, sender=DirectMessageMessage)
def create_message_notification(sender: type[DirectMessageMessage], instance: DirectMessageMessage,created: bool, **kwargs: Any):
     if created:
          dm: DirectMessage = instance.direct_message
          sender_user = instance.sender
          if dm.user1 == sender_user:
              receiver = dm.user2
          else:
              receiver = dm.user1

          receiver = receiver
          create_notification(receiver,'message',instance, not(receiver.settings.message_notifications))
 

#Create dm when a new friendship object has been created
def create_dm(user1: User,user2: User):
    if user1 and user2:
        dm: DirectMessage = DirectMessage.objects.create(
            user1=user1,
            user2=user2
        )
    

ContentObjectType = Union[FriendshipRequest, Invitation, ChatroomJoinRequest, DirectMessageMessage]

def create_notification(user: User, notification_type: str, content_object: ContentObjectType | None, read: bool = False) -> None:
    if user and content_object: 
        sender: str
        chatroom: str
        message: str
        
        if notification_type == 'message':
            # For DirectMessageMessage objects
            if hasattr(content_object, 'sender'):
                sender_user = content_object.sender
                sender = sender_user.username
                message = f'{sender} sent you a message'
        elif isinstance(content_object, FriendshipRequest):
            initiator = content_object.initiator
            sender = initiator.username
            message = f'{sender} sent you a friend request'
        elif isinstance(content_object, Invitation):
            initiator = content_object.initiator
            sender = initiator.username
            chatroom = content_object.chatroom.name
            message = f'{sender} invited you to join {chatroom}'
        elif isinstance(content_object, ChatroomJoinRequest):
            initiator = content_object.initiator
            sender = initiator.username
            chatroom = content_object.chatroom.name
            message = f'{sender} wants to join {chatroom}'
        else:
            message = 'New notification'
        
        if not get_user_status(user):
            content_type = ContentType.objects.get_for_model(content_object)
            # Cast to ensure Fukcing MyPy knows the fucking object has an id attribute
            obj_with_id = cast(ContentObjectProtocol, content_object)
            notification = UserNotification.objects.create(
                user=user,
                notification_type=notification_type,
                content_type=content_type,
                object_id=obj_with_id.id,
                is_read=read,
                notification_message=message,
            )
            notification_data = UserNotificationsSerializer(notification).data

            if not read:
                async_to_sync(notify_user)(user, notification_data)
    else:
        #TODO Handle cases where user or content_object is None
        pass

def get_user_status(user: User) -> bool:
    redis_client = redis.StrictRedis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=0,
    )

    raw_status: dict[bytes, bytes] = redis_client.hgetall(f"user_activity_{user.id}")

    decoded_status: dict[str, str] = {
        k.decode("utf-8"): v.decode("utf-8") for k, v in raw_status.items()
    }

    return decoded_status.get("in_the_chat_status") == "True"

async def notify_user(user: User, notification_data: dict[str, Any]) -> None:
    channel_layer = get_channel_layer()
    group_name = f'notifications_{user.id}'

    await channel_layer.group_send(
        group_name,
        {'type':'send_notification',
         'notification':notification_data}
    )