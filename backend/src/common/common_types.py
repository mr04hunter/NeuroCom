"""
Common types used across the entire project
"""
from __future__ import annotations

from typing import TypedDict, Literal, Union, Optional, Dict, Any, List
from datetime import datetime
from django.http import HttpRequest
from rest_framework.request import Request as DRFRequest


RequestType = Union[HttpRequest, DRFRequest]
JSONDict = Dict[str, Any]
UserID = int  

FriendshipStatus = Literal['pending', 'accepted', 'rejected']
MessageStatus = Literal['sent', 'delivered', 'read']
OnlineStatus = Literal['online', 'away', 'offline']


class APIResponse(TypedDict):
    success: bool
    message: str
    data: JSONDict | None
    errors: list[str] | None

class UserProfileData(TypedDict):
    id: int
    username: str
    email: str
    bio: str
    is_online: bool
    last_active: datetime
    profile_picture: Optional[str]

class FriendshipRequestData(TypedDict):
    id: int
    initiator: UserProfileData
    recipient: UserProfileData
    status: FriendshipStatus
    created_at: datetime

class MessageData(TypedDict):
    id: int
    sender: UserProfileData
    recipient: UserProfileData
    content: str
    status: MessageStatus
    timestamp: datetime
    is_edited: bool


class NotificationData(TypedDict):
    id: int
    type: Literal['friend_request', 'message', 'friend_accepted']
    title: str
    message: str
    is_read: bool
    created_at: datetime
    data: JSONDict | None  