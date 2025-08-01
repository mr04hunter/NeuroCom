from django.test import SimpleTestCase, TestCase
from django.urls import reverse, resolve
from notifications import views
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status


class TestUrls(SimpleTestCase):
    
    def test_get_notifications_resolves(self):
        url = reverse('get_notifications') 
        self.assertEqual(resolve(url).func.view_class, views.GetNotificationsView)
    
    def test_send_friendship_request_resolves(self):
        url = reverse('send_friendship_request',args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.FriendRequestView)
    
    def test_accept_friendship_resolves(self):
        url = reverse('accept_friendship', args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.AcceptFriendRequestView)

    def test_decline_friendship_resolves(self):
        url = reverse('decline_friendship', args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.DeclineFriendRequestView)

    def test_mark_all_read_resolves(self):
        url = reverse('mark_all_read') 
        self.assertEqual(resolve(url).func.view_class, views.MarkAllReadView)
    
    def test_accept_invtation_resolves(self):
        url = reverse('accept_invitation', args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.AcceptInvitationView)

    def test_reject_invitation_resolves(self):
        url = reverse('decline_invitation', args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.RejectInvitationView)

    def test_send_chatroom_request_resolves(self):
        url = reverse('send_chatroom_request', args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.CreateChatroomRequestView)

    def test_acceot_chatroom_request_resolves(self):
        url = reverse('accept_chatroom_request', args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.AcceptChatroomRequestView)

    def test_reject_chatroom_request_resolves(self):
        url = reverse('decline_chatroom_request', args=[1]) 
        self.assertEqual(resolve(url).func.view_class, views.RejectChatroomRequestView)






