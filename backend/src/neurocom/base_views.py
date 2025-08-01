from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import ListModelMixin
from rest_framework.request import Request
from django.contrib.auth.models import AnonymousUser
from rest_framework.response import Response
from rest_framework import status
from typing import Any, Dict, Type, Optional, cast, Union
from .mixins import StandardizedResponseMixin
from .errors.exceptions import ValidationError, NotFoundError
from user.models import User
from rest_framework.serializers import ModelSerializer
class BaseAPIView(StandardizedResponseMixin, GenericAPIView):
    serializer_class: type[ModelSerializer]
    """
    Base API view with built-in error handling and standardized responses
    """
    
    def get_authenticated_user(self, request: Request) -> Union[User, Response]:
        """
        Get authenticated user or return error response.
        
        Returns:
            User: The authenticated user
            Response: Error response if user is anonymous
            
        Usage:
            user = self.get_authenticated_user(request)
            if isinstance(user, Response):
                return user  # Return the error response
            # user is now guaranteed to be a User instance
        """
        if isinstance(request.user, AnonymousUser):
            return self.fail_response(
                {"success": False, "message": "Authentication required"},
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        return cast(User, request.user)
    
    pass

class BaseModelAPIView(BaseAPIView):
    """
    Base view for model operations with common CRUD patterns
    """
    serializer_class: type[ModelSerializer]
    def get_object_or_404(self):
        """Get object or raise NotFoundError instead of Http404"""
        try:
            return self.get_object()
        except Exception:
        
            serializer_class = cast(ModelSerializer,self.get_serializer_class())
            model_name = serializer_class.Meta.model.__name__
            raise NotFoundError(
                message=f"{model_name} not found"
            )
    
    def create_object(self, request: Request) -> Response:
        """Standardized object creation"""
        serializer = self.get_validated_serializer(
            self.get_serializer_class(), 
            request.data
        )
        instance = serializer.save()
        return self.created_response(
            self.get_serializer(instance).data,
            f"{instance.__class__.__name__} created successfully"
        )
    
    def update_object(self, request: Request, partial: bool = False) -> Response:
        """Standardized object update"""
        instance = self.get_object_or_404()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        self.validate_serializer(serializer)
        updated_instance = serializer.save()
        return self.success_response(
            self.get_serializer(updated_instance).data,
            f"{updated_instance.__class__.__name__} updated successfully"
        )