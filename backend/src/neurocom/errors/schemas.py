# schemas.py
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from rest_framework import serializers

@dataclass
class ErrorDetail:
    field: Optional[str] = None
    code: Optional[str] = None
    message: str = ""

class ErrorResponseSerializer(serializers.Serializer):
    """Standardized error response format"""
    success = serializers.BooleanField(default=False)
    error_code = serializers.CharField()
    message = serializers.CharField()
    details = serializers.DictField(required=False)
    timestamp = serializers.DateTimeField()
    path = serializers.CharField()
    
class FieldErrorSerializer(serializers.Serializer):
    field = serializers.CharField()
    code = serializers.CharField()
    message = serializers.CharField()

class ValidationErrorResponseSerializer(ErrorResponseSerializer):
    field_errors = FieldErrorSerializer(many=True, required=False)