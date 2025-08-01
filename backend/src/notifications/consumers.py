from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import UserNotificationsSerializer
import json
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async



class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user'] #Get the user
        self.group_name = None  # Initialize group_name
        if self.user.is_anonymous or not self.user.is_authenticated: #Check if authenticated
            await self.close()
        else:
            self.group_name = f'notifications_{self.user.id}'

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

            await self.send_unread_notifications()

    async def disconnect(self, close_code):
       if self.group_name:
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass
        #TODO Ping/Acknowledge system will be implemented later.

    async def send_notification(self, event):
        notification = event['notification']
        await self.send(text_data=json.dumps({
            'notification':notification
        }))

    @database_sync_to_async
    def get_unread_notifications(self):
        unread_notifications = self.user.notifications.filter(is_read=False).order_by('-created_at')
        serialized_notifications = UserNotificationsSerializer(unread_notifications, many=True).data
        return serialized_notifications

    async def send_unread_notifications(self):

        serialized_notifications = await self.get_unread_notifications()
        await self.send(text_data=json.dumps({
            'notifications': serialized_notifications
        }))
