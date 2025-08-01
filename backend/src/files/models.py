from __future__ import annotations
import os
import secrets
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
from typing import Any, TYPE_CHECKING

User = get_user_model()
if TYPE_CHECKING:
    from user.models import User

class BaseFile(models.Model):
    """Abstract base model"""
    
    class FileType(models.TextChoices):
        IMAGE = 'image', 'Image'
        GIF = 'gif', 'GIF'
        DOCUMENT = 'document', 'Document'
        VIDEO = 'video', 'Video'
        AUDIO = 'audio', 'Audio'
        OTHER = 'other', 'Other'
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
    
    # Core fields
    user = models.ForeignKey(

        User, 
        on_delete=models.CASCADE,
        related_name='%(class)s_files',  # Dynamic related name
        help_text="User who uploaded the file"
    )
    original_name = models.CharField(
        max_length=255,
        help_text="Original filename as uploaded"
    )
    file_path = models.CharField(
        max_length=500,
        help_text="Relative path to the file from MEDIA_ROOT"
    )
    file_size = models.PositiveIntegerField(
        help_text="File size in bytes"
    )
    mime_type = models.CharField(
        max_length=100,
        help_text="MIME type of the file"
    )
    file_type = models.CharField(
        max_length=10,
        choices=FileType.choices,
        help_text="Category of file type"
    )
    
    # Timestamps
    created_at= models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Security fields
    access_token = models.CharField(
        max_length=64,
        unique=True,
        help_text="Secure access token for file retrieval"
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Optional expiration time for file access"
    )
    is_public = models.BooleanField(
        default=False,
        help_text="Whether file can be accessed without authentication"
    )
    
    def __str__(self) -> str:
        return f"{self.original_name} ({self.user.username})"
    
    def clean(self) -> None:
        """Validate file constraints"""
        super().clean()
        
        # Check file size
        max_size = self.get_max_file_size()
        if self.file_size > max_size:
            raise ValidationError(
                f"File size cannot exceed {max_size / (1024*1024):.1f}MB"
            )
        
        # Validate file type
        if not self.is_valid_file_type():
            raise ValidationError(
                f"File type {self.mime_type} is not allowed for {self.__class__.__name__}"
            )
    
    def save(self, *args, **kwargs) -> None:
        """Override save to generate access token"""
        if not self.access_token:
            self.access_token = self.generate_access_token()
        
        # Auto-detect file type from mime_type if not set
        if not self.file_type:
            self.file_type = self.detect_file_type()
        
        self.full_clean()
        super().save(*args, **kwargs)
    
    def generate_access_token(self) -> str:
        """Generate secure access token"""
        return secrets.token_urlsafe(48)
    
    def get_max_file_size(self) -> int:
        """Get maximum file size for this file type (override in subclasses)"""
        return 10 * 1024 * 1024  # 10MB default
    
    def is_valid_file_type(self) -> bool:
        """Check if mime type is valid for this file type (override in subclasses)"""
        return True  # Base implementation allows all types
    
    def detect_file_type(self) -> str:
        """Auto-detect file type from mime_type"""
        if self.mime_type.startswith('image/'):
            return self.FileType.IMAGE if 'gif' not in self.mime_type else self.FileType.GIF
        elif self.mime_type.startswith('video/'):
            return self.FileType.VIDEO
        elif self.mime_type.startswith('audio/'):
            return self.FileType.AUDIO
        elif self.mime_type in ['application/pdf', 'text/plain', 'application/msword']:
            return self.FileType.DOCUMENT
        else:
            return self.FileType.OTHER
    
    def get_absolute_url(self) -> str:
        """Get the full file URL"""
        return f"{settings.MEDIA_URL}{self.file_path}"
    
    def get_full_path(self) -> str:
        """Get the full filesystem path"""
        return os.path.join(settings.MEDIA_ROOT, self.file_path)
    
    def is_expired(self) -> bool:
        """Check if file access has expired"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at
    
    def delete(self, *args, **kwargs) -> tuple[int, dict[str, int]]:
        """Override delete to clean up file from filesystem"""
        file_path = self.get_full_path()
        if os.path.exists(file_path):
            os.remove(file_path)
        return super().delete(*args, **kwargs)


class File(BaseFile):
    """General file upload model"""
    
    class Meta:
        db_table = 'files_file'
        verbose_name = 'File'
        verbose_name_plural = 'Files'
    
    def get_max_file_size(self) ->  int:
        """General files can be up to 10MB"""
        return 10 * 1024 * 1024


class ProfileImage(BaseFile):
    """Profile image specific model with additional constraints"""
    
    class Meta:
        db_table = 'files_profile_image'
        verbose_name = 'Profile Image'
        verbose_name_plural = 'Profile Images'
    
    
    def clean(self) -> None:
        """Additional validation for profile images"""
        super().clean()
        
       
    def get_max_file_size(self) -> int:
        """Profile images should be smaller"""
        return 5 * 1024 * 1024  # 5MB
    
    def is_valid_file_type(self) -> bool:
        """Only allow image types for profile images"""
        allowed_types = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
        ]
        return self.mime_type in allowed_types
    
    def save(self, *args, **kwargs) -> None:
        # Force file_type to be image for profile images
        if self.mime_type and 'gif' in self.mime_type:
            self.file_type = self.FileType.GIF
        else:
            self.file_type = self.FileType.IMAGE
        
        super().save(*args, **kwargs)


class ChatFile(BaseFile):
    """Files specifically for chat messages"""
    
    class Meta:
        db_table = 'files_chat_file'
        verbose_name = 'Chat File'
        verbose_name_plural = 'Chat Files'
    
    # GenericForeignKey to work with any message type
    message_content_type = models.ForeignKey(
        ContentType,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        help_text="Type of message this file belongs to"
    )
    message_object_id = models.PositiveIntegerField(null=True, blank=True,
        help_text="ID of the message this file belongs to"
    )
    message: Any = GenericForeignKey('message_content_type', 'message_object_id')
    
    def get_max_file_size(self) -> int:
        """Chat files can be larger"""
        return 20 * 1024 * 1024  # 20MB
    
    def is_valid_file_type(self) -> bool:
        """Allow most file types for chat, but restrict dangerous ones"""
        dangerous_types = [
            'application/x-executable',
            'application/x-msdos-program',
            'application/x-msdownload',
        ]
        return self.mime_type not in dangerous_types