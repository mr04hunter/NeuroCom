from __future__ import annotations
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework import generics
from .serializers import (
   
   ChatroomSerializer,ChatroomSettingsSerializer,
     ChannelSerializer, CreateChannelSerializer, UpdateChannelSerializer
    
)
from user.serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from chatroom.models import ChatRoom, Channel, UserChatRoom
from chatroom.serializers import MembershipSerializer
from rest_framework.request import Request
from chatroom.serializers import ChatroomMessageSerializer
from django.db.models import QuerySet
from .models import ChatroomMessage
from neurocom.errors.exceptions import PermissionError
from rest_framework.pagination import PageNumberPagination
from typing import Any, cast
from notifications.models import Invitation, ChatroomJoinRequest
from user.models import User
from rest_framework.generics import GenericAPIView
from neurocom.base_views import BaseAPIView, BaseModelAPIView
from common.custom_api_classes import AuthenticatedAPIView




class UsersPagination(PageNumberPagination):
    page_size = 20  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum page size


class MessagePagination(PageNumberPagination):
    page_size = 25  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum page size

class ChannelPagination(PageNumberPagination):
    page_size = 50  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum page size

class ChatroomsPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum page size


class ChatroomIsAdminView(BaseAPIView, APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request: Request,chatroom_id: str) -> Response:
        user = self.get_authenticated_user(request)
        if (isinstance(user, Response)):
            return user
        chatroom: ChatRoom = get_object_or_404(ChatRoom, id=chatroom_id)
        chatroom_user = cast(User, chatroom.user)
        if chatroom_user.id == user.id:
            return self.success_response({"success": True, 'is_admin':True},status_code=status.HTTP_200_OK)
        else:
            return self.success_response({"success": True, 'is_admin':False},status_code=status.HTTP_200_OK)







class CreateInvitationView(BaseModelAPIView, APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request: Request,user_id: str,chatroom_id: str, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request)
        if (isinstance(user, Response)):
            return user
        invitation_user: User = get_object_or_404(User,id=user_id)
        chatroom: ChatRoom = get_object_or_404(ChatRoom, id=chatroom_id)
        if user != chatroom.user:
            raise PermissionError("You don't have permission to access this chatroom")
        if(invitation_user.is_blocked(user)):
            return Response({"This User Is Blocked"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            invitation = Invitation.objects.create(chatroom=chatroom, initiator=user, recipient=invitation_user)
            return self.success_response({"success": True},message="Invitation Has Been Sent", status_code=status.HTTP_201_CREATED)




class ChatroomsView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ChatRoom.objects.all()
    serializer_class = ChatroomSerializer
    pagination_class = ChatroomsPagination

    def get_queryset(self) -> QuerySet[ChatRoom]:
        # Filter out posts from blocked users
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        requested_chatroom_ids: list[int] = list(ChatroomJoinRequest.objects.filter(initiator=user).values_list('chatroom__id',flat=True))
        chatrooms: QuerySet[ChatRoom] = ChatRoom.objects.exclude_blocked(user).exclude(users=user).exclude(user=user).exclude(id__in=requested_chatroom_ids)
        return chatrooms
    
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "chatrooms": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Chatrooms retrieved successfully"
        )
    
    
class CreateChatroomView(BaseModelAPIView, APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self,request: Request) -> Response:
        user = self.get_authenticated_user(request)
        if (isinstance(user, Response)):
            return user
        request.data["user"] = user.pk
        serializer = self.get_validated_serializer(ChatroomSerializer, request.data)
        serializer.save()
        return self.created_response({"success": True, "chatroom":serializer.data}, "Chatroom Created Successfully")
  
    


class CreateChannelView(BaseModelAPIView, APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self,request: Request,chatroom_id: str) -> Response:
        user = self.get_authenticated_user(request)
        if (isinstance(user, Response)):
            return user
        request.data["chatroom"] = ChatRoom.objects.get(id=chatroom_id).pk
        serializer = self.get_validated_serializer(CreateChannelSerializer, request.data)
        serializer.save()

        
        return self.created_response({"success": True}, "Channel Created Successfully")
    
class UpdateChannelView(BaseModelAPIView, generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset  = Channel.objects.all()
    serializer_class = UpdateChannelSerializer
    def get_object(self) -> Channel:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("You dont have the permission to edit this channel")
        channel = Channel.objects.get(id=self.kwargs.get('channel_id'))
        chatroom = cast(ChatRoom, channel.chatroom)
        chatroom_user = cast(User, chatroom.user)
        if user != chatroom_user:
            raise PermissionError("You don't have permission to access this chatroom")
        else:
            return channel

    def put(self, request: Request, channel_id:int):
        return self.update_object(request)


    
class MyChatroomsView(BaseAPIView, generics.ListAPIView):
    serializer_class = ChatroomSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ChatroomsPagination

    def get_queryset(self) -> QuerySet[ChatRoom]:
        user = self.request.user
        return ChatRoom.objects.filter(user=user)
    
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "chatrooms": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Chatrooms retrieved successfully"
        )
    
class ChatroomSettingsView(BaseAPIView, generics.RetrieveAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatroomSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self) -> ChatRoom:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("You don't have permission to access this chatroom")
        id: int = self.kwargs.get("id")
        chatroom = cast(ChatRoom,ChatRoom.objects.get(id=id))

        if user != chatroom.user:
            raise PermissionError("You don't have permission to access this chatroom")
        return chatroom

    def get(self, request: Request, id:int):
        return self.success_response({"success": True, "chatroom_settings": ChatroomSettingsSerializer(self.get_object()).data},"Chatroom Settings Retrieved Successfully")
        

class GetChannels(BaseAPIView, generics.ListAPIView):
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ChannelPagination

    def get_queryset(self) -> QuerySet[Channel]:
        user = self.request.user
        chatroom_id: int = self.kwargs.get('chatroom_id')
        chatroom: ChatRoom = ChatRoom.objects.get(id=chatroom_id)

        channels: QuerySet[Channel] = chatroom.channels.all()
        return channels

    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "channels": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Channels retrieved successfully"
        )
    
class UpdateChatroomSettingsView(BaseModelAPIView, generics.UpdateAPIView):
    queryset = ChatRoom.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ChatroomSettingsSerializer
    lookup_field: str = 'id'

    def get_object(self) -> ChatRoom:
        user = self.get_authenticated_user(self.request)
        if(isinstance(user, Response)):
            raise PermissionError("You don't have permission to access this chatroom")
        chatroom: ChatRoom = super().get_object()

        if user != chatroom.user:
            raise PermissionError("You don't have permission to access this chatroom")
        return chatroom
    
    def put(self, request: Request, id: int):
        return self.update_object(request)

class DeleteChatroomView(BaseModelAPIView, generics.DestroyAPIView):
    queryset = ChatRoom.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ChatroomSerializer

    def get_object(self) -> ChatRoom:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("You don't have permission to access this chatroom")
        chatroom_id: int = self.kwargs.get('id')
        chatroom =  cast(ChatRoom, ChatRoom.objects.get(id=chatroom_id))
        if user != chatroom.user:
            raise PermissionError("You don't have permission to access this chatroom")
        return chatroom
    
    def delete(self, request: Request, id:int):
        chatroom = self.get_object()
        chatroom.delete()
        return self.success_response({"success": True},message="Chatroom Deleted Successfully")

class DeleteChannelView(BaseModelAPIView, generics.DestroyAPIView):
    queryset = Channel.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ChannelSerializer

    def get_object(self) -> Channel:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("You don't have permission to access this chatroom")
        channel_id: str = self.kwargs.get('id')
        channel = Channel.objects.get(id=channel_id)
        chatroom = cast(ChatRoom, channel.chatroom)
        chatroom_user = cast(User, chatroom.user)
        if user != chatroom_user:
            raise PermissionError("You don't have permission to access this chatroom")
        return channel

    def delete(self, request: Request, id: int):
        channel = self.get_object()
        channel.delete()
        return self.success_response({"success": True},message="Channel Deleted Successfully")
    


class GetMembersView(BaseAPIView, generics.ListAPIView,):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipSerializer
    pagination_class = UsersPagination

    def get_queryset(self) -> QuerySet[UserChatRoom]:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("You don't have permission to access this chatroom")
        chatroom_id: int | None = self.kwargs.get('chatroom_id')
        chatroom: ChatRoom = get_object_or_404(ChatRoom, id=chatroom_id)
        if user != chatroom.user:
            raise PermissionError("You don't have permission to access this chatroom")

        memberships: QuerySet[UserChatRoom] = UserChatRoom.objects.filter(chatroom=chatroom)

        return memberships
    
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "members": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Members retrieved successfully"
        )


class RemoveMemberView(BaseAPIView, APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipSerializer

    def delete(self,request: Request ,member_id: str,chatroom_id: str) -> Response:
        user = self.get_authenticated_user(request)
        if (isinstance(user, Response)):
            return user
        chatroom: ChatRoom = get_object_or_404(ChatRoom, id=chatroom_id)
        if user != chatroom.user:
            raise PermissionError("You don't have permission to access this chatroom")
        member: User = User.objects.get(id=member_id)
        if (chatroom.is_member(member)):
            chatroom.remove_member(member)

            return self.success_response({"success": True, "message": 'Member Has Been Removed'}, status_code=status.HTTP_200_OK)
        else:
            return self.fail_response({"success": False ,"message":'This User Is Already Not A Member Of This Chatroom'},status_code=status.HTTP_400_BAD_REQUEST)

    

class LeaveChatroomView(BaseAPIView,APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request: Request,chatroom_id: str) -> Response:
        user = self.get_authenticated_user(request)
        if (isinstance(user, Response)):
            return user
        chatroom: ChatRoom = get_object_or_404(ChatRoom, id=chatroom_id)
        if (chatroom.is_member(user)):
            chatroom.remove_member(user)

            return self.success_response({"success": True}, message='Chatroom Left', status_code=status.HTTP_200_OK)
        else:
            return self.fail_response({"success": False, "message": 'This User Is Already Not A Member Of This Chatroom'},status_code=status.HTTP_400_BAD_REQUEST)



    
class GetInvitationUsersView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    pagination_class = UsersPagination

    def get_queryset(self) -> QuerySet[User]:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("You don't have permission to access this chatroom")
        chatroom_id: int = self.kwargs.get('chatroom_id')
        chatroom: ChatRoom = get_object_or_404(ChatRoom, id=chatroom_id)
        members_ids: list[int] = list(chatroom.users.values_list('id',flat=True))
        users: QuerySet[User] = User.objects.exclude(id__in=members_ids).exclude(id__in=user.blocked_users.all()).exclude(id__in=user.blocked_by.all()).exclude(id=user.id)
        return users
    
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "invitation_users": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Users retrieved successfully"
        )
    

class GetChannelMessagesView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatroomMessageSerializer
    pagination_class = MessagePagination

    def get_queryset(self) -> QuerySet[ChatroomMessage]:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("You don't have permission to access this chatroom")
        channel_id: str = self.kwargs.get("channel_id")
        channel: Channel =  get_object_or_404(Channel, id=channel_id)
        chatroom: ChatRoom = cast(ChatRoom, channel.chatroom)
        if chatroom.is_member(user) or chatroom.user == user:
            messages: QuerySet[ChatroomMessage] = channel.messages.all().order_by('-timestamp')
            return messages
        
        raise PermissionError('You are not a member of this chatroom')
        
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "messages": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Messages retrieved successfully"
        )
    
class GetJoinedChatroomsView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipSerializer
    pagination_class = ChatroomsPagination

    def get_queryset(self) -> QuerySet[UserChatRoom]:
        user = self.get_authenticated_user(self.request)
        if (isinstance(user, Response)):
            raise PermissionError("Unauthenticated")
        return user.memberships.all()
    
    def get(self, request: Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.success_response(
            data={
                "chatrooms": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Chatrooms retrieved successfully"
        )