from django.urls import reverse, resolve

from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status


user_model = get_user_model()



class TestviewUrls(APITestCase):

    def setUp(self):
      
        self.user = user_model.objects.create_user(first_name='test', last_name='test',email='testexample@email.com', username='testuser', password='password123')
        self.test_user = user_model.objects.create_user(first_name='test', last_name='test',email='testexample2@email.com', username='testuser2', password='password123')
        self.test_user_id = self.test_user.id
      
        self.token, _ = Token.objects.get_or_create(user=self.user)
        
    
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')


    def test_me_view(self):
        url = reverse('user')  
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_edit_profile_view(self):
        url = reverse('edit')  

        data = {
            'first_name':'aiden',
            'last_name':'hunter',
            'email':'test@email.com',
            'username':'aiden123',
            'bio':''
                }

        response = self.client.put(url, data) 
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'aiden')  


    def test_update_settings_view(self):
        url = reverse('update_settings')  

        data = {
            'message_notifications': False,
            'darkmode':False,
            'request_notifications':False,
                }
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message_notifications'], False)

    def test_settings_view(self):
        url = reverse('settings')  

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_view(self):
        url = reverse('change_password')  

        data = {
            'old_password':'password123',
            'new_password':'new_password123',
            'confirm_new_password':'new_password123'
        }

        response = self.client.put(url, data)

        self.assertEqual(response.status_code ,status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password Updated Successfully')

    def test_delete_account_view(self):
        url = reverse('delete_account')  
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_users_view(self):
        url = reverse('get_users') 

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_block_user_view(self):
        url = reverse('block_user', args=[self.test_user_id])  

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_blocked_users_view(self):
        url = reverse('get_blocked_users') 

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unblock_user_view(self):
        self.user.block_user(self.test_user)
        url = reverse('unblock_user', args=[self.test_user_id])  
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
    def test_get_friends_view(self):
        url = reverse('get_friends')  
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_profile_view(self):
        url = reverse('get_user_profile', args=['testuser2'])  
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_remove_friendship_view(self):
        self.test_user.add_friend(self.user)
        url = reverse('remove_friendship', args=[self.test_user_id]) 
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
