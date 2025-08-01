from django.urls import reverse, resolve

from django.contrib.auth import get_user_model
from notifications.models import UserNotification
from rest_framework.test import APITestCase, APIClient, APITransactionTestCase
from django.test import Client,TestCase, TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from user.models import FriendshipRequest
from django.contrib.contenttypes.models import ContentType
from chatroom.models import Invitation, ChatroomJoinRequest, ChatRoom, Channel, ChatroomMessage
from unittest.mock import patch

user_model = get_user_model()

class TestModels(TestCase):

    def test_chatroom_model(self):

        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom', title='chatroom1',description='testdes')

        self.assertEqual(self.chatroom.name, 'testchatroom')
        self.assertEqual(self.chatroom.title, 'chatroom1')
        self.assertEqual(self.chatroom.description, 'testdes')
        self.assertEqual(self.chatroom.is_public, True)
        self.assertEqual(self.chatroom.allow_file_sharing, True)
        self.assertEqual(self.chatroom.message_retention_days, 30)
        self.assertEqual(self.chatroom.mute_notifications, False)
        self.assertEqual(self.chatroom.max_members, 50)

    def test_channel_model(self):
        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom', title='chatroom1',description='testdes')
        self.channel = Channel.objects.create(chatroom=self.chatroom, is_public=True, name='testchannel')

        self.assertEqual(self.channel.name, 'testchannel')
        self.assertEqual(self.channel.is_public, True)
        self.assertEqual(self.channel.chatroom.name, 'testchatroom')


    def test_chatroom_message_model(self):
        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom', title='chatroom1',description='testdes')
        self.channel = Channel.objects.create(chatroom=self.chatroom, is_public=True, name='testchannel')
        self.message = ChatroomMessage.objects.create(channel=self.channel, sender=self.user, content='testcontent')

        self.assertEqual(self.message.content, 'testcontent')
        self.assertEqual(self.message.channel, self.channel)
        self.assertEqual(self.message.sender, self.user)

