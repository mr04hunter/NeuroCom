import {Profile, User} from "./auth"

export interface Chatroom {
    title: string,
    id: number;
    user: User;
    name: string;
    description?: string;
    created_at: string;
    users: User[];
    is_public: boolean;
  }

export interface FileType {
  file_name: string
  original_name: string;
  file_type: string;
  file_size: number;
  user: User;
  created_at: Date;
  url: string;
}
  
export interface  Message {
  id: number;
  content: string;
  sender: User;
  chatroom: Chatroom;
  timestamp: string;
  file: FileType;
}

export interface Channel {
  id: number,
  name: string;
  is_public: boolean;
  chatroom: Chatroom;
}

export interface DirectMessage {
  id: number
  user: User;
  other_user: User;
  created_at: Date;
  last_interaction: Date;

}

export interface UserStatus {
  user_id: number
  in_the_chat_status: string;
  typing: string

}

export interface Member { 
  user: User,
  chatroom: Chatroom,
  joined_at: Date,
  id: number
}

export interface ChatroomSettings {
  name?: string,
  title?: string,
  description?: string,
  is_public?: boolean,
  allow_file_sharing?:boolean,
  mute_notifications?: boolean,
  max_members?: number,
  message_retention_days?: number
}

export interface Friendship {
  user: User,
  friend: Profile,
  created_at: Date
}