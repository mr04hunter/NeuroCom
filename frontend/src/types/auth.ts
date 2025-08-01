import { FileType } from "./chat";

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    bio?: string;
    profile_picture?: FileType;
    is_online?: boolean;
    token: string;
    created_at: Date
    settings: UserSettings;
  }
  export interface ChangePasswordData {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
  }

  export interface Profile {
    username: string
    email: string
    first_name: string,
    last_name: string
    bio?: string,
    profile_picture?: FileType,

  }

  export interface UserSettings {
    darkmode: boolean;
    request_notifications: boolean;
    message_notifications: boolean;
  }


  export interface FriendshipRequest {
    initiator:User;
    recipient:User;
    status: "pending" | "rejected" | "accepted";
    created_at: Date;
  }

  export interface LoginCredentials  {
    username: string;
    password: string;
  }

  export interface RegisterData{
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;

  }

  export interface AuthToken {
    token: string;
  }