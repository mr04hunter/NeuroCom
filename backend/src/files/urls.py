from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token


router = DefaultRouter()
router.register(r'upload', views.UploadFileViewSet, basename='upload')
router.register(r'upload_profile_picture', views.UploadProfilePhotoViewSet, basename='upload_profile_picture')


urlpatterns = [
    #FILES

 
    path('', include(router.urls)),
    path('chat/secure-media/<str:access_token>/', views.ChatFileView.as_view({'get':'retrieve'}), name='chat_secure_media'),
    path('profile/secure-media/<str:access_token>/', views.ProfilePictureView.as_view({'get':'retrieve'}), name='profile_pic_secure_media'),


    ##########

]