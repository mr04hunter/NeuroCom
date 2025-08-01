import { ChangePasswordResponse, LoginResponse, LogoutResponse, RegisterResponse, UpdateProfileData, UpdateProfileResponse, UpdateUserSettingsResponse } from "./api";
import {ChangePasswordData, LoginCredentials, Profile, RegisterData, User, UserSettings} from "./auth"
import { DirectMessage, Channel, Message, UserStatus, FileType} from "./chat";

export interface AuthContextType {
user: User | null;
isLoggedIn: boolean;
userSettings: UserSettings | null;
error: any;
onlineUsers: User[];
loadingAuth: boolean;
handleLogin: (loginData: LoginCredentials) => Promise<LoginResponse | null>;
logout: () => Promise<LogoutResponse | null>;
updateProfile: (updateProfileData: UpdateProfileData) => Promise<UpdateProfileResponse | null>;
updateUserSettings: (settings: UserSettings) => Promise<UpdateUserSettingsResponse | null>;
changePassword: (changePasswordData: ChangePasswordData) => Promise<ChangePasswordResponse | null>;
deleteAccount: () => Promise<void | null>;
handleRegister: (data: RegisterData) => Promise<RegisterResponse | null>;

}

export interface ChatContextType {
    // Direct Messages
    direct_messages: DirectMessage[] | null;
    setDirectMessages: React.Dispatch<React.SetStateAction<DirectMessage[] | null>>;
    
    // Messages
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    currentMessages: Message[];
    setCurrentMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    
    // Loading states
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    messagesLoading: boolean;
    setMessagesLoading: React.Dispatch<React.SetStateAction<boolean>>;
    channelsLoading: boolean | null;
    isAdminLoading: boolean | null;
    
    // Current IDs
    currentDmId: number | null;
    setCurrentDmId: React.Dispatch<React.SetStateAction<number | null>>;
    currentChannelId: number | null;
    setCurrentChannelId: React.Dispatch<React.SetStateAction<number | null>>;
    
    // Message input
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    
    // UI states
    hoveredIndex: number | null;
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
    editIndex: number | null;
    setEditIndex: React.Dispatch<React.SetStateAction<number | null>>;
    editMessage: string;
    setEditMessage: React.Dispatch<React.SetStateAction<string>>;
    newMesNot: boolean;
    setNewMesNot: React.Dispatch<React.SetStateAction<boolean>>;
    
    // User status
    userStatus: UserStatus[];
    setUserStatus: React.Dispatch<React.SetStateAction<UserStatus[]>>;
    otherUser: string;
    setOtherUser: React.Dispatch<React.SetStateAction<string>>;
    
    // Pagination
    nextDmPage: string | null;
    setNextDmPage: React.Dispatch<React.SetStateAction<string | null>>;
    nextMessagesPage: string | null;
    setNextMessagesPage: React.Dispatch<React.SetStateAction<string | null>>;
    previousMessagesPage: string | null;
    setPreviousMessagesPage: React.Dispatch<React.SetStateAction<string | null>>;
    
    // Initialization flags
    dmInitialized: boolean;
    setdmInit: React.Dispatch<React.SetStateAction<boolean>>;
    channelInitialized: boolean;
    setChannelInit: React.Dispatch<React.SetStateAction<boolean>>;
    
    // File handling
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
    fileData: FileType | null;
    setFileData: React.Dispatch<React.SetStateAction<FileType | null>>;
    completed: boolean;
    setCompleted: React.Dispatch<React.SetStateAction<boolean>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    
    // Refs
    messagesEndRef: React.MutableRefObject<Message | null>;
    chatWindowRef: React.RefObject<HTMLDivElement>;
    firstMessageRef: React.MutableRefObject<Message | null>;
    
    // Channels
    channels: Channel[] | null;
    isAdmin: boolean | null;
    
    // Functions
    fetchDms: (url: string, prepend: boolean) => Promise<void>;
    connectDm: (e: React.MouseEvent, dm_id: number, other_user_username: string) => Promise<void>;
    fetchMessages: (url: string, prepend?: boolean) => Promise<void>;
    fetchChannels: (url: string, prepend: boolean) => Promise<void>;
    connectChannel: (chatroom_id: number, channel_id: number) => Promise<void>;
    getIsAdmin: (id: number) => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
    handleEdit: (id: number, message: string) => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
    submitEdit: (e: React.FormEvent, id: number) => void;
    submitDelete: (e: React.FormEvent, id: number) => void;
    isOnBottom: () => boolean;
  }