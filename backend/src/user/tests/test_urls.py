from django.test import SimpleTestCase, TestCase
from django.urls import reverse, resolve
from user import views

from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status

class TestUrls(SimpleTestCase):
    
    def test_login_url_resolves(self):
        url = reverse('login')  
        self.assertEqual(resolve(url).func.view_class, views.LoginView)
    
    def test_register_url_resolves(self):
        url = reverse('register')  
        self.assertEqual(resolve(url).func.view_class, views.RegisterView)
    
    def test_logout_url_resolves(self):
        url = reverse('logout')  
        self.assertEqual(resolve(url).func.view_class, views.LogOut)







