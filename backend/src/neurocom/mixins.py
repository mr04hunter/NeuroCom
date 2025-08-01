from typing import Any, Dict, Optional, cast
from rest_framework.response import Response
from rest_framework import status
from rest_framework.request import Request
from rest_framework.serializers import BaseSerializer
from django.db.models.query import QuerySet
import logging
from django.http import HttpRequest, HttpResponse

logger = logging.getLogger(__name__)



class StandardizedResponseMixin:
    """
    Mixin that provides standardized response methods and automatic error handling
    """
    
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        """
        Override dispatch to catch all exceptions and let our handler process them
        """
        try:
            return super().dispatch(request, *args, **kwargs)# type: ignore[misc]
        except Exception as e:
            # Log the error with context
            logger.error(
                f"Error in {self.__class__.__name__}.{cast(str,request.method).lower()}: {e}",
                exc_info=True,
                extra={
                    'view': self.__class__.__name__,
                    'method': request.method,
                    'path': request.path,
                    'user': str(getattr(request, 'user', 'Anonymous')),
                }
            )
            # Re-raise to let our custom exception handler process it
            raise
    
    def success_response(
        self, 
        data: Any = None, 
        message: str = "Success", 
        status_code: int = status.HTTP_200_OK
    ) -> Response:
        """Create standardized success response"""
        response_data = {
            'success': True,
            'message': message,
        }
        if data is not None:
            response_data['data'] = data
            
        return Response(response_data, status=status_code)
    
    def fail_response(self, data: Any = None, status_code: int = status.HTTP_400_BAD_REQUEST) -> Response:
        return Response(data, status=status_code)
    
    def created_response(self, data: Any, message: str = "Created successfully") -> Response:
        """Create standardized creation response"""
        return self.success_response(data, message, status.HTTP_201_CREATED)
    
    def validate_serializer(self, serializer: BaseSerializer) -> BaseSerializer:
        """Validate serializer and raise exception if invalid"""
        serializer.is_valid(raise_exception=True)
        return serializer
    
    def get_validated_serializer(self, serializer_class, data: Dict[str, Any]) -> BaseSerializer:
        """Create and validate serializer in one step"""
        serializer = serializer_class(data=data)
        return self.validate_serializer(serializer)