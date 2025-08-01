// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosProgressEvent } from 'axios';
import { useErrorHandler } from '../types/hooks';
import { ApiService, ChangePasswordResponse } from '../types/api';
import { ApiError } from '../types/errors';

import { useNavigate } from 'react-router-dom';
import { SetStateAction } from 'react';
import { handleApiError } from '../utils/errorHandler';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);



// Implementation
export const apiService: ApiService = {
  // Auth methods
  login: async (credentials) => {
    const response = await apiClient.post('/user/login/', credentials);
    console.log("LOGINN", response);
    
    return {
      success:response.data.success,
      token: response.data.data.token,
      user: response.data.data.user,
      message: response.data.message}
  },

  register: async (userData) => {

      const response = await apiClient.post('/user/register/', userData);

      return  {success: response.data.success, user: response.data.data.user, message: "Registered Successfully", token:response.data.data.token, errors: null}
    
    
  
  },

  logout: async () => {
    const response = await apiClient.post('/user/logout/');
    console.log('LOGOUT RESPONSE', response);
    
    return {success: response.data.data.success}
  },
  checkAuthStatus: async () => {
    const response = await apiClient.get('/user/me/')
    console.log("MEEE DATA", response.data);
    
    return {user: response.data.data.user, success: response.data.data.success}  
          
  },
  updateUserSettings: async (userSettingsData) => {
    const response = await apiClient.put('/user/update_settings/',userSettingsData)
    console.log('UPDATESET RES', response);
    
    return {success: response.data.success, settings: response.data.data}

  },
  changePassword: async (changePasswordData) => {
    const response = await apiClient.put('/user/change_password/',changePasswordData)
    const result = {success: response.data.success, message:response.data.message}

    return result

  },
  deleteAccount: async () => {
    const response = await apiClient.delete('/user/delete_account/')
    console.log("del res");
    
    return {success: response.data.success}
  },

  getFriends: async (url) => {
    const response = await apiClient.get(url)

    return {success: response.data.success, friends: response.data.data.friends, next: response.data.data.pagination.next}

  },
  blockUser: async (friend_id) => {
    const response = await apiClient.post(`/user/block_user/${friend_id}`)
    return {success: response.data.success, message: response.data.message}
  },

  removeFriend: async (friend_id) => {
    const response = await apiClient.post(`/user/remove_friendship/${friend_id}`)
    return {success: response.data.success}
  },

  // Chatroom methods
  createChatroom: async (data) => {
    const response = await apiClient.post('/chatroom/create_chatroom/', data);
    return response.status === 201 ? {success:response.data.success} : {success: false}
  },

  getJoinedChatrooms: async (url) => {
      const response = await apiClient.get(url)
      return {success: response.data.success, memberships: response.data.data.chatrooms, next: response.data.data.pagination.next}
  },

  handleLeaveChatroom: async (chatroomId) => {
    const response = await apiClient.post(`/chatroom/leave_chatroom/${chatroomId}`,{})

  return {success: response.data.success}

  },
  deleteChatroom: async (chatroom_id) => {
    const response = await apiClient.delete(`/chatroom/delete_chatroom/${chatroom_id}`)
    return {success: response.data.success}
  },
  getMyChatrooms: async (url) => {
    const response = await apiClient.get(url)
    return {success: response.data.success, chatrooms: response.data.data.chatrooms, next: response.data.data.pagination.next}
  },
  sendInvitation: async (id,chatroom_id) => {
    const response = await apiClient.post(`/chatroom/send_invitation/${id}/${chatroom_id}`,{})

  return {success: response.data.success}
  },

  getInvitationUsers: async (url) => {
     const response = await apiClient.get(url)
  return {success: response.data.success, users: response.data.data.invitation_users, next: response.data.data.pagination.next, prev: response.data.data.pagination.prev}
  },

  // Message methods
  getMessages: async (url) => {
    const response = await apiClient.get(url);
    console.log("mes", response);
    
    return {success: response.data.success, messages: response.data.data.messages, next: response.data.data.pagination.next, previous: response.data.data.pagination.previous}
  },

  deleteMessage: async (id) => {
    const response = await apiClient.delete(`/delete_message_dm/${id}`);
    return {success: response.data.success}
  },

  getChatroomSettings: async (id) => {
    const response = await apiClient.get(`/chatroom/chatroom_settings/${id}`)

  return {success: response.data.success, chatroomSettings: response.data.data.chatroom_settings}
  },

  getChannels: async (chatroom_id) => {
    const response = await apiClient.get(`/chatroom/get_channels/${chatroom_id}`)
  return {success: response.data.success, channels: response.data.data.channels, next: response.data.data.pagination.next}
  },

  getMembers: async (chatroom_id) => {
    const response = await apiClient.get(`/chatroom/get_members/${chatroom_id}`)
    return {success: response.data.success, members: response.data.data.members, next: response.data.data.pagination.next}
  },

  addChannel: async (id,data) => {
    const response = await apiClient.post(`/chatroom/add_channel/${id}`,data)
    return {success: response.data.success}
  },

  sendMessage: async (chatroomId, message) => {
    const response = await apiClient.post(
      `/chatroom/send_message/${chatroomId}/`,
      { message }
    );
    return response.data;
  },
  updateChannel: async (id,data) => {
    const response = await apiClient.put(`/chatroom/update_channel/${id}`,data)
    return {success: response.data.success}
  },

  deleteChannel: async (id) => {
    const response = await apiClient.delete(`/chatroom/delete_channel/${id}`)

    return {success: response.data.success}
  
  },

  removeMember: async (member_id, channel_id) => {
    const response = await apiClient.delete(`/chatroom/remove_member/${member_id}/${channel_id}`)
    return {success: response.data.success}
  },

  updateChatroomSettings: async (chatroom_id, data) => {
    const response = await apiClient.put(`/chatroom/update_chatroom_settings/${chatroom_id}`,data)

    return {success: response.data.success}
  },

  getChatrooms: async (url) => {
    const response = await apiClient.get(url)
    return {success: response.data.success, chatrooms: response.data.data.chatrooms, next: response.data.data.pagination.next}
  },

  joinChatroom: async (chatroom_id) => {
    const response = await apiClient.post(`/notifications/send_chatroom_request/${chatroom_id}`)

    return {success: response.data.success}
  },

  // File methods
  uploadFile: async (file: File, setProgress: React.Dispatch<SetStateAction<number>>) => {
    const formData = new FormData();
    formData.append("file",file);

    const response = await apiClient.post("/files/upload/", formData, {
        headers:{
          
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (event: AxiosProgressEvent) => {
              if (event.total) {
                const percent = Math.round((event.loaded * 100) / event.total);
                setProgress(percent);
              }
                
              },
        })

    return {success: response.data.success, file: response.data.data.file}
  },

  // User methods
  getProfile: async (user_id: number) => {
    const response = await apiClient.get(`/user/get_user_profile/${user_id}`);
    return response.data;
  },

  updateProfile: async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await apiClient.put('/user/edit_profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log("UPDATE RES", response);
    
    return {
      success: response.data.success,
      message: response.data.message,
      user: response.data.data}

  },

  uploadProfilePhoto: async (file: File) => {
    const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(`/files/upload_profile_picture/`,formData,{
        headers:{
                    'Content-Type': 'multipart/form-data'
                },
      })

      return {success: response.data.success}

  },
  getSearchUsers: async (url: string) => {
    const response = await apiClient.get(url)
    console.log('GET USERS RES', response);
    
    return {success: response.data.success, users: response.data.data.users, next: response.data.data.pagination.next}
  },

  sendFriendRequest: async (user_id: number) => {
    const response = await apiClient.post(`/notifications/send_friendship_request/${user_id}`)
    return {success: response.data.success}
  },
  getBlockedUsers: async () => {
    const response = await apiClient.get('/user/get_blocked_users/')

    return {success: response.data.success, blocked_users: response.data.data.blocked_users, message: response.data.message}
        
  },

  unblockUser: async (user_id: number) => {
    const response = await apiClient.post(`/user/unblock_user/${user_id}`)
    return {success: response.data.success, message: response.data.message}
  },
  getUserProfile: async (username: string) => {
    const response = await apiClient.get(`/user/get_user_profile/${username}`)
    return {success: response.data.success, profile: response.data.data.user}
  },


  // Notifications Methods
  markAllRead: async () => {
    const response = await apiClient.put('/notifications/mark_all_read/')

    return {success: response.data.success}
  },
  getNotifications: async () => {
    const response = await apiClient.get('/notifications/get_notifications/')
    return {success: response.data.success, notifications: response.data.data.notifications, }
  },
  acceptChatroomInvitation: async (notification_id) => {
    const response = await apiClient.put(`/notifications/accept_invitation/${notification_id}`)

    return {success: response.data.success}
},
  rejectChatroomInvitation: async (notification_id) => {
    const response = await apiClient.put(`/notifications/reject_invitation/${notification_id}`)

    return {success: response.data.success}
  },

  acceptFriendshipRequest: async (notification_id) => {
    const response = await apiClient.put(`/notifications/accept_friendship/${notification_id}`)
    return {success: response.data.success}
  },
  rejectFriendshipRequest: async (notification_id) => {
    const response = await apiClient.put(`/notifications/decline_friendship/${notification_id}`)
    return {success: response.data.success}
  },

  acceptChatroomJoinRequest: async (notification_id) => {
    const response = await apiClient.put(`/notifications/accept_chatroom_request/${notification_id}`)
    return {success: response.data.success}
  },

  rejectChatroomJoinRequest: async (notification_id) => {
    const response = await apiClient.put(`/notifications/reject_chatroom_request/${notification_id}`)
    return {success: response.data.success}
  },

  getDms: async (url) => {
    const response = await apiClient.get(url);
    return {success: response.data.success, direct_messages: response.data.data.direct_messages, next: response.data.data.pagination.next}

  },
  getChatChannels: async (url) => {
    const response = await apiClient.get(url);

    return {success: response.data.success, channels: response.data.data.channels, next: null}
  },
  isChatroomAdmin: async (id) => {
    const response = await apiClient.get(`/chatroom/is_admin/${id}`);

    return {success: response.data.success, is_admin: response.data.data.is_admin}
  },



}