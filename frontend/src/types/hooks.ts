import React, { SetStateAction } from "react";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import { ChatContext } from "../contexts/ChatContext";
import { useState } from "react";
import { ApiError } from "./errors";
import { handleApiError } from "../utils/errorHandler";
import { apiService } from "../services/api";
import { LoginCredentials } from "./auth";
import { RegisterData } from "./auth";
import { ChannelData, CreateChatroomData } from "./api";
import { useRef, useEffect } from "react";
import { ChatroomSettings } from "./chat";
import ErrorHandlerContext from "../contexts/ErrorContext";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  }


export function useChat() {
  const context = useContext(ChatContext)
  if(!context){
    throw new Error("useChat must be used within an ChatProvider")
  }
  return context;
}

export const useError = () => {
  const context = useContext(ErrorHandlerContext);
  if (!context) throw new Error('useGlobalErrorHandler must be used inside ErrorHandlerProvider');
  return context;
};




export const useErrorHandler = () => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error: any) => {
    console.log('ERROR', error);
    const processedError = handleApiError(error);
    setError(processedError);
    setIsLoading(false);
    console.log(processedError);
  };

  const clearError = () => setError(null);

  const executeWithErrorHandling = async <T>(
    asyncOperation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncOperation();
      setIsLoading(false);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  // Additional helper methods for field errors
  const getFieldError = (fieldName: string): string | null => {
    console.log('ERRROS FSADAS', error);
    
    if (!error?.fieldErrors) return null;
    const fieldErrors = error.fieldErrors[fieldName];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
  };

  const hasFieldErrors = (): boolean => {
    return error?.fieldErrors ? Object.keys(error.fieldErrors).length > 0 : false;
  };

  const getAllFieldErrors = (): Record<string, string[]> => {
    return error?.fieldErrors || {};
  };

  const getNonFieldErrors = (): string[] => {
    return error?.nonFieldErrors || [];
  };

  return {
    error,
    isLoading,
    clearError,
    executeWithErrorHandling,
    getFieldError,
    hasFieldErrors,
    getAllFieldErrors,
    getNonFieldErrors
  };
};


// API HOOK

// Custom hooks for API calls
export const useApi = (executeWithErrorHandling: ReturnType<typeof useErrorHandler>['executeWithErrorHandling']) => {


  const login = async (credentials: LoginCredentials) => {
    return await executeWithErrorHandling(() => {
      const response = apiService.login(credentials);
      return response;
    });
  };
  const register = async (data:RegisterData) => {
    return await executeWithErrorHandling( () => {
      return apiService.register(data)
    })
  }

  const createChatroom = async (data: CreateChatroomData) => {
    return executeWithErrorHandling(() => {
      return apiService.createChatroom(data)});
  };

  const getChatrooms = async (url: string) => {
    return executeWithErrorHandling(() => 
      {
        return apiService.getChatrooms(url)});
  };
  const handleLeaveChatroom = async (chatroomId: number) => {
    return executeWithErrorHandling(() => {
      return apiService.handleLeaveChatroom(chatroomId)})
  };
  const uploadProfilePhoto = async (file: File) => {
    return executeWithErrorHandling(() => {
      return apiService.uploadProfilePhoto(file)});
  };
  const uploadFile = async (file: File, setProgress: React.Dispatch<SetStateAction<number>>) => {
    return executeWithErrorHandling(() => {
       return apiService.uploadFile(file, setProgress)
    })
  };
  const markAllRead = async () => {
    return executeWithErrorHandling(() => {
      return apiService.markAllRead()
    })
  };
  const sendInvitation = async (id: number,  chatroom_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.sendInvitation(id, chatroom_id)
    })
  };
  const getInvitationUsers = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getInvitationUsers(url)
    })
  };
  const getChatroomSettings = async (id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.getChatroomSettings(id)
    })
  }
  const getChannels = async (chatroom_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.getChannels(chatroom_id)
    })
  }
  const getMembers = async (chatroom_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.getMembers(chatroom_id)
    })
  }
  const addChannel = async (id: number, data: ChannelData) => {
    return executeWithErrorHandling(() => {
      return apiService.addChannel(id, data)
    })
  }
  const updateChannel = async (id: number | null, data: ChannelData) =>  {
    return executeWithErrorHandling(() => {
      return apiService.updateChannel(id, data)
    })
  }
  const deleteChannel = async (id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.deleteChannel(id)
    })
  }

  const removeMember = async (member_id: number, chatroom_id: number | null) => {
    return executeWithErrorHandling(() => {
      return apiService.removeMember(member_id, chatroom_id)
    })
  }

  const updateChatroomSettings = async (chatroom_id: number, data: ChatroomSettings) => {
    return executeWithErrorHandling(() => {
      return apiService.updateChatroomSettings(chatroom_id, data)
    })
  }
  const joinChatroom = async (chatroom_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.joinChatroom(chatroom_id)
    })
  }
  const getFriends = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getFriends(url)
    })
  }
  const blockUser = async (user_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.blockUser(user_id)
    })
  }
  const removeFriend = async (friend_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.removeFriend(friend_id)
    })
  } 
  const getJoinedChatrooms = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getJoinedChatrooms(url)
    })
  }
  const getMyChatrooms = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getMyChatrooms(url)
    })
  }
  const deleteChatroom = async (chatroom_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.deleteChatroom(chatroom_id)
    })
  }

  const getNotifications = async () => {
    return executeWithErrorHandling(() => {
      return apiService.getNotifications()
    })
  }

  const acceptChatroomInvitation = async (notification_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.acceptChatroomInvitation(notification_id)
    })
  }
  const rejectChatroomInvitation = async (notification_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.rejectChatroomInvitation(notification_id)
    })
  }

  const acceptFriendshipRequest = async (notification_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.acceptFriendshipRequest(notification_id)
    })
  }
  const rejectFriendshipRequest = async (notification_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.acceptFriendshipRequest(notification_id)
    })
  }
  const acceptChatroomJoinRequest = async (Notification_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.acceptChatroomJoinRequest(Notification_id)
    })
  }
  const rejectChatroomJoinRequest = async (Notification_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.rejectChatroomJoinRequest(Notification_id)
    })
  }
  const getSearchUsers = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getSearchUsers(url)
    })
  }

  const sendFriendRequest = async (user_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.sendFriendRequest(user_id)
    })
  }
  const getBlockedUsers = async () => {
    return executeWithErrorHandling(() => {
      return apiService.getBlockedUsers()
    })
  }
  const unblockUser = async (user_id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.unblockUser(user_id)
    })
  }
  const getUserProfile = async (username: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getUserProfile(username)
    })
  }

  const getDms = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getDms(url)
    })
  }

  const getChatChannels = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getChatChannels(url)
    })
  }
  const isChatroomAdmin = async (id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.isChatroomAdmin(id)
    })
  }
  const getMessages = async (url: string) => {
    return executeWithErrorHandling(() => {
      return apiService.getMessages(url)
    })
  }
  const deleteMessage = async (id: number) => {
    return executeWithErrorHandling(() => {
      return apiService.deleteMessage(id)
    })
  }

  return {
    login,
    createChatroom,
    getChatrooms,
    uploadProfilePhoto,
    uploadFile,
    markAllRead,
    handleLeaveChatroom,
    sendInvitation,
    getInvitationUsers,
    getChatroomSettings,
    getChannels,
    getMembers,
    addChannel,
    updateChannel,
    deleteChannel,
    removeMember,
    updateChatroomSettings,
    joinChatroom,
    getFriends,
    blockUser,
    removeFriend,
    getJoinedChatrooms,
    getMyChatrooms,
    deleteChatroom,
    getNotifications,
    acceptChatroomInvitation,
    rejectChatroomInvitation,
    acceptFriendshipRequest,
    rejectFriendshipRequest,
    acceptChatroomJoinRequest,
    rejectChatroomJoinRequest,
    getSearchUsers,
    sendFriendRequest,
    getBlockedUsers,
    unblockUser,
    getUserProfile,
    getDms,
    getChatChannels,
    isChatroomAdmin,
    getMessages,
    deleteMessage,
    register
  };
};



export const useTypingAnimation = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) return;

    setDisplayText('');
    setIsComplete(false);
    let index = 0;

    const type = () => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
        timeoutRef.current = setTimeout(type, speed);
      } else {
        setIsComplete(true);
      }
    };

    type();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  return { displayText, isComplete };
}