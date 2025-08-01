from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from chat.models import File
from chat.serializers import DirectMessageSerializer, MessageSerializer
from files.serializers import ChatFileSerializer
from rest_framework.pagination import PageNumberPagination
from .models import DirectMessage, BaseMessage, DirectMessageMessage
from rest_framework.response import Response
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
import os
from neurocom import settings
from django.forms import ValidationError
from typing import Any, Dict, Optional, Type
from django.db.models import QuerySet
from django.http import Http404, HttpRequest
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from django.db.models import Q
import logging
from common.custom_api_classes import AuthenticatedAPIView

# Assuming these are your model and serializer imports
from .models import DirectMessage, DirectMessageMessage
from .serializers import DirectMessageSerializer, MessageSerializer
from typing import TYPE_CHECKING, cast, Any
from neurocom.base_views import BaseAPIView, BaseModelAPIView
if TYPE_CHECKING:
    from user.models import User


###### PAGINATION CLASSES ######
class MessagePagination(PageNumberPagination):
    page_size = 25  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum page size

class DmPagination(PageNumberPagination):
    page_size = 15  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum page size




### VIEWS ###


class GetDirectMessagesView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DirectMessageSerializer
    pagination_class = DmPagination
    
    def get_serializer_context(self) -> dict[str, Any]:
        return {
            'request':self.request
        }

    def get_queryset(self) -> QuerySet[DirectMessage]:
        try:
            
            dm_objects: QuerySet[DirectMessage] = DirectMessage.objects.exclude_blocked(self.request.user).filter(Q(user1=self.request.user) | Q(user2=self.request.user)).order_by('-last_interaction')
            
            return dm_objects

        except DirectMessage.DoesNotExist:
            import logging as logger
            logger.error(f"DM Object Not Found",exc_info=True)
            raise Http404
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "direct_messages": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="DMs retrieved successfully"
        )
            
            
class GetDmMessagesView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = MessagePagination
    def get_queryset(self) -> QuerySet[DirectMessageMessage]:
        dm_id: int | None = self.kwargs.get('id')
        return DirectMessageMessage.objects.filter(direct_message=dm_id).order_by('-timestamp')
    
    def list(self, request: Request, *args: Any, **kwargs: Any):

            dm_id: str | None= self.kwargs.get('id')
            dm: DirectMessage = get_object_or_404(DirectMessage, id=dm_id)

            return super().list(request, *args, **kwargs)
        
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, *kwargs)
        return self.success_response(
            data={
                "messages": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="DM Messages retrieved successfully"
        )
       
