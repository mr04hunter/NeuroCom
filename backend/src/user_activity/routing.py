from django.urls import re_path
from . import consumers



user_activity_websocket_urlpatterns = [
    re_path(r'ws/activity/$', consumers.UserActivityConsumer.as_asgi()),
]