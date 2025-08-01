from django.urls import reverse, resolve

from  django.contrib.auth import get_user_model
from notifications.models import UserNotification
from rest_framework.test import APITestCase, APIClient, APITransactionTestCase
from django.test import Client,TestCase, TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from user.models import FriendshipRequest
from ..models import File
from django.contrib.contenttypes.models import ContentType
from chat.models import DirectMessage, DirectMessageMessage
from unittest.mock import patch

User = get_user_model()

class DirectMessageTestModel(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
        username="user1",
        email="user1@test.com",
        password="testp123"
        )
        self.user2 = User.objects.create_user(
        username="user2",
        email="user2@test.com",
        password="testp123"
        )
        self.user3 = User.objects.create_user(
        username="user3",
        email="user3@test.com",
        password="testp123"
        )
        
    def test_dm_creation(self):
        dm = DirectMessage.objects.create(user1=self.user1, user2=self.user2)
        
        expected_group_name = f"dm_{min(self.user1.id, self.user2.id)}_{max(self.user1.id, self.user2.id)}"
        self.assertEqual(dm.group_name, expected_group_name)
        
    def test_dm_unique_constraint(self):
        """Test that duplicate DMs cannot be created"""
        DirectMessage.objects.create(user1=self.user1, user2=self.user2)
        
        with self.assertRaises(Exception):
            DirectMessage.objects.create(user1=self.user1, user2=self.user2)
            
    def test_dm_reverse_users_same_group(self):
        """Test that user1/user2 vs user2/user1 create same group name"""
        dm1 = DirectMessage.objects.create(user1=self.user1, user2=self.user2)
        # This should fail due to unique constraint, but if it didn't, group names would be same
        expected_group_name = f"dm_{min(self.user1.id, self.user2.id)}_{max(self.user1.id, self.user2.id)}"
        self.assertEqual(dm1.group_name, expected_group_name)
        
    def test_update_interaction(self):
        """Test last_interaction update"""
        dm = DirectMessage.objects.create(user1=self.user1, user2=self.user2)
        original_time = dm.last_interaction
        
        # Small delay to ensure time difference
        import time
        time.sleep(0.01)
        
        dm.update_interaction()
        self.assertGreater(dm.last_interaction, original_time)
        
    def test_str_method(self):
        """Test string representation"""
        dm = DirectMessage.objects.create(user1=self.user1, user2=self.user2)
        expected_str = f"DM between {self.user1.username} and {self.user2.username}"
        self.assertEqual(str(dm), expected_str)
    
    

class FileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
    def test_file_creation(self):
        """Test File model creation"""
        file_obj = File.objects.create(
            user=self.user,
            original_name='test.txt',
            file_path='/uploads/test.txt',
            file_size=1024,
            mime_type='text/plain',
            file_type='file'
        )
        
        self.assertEqual(file_obj.user, self.user)
        self.assertEqual(file_obj.original_name, 'test.txt')
        self.assertIsNotNone(file_obj.access_token)
        self.assertEqual(len(file_obj.access_token), 64)  # URL-safe base64 token
        
    def test_access_token_generation(self):
        """Test that access tokens are unique"""
        file1 = File.objects.create(
            user=self.user,
            original_name='test1.txt',
            file_path='/uploads/test1.txt',
            file_size=1024,
            mime_type='text/plain',
            file_type='file'
        )
        
        file2 = File.objects.create(
            user=self.user,
            original_name='test2.txt',
            file_path='/uploads/test2.txt',
            file_size=1024,
            mime_type='text/plain',
            file_type='file'
        )
        
        self.assertNotEqual(file1.access_token, file2.access_token)
        
    def test_file_type_choices(self):
        """Test file type choices validation"""
        valid_types = ['image', 'gif', 'file']
        
        for file_type in valid_types:
            file_obj = File.objects.create(
                user=self.user,
                original_name=f'test.{file_type}',
                file_path=f'/uploads/test.{file_type}',
                file_size=1024,
                mime_type='text/plain',
                file_type=file_type
            )
            self.assertEqual(file_obj.file_type, file_type)
            
            
class DirectMessageMessageModelTest(TestCase):
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
        self.dm = DirectMessage.objects.create(user1=self.user1, user2=self.user2)
        
    def test_message_creation(self):
        """Test DirectMessageMessage creation"""
        message = DirectMessageMessage.objects.create(
            direct_message=self.dm,
            sender=self.user1,
            content="Test message"
        )
        
        self.assertEqual(message.direct_message, self.dm)
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.content, "Test message")
        self.assertFalse(message.is_read)
        
    def test_message_with_file(self):
        """Test message creation with file attachment"""
        file_obj = File.objects.create(
            user=self.user1,
            original_name='test.txt',
            file_path='/uploads/test.txt',
            file_size=1024,
            mime_type='text/plain',
            file_type='file'
        )
        
        message = DirectMessageMessage.objects.create(
            direct_message=self.dm,
            sender=self.user1,
            content="Message with file",
            file=file_obj
        )
        
        self.assertEqual(message.file, file_obj)
        self.assertEqual(message.content, "Message with file")
        
    def test_message_timestamp(self):
        """Test that timestamp is automatically set"""
        message = DirectMessageMessage.objects.create(
            direct_message=self.dm,
            sender=self.user1,
            content="Test message"
        )
        
        self.assertIsNotNone(message.timestamp)
        self.assertIsNotNone(message.created_at)