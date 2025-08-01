from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [

    # USER ##############
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogOut.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.UserView.as_view(), name='user'),
    path('edit_profile/', views.UpdateView.as_view(), name='edit'),
    path('update_settings/', views.UpdateSettingsView.as_view(), name='update_settings'),
    path('settings/', views.SettingsView.as_view(), name='settings'),
    path('change_password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('delete_account/', views.DeleteAccountView.as_view(), name='delete_account'),
    path('get_users/', views.GetUsersView.as_view(), name='get_users'),
    path('block_user/<int:user_id>', views.BlockUserView.as_view(), name='block_user'),
    path('get_blocked_users/', views.BlockedUsersView.as_view(), name='get_blocked_users'),
    path('unblock_user/<int:user_id>', views.UnblockUserView.as_view(), name='unblock_user'),
    path('get_friends/', views.GetFriendsView.as_view(), name='get_friends'),
    path('get_user_profile/<str:username>', views.GetUserProfileView.as_view(), name='get_user_profile'),  
    # path('upload_profile_photo/', views.UploadProfilePhotoView.as_view(), name='upload_profile_photo'),
    path('remove_friendship/<int:friend_id>', views.RemoveFriendshipView.as_view(), name='remove_friendship'),
    ##########


    
    

]
    

