from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token






urlpatterns = [
    #CHAT

    path('get_direct_messages/', views.GetDirectMessagesView.as_view(), name='get_direct_messages'),   
    path('get_messages_dm/<int:id>/messages/', views.GetDmMessagesView.as_view(), name='get_messages_dm'),  


    ##########

]
    

