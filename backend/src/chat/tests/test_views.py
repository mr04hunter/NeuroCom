from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token
from rest_framework import status
from chat.models import DirectMessage, DirectMessageMessage, File
from django.core.files.uploadedfile import SimpleUploadedFile
import json
import tempfile
import os
from neurocom import settings

User = get_user_model()

class DirectMessageViewTest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
        self.user3 = User.objects.create_user(
            username='user3',
            email='user3@test.com',
            password='testpass123'
        )
        
        # Create token for user1
        self.token = Token.objects.create(user=self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Create some test DMs
        self.dm1 = DirectMessage.objects.create(user1=self.user1, user2=self.user2)
        self.dm2 = DirectMessage.objects.create(user1=self.user1, user2=self.user3)
        
    def test_get_direct_messages_authenticated(self):
        """Test getting direct messages for authenticated user"""
        url = reverse('get_direct_messages')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
    def test_get_direct_messages_unauthenticated(self):
        """Test that unauthenticated users can't access DMs"""
        self.client.credentials()  # Remove authentication
        url = reverse('get_direct_messages')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_get_direct_messages_ordering(self):
        """Test that DMs are ordered by last_interaction"""
        # Update interaction time for dm2
        self.dm2.update_interaction()
            
        url = reverse('get_direct_messages')
        response = self.client.get(url)
    
        """dm2 should be first (more recent interaction)"""
        self.assertEqual(response.data['results'][0]['id'], self.dm2.id)
        
    def test_get_dm_messages(self):
        """Test getting messages for a specific DM"""
        # Create some test messages
        DirectMessageMessage.objects.create(
            direct_message=self.dm1,
            sender=self.user1,
            content="Message 1"
        )
        DirectMessageMessage.objects.create(
            direct_message=self.dm1,
            sender=self.user2,
            content="Message 2"
        )
        
        url = reverse('get_messages_dm', args=[self.dm1.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
    def test_get_dm_messages_nonexistent(self):
        import logging as logger
        """Test getting messages for non-existent DM"""
        url = reverse('get_messages_dm', args=[999])
        response = self.client.get(url)
        logger.debug(response)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_pagination(self):
        """Test pagination for DM messages"""
        # Create many messages
        for i in range(30):
            DirectMessageMessage.objects.create(
                direct_message=self.dm1,
                sender=self.user1,
                content=f"Message {i}"
            )
            
        url = reverse('get_messages_dm', args=[self.dm1.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 25)  # Default page size
        self.assertIsNotNone(response.data['next'])


class FileUploadViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
    def test_upload_valid_file(self):
        """Test uploading a valid file"""
        # Create a simple text file
        file_content = b"This is a test file content"
        uploaded_file = SimpleUploadedFile(
            "test.txt",
            file_content,
            content_type="text/plain"
        )
        
        url = reverse('upload-list')
        response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('url', response.data)
        self.assertEqual(response.data['original_name'], 'test.txt')
        
    def test_upload_no_file(self):
        """Test upload request without file"""
        url = reverse('upload-list')
        response = self.client.post(url, {}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
    def test_upload_large_file(self):
        """Test uploading file that exceeds size limit"""
        # Create a file larger than 10MB
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        uploaded_file = SimpleUploadedFile(
            "large.txt",
            large_content,
            content_type="text/plain"
        )
        
        url = reverse('upload-list')
        response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_upload_invalid_file_type(self):
        """Test uploading invalid file type"""
        file_content = b"Invalid content"
        uploaded_file = SimpleUploadedFile(
            "test.exe",
            file_content,
            content_type="application/x-executable"
        )
        
        url = reverse('upload-list')
        response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_upload_unauthenticated(self):
        """Test that unauthenticated users can't upload files"""
        self.client.credentials()  # Remove authentication
        
        uploaded_file = SimpleUploadedFile(
            "test.txt",
            b"content",
            content_type="text/plain"
        )
        
        url = reverse('upload-list')
        response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SecureMediaViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        self.relative_path = 'uploads/testuser/test.txt'
        self.full_path = os.path.join(settings.MEDIA_ROOT, self.relative_path)

        with open(self.full_path, 'wb') as f:
            f.write(b"Test content")

        # Create DB object with that path
        self.file_obj = File.objects.create(
            user=self.user,
            original_name='test.txt',
            file_path=self.relative_path,
            file_size=1024,
            mime_type='text/plain',
            file_type='file',
        )
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.full_path), exist_ok=True)
        
    def test_secure_media_access_valid_token(self):
        url = reverse('secure_media', args=[self.file_obj.access_token])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('X-Accel-Redirect', response)
        self.assertEqual(response['Content-Type'], 'text/plain')
    
    def tearDown(self):
        # Clean up created file
        if os.path.exists(self.full_path):
            os.remove(self.full_path)

                
    def test_secure_media_access_invalid_token(self):
        """Test accessing file with invalid access token"""
        url = reverse('secure_media', args=['invalid_token'])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
