# middleware.py
import logging
import time
import json
from typing import Callable
from django.http import HttpRequest, HttpResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class ErrorLoggingMiddleware(MiddlewareMixin):
    """Middleware to log API requests and responses"""
    
    def process_request(self, request: HttpRequest) -> None:
        request._start_time = time.time() #type: ignore[attr-defined]
        
        # Log incoming request
        if request.path.startswith('/api/'):
            logger.info(f"API Request: {request.method} {request.path}", extra={
                'method': request.method,
                'path': request.path,
                'user': getattr(request, 'user', None),
                'ip': self._get_client_ip(request)
            })
    
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        if hasattr(request, '_start_time') and request.path.startswith('/api/'):
            duration = time.time() - request._start_time
            
            # Log response
            log_data = {
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': round(duration * 1000, 2),
                'user': getattr(request, 'user', None),
                'ip': self._get_client_ip(request)
            }
            
            if response.status_code >= 400:
                logger.warning(f"API Error Response: {request.method} {request.path} - {response.status_code}", extra=log_data)
            else:
                logger.info(f"API Response: {request.method} {request.path} - {response.status_code}", extra=log_data)
        
        return response
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip