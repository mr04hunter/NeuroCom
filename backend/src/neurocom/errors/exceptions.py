from typing import Dict, Any, Optional, List
from rest_framework import status
from rest_framework.views import exception_handler
from rest_framework.response import Response

class APIException(Exception):
    """Base exception for all API errors"""
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code: str = "INTERNAL_ERROR"
    message: str = "An internal error occurred"
    details: Optional[Dict[str, Any]] = None

    def __init__(self, message: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        if message:
            self.message = message
        if details:
            self.details = details
        super().__init__(self.message)

class ValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "VALIDATION_ERROR"
    message = "Validation failed"

class NotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "NOT_FOUND"
    message = "Resource not found"

class PermissionError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "PERMISSION_DENIED"
    message = "Permission denied"

class AuthenticationError(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "AUTHENTICATION_FAILED"
    message = "Authentication failed"

class BusinessLogicError(APIException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "BUSINESS_LOGIC_ERROR"
    message = "Business logic validation failed"

class ExternalServiceError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = "EXTERNAL_SERVICE_ERROR"
    message = "External service unavailable"