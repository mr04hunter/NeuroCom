// API Response Types
export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    bio?: string;
    avatar?: string;
    is_online?: boolean;
  }
  
  export interface UserSettings {
    darkmode: boolean;
    notifications: boolean;
  }
  
  export interface Chatroom {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    members: User[];
    is_private: boolean;
  }
  
  export interface Message {
    id: number;
    content: string;
    user: User;
    chatroom: number;
    timestamp: string;
    message_type: 'text' | 'image' | 'file';
  }
  
  // WebSocket Message Types
  export interface WSMessage {
    type: 'message' | 'online_users' | 'user_joined' | 'user_left';
    data: any;
  }
  
  // API Error Types
  export interface ApiError {
    message: string;
    field_errors?: Record<string, string[]>;
    status: number;
  }