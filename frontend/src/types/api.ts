import { ChangePasswordData, LoginCredentials } from "./auth";
import { RegisterData } from "./auth";
import { Profile } from "./auth";
import { Channel, Chatroom, ChatroomSettings, DirectMessage, FileType, Friendship, Member } from "./chat";
import { Message } from "./chat";
import { User } from "./auth";
import { UserSettings } from "./auth";
import { SetStateAction } from 'react';
import { Notification } from "./notifications";
import { FormErrors } from "./errors";
import { ApiError } from "./errors";

// Base response interface
export interface BaseApiResponse {
  success: boolean;
}

// Base response with message
export interface BaseApiResponseWithMessage extends BaseApiResponse {
  message: string;
}

// API service interface
export interface ApiService {
  // Auth endpoints
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<LogoutResponse>;
  checkAuthStatus: () => Promise<checkAuthStatusResponse>;
  changePassword: (changePasswordData: ChangePasswordData) => Promise<ChangePasswordResponse>;
  deleteAccount: () => Promise<BaseApiResponse>;
  getFriends: (url: string) => Promise<GetFriendsResponse>


  // Chatroom endpoints
  createChatroom: (data: CreateChatroomData) => Promise<CreateChatroomResponse>;
  getChatrooms: (url: string) => Promise<GetChatroomsResponse>;
  joinChatroom: (chatroomId: number) => Promise<BaseApiResponse>;
  handleLeaveChatroom: (chatroomId: number) => Promise<BaseApiResponse>;
  sendInvitation : (id: number, chatroom_id: number) => Promise<BaseApiResponse>
  getInvitationUsers : (url: string) => Promise<GetUsersResponse>
  getChatroomSettings : (id: number) => Promise<GetChatroomSettingsResponse>
  getChannels: (chatroom_id: number) => Promise<GetChannelsResponse>
  getMembers: (chatroom_id: number) => Promise<GetMembersResponse>
  addChannel: (id: number ,data: ChannelData) => Promise<BaseApiResponse>
  updateChannel: (id: number | null, data: ChannelData) => Promise<BaseApiResponse>
  deleteChannel: (id: number) => Promise<BaseApiResponse>
  removeMember: (member_id: number, chatroom_id: number | null) => Promise<BaseApiResponse>
  updateChatroomSettings: (chatroom_id: number, data: ChatroomSettings) => Promise<BaseApiResponse>
  getJoinedChatrooms : (url: string) => Promise<GetJoinedChatroomsResponse>
  getMyChatrooms: (url: string) => Promise<GetChatroomsResponse>
  deleteChatroom: (chatroom_id: number) => Promise<BaseApiResponse>


  // Notifications endpoints
  markAllRead: () => Promise<BaseApiResponse>
  getNotifications: () => Promise<GetNotificationsResponse>
  acceptChatroomInvitation: (notification_id: number) => Promise<BaseApiResponse>
  rejectChatroomInvitation: (notification_id: number) => Promise<BaseApiResponse>
  acceptFriendshipRequest: (notification_id: number) => Promise<BaseApiResponse>
  rejectFriendshipRequest: (notification_id: number) => Promise<BaseApiResponse>
  acceptChatroomJoinRequest: (notification_id: number) => Promise<BaseApiResponse>
  rejectChatroomJoinRequest: (notification_id: number) => Promise<BaseApiResponse>



  // Message endpoints
  getMessages: (url: string) => Promise<MessagesResponse>;
  sendMessage: (chatroomId: string, message: string) => Promise<Message>;
  getDms: (url: string) => Promise<GetDmsResponse>
  getChatChannels: (url: string) => Promise<GetChannelsResponse>
  isChatroomAdmin: (id: number) => Promise<IsAdminResponse>
  deleteMessage: (id: number) => Promise<BaseApiResponse>

  // File endpoints
  uploadFile: (file: File, setProgress: React.Dispatch<SetStateAction<number>>) => Promise<FileUploadResponse>;
  
  // User endpoints
  getProfile: (user_id: number) => Promise<Profile>;
  updateProfile: (data: UpdateProfileData) => Promise<UpdateProfileResponse>;
  uploadProfilePhoto: (file: File) => Promise<UploadProfilePhotoResponse>;
  updateUserSettings: (userSettingsData: UserSettings) => Promise<UpdateUserSettingsResponse>;
  blockUser: (user_id: number) => Promise<BaseApiResponseWithMessage>
  removeFriend: (friend_id: number) => Promise<BaseApiResponse>
  getSearchUsers: (url: string) => Promise<GetSearchUsersResponse>
  sendFriendRequest: (user_id: number) => Promise<BaseApiResponse>
  getBlockedUsers: () => Promise<GetBlockedUsersResponse>
  unblockUser: (user_id: number) => Promise<BaseApiResponseWithMessage>
  getUserProfile: (username: string) => Promise<GetUserProfileResponse>
}

// Auth responses
export interface LoginResponse extends BaseApiResponseWithMessage {
  token: string;
  user?: User
}

export interface checkAuthStatusResponse extends BaseApiResponse{
  user: User,
}

export interface IsAdminResponse extends BaseApiResponse {
  is_admin: boolean
}


export interface RegisterResponse extends BaseApiResponseWithMessage {
  user?: User;
  token:string | null,
  errors: ApiError | null
}

export interface GetUserProfileResponse extends BaseApiResponse {
  profile: Profile
}

export interface GetJoinedChatroomsResponse extends BaseApiResponse {
  memberships: Member[]
  next: string | null
}

export interface GetSearchUsersResponse extends BaseApiResponse {
  users: User[]
  next: string | null
}

export interface GetBlockedUsersResponse extends BaseApiResponse {
  blocked_users: User[]
}

export interface GetFriendsResponse extends BaseApiResponse {
  friends: User[],
  next: string | null
}

export interface ChangePasswordResponse extends BaseApiResponseWithMessage {}

export interface LogoutResponse extends BaseApiResponse {
  success: boolean
}

// User responses
export interface UpdateUserSettingsResponse extends BaseApiResponse {
  settings: UserSettings | null;
}

export interface GetChatroomsResponse extends BaseApiResponse {
  chatrooms: Chatroom[],
  next: string | null
}

export interface GetUsersResponse extends BaseApiResponse {
  users: User[];
  next: string | null;
  prev: string | null
}

export interface GetMembersResponse extends BaseApiResponse { 
  members: Member[]
  next: string | null
}

export interface GetChannelsResponse extends BaseApiResponse {
  channels: Channel[]
  next: string | null
}

export interface ChannelData {
  name: string
  is_public: boolean
}

export interface GetChatroomSettingsResponse extends BaseApiResponse {
  chatroomSettings: ChatroomSettings | null
}

export interface UpdateProfileResponse extends BaseApiResponse {
  user: User | null;
}

export interface UploadProfilePhotoResponse extends BaseApiResponse {}

// Chatroom responses
export interface CreateChatroomResponse extends BaseApiResponse {}







// Notification Responses
export interface GetNotificationsResponse extends BaseApiResponse {
  notifications: Notification[]

}



// Message responses
export interface MessagesResponse extends BaseApiResponse {
  messages: Message[];
  next: string | null;
  previous: string | null;
}

export interface GetDmsResponse extends BaseApiResponse {
  direct_messages: DirectMessage[]
  next: string
}

// File responses
export interface FileUploadResponse extends BaseApiResponse {
  file: FileType;
}

// Request data interfaces
export interface CreateChatroomData {
  name: string;
  description?: string;
  is_private?: boolean;
}


export interface UpdateProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: File;
  bio?: string;
}