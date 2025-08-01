from django.test import SimpleTestCase, TestCase
from django.urls import reverse, resolve
from notifications import views
import user.models
from django.contrib.auth import get_user_model
from notifications.models import UserNotification
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from user.models import FriendshipRequest
from django.contrib.contenttypes.models import ContentType
from chatroom.models import Invitation, ChatroomJoinRequest, ChatRoom

user_model = get_user_model()

class TestUserNotificationModel(TestCase):

    def test_create_model_instance_friendship_request(self):

        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id
        self.friendship = FriendshipRequest.objects.create(initiator=self.test_user,recipient=self.user, status='pending')
        content_type = ContentType.objects.get_for_model(self.friendship)
        instance = UserNotification.objects.create(user=self.user, notification_type='friend_request', content_type=content_type, object_id=self.friendship.id)
        instance2 = UserNotification.objects.create(user=self.user, notification_type='friend_request', content_type=content_type, object_id=self.friendship.id)

        self.assertEqual(instance.content_type, content_type)
        self.assertEqual(instance.notification_type, 'friend_request')
        self.assertEqual(instance.is_read, False)
        self.assertEqual(instance.object_id, self.friendship.id)

        self.assertEqual(instance2.content_type, content_type)
        self.assertEqual(instance2.notification_type, 'friend_request')
        self.assertEqual(instance2.is_read, False)
        self.assertEqual(instance2.object_id, self.friendship.id)
        
    def test_create_model_instance_chatroom_request(self):

        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id
        self.chatroom = ChatRoom.objects.create(user=self.test_user, title='testchatroom', name='testname', description='testdes')
        self.request_instance = ChatroomJoinRequest.objects.create(initiator=self.test_user,recipient=self.user, status='pending', chatroom=self.chatroom)
       
        content_type = ContentType.objects.get_for_model(self.request_instance)
        instance = UserNotification.objects.create(user=self.user, notification_type='chatroom_request', content_type=content_type, object_id=self.request_instance.id)
        instance2 = UserNotification.objects.create(user=self.user, notification_type='chatroom_request', content_type=content_type, object_id=self.request_instance.id)

        self.assertEqual(instance.content_type, content_type)
        self.assertEqual(instance.notification_type, 'chatroom_request')
        self.assertEqual(instance.is_read, False)
        self.assertEqual(instance.object_id, self.request_instance.id)
        
        self.assertEqual(instance2.content_type, content_type)
        self.assertEqual(instance2.notification_type, 'chatroom_request')
        self.assertEqual(instance2.is_read, False)
        self.assertEqual(instance2.object_id, self.request_instance.id)

    
    def test_create_model_instance_chatroom_invitations(self):

        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id
        self.chatroom = ChatRoom.objects.create(user=self.test_user, title='testchatroom', name='testname', description='testdes')
        self.invitation_instance = Invitation.objects.create(initiator=self.test_user,recipient=self.user, status='pending', chatroom=self.chatroom)

        content_type = ContentType.objects.get_for_model(self.invitation_instance)
        instance = UserNotification.objects.create(user=self.user, notification_type='chatroom_invitation', content_type=content_type, object_id=self.invitation_instance.id)
        
        instance2 = UserNotification.objects.create(user=self.user, notification_type='chatroom_invitation', content_type=content_type, object_id=self.invitation_instance.id)

        self.assertEqual(instance.content_type, content_type)
        self.assertEqual(instance.notification_type, 'chatroom_invitation')
        self.assertEqual(instance.is_read, False)
        self.assertEqual(instance.object_id, self.invitation_instance.id)

        self.assertEqual(instance2.content_type, content_type)
        self.assertEqual(instance2.notification_type, 'chatroom_invitation')
        self.assertEqual(instance2.is_read, False)
        self.assertEqual(instance2.object_id, self.invitation_instance.id)