# handlers.py
import logging
from typing import Dict, Any, Optional, cast
from datetime import datetime
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework.request import Request
from .exceptions import APIException

logger = logging.getLogger(__name__)

def custom_exception_handler(exc: Exception, context: Dict[str, Any]) -> Optional[Response]:
    """
    Custom exception handler that returns consistent error responses
    """
    request: Request = cast(Request,context.get('request'))
    path = request.path if request else 'unknown'
    
    # Handle our custom API exceptions
    if isinstance(exc, APIException):
        return _handle_api_exception(exc, path)
    
    # Handle Django built-in exceptions
    if isinstance(exc, Http404):
        return _create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            message="Resource not found",
            path=path
        )
    
    if isinstance(exc, PermissionDenied):
        return _create_error_response(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="PERMISSION_DENIED",
            message="Permission denied",
            path=path
        )
    
    if isinstance(exc, DjangoValidationError):
        return _handle_django_validation_error(exc, path)
    
    # Let DRF handle other exceptions (like DRF ValidationError)
    response = drf_exception_handler(exc, context)
    if response is not None:
        return _format_drf_response(response, path)
    
    # Log unhandled exceptions
    logger.error(f"Unhandled exception: {exc}", exc_info=True, extra={
        'path': path,
        'user': getattr(request, 'user', None) if request else None
    })
    
    # Return generic error for unhandled exceptions
    return _create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code="INTERNAL_ERROR",
        message="An internal error occurred",
        path=path
    )

def _handle_api_exception(exc: APIException, path: str) -> Response:
    """Handle custom API exceptions"""
    return _create_error_response(
        status_code=exc.status_code,
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
        path=path
    )

def _handle_django_validation_error(exc: DjangoValidationError, path: str) -> Response:
    """Handle Django validation errors"""
    if hasattr(exc, 'error_dict'):
        # Field-specific errors
        field_errors = []
        for field, errors in exc.error_dict.items():
            for error in errors:
                field_errors.append({
                    'field': field,
                    'code': error.code,
                    'message': str(error.message)
                })
        
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message="Validation failed",
            details={'field_errors': field_errors},
            path=path
        )
    else:
        # Non-field errors
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            message=str(exc),
            path=path
        )

def _format_drf_response(response: Response, path: str) -> Response:
    """Format DRF exception responses to match our schema"""
    error_code = "VALIDATION_ERROR" if response.status_code == 400 else "API_ERROR"
    
    # Handle different DRF error formats
    if isinstance(response.data, dict):
        field_errors = []
        non_field_errors = []
        
        # Handle the format: {"errors": {"field": ["message"]}}
        if 'errors' in response.data:
            error_data = response.data['errors']
        else:
            error_data = response.data
        
        for field, errors in error_data.items():
            if field == 'non_field_errors':
                non_field_errors.extend([str(error) for error in errors])
            else:
                if isinstance(errors, list):
                    for error in errors:
                        field_errors.append({
                            'field': field,
                            'code': getattr(error, 'code', 'invalid'),
                            'message': str(error)
                        })
                else:
                    field_errors.append({
                        'field': field,
                        'code': 'invalid',
                        'message': str(errors)
                    })
        
        details = {}
        if field_errors:
            details['field_errors'] = field_errors
        if non_field_errors:
            details['non_field_errors'] = cast(list[dict[str, Any]],non_field_errors)
        
        response.data = _create_error_data(
            error_code=error_code,
            message="Validation failed",
            details=details if details else None,
            path=path
        )
    
    return response

def _create_error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    path: str = 'unknown'
) -> Response:
    """Create standardized error response"""
    return Response(
        data=_create_error_data(error_code, message, details, path),
        status=status_code
    )

def _create_error_data(
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    path: str = 'unknown'
) -> Dict[str, Any]:
    """Create standardized error data structure"""
    data = {
        'success': False,
        'error_code': error_code,
        'message': message,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'path': path
    }
    
    if details:
        data['details'] = details
    
    return data