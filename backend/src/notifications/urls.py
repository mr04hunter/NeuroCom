
from django.urls import path, include
from . import views
from django.conf.urls.static import static
from django.urls import path

urlpatterns = [

    
    
    #NOTIFICATIONS


    path('get_notifications/', views.GetNotificationsView.as_view(), name='get_notifications'),
    path('send_friendship_request/<int:to_user_id>', views.FriendRequestView.as_view(), name='send_friendship_request'),
    path('accept_friendship/<int:notification_id>', views.AcceptFriendRequestView.as_view(), name='accept_friendship'),
    path('decline_friendship/<int:notification_id>', views.DeclineFriendRequestView.as_view(), name='decline_friendship'),
    path('mark_all_read/', views.MarkAllReadView.as_view(), name='mark_all_read'),
    path('accept_invitation/<int:notification_id>', views.AcceptInvitationView.as_view(), name='accept_invitation'),
    path('reject_invitation/<int:notification_id>', views.RejectInvitationView.as_view(), name='decline_invitation'),
    path('send_chatroom_request/<int:chatroom_id>', views.CreateChatroomRequestView.as_view(), name='send_chatroom_request'),
    path('accept_chatroom_request/<int:notification_id>', views.AcceptChatroomRequestView.as_view(), name='accept_chatroom_request'),
    path('reject_chatroom_request/<int:notification_id>', views.RejectChatroomRequestView.as_view(), name='decline_chatroom_request'),

    ########
    
   
    
    
    

]
    

