from __future__ import annotations
from django.shortcuts import render
from files.models import ProfileImage, ChatFile, BaseFile
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import viewsets, status
from rest_framework.views import APIView
from neurocom import settings
import os
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from.serializers import ChatFileSerializer, ProfilePictureSerializer
from user.models import User
from common.custom_api_classes import AuthenticatedAPIView
from typing import Any, cast, TYPE_CHECKING, Protocol, Union
from rest_framework.permissions import AllowAny
from neurocom.base_views import BaseAPIView
from neurocom.errors.exceptions import NotFoundError

class FileUpload:
    type: str
    size: int
    name: str
    chunks: Any
    content_type: str

class BaseUploadFileViewSet(BaseAPIView, viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    file_model: type[ProfileImage] | type[ChatFile]
  
    
    def create(self, request: Request) -> Response:
        if (self.file_model is None):
            raise Exception('file_model is not specified')
        try:
            user = self.get_authenticated_user(request)
            if (isinstance(user, Response)):
                raise PermissionError("Unauthenticated")
            file: FileUpload = request.FILES['file']

        except KeyError:
            return self.fail_response({"success": False, 'message': 'No file provided'}, status_code=status.HTTP_400_BAD_REQUEST)

        if not self.validate_file(file):
            return self.fail_response({"success": False,'message': 'Invalid file type'}, status_code=status.HTTP_400_BAD_REQUEST)

        try:
            userdir = f'uploads/{user.username}' if self.file_model == ChatFile else f'uploads/{user.username}/profile'
            filename = self.generate_secure_filename(file.name)
            file_type = self.get_file_type(file)
            file_path = f'{userdir}/{filename}'
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)
            
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
            with open(full_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            uploaded_file = self.file_model.objects.create(
                user=user,
                original_name=file.name,
                file_path=file_path,
                file_size=file.size,
                mime_type=file_type,
                file_type=file_type,
            )
            serializer = self.serializer_class(uploaded_file)
            if isinstance(serializer, ProfilePictureSerializer) and isinstance(uploaded_file, ProfileImage):
                user.profile_picture = uploaded_file
                user.save()
            return self.success_response({"file":serializer.data},status_code=status.HTTP_201_CREATED)
        
    

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error during file upload: {str(e)}", exc_info=True)
            return self.fail_response({"success": False, 'message': 'Internal server error'}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
    def validate_file(self, file) -> bool:
        #size check
        if file.size > 10 * 1024 * 1024:
            return False
        
        #type check
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain'
        ]
        return file.content_type in allowed_types
    
    def get_file_type(self, file) -> str:
        if file.content_type.startswith('image/'):
            return 'gif' if file.content_type == 'image/gif' else "image"
        return 'file'

    def generate_secure_filename(self, original_name) -> str:
        import hashlib
        import time
        
        hash_obj = hashlib.sha256(f"{original_name}{time.time()}".encode())
        ext = os.path.splitext(original_name)[1]
        return f"{hash_obj.hexdigest()[:16]}{ext}"



class UploadProfilePhotoViewSet(BaseUploadFileViewSet):
    file_model = ProfileImage
    serializer_class =  ProfilePictureSerializer
    
    
    def get_file_type(self, file):
        return file.content_type
    
    def validate_file(self, uploaded_file: dict[str, Any]) -> bool:
        # Profile photo specific validation
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        file = cast(FileUpload, uploaded_file)
        if file.content_type not in allowed_types:
            return False
        
        # Smaller size limit for profile photos
        if file.size > 5 * 1024 * 1024:  # 5MB
            return False
            
        return True
    


class UploadFileViewSet(BaseUploadFileViewSet):
    file_model = ChatFile
    serializer_class = ChatFileSerializer


    
    
class BaseSecureMediaView(viewsets.ViewSet):
    permission_classes = [AllowAny]
    file_model: type[ProfileImage] | type[ChatFile]
    def retrieve(self, request: Request, access_token: str) -> HttpResponse:
        try:
            if(self.file_model is None):
                raise Exception("file_model is not specified")
            
           
            uploaded_file = self.file_model.objects.get(access_token= access_token)
            
            #debug print all path information
            full_path: str = os.path.join(settings.MEDIA_ROOT, uploaded_file.file_path)
            x_accel_path: str = f'/protected-media/{uploaded_file.file_path}'
            
            print("=== DEBUG FILE SERVING ===")
            print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
            print(f"File path in DB: {uploaded_file.file_path}")
            print(f"Full file path: {full_path}")
            print(f"File exists: {os.path.exists(full_path)}")
            print(f"X-Accel-Redirect path: {x_accel_path}")
            print(f"File size on disk: {os.path.getsize(full_path) if os.path.exists(full_path) else 'N/A'}")
            print(f"MIME type: {uploaded_file.mime_type}")
            print("========================")
            
            if not os.path.exists(full_path):
                raise Http404("File not found on disk")
            
            response = HttpResponse()
            response['X-Accel-Redirect'] = x_accel_path
            response['Content-Type'] = uploaded_file.mime_type
            if uploaded_file.mime_type.startswith('image/'):
                response['Content-Disposition'] = f'inline; filename="{uploaded_file.original_name}"'
            else:
                response['Content-Disposition'] = f'attachment; filename="{uploaded_file.original_name}"'
        
            
            return response
            
        except ChatFile.DoesNotExist:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"File not found for access token: {access_token}")
            raise Http404("File not found")

        except TypeError as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error("Unexpected error in SecureMediaView", str(e), exc_info=True)
            return HttpResponse("File Not Found", status=404)
        
        
class ProfilePictureView(BaseSecureMediaView):
    file_model = ProfileImage
    



class ChatFileView(BaseSecureMediaView):
    file_model = ChatFile
    
 
        