from __future__ import annotations
from typing import TYPE_CHECKING, Any, Union, cast
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from rest_framework.request import Request

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q, QuerySet

from chatroom.models import ChatRoom
from chat.models import DirectMessage
from notifications.models import (
    UserNotification,
    FriendshipRequest,
    Invitation,
    ChatroomJoinRequest
)
from notifications.serializers import UserNotificationsSerializer
from user.serializers import FriendshipSerializer
from common.custom_api_classes import AuthenticatedAPIView

from neurocom.errors.exceptions import ValidationError, BusinessLogicError
from user.models import User
from neurocom.base_views import BaseAPIView, BaseModelAPIView
from rest_framework.mixins import ListModelMixin

class MarkAllReadView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request)
        if(isinstance(user, Response)):
            return user
        notifications = UserNotification.objects.filter(user=user)
        notifications.update(is_read=True)
        return self.success_response({"success": True}, status_code=status.HTTP_200_OK)


class AcceptFriendRequestView(BaseModelAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request, notification_id: str, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request=request)
        if(isinstance(user, Response)):
            return user

     
        notification = UserNotification.objects.get(
            id=notification_id,
            user=user,
            notification_type='friend_request'
        )


        content_object = notification.content_object

        if isinstance(content_object, FriendshipRequest):
            content_object.status = FriendshipRequest.ACCEPTED
            content_object.is_removed = True
            content_object.save()

            initiator = content_object.initiator
            recipient = content_object.recipient
            initiator.add_friend(recipient)

            if not DirectMessage.objects.filter(
                Q(user1=initiator, user2=recipient) | Q(user1=recipient, user2=initiator)
            ).exists():
                DirectMessage.objects.create(user1=initiator, user2=recipient)

        notification.is_read = True
        notification.save()

        return self.success_response({"success": True, "message": "Accepted"}, status_code=status.HTTP_201_CREATED)


class DeclineFriendRequestView(BaseModelAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request, notification_id: str, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request=request)
        if(isinstance(user, Response)):
            return user

     
        notification = UserNotification.objects.get(
            id=notification_id,
            user=user,
            notification_type='friend_request'
        )


        if isinstance(notification.content_object, FriendshipRequest):
            request_obj = notification.content_object
            request_obj.is_removed = True
            request_obj.save()

        notification.is_read = True
        notification.save()

        return self.success_response({"success": True, "Message": "Declined"}, status_code=status.HTTP_200_OK)


class FriendRequestView(BaseModelAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FriendshipSerializer

    def post(self, request: Request, to_user_id: str, *args: Any, **kwargs: Any) -> Response:
        from_user = self.get_authenticated_user(request=request)
        if(isinstance(from_user, Response)):
            return from_user
        to_user = get_object_or_404(User, id=to_user_id)

        if FriendshipRequest.objects.filter(
            initiator=from_user,
            recipient=to_user,
            is_removed=False
        ).exists():
            return self.fail_response({"success": False, "message": "Friend request already sent"}, status_code=status.HTTP_400_BAD_REQUEST)

        friendship_request = FriendshipRequest.objects.create(
            initiator=from_user,
            recipient=to_user
        )
    
  

        return self.created_response({"success": True},"Friendship Request Sent")


class GetNotificationsView(BaseAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserNotificationsSerializer

    def get_queryset(self) -> QuerySet[UserNotification]:
        user: User = self.request.user  # type: ignore
        return user.notifications.all().order_by('-created_at')

    def get(self, request:Request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        return self.success_response(data={
                "notifications": response.data.get('results', response.data),
                "pagination": {
                    "count": response.data.get('count'),
                    "next": response.data.get('next'),
                    "previous": response.data.get('previous'),
                } if hasattr(response.data, 'get') and 'count' in response.data else None
            },
            message="Notifications retrieved successfully"
        )
        
        
        
##########################
# CHATROOM RELATED VIEWS #
##########################

class CreateChatroomRequestView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, chatroom_id: str, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request=request)
        if(isinstance(user, Response)):
            return user
        chatroom = get_object_or_404(ChatRoom, id=chatroom_id)
        chatroom_user = cast(User, chatroom.user)

        if user.is_blocked(chatroom_user):
            return Response({"error": "This User Is Blocked"}, status=status.HTTP_400_BAD_REQUEST)

        if chatroom.is_member(user):
            return Response({"error": "You are already a member of this chatroom"}, status=status.HTTP_400_BAD_REQUEST)

        if ChatroomJoinRequest.objects.filter(
            chatroom=chatroom,
            initiator=user,
            status='pending'
        ).exists():
            return Response({"error": "Request Already Sent"}, status=status.HTTP_400_BAD_REQUEST)

        ChatroomJoinRequest.objects.create(
            chatroom=chatroom,
            initiator=user,
            recipient=chatroom_user
        )

        return self.success_response({"success": True},"Request sent")


class AcceptInvitationView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request, notification_id: str, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request=request)
        if(isinstance(user, Response)):
            return user

       
        notification = UserNotification.objects.get(
            id=notification_id,
            user=user,
            notification_type='chatroom_invitation'
        )


        invitation = notification.content_object
        
        if invitation is None:
            return self.fail_response({"message": "Invalid notification content"})
        
        if not isinstance(invitation, Invitation):
            return self.fail_response({"message": "Invalid notification type"})
 
        

        chatroom = invitation.chatroom

        if chatroom.is_member(user):
            raise BusinessLogicError("You Are Already A Member Of This Chatroom")

        chatroom.add_member(user)
        invitation.status = Invitation.ACCEPTED
        invitation.save()

        notification.is_read = True
        notification.save()

        return self.success_response({"success": True}, "Invitation Accepted")


class AcceptChatroomRequestView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request, notification_id: str, *args: Any, **kwargs: Any) -> Response:
  
            notification = get_object_or_404(UserNotification, id=notification_id)
            join_request = notification.content_object

            if not isinstance(join_request, ChatroomJoinRequest):
                return self.fail_response({"success": False, "message": "Invalid Request"}, status_code=status.HTTP_400_BAD_REQUEST)

            chatroom = join_request.chatroom

            if join_request.status != ChatroomJoinRequest.PENDING:
                return self.fail_response({"success": False, "message": "Request Already Processed"}, status_code=status.HTTP_400_BAD_REQUEST)

            if chatroom.is_member(join_request.initiator):
                return self.fail_response({"success": False, "message": "User is already a member"}, status_code=status.HTTP_400_BAD_REQUEST)

            chatroom.add_member(join_request.initiator)
            join_request.status = ChatroomJoinRequest.ACCEPTED
            join_request.save()

            notification.is_read = True
            notification.save()

            return self.success_response({"success": True,"message": "Request Accepted"}, status_code=status.HTTP_200_OK)




class RejectInvitationView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request, notification_id: str, *args: Any, **kwargs: Any) -> Response:
        user = self.get_authenticated_user(request=request)
        if(isinstance(user, Response)):
            return user

        try:
            notification = UserNotification.objects.get(
                id=notification_id,
                user=user,
                notification_type='chatroom_invitation'
            )
        except UserNotification.DoesNotExist:
            return self.fail_response({"success": False, 'message': 'Notification Does Not Exist'}, status_code=status.HTTP_404_NOT_FOUND)

        invitation = notification.content_object
        if not isinstance(invitation, Invitation):
            return self.fail_response({"success": False,'message': 'Invalid Invitation'}, status_code=status.HTTP_400_BAD_REQUEST)

        if invitation.status != Invitation.PENDING:
            return self.fail_response({"success": False, "message": "Invitation Already Processed"}, status_code=status.HTTP_400_BAD_REQUEST)

        invitation.status = Invitation.REJECTED
        invitation.save()

        notification.is_read = True
        notification.save()

        return self.success_response({"success": True, "message": "Invitation Rejected"}, status_code=status.HTTP_200_OK)


class RejectChatroomRequestView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request, notification_id: str, *args: Any, **kwargs: Any) -> Response:
        
        notification = get_object_or_404(UserNotification, id=notification_id)
        join_request = notification.content_object

        if not isinstance(join_request, ChatroomJoinRequest):
            return self.fail_response({"success": False, 'message': 'Invalid Request'}, status_code=status.HTTP_400_BAD_REQUEST)

        if join_request.status != ChatroomJoinRequest.PENDING:
            return self.fail_response({"success": False, "message": "Request Already Processed"}, status_code=status.HTTP_400_BAD_REQUEST)

        join_request.status = ChatroomJoinRequest.REJECTED
        join_request.save()

        notification.is_read = True
        notification.save()

        return self.success_response({"success": True, "message": "Request Rejected"}, status_code=status.HTTP_200_OK)

      
