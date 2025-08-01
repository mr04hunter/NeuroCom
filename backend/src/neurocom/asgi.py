"""
ASGI config for neurocom project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os


from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from asgiref.sync import sync_to_async


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurocom.settings')

django_asgi_app = get_asgi_application()


from chat.routing import chat_websocket_urlpatterns
from notifications.routing import notifications_websocket_urlpatterns
from user_activity.routing import user_activity_websocket_urlpatterns


@sync_to_async
def get_user_from_token(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware:
    def __init__(self,inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode()
        query_params = parse_qs(query_string)
        token_key = query_params.get('token')

        if token_key:
            token_key = token_key[0]
            scope['user'] = await get_user_from_token(token_key)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)




application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket":AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                TokenAuthMiddleware(URLRouter(chat_websocket_urlpatterns + notifications_websocket_urlpatterns + user_activity_websocket_urlpatterns )))
        )
        # Just HTTP for now. (We can add other protocols later.)
    }
)