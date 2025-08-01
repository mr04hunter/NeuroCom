from django.test import SimpleTestCase, TestCase
from django.urls import reverse, resolve
from chatroom import views
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status


class TestUrls(SimpleTestCase):
    
    def test_get_chatrooms_resolves(self):
        url = reverse('get_chatrooms')  
        print(url)
        self.assertEqual(resolve(url).func.view_class, views.ChatroomsView)
    
    def test_is_admin_resolves(self):
        url = reverse('chatroom_is_admin',args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.ChatroomIsAdminView)
    
    def test_get_joined_chatrooms_resolves(self):
        url = reverse('get_joined_chatrooms')  
        self.assertEqual(resolve(url).func.view_class, views.GetJoinedChatroomsView)

    def test_leave_chatroom_resolves(self):
        url = reverse('leave_chatroom', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.LeaveChatroomView)

    def test_get_members_resolves(self):
        url = reverse('get_members', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.GetMembersView)
    
    def test_remove_member_resolves(self):
        url = reverse('remove_member', args=[1,2])  
        self.assertEqual(resolve(url).func.view_class, views.RemoveMemberView)

    def test_create_chatroom_resolves(self):
        url = reverse('create_chatroom')  
        self.assertEqual(resolve(url).func.view_class, views.CreateChatroomView)

    def test_my_chatrooms_resolves(self):
        url = reverse('my_chatrooms')  
        self.assertEqual(resolve(url).func.view_class, views.MyChatroomsView)

    def test_chatroom_settings_resolves(self):
        url = reverse('chatroom_settings', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.ChatroomSettingsView)

    def test_update_chatroom_resolves(self):
        url = reverse('update_chatroom_settings', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.UpdateChatroomSettingsView)

    def test_delete_chatroom_resolves(self):
        url = reverse('delete_chatroom', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.DeleteChatroomView)

    def test_get_channels_resolves(self):
        url = reverse('get_chatroom_channels', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.GetChannels)

    def test_add_channel_resolves(self):
        url = reverse('create_channel', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.CreateChannelView)

    def test_update_channel_resolves(self):
        url = reverse('update_channel', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.UpdateChannelView)

    def test_delete_channel_resolves(self):
        url = reverse('delete_channel', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.DeleteChannelView)

    def test_get_channel_messages_resolves(self):
        url = reverse('get_channel_messages', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.GetChannelMessagesView)

    def test_get_invitation_users_resolves(self):
        url = reverse('get_invitation_users', args=[1])  
        self.assertEqual(resolve(url).func.view_class, views.GetInvitationUsersView)

    def test_send_invitation_resolves(self):
        url = reverse('send_invitation', args=[1,2])  
        self.assertEqual(resolve(url).func.view_class, views.CreateInvitationView)






