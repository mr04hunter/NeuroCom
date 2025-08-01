import { User } from "./auth";
import { Chatroom } from "./chat";

export interface Notification {
id: number,
user: User,
notification_type: string,
is_read: boolean,
created_at: Date,
notification_message: string
content_object: FriendshipRequest | ChatroomInvitation | ChatroomJoinRequest
}

export interface FriendshipRequest {
    initiator: User
    recipient: User
    created_at: Date
    status: string

}

export interface ChatroomJoinRequest { 
    chatroom: Chatroom
    initiaor: User
    recipient: User
    status: string
    created_at: Date
}

export interface ChatroomInvitation {
    chatroom: Chatroom
    initiaor: User
    recipient: User
    status: string
    created_at: Date

}