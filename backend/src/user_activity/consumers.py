from channels.generic.websocket import AsyncWebsocketConsumer
import redis
from django.conf import settings
import redis.client
from asgiref.sync import sync_to_async
import json
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from chat.models import DirectMessage
from typing import cast, Any
redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)


class UserActivityConsumer(AsyncWebsocketConsumer):


    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_anonymous or not self.user.is_authenticated:
            await self.close()
        else:
            
            await self.accept()
            await self.channel_layer.group_add('user_status', self.channel_name)
            await sync_to_async(redis_client.sadd)('online_users', self.user.id)
            await sync_to_async(redis_client.sadd)("online_channels",self.channel_name)
            await self.send_to_all()
            



    async def get_user_status(self,event):
        group_name = event['group_name']
        user_status = event['user_status']
        self.channel_layer.send_group('user_activity',{
            "type":'send_user_status',
            "user_status":user_status
        })



    @database_sync_to_async
    def get_dm(self, dm_id):
        try:
            # Select related users in the same query to avoid lazy loading in async context
            dm = DirectMessage.objects.select_related('user1', 'user2').get(id=dm_id)
            # Return a dictionary with relevant fields
            return {
                'user1_id': dm.user1.id,
                'user2_id': dm.user2.id,
                'group_name': dm.group_name
            }
        except DirectMessage.DoesNotExist:
            return None
    
    async def disconnect(self,close_code):
        user_id = self.scope['user'].id
        await sync_to_async(redis_client.srem)("online_users", user_id)

        await sync_to_async(redis_client.srem)("online_channels", self.channel_name)
        await self.send_to_all()


    async def receive(self, text_data=None):
        pass
        


    async def send_to_all(self):
        try:
            
            online_users: Any = await sync_to_async(redis_client.smembers)("online_users")
            online_users = [int(user_id) for user_id in online_users], online_users


            online_channels: Any = await sync_to_async(redis_client.smembers)("online_channels")



            for channel_name in online_channels:

                channel_name = channel_name.decode()
                await self.channel_layer.send(channel_name, {
                    "type": "send_online_users",
                    "online_users": online_users
                })
            

        except Exception as e:
            print(e)


    async def send_online_users(self, event):
        try:
 
            online_users = event.get('online_users', [])
   
            
            await self.send(text_data=json.dumps({
                "type": "online_users",
                "online_users": online_users
            }))

        except Exception as e:
            print(f"Error in send_message: {e}") 