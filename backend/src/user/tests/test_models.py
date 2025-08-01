from django.test import SimpleTestCase, TestCase
from django.urls import reverse, resolve
from user import views
import user.models
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status

user_model = get_user_model()

class TestProfileModel(TestCase):
    def test_create_model_instance(self):
        instance = user_model.objects.create(
            first_name="Test Name",
            last_name='Last Name',
            password='testpassword',
            username='test-username',
            email="test@example.com"
        )
        self.assertEqual(instance.first_name, "Test Name")
        self.assertEqual(instance.username, 'test-username')
        self.assertEqual(instance.email, "test@example.com")
    
    def test_unique_constraint(self):
        user_model.objects.create(
            first_name="Test Name",
            last_name='Last Name',
            password='testpassword',
            username='test-username',
            email="test@example.com"
        )
        with self.assertRaises(IntegrityError):
            user_model.objects.create(
            first_name="Test Name",
            last_name='Last Name',
            password='testpassword',
            username='test-username',
            email="test@example.com"
        )
    
    