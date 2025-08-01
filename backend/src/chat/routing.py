from django.urls import re_path
from . import consumers  # Import your WebSocket consumers

chat_websocket_urlpatterns = [
    re_path(r'ws/chatroom/(?P<chatroom_id>\w+)/(?P<channel_id>\d+)/$', consumers.ChatroomConsumer.as_asgi()),
    re_path(r'ws/dm/(?P<dm_id>\w+)/$', consumers.DirectMessageConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_name>\w+)/$', consumers.DirectMessageConsumer.as_asgi()),
]