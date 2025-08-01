from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    #CHATROOM

    path('chatrooms/', views.ChatroomsView.as_view(), name='get_chatrooms'),
    path('is_admin/<int:chatroom_id>', views.ChatroomIsAdminView.as_view(), name='chatroom_is_admin'),
    path('get_joined_chatrooms/', views.GetJoinedChatroomsView.as_view(), name='get_joined_chatrooms'),
    path('leave_chatroom/<int:chatroom_id>', views.LeaveChatroomView.as_view(), name='leave_chatroom'),
    path('get_members/<int:chatroom_id>', views.GetMembersView.as_view(), name='get_members'),
    path('remove_member/<int:member_id>/<int:chatroom_id>', views.RemoveMemberView.as_view(), name='remove_member'),
    path('create_chatroom/', views.CreateChatroomView.as_view(), name='create_chatroom'),
    path('my_chatrooms/', views.MyChatroomsView.as_view(), name='my_chatrooms'),
    path('chatroom_settings/<int:id>', views.ChatroomSettingsView.as_view(), name='chatroom_settings'),
    path('update_chatroom_settings/<int:id>', views.UpdateChatroomSettingsView.as_view(), name='update_chatroom_settings'),
    path('delete_chatroom/<int:id>', views.DeleteChatroomView.as_view(), name='delete_chatroom'),
    path('get_channels/<int:chatroom_id>', views.GetChannels.as_view(), name='get_chatroom_channels'),  
    path('add_channel/<int:chatroom_id>', views.CreateChannelView.as_view(), name='create_channel'),  
    path('update_channel/<int:channel_id>', views.UpdateChannelView.as_view(), name='update_channel'),  
    path('delete_channel/<int:id>', views.DeleteChannelView.as_view(), name='delete_channel'),
    path('get_channel_messages/<int:channel_id>', views.GetChannelMessagesView.as_view(), name='get_channel_messages'),
    path('get_invitation_users/<int:chatroom_id>', views.GetInvitationUsersView.as_view(), name='get_invitation_users'),
    path('send_invitation/<int:user_id>/<int:chatroom_id>', views.CreateInvitationView.as_view(), name='send_invitation'),
    

    ##########

    
    
    
    

]
    


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)