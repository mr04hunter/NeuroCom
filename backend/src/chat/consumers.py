from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import DirectMessage,DirectMessageMessage
import json
from chatroom.models import ChatRoom, Channel, ChatroomMessage
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model
from .serializers import MessageSerializer
from asgiref.sync import sync_to_async
import redis.client
from django.conf import settings
from django.core.files.base import ContentFile
import base64
from files.models import ChatFile
from django.utils import timezone
from chatroom.serializers import ChatroomMessageSerializer
from django.contrib.contenttypes.models import ContentType
import logging
from django.db.transaction import atomic
logger = logging.getLogger(__name__)


#REDIS SETUP
redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)

user_model = get_user_model()



class BaseConsumer(AsyncWebsocketConsumer):
    message_model: type[DirectMessageMessage] | type[ChatroomMessage] | None  = None
    serializer_class: type[MessageSerializer] | type[ChatroomMessageSerializer] | None = None
    
    
    
    async def connect(self):
        self.user = self.scope["user"]
        is_authorized = await self.authorize()
        
        if not is_authorized:
            logger.info('UNAUTHORIZED')
            self.close()
            return
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        
        
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action_type = data['action_type'] #Detect the action type: chat_message, edit_message, delete_message, user_status
            
       
            if action_type == 'chat_message':

                message = data['message']
                message = await self.save_message(message)
                
                # Send message to group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message
                    }
                )
            
            elif action_type == 'edit_message':
                await self.edit_message(data)
            elif action_type == 'delete_message':
                await self.delete_message(data)

            elif action_type == 'user_status':
                pass

        except json.JSONDecodeError:
            await self.send_error("Invalid json format")
            
        except Exception as e:
            logger.error(f"Error in receive: {e}")
            await self.send_error("Internal server error")


    #Message edit function
    async def edit_message(self,data):
        try:
            message_id = data['message_id']
            new_content = data['new_content']
            message = await self.get_message(message_id) #Get the message from the database
            message.content = new_content #Update the content of the message
            await self.edit_save_message(new_content,message_id)
        
            #Send the edited message id back to frontend with the new content to update the message
            await self.channel_layer.group_send(
                self.room_group_name,{
                    'type':'send_edited_message',
                    'message_id': message.id,
                    'new_content': new_content
                }
            )
        except Exception as e:
            logger.error(f"Error on edit_message:{e}")

    
    #Message delete function
    async def delete_message(self,data):
        try:
            
            message_id = data['message_id']
            await self.delete_message_from_database(message_id)

            #Send the deleted message id back to frontend to remove from the chat.
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type':'send_deleted_message',
                    'message_id':message_id
                }
            )
        except Exception as e:
            logger.error(f"Error on delete_message:{e}")
    
    
    
    #Sending user status: Typing, Online etc.
    async def send_user_status(self,event):
        try:
            
            user_status = event['user_status']

            await self.send(text_data=json.dumps({
                "action_type":'user_status',
                "user_status":user_status
            }))
        except Exception as e:
            logger.error(f"Error on send_user_status:{e}")


        
        
    async def send_deleted_message(self, event):
        try:
            
            await self.send(text_data=json.dumps({
                'action_type': 'message_deleted',
                'message_id': event['message_id']
            }))
        except Exception as e:
            logger.error(f"Error on send_deleted_message:{e}")

    async def send_edited_message(self, event):
        try:
            
            await self.send(text_data=json.dumps({
                'action_type': 'message_edited',
                'message_id': event['message_id'],
                'new_content': event['new_content']
            }))
            
        except Exception as e:
            logger.error(f"Error on send_edited_message:{e}")

    async def chat_message(self, event):
        try:
            
            await self.send(text_data=json.dumps({
                'action_type': 'chat_message',
                'message': event['message']
            }))
            
        except Exception as e:
            logger.error(f"Error on chat_message:{e}")


    #================================================#
    # Must be implemented in the subclass

    async def authorize(self):
        raise NotImplementedError()

    @database_sync_to_async
    def delete_message_from_database(self, message_id):
        raise NotImplementedError()

    @database_sync_to_async
    def save_message(self, message_data):
        raise NotImplementedError()

    @database_sync_to_async
    def edit_save_message(self, new_content, message_id):
        raise NotImplementedError()
    
    #================================================#



#CHATROOM CONSUMER
class ChatroomConsumer(BaseConsumer):
    message_model = type[ChatroomMessage]
    serializer_class = type[ChatroomMessageSerializer]
    room_group_name: str | None = None

    async def authorize(self):
        try:
            self.chatroom_id = self.scope['url_route']['kwargs']['chatroom_id']
            self.channel_id = self.scope['url_route']['kwargs']['channel_id']
            self.user = self.scope['user']
            
            # Get the DM object and check if the current user is part of this DM
            self.chatroom = await self.get_chatroom(self.chatroom_id)

            if self.chatroom is None:
                await self.close()
                return
            
            # Check if the user is part of the DM (authorization)
            if not self.user in self.chatroom.users.all() and self.user != self.chatroom.user:
                await self.close()  # Close connection if user is unauthorized
                logger.info("UNAUTHORIZED")
                return False
            self.room_group_name = f"chatroom_{self.chatroom.id}"
            logger.info("AUTHORIZED")
            return True
            
        except Exception as e:
            logger.error(f"Error on authorize (Chatroom): {e}")
            

    #Get the chatroom from the database
    @database_sync_to_async
    def get_chatroom(self, chatroom_id):
        try:
            return ChatRoom.objects.select_related('user').prefetch_related('users').get(id=chatroom_id)
            
        except Channel.DoesNotExist:
            return None
        
        except Exception as e:
            logger.error(f"Error on get_chatroom:{e}")
        


    @database_sync_to_async
    def delete_message_from_database(self,message_id):
        try:
            message = ChatroomMessage.objects.get(id=message_id) #Get the message from the database
            #Check if the sender is not the same user to delete
            if message.sender == self.user:
                message.delete()
        except Exception as e:
            logger.error(f"Error on delete_message_from_database(Chatroom): {e}")

    #Get message function 
    @database_sync_to_async
    def get_message(self,message_id):
        try:
            return ChatroomMessage.objects.get(id=message_id)
        except Exception as e:
            logger.error(f"Error on get_message(Chatroom): {e}")


    #Save the message to the database
    @database_sync_to_async
    def save_message(self,message_data):
        try:
            channel = Channel.objects.get(id=message_data['channel_id']) #Get the channel that the message belongs to
            user = user_model.objects.get(id=message_data['sender']['id']) #get the sender
            if 'file' in message_data: #Check if a file exists in the message
                #Get the file data
                file_id = message_data['file']['id']

                
                with atomic():
                    # Create message
                    new_message = ChatroomMessage.objects.create(
                    channel=channel, 
                    sender=user,
                    content=message_data['content']
                    )

                    # Update file to point to this message
                    ChatFile.objects.filter(id=file_id).update(
                    message_object_id=new_message.id,
                    message_content_type=ContentType.objects.get_for_model(new_message),
                    )
  
                
                serialized_message = ChatroomMessageSerializer(new_message).data
            else:


                message = ChatroomMessage.objects.create(channel=channel,sender=user,content=message_data['content'])
                message.save()
                serialized_message = ChatroomMessageSerializer(message).data
            return serialized_message
        except Exception as e:
            logger.error(f"Error on save_message(Chatroom): {e}")
    
    #Update the edited message
    @database_sync_to_async
    def edit_save_message(self,new_content,message_id):
        try:
            message = ChatroomMessage.objects.get(id=message_id)

            #Check if the sender is the same user who edits
            if message.sender != self.user:
                pass

            else:
                message.content = new_content
                message.save()
                serialized_message = ChatroomMessageSerializer(message).data
                return serialized_message
        except Exception as e:
            logger.error(f"Error on edit_save_message:{e}")

    


class DirectMessageConsumer(BaseConsumer):
    message_model = type[DirectMessageMessage]
    serializer_class = type[MessageSerializer]
    
    async def authorize(self):
        try:
            
            self.dm_id = self.scope['url_route']['kwargs']['dm_id']
            self.dm = await self.get_dm(self.dm_id)

            if not self.dm:
                return False

            if self.user.id not in [self.dm['user1_id'], self.dm['user2_id']]:
                return False

            self.room_group_name = self.dm['group_name']
            return True
        except Exception as e:
            logger.error(f"Error on authorize(DM): {e}")


    async def broadcast_status(self):
        try:
            
            user_status_1 = await sync_to_async(redis_client.hgetall)(f'user_activity_{self.dm["user1_id"]}')
            user_status_2 = await sync_to_async(redis_client.hgetall)(f'user_activity_{self.dm["user2_id"]}')
            user_status_list = [user_status_1,user_status_2]
            decoded_status_list = []
            for user_status in user_status_list:
                decoded_status = {k.decode('utf-8'): v.decode('utf-8') for k, v in user_status.items()}
                decoded_status_list.append(decoded_status)
                
            await self.channel_layer.group_send(self.room_group_name, {
                'type':'send_user_status',
                'user_status':decoded_status_list
            })
        except Exception as e:
            logger.error(f"Error on broadcast_status(DM): {e}")

    async def send_user_status(self,event):
        try:
            
            user_status = event['user_status']

            await self.send(text_data=json.dumps({
                "action_type":'user_status',
                "user_status":user_status
            }))
        except Exception as e:
            logger.error(f"Error on send_user_status(DM): {e}")

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
        except Exception as e:
            logger.error(f"Error on get_dm: {e}")


    @database_sync_to_async
    def delete_message_from_database(self,message_id):
        try:
            
            message = DirectMessageMessage.objects.get(id=message_id)
            if message.sender != self.user:
                pass
            else:

                message.delete()
        except Exception as e:
            logger.error(f"Error on delete_message_from_database(DM): {e}")

    @database_sync_to_async
    def get_message(self,message_id):
        try:
            return DirectMessageMessage.objects.get(id=message_id)
        except Exception as e:
            logger.error(f"Error on get_message(DM):{e}")

    @database_sync_to_async
    def save_message(self,message_data):
        try:
            dm = DirectMessage.objects.get(id=message_data['dm_id'])
            user = user_model.objects.get(id=message_data['sender']['id'])
            file_data = message_data.get("file")
            if file_data:
                
                file_id = message_data['file']['id']

                
                with atomic():
                    # Create message
                    new_message = DirectMessageMessage.objects.create(
                    sender=user,
                    direct_message=dm,
                    content=message_data['content']
                    )

                    # Update file to point to this message
                    ChatFile.objects.filter(id=file_id).update(
                    message_object_id=new_message.id,
                    message_content_type=ContentType.objects.get_for_model(new_message),
                    )
  
                
                serialized_message = MessageSerializer(new_message).data
            else:


                message = DirectMessageMessage.objects.create(direct_message=dm,sender=user,content=message_data['content'])
                message.save()
                dm.update_interaction()
                serialized_message = MessageSerializer(message).data
            return serialized_message
        except Exception as e:
            logger.error(f"Error on save_message(DM): {e}")
    
    @database_sync_to_async
    def edit_save_message(self,new_content,message_id):
        try:
            
            message = DirectMessageMessage.objects.get(id=message_id)
            if message.sender != self.user:
                pass

            else:
                message.content = new_content
                message.save()
                serialized_message = MessageSerializer(message).data
                return serialized_message
        except Exception as e:
            logger.error(f"Error on edit_save_message:(DM) {e}")

