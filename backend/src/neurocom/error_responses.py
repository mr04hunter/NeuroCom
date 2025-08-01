from rest_framework.response import Response
from rest_framework import status
from typing import Dict, Any, Optional
from django.utils import timezone

class ErrorResponse:
    @staticmethod
    def format_error(
        error_type: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 400
    ) -> Response:
        response_data = {
            'error': True,
            'error_type': error_type,
            'message': message,
            'timestamp': timezone.now().isoformat(),
        }
        
        if details:
            response_data['details'] = details
            
        return Response(response_data, status=status_code)

    @staticmethod
    def validation_error(serializer_errors: Dict) -> Response:
        formatted_errors = {}
        for field, errors in serializer_errors.items():
            formatted_errors[field] = [str(error) for error in errors]
        
        return ErrorResponse.format_error(
            error_type='validation_error',
            message='Validation failed',
            details={'field_errors': formatted_errors},
            status_code=status.HTTP_400_BAD_REQUEST
        )