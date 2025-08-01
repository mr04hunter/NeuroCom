from django.urls import reverse, resolve

from django.contrib.auth import get_user_model
from notifications.models import UserNotification
from rest_framework.test import APITestCase, APIClient, APITransactionTestCase
from django.test import Client,TestCase, TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from user.models import FriendshipRequest
from django.contrib.contenttypes.models import ContentType
from chatroom.models import Invitation, ChatroomJoinRequest, ChatRoom
from unittest.mock import patch


user_model = get_user_model()

class TestAcceptDeclineNotifications(APITestCase):

    def setUp(self):
        # Create a test user
        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.friendship = FriendshipRequest.objects.create(initiator=self.test_user,recipient=self.user, status='pending')
        content_type = ContentType.objects.get_for_model(self.friendship)
        self.notification = UserNotification.objects.create(user=self.user,notification_type='friend_request', content_type=content_type, object_id=self.friendship.id)


        # Generate a token for the user
        self.token, _ = Token.objects.get_or_create(user=self.user)
        
        # Set the token in the headers
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        
    @patch('notifications.signals.create_notification')
    def test_friendship_signal_view(self,mock_not):
        self.friendship = FriendshipRequest.objects.create(initiator=self.test_user,recipient=self.user, status='pending')


        
        mock_not.assert_called_with(self.friendship.recipient, 'friend_request',self.friendship, False)


    def test_accept_friendship_view(self):
        url = reverse('accept_friendship', args=[self.notification.id])

        response = self.client.put(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_decline_friendship_view(self):
        url = reverse('decline_friendship', args=[self.notification.id])

        response = self.client.put(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_if_request_already_sent(self):
        url = reverse('send_friendship_request', args=[self.test_user_id])

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
        



    
class TestGetAndMarkNotificationsView(APITestCase):

    def setUp(self):
        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.friendship = FriendshipRequest.objects.create(initiator=self.test_user,recipient=self.user, status='pending')
        self.friend_content_type = ContentType.objects.get_for_model(self.friendship)
        self.friend_notification = UserNotification.objects.create(user=self.user,notification_type='friend_request',content_type=self.friend_content_type, object_id=self.friendship.id)
        self.friend_notification_id = self.friend_notification.id

        self.token, _ = Token.objects.get_or_create(user=self.user)
        
        # Set the token in the headers
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')



    def test_get_notifications(self):
        url = reverse('get_notifications')

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data, [])
        
    def test_send_friend_request(self):
        url = reverse('send_friendship_request', args=[self.test_user_id])

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

class TestChatroomInvitations(APITestCase):

    
    def setUp(self):

        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample123@email.com', username='testuser123354', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2123@email.com', username='testuser223', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.test_user, title='testchatroom', name='testname', description='testdes')

        self.invitation = Invitation.objects.create(chatroom=self.chatroom,initiator=self.test_user,recipient=self.user, status='pending')
        
        invitation_content_type = ContentType.objects.get_for_model(self.invitation)

        self.notification = UserNotification.objects.create(user=self.user, notification_type='chatroom_invitation', content_type=invitation_content_type, object_id=self.invitation.id)


        self.token, _ = Token.objects.get_or_create(user=self.user)
        
        # Set the token in the headers
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        return super().setUp()

 
  
         

    @patch('notifications.signals.create_notification')
    def test_invitation_signal(self,mock_not):

        self.chatroom = ChatRoom.objects.create(user=self.test_user, name='testchatroom123', title='chatroom1123',description='testdes')

        self.invitation = Invitation.objects.create(chatroom=self.chatroom,initiator=self.test_user,recipient=self.user, status='pending')
        
        invitation_content_type = ContentType.objects.get_for_model(self.invitation)
        
        mock_not.assert_called_with(self.invitation.recipient, 'chatroom_invitation',self.invitation, False)
    


    def test_accept_invitation_view(self):
        url = reverse('accept_invitation', args=[self.notification.id])

        response = self.client.put(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        

    def decline_invitation_view(self):
        url = reverse('decline_invitation', args=[self.notification.id])

        response = self.client.put(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)



class TestChatroomRequests(APITestCase):
    def setUp(self):

        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom', title='chatroom1',description='testdes')

        self.chatroom_request = ChatroomJoinRequest.objects.create(chatroom=self.chatroom,initiator=self.test_user,recipient=self.user, status='pending')
        self.chatroom_request.id = self.chatroom_request.id
        chatroom_request_content_type = ContentType.objects.get_for_model(self.chatroom_request)
        self.chatroom_request_notification = UserNotification.objects.create(user=self.user,notification_type='chatroom_join_request',content_type=chatroom_request_content_type, object_id=self.chatroom_request.id)
        self.chatroom_request_notification_id = self.chatroom_request_notification.id

        self.token, _ = Token.objects.get_or_create(user=self.user)
        
        # Set the token in the headers
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_send_chatroom_request(self):
        url = reverse('send_chatroom_request', args=[self.chatroom.id])

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_accept_chatroom_request_view(self):
        
        
        url = reverse('accept_chatroom_request', args=[self.chatroom_request_notification_id])  # Use the name of the URL pattern

        response = self.client.put(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_decline_chatroom_request_view(self):
        
        
        url = reverse('decline_chatroom_request', args=[self.chatroom_request_notification_id])  # Use the name of the URL pattern

        response = self.client.put(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('notifications.signals.create_notification')
    def test_chatroom_request_signal(self, mock_not):
        chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom123', title='chatroom1123',description='testdes123')
        chatroom_request = ChatroomJoinRequest.objects.create(chatroom=chatroom,initiator=self.test_user,recipient=self.user, status='pending')

        mock_not.assert_called_with(chatroom_request.recipient, 'chatroom_join_request', chatroom_request, False)







class TestDuplicateRequests(APITestCase):
    def setUp(self):
        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom', title='chatroom1',description='testdes')

        self.chatroom_request = ChatroomJoinRequest.objects.create(chatroom=self.chatroom,initiator=self.test_user,recipient=self.user, status='pending')
        self.chatroom_request.id = self.chatroom_request.id
        chatroom_request_content_type = ContentType.objects.get_for_model(self.chatroom_request)
        self.chatroom_request_notification = UserNotification.objects.create(user=self.user,notification_type='chatroom_join_request',content_type=chatroom_request_content_type, object_id=self.chatroom_request.id)
        self.chatroom_request_notification_id = self.chatroom_request_notification.id

        self.friendship = FriendshipRequest.objects.create(initiator=self.test_user,recipient=self.user, status='pending')
        content_type = ContentType.objects.get_for_model(self.friendship)
        self.notification = UserNotification.objects.create(user=self.user,notification_type='friend_request', content_type=content_type, object_id=self.friendship.id)

        self.invitation = Invitation.objects.create(chatroom=self.chatroom,initiator=self.test_user,recipient=self.user, status='pending')
        
        invitation_content_type = ContentType.objects.get_for_model(self.invitation)

        self.notification = UserNotification.objects.create(user=self.user, notification_type='chatroom_invitation', content_type=invitation_content_type, object_id=self.invitation.id)


        self.token, _ = Token.objects.get_or_create(user=self.user)
        
        # Set the token in the headers
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        return super().setUp()
    

    def test_duplicate_friend_request(self):
        url = reverse('send_friendship_request', args=[self.test_user_id])

        response1 = self.client.post(url)

        url = reverse('send_friendship_request', args=[self.test_user_id])

        response2 = self.client.post(url)

        self.assertNotEqual(response2.status_code, status.HTTP_201_CREATED)

    def test_duplicate_chatroom_request(self):
        url = reverse('send_chatroom_request', args=[self.chatroom.id])

        response1 = self.client.post(url)

        url = reverse('send_chatroom_request', args=[self.chatroom.id])

        response2 = self.client.post(url)

        self.assertNotEqual(response2.status_code, status.HTTP_201_CREATED)


class TestAlreadyMembers(APITestCase):
    def setUp(self):
        self.user = user_model.objects.create(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id

        self.chatroom = ChatRoom.objects.create(user=self.user, name='testchatroom', title='chatroom1',description='testdes')
        self.chatroom.add_member(self.user)


        return super().setUp()
    

    def test_already_member_request(self):
        url = reverse('send_chatroom_request', args=[self.chatroom.id])
        response = self.client.post(url)

        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)