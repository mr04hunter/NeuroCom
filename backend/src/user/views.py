from __future__ import annotations
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework import generics
from .serializers import (
    LogInSerializer, RegisterSerializer, UserSerializer,UpdateSerializer,UserSettingsSerializer,
    ChangePasswordSerializer,
    FriendsSerializer,
    
)
from user.models import UserSettings, Friendship, UserBlock
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.http import Http404
from rest_framework.pagination import PageNumberPagination
import logging
from rest_framework.request import Request
from django.db.models import QuerySet
logger = logging.getLogger(__name__)
from typing import Any, cast, TYPE_CHECKING
from common.custom_api_classes import AuthenticatedAPIView
from neurocom.errors.exceptions import ValidationError, BusinessLogicError
from neurocom.base_views import BaseAPIView, BaseModelAPIView


from user.models import User

class UsersPagination(PageNumberPagination):
    page_size = 20  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum page size






class UnblockUserView(BaseAPIView, APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request: Request,user_id: str, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request)
        if(isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        block_user: User = get_object_or_404(User,id=user_id)
        if(user.is_blocked(block_user)):
            user.unblock_user(block_user)
            return self.created_response({"success": True},message="User Unblocked")
        else:
            raise BusinessLogicError("User is not blocked")



class LoginView(BaseAPIView):
    authentication_classes = []  # Clear any authentication requirements
    permission_classes = []
    def post(self, request: Request) -> Response:
        serializer = self.get_validated_serializer(LogInSerializer, request.data)
       
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            
            return self.success_response({
                'token': token.key,
                'user': UserSerializer(user).data,
                
            }, 'Logged In Successfully')
        raise ValidationError('Incorrect Username Or Password')
        
class RegisterView(BaseAPIView):
    authentication_classes = []
    permission_classes = []
    
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        # Get validated serializer (automatically raises exception if invalid)
        serializer = self.get_validated_serializer(RegisterSerializer, request.data)
        
        # Save user
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        # Return standardized success response
        return self.created_response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, 'User registered successfully')
    

class UpdateView(BaseModelAPIView):
    queryset: QuerySet[User] = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class: type[UpdateSerializer] = UpdateSerializer
    
    def get_object(self):
        return self.request.user

    def put(self, request: Request):
        return self.update_object(request)
        


class UserView(BaseModelAPIView):
    serializer_class: type[UserSerializer] = UserSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        serializer = self.get_serializer(request.user)
        
        return self.created_response({"success": True, "user": serializer.data}, "Authenticated")
    

class SettingsView(BaseModelAPIView):
    serializer_class: type [UserSettingsSerializer] = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self) -> UserSettings:
        user = self.request.user
        return get_object_or_404(UserSettings, user=user)
    
    def get(self, request: Request):
        serializer = self.get_serializer(self.get_object())
        
        return self.created_response({"success": True, "settings": serializer.data}, "Settings Retrieved")

class UpdateSettingsView(BaseModelAPIView, generics.UpdateAPIView):
    queryset: QuerySet[UserSettings] = UserSettings.objects.all()
    serializer_class: type[UserSettingsSerializer] = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self) -> UserSettings:
        user = self.request.user
        return get_object_or_404(UserSettings, user=user)
    
    def put(self, request: Request):
        return self.update_object(request)
        
    
class ChangePasswordView(BaseModelAPIView, generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        return {
            "request":self.request
        }

    def put(self,request: Request) -> Response:
        data = {
            "user": request.user,
            "new_password":request.data["new_password"],
            "confirm_new_password":request.data["confirm_new_password"],
            "old_password":request.data["old_password"]
        }
        serializer = self.get_validated_serializer(ChangePasswordSerializer, data)

        user = self.get_authenticated_user(request)
        if(isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return self.success_response({"success": True}, "Password Updated Successfully")
        
        
        

class DeleteAccountView(BaseModelAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self,request: Request,*args: Any, **kwargs: Any) -> Response :
        request.user.delete()
        return self.success_response({"success": True},"Account Deleted")


class LogOut(BaseAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self,request: Request) -> Response:
        user = self.get_authenticated_user(request)
        if(isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        user.auth_token.delete()
        return self.created_response({"success": True}, "Logged Out")

class GetUsersView(BaseModelAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class: type[UserSerializer] = UserSerializer
    pagination_class = UsersPagination

    def get_queryset(self) -> QuerySet[User]:
        user = self.get_authenticated_user(self.request)
        if(isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        friend_ids: list[int] = list(user.friends.values_list('id',flat=True))
        blocked_users_ids: list[int] = list(user.blocked_users.values_list('id',flat=True))
        blocked_by_users: list[int] = list(UserBlock.objects.filter(blocked_user=user).values_list('user__id', flat=True))
        users: QuerySet[User] = User.objects.exclude(id__in=blocked_users_ids).exclude(id__in=friend_ids).exclude(id=user.id).exclude(id__in=blocked_by_users)
        
        return users

    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Wrap it in your standardized response format
        return self.success_response(
            data={
                "users": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Users retrieved successfully"
        )


class BlockedUsersView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class: type[UserSerializer] = UserSerializer
    pagination_class: type[UsersPagination] = UsersPagination

    def get_queryset(self) -> QuerySet[User]:
        user = self.get_authenticated_user(self.request)
        if(isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        return user.blocked_users.all()
    
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request)
        return self.success_response(
            data={
                "blocked_users": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Blocked Users retrieved successfully"
        )
    

class GetUserProfileView(BaseAPIView, APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request: Request,username: str, *args: Any, **kwargs: Any) -> Response:
        try:
            get_user: User = get_object_or_404(User,username=username)
            serialized_user: dict[str, Any] = UserSerializer(get_user).data

            return self.success_response({"success": True, "user": serialized_user}, "User Retrieved Successfully")
        except User.DoesNotExist:
            return self.fail_response({"success":False, "message": "User Not Found"}, status_code=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            import logging as logger
            logger.error(f"Unexpected Error:", exc_info=True)
            return self.fail_response({"success":False, "message": "Unexpected Error"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        

class GetFriendsView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class: type[FriendsSerializer] = FriendsSerializer
    pagination_class: type[UsersPagination] = UsersPagination

    def get_serializer_context(self) -> dict[str, Any]:
        return {
            'request':self.request
        }

    def get_queryset(self) -> QuerySet[User]:
        user = self.get_authenticated_user(self.request)
        if(isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        friendships: QuerySet[User] = user.friends.all()
        return friendships
    
    def get(self, request:Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "friends": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Friends retrieved successfully"
        )
        
    
class RemoveFriendshipView(BaseAPIView, APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request: Request,friend_id: str, *args: Any, **kwargs: Any) -> Response:
        try:
            user = self.get_authenticated_user(request)
            if(isinstance(user, Response)):
                raise PermissionError("Unauthenticated")
            friend: User = User.objects.get(id=friend_id)
            user.remove_friend(friend)
            
        except User.DoesNotExist:
            return self.fail_response({"success": False, "message": "User Not Found"}, status_code=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            import logging as logger
            logger.error(f"Unexpected Error:", exc_info=True)
            return self.fail_response({"success": False, "message": "Unexpected Error"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        return self.success_response({"success": True}, "Removed")
    
class BlockUserView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def post(self,request: Request,user_id: str, *args: Any, **kwargs: Any) -> Response:
        try:
            user = self.get_authenticated_user(request)
            if(isinstance(user, Response)):
                raise PermissionError("Unauthenticated")
            block_user: User = get_object_or_404(User, id=user_id)
            user.block_user(block_user)
            user.remove_friend(block_user)
        except User.DoesNotExist:
            return self.fail_response({"success": False, 'message':'User Does Not Exist'},status_code=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error("Unexpected error in BlockUserView", exc_info=True)
            return self.fail_response({"success": False, 'message':'Unexpected Error'},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        

        return self.success_response({"success": True}, "User Blocked Successfully")