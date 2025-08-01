from django.urls import re_path
from . import consumers  # Import your WebSocket consumers

notifications_websocket_urlpatterns = [
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]