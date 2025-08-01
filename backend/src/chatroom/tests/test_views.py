from django.urls import reverse, resolve

from django.contrib.auth import get_user_model
from notifications.models import UserNotification
from rest_framework.test import APITestCase, APIClient, APITransactionTestCase
from django.test import Client,TestCase, TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from user.models import FriendshipRequest
from django.contrib.contenttypes.models import ContentType
from chatroom.models import Invitation, ChatroomJoinRequest, ChatRoom, Channel
from unittest.mock import patch

User = get_user_model()

class TestChatroomRequests(APITestCase):
    def setUp(self):

        self.user = User.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = User.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom', title='chatroom1',description='testdes')
        self.chatroom2 = ChatRoom.objects.create(user=self.test_user, name='testchatroom232', title='chatroom123',description='testdes32')
        self.channel = Channel.objects.create(name='testchannel', chatroom=self.chatroom, is_public=True)

        self.chatroom_request = ChatroomJoinRequest.objects.create(chatroom=self.chatroom,initiator=self.test_user,recipient=self.user, status='pending')
       

        self.token, _ = Token.objects.get_or_create(user=self.user)
        
        # Set the token in the headers
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_get_chatrooms_view(self):
        url = reverse('get_chatrooms')

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_is_admin_view(self):
        url = reverse('chatroom_is_admin', args=[self.chatroom.id])

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_admin'], True)

    def test_get_joined_chatrooms_view(self):
        self.chatroom2.add_member(self.user)
        url = reverse('get_joined_chatrooms',)

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data, [])

    def test_leave_chatroom_view(self):
        self.chatroom2.add_member(self.user)
        url = reverse('leave_chatroom',args=[self.chatroom2.id])

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data, [])

    def test_get_members_view(self):
        self.chatroom.add_member(self.test_user)
        url = reverse('get_members',args=[self.chatroom.id])

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data, [])

    def test_remove_member_view(self):
        self.chatroom.add_member(self.test_user)
        url = reverse('remove_member',args=[self.test_user.id,self.chatroom.id])

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data, [])

    def test_create_chatroom_view(self):
        url = reverse('create_chatroom')

        data = {
            'user':self.user.id,
            'name':'testname',
            'title':'test',
            'description':'test',
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_my_chatrooms_view(self):
        url = reverse('my_chatrooms')


        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data, [])

    def test_chatroom_settings_view(self):
            url = reverse('chatroom_settings', args=[self.chatroom.id])


            response = self.client.get(url)

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertNotEqual(response.data, [])

    def test_update_chatroom_settings_view(self):
            url = reverse('update_chatroom_settings', args=[self.chatroom.id])

            data = {
                 'name':'updatedname',
                 'title':'updatedtitle',
                 'description':'testdesc',
                 'is_public':False,
                 'allow_file_sharing':True,
                 'message_retention_days':20,
                 'max_members':50,
                 'mute_notifications':True,

            }

            response = self.client.put(url, data)

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertNotEqual(response.data, [])

    def test_delete_chatroom_view(self):
            url = reverse('delete_chatroom', args=[self.chatroom.id])

            

            response = self.client.delete(url)

            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertNotEqual(response.data, [])

    def test_get_channels_view(self):
            url = reverse('get_chatroom_channels', args=[self.chatroom.id])

            

            response = self.client.get(url)

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertNotEqual(response.data, [])


    
    def test_add_channels_view(self):
            url = reverse('create_channel', args=[self.chatroom.id])

            data = {
                 'chatroom':self.chatroom.id,
                 'name':'channel',
                 'is_public':True,
                 

            }

            response = self.client.post(url, data)

            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertNotEqual(response.data, [])


    def test_update_channels_view(self):
            url = reverse('update_channel', args=[self.channel.id])

            data = {
                 'chatroom':self.chatroom.id,
                 'name':'updatedchannel',
                 'is_public':True,
                 

            }

            response = self.client.put(url, data)

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertNotEqual(response.data, [])

    def test_delete_channels_view(self):
            url = reverse('delete_channel', args=[self.channel.id])

            response = self.client.delete(url)

            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertNotEqual(response.data, [])

        
    def test_get_channel_messages_view(self):
            url = reverse('get_channel_messages', args=[self.channel.id])

            response = self.client.get(url)

            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_channel_messages_view(self):
            url = reverse('get_invitation_users', args=[self.chatroom.id])

            response = self.client.get(url)

            self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_send_invitation_view(self):
            url = reverse('send_invitation', args=[self.test_user.id,self.chatroom.id])

            response = self.client.post(url)

            self.assertEqual(response.status_code, status.HTTP_201_CREATED)




    