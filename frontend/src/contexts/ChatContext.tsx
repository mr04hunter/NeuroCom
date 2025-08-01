import React, { ReactNode, createContext, useContext, useRef, useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import axios from 'axios';
import { MessageValidator } from '../components/MessageValidator';
import { ChatContextType, AuthContextType } from '../types/context';
import { DirectMessage, Channel, Message, FileType, UserStatus, } from '../types/chat';
import { WebSocketMessage } from '../types/websocket';
import { useApi } from '../types/hooks';
import { toast } from 'react-toastify';
import { useError } from '../types/hooks';

export interface ChatProviderProps {
  children: ReactNode;
  mode: 'chatroom' | 'dm';
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<ChatProviderProps> = ({ mode, children }) => {
  const [channelsLoading, setChannelsLoading] = useState<boolean | null>(mode === 'chatroom' ? true : null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(mode === 'chatroom' ? null : null);
  const [direct_messages, setDirectMessages] = useState<DirectMessage[] | null>(mode === 'dm' ? [] : null);
  const [channels, setChannels] = useState<Channel[] | null>(mode === 'chatroom' ? [] : null);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean | null>(mode === 'chatroom' ? true : null);
  const [currentChannelId, setCurrentChannelId] = useState<number | null>(null);
  const [channelInitialized, setChannelInit] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
  const [currentDmId, setCurrentDmId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const {executeWithErrorHandling, error} = useError()
  const { user, userSettings, loadingAuth, updateUserSettings, changePassword, deleteAccount} = useContext(AuthContext) as AuthContextType;
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<Message | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nextDmPage, setNextDmPage] = useState<string | null>(null);
  const [nextMessagesPage, setNextMessagesPage] = useState<string | null>(null);
  const [previousMessagesPage, setPreviousMessagesPage] = useState<string | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const dmWindowRef = useRef<HTMLDivElement>(null);
  const [dmInitialized, setdmInit] = useState<boolean>(false);
  const [newMesNot, setNewMesNot] = useState<boolean>(false);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<string>('');
  const firstMessageRef = useRef<Message | null>(null);
  const [fileData, setFileData] = useState<FileType | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  
  
  const {getDms, getChatChannels, isChatroomAdmin, getMessages, deleteMessage} = useApi(executeWithErrorHandling)

  const web_socket_url = import.meta.env.VITE_WS_URL as string;

  const scrollToEndMessage = (): void => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        console.log('END CSCOSADASFDAF');
        console.log('CURRENT ID ', messagesEndRef.current.id);
        
        const endMessageElement = document.getElementById(`message-${messagesEndRef.current.id}`);
        if (endMessageElement) {
          console.log('END ELEMENTTT', endMessageElement);
          endMessageElement.scrollIntoView();
        }
      }
    }, 100);
  };

  const isOnBottom = (): boolean => {
    if (chatWindowRef.current) {
      if (Math.abs(chatWindowRef.current.scrollHeight - chatWindowRef.current.clientHeight - chatWindowRef.current.scrollTop) <= 1) {
        console.log('true');
        return true;
      } else {
        console.log('false');
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    setSocket(null);
    setMessage('');
  }, []);

  const connectChannel = async (chatroom_id: number, channel_id: number): Promise<void> => {
    if (!(currentChannelId === channel_id)) {
      setCurrentChannelId(channel_id);
      if (socket) {
        setSocket(null);
        socketRef.current?.close();
        socketRef.current = null;
      }
      setNewMesNot(false);
      setCurrentMessages([]);
      setChannelInit(false);
      setNextMessagesPage(null);
      setMessages([]);
      fetchMessages(`/chatroom/get_channel_messages/${channel_id}`, false);

      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        try {
          socketRef.current = new WebSocket(`${web_socket_url}/ws/chatroom/${chatroom_id}/${channel_id}/?token=${localStorage.getItem('auth_token')}`);
          setSocket(socketRef.current);
          
          socketRef.current.onmessage = (event: MessageEvent) => {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log(data);
            
            if (data.action_type === 'chat_message' && data.message) {
              console.log(data.message);
              if (data.message.file) {
                data.message.file.file_name = data.message.file.url?.replace('/files/uploads/', '') || '';
              }
              messagesEndRef.current = data.message;
              setMessages((prev) => [...prev, data.message!]);
              
              if (!isOnBottom()) {
                setNewMesNot(true);
              } else {
                scrollToEndMessage();
              }
            } else if (data.action_type === 'message_edited') {
              const { message_id, new_content } = data;
              if (message_id && new_content) {
                setMessages(prevMessages => prevMessages.map(msg =>
                  msg.id === message_id ? { ...msg, content: new_content } : msg
                ));
              }
            } else if (data.action_type === 'message_deleted') {
              const { message_id } = data;
              if (message_id) {
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== message_id));
              }
            } else if (data.action_type === 'user_status') {
              const user_status = data.user_status;
              if (user_status) {
                setUserStatus(user_status);
                console.log('USER STATUS', userStatus);
              }
            }
          };

          socketRef.current.onopen = () => {
            console.log('WebSocket connection established CHANNEL ACTIVE');
          };

          socketRef.current.onclose = () => {
            setMessage('');
            console.log('WebSocket connection closed');
          };
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const fetchDms = async (url: string, prepend: boolean): Promise<void> => {

      const result = await getDms(url)
      
      result?.success === false && toast.error(error?.message)
      
      if (prepend) {
        setDirectMessages((prev) => prev ? [...prev, ...result?.direct_messages ?? []] : result?.direct_messages ?? []);
      } else {
        setDirectMessages(result?.direct_messages ?? []);
      }
      setNextDmPage(result?.next ?? null);
  
    
      setLoading(false);
    
  };

  const connectDm = async (e: React.MouseEvent, dm_id: number, other_user_username: string): Promise<void> => {
    if (!(currentDmId === dm_id)) {
      setCurrentDmId(dm_id);
      if (socket) {
        socketRef.current?.close();
        socketRef.current = null;
      }
      setOtherUser(other_user_username);
      setNewMesNot(false);
      setCurrentMessages([]);
      setdmInit(false);
      setNextMessagesPage(null);
      setMessages([]);
      fetchMessages(`/chat/get_messages_dm/${dm_id}/messages/`, false);
      
      e.preventDefault();
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        try {
          socketRef.current = new WebSocket(`${web_socket_url}/ws/dm/${dm_id}/?token=${localStorage.getItem('auth_token')}`);
          setSocket(socketRef.current);
          
          socketRef.current.onmessage = (event: MessageEvent) => {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log(data);
            
            if (data.action_type === 'chat_message' && data.message) {
              console.log(data.message);
              if (data.message.file) {
                data.message.file.file_name = data.message.file.url?.replace('/files/uploads/', '') || '';
              }
              setMessages((prev) => [...prev, data.message!]);
              messagesEndRef.current = data.message;
              
              if (!isOnBottom()) {
                setNewMesNot(true);
              } else {
                scrollToEndMessage();
              }
            } else if (data.action_type === 'message_edited') {
              const { message_id, new_content } = data;
              if (message_id && new_content) {
                setMessages(prevMessages => prevMessages.map(msg =>
                  msg.id === message_id ? { ...msg, content: new_content } : msg
                ));
              }
            } else if (data.action_type === 'message_deleted') {
              const { message_id } = data;
              if (message_id) {
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== message_id));
              }
            } else if (data.action_type === 'user_status') {
              const user_status = data.user_status;
              if (user_status) {
                setUserStatus(user_status);
                console.log('USER STATUS', userStatus);
              }
            }
          };

          socketRef.current.onopen = () => {
            console.log('WebSocket connection established');
          };

          socketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
            setMessage('');
          };
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const sendMessage = async (message: string): Promise<void> => {
    if (MessageValidator(message, setMessage) || (!MessageValidator(message, setMessage) && file)) {
      if (socketRef.current) {
        if (mode === "chatroom") {
          socketRef.current.send(JSON.stringify({
            "action_type": "chat_message",
            "message": {
              "channel_id": currentChannelId,
              "sender": user,
              "content": message,
              ...(fileData ? { file: fileData } : {})
            }
          }));
        } else {
          socketRef.current.send(JSON.stringify({
            "action_type": "chat_message",
            "message": {
              "dm_id": currentDmId,
              "sender": user,
              "content": message,
              ...(fileData ? { file: fileData } : {})
            }
          }));
        }
        
        setMessage("");
        setFile(null);
        setFileData(null);
        setCompleted(false);
      }
    }
  };

  useEffect(() => {
    if (message && message.trim() !== '') {
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          "action_type": "user_status",
          "user_status": {
            "user_id": String(user?.id),
            "in_the_chat_status": "True",
            "typing": "True"
          }
        }));
      }
    } else {
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          "action_type": "user_status",
          "user_status": {
            "user_id": String(user?.id),
            "in_the_chat_status": "True",
            "typing": "False"
          }
        }));
      }
      console.log('WORKED');
    }
  }, [message, user?.id]);

  const fetchChannels = async (url: string, prepend: boolean): Promise<void> => {
   
      const result = await getChatChannels(url)
        result?.success ?? toast.error(error?.message)
      
        if (prepend) {
          setChannels((prev) => prev ? [...prev, ...result?.channels ?? []] : result?.channels ?? []);
        } else {
          setChannels(result?.channels ?? []);
        }
      
    
      setChannelsLoading(false);
      const main_channel = document.getElementById('Main');
      if (main_channel) {
        (main_channel as HTMLElement).click();
      }
    
  };

  const getIsAdmin = async (id: number): Promise<void> => {
 
      const result = await isChatroomAdmin(id)
      
      const is_admin = result?.is_admin
      setIsAdmin(is_admin ?? false);
      console.log(isAdmin);
      console.log('IS_ADMIN', is_admin);

      setIsAdminLoading(false);
    
  };

  const fetchMessages = async (url: string, prepend: boolean = false): Promise<void> => {
    console.log("CURRENT URL", url, "CURRENT PREPEND:", prepend);
    
    setMessagesLoading(true);
    console.log('CURRENT DM ID', currentDmId);
    
    
      const result = await getMessages(url)
      if(!result?.success){
        toast.error(error?.message)
      }
      console.log(result);
      
      if (prepend) {
        const reversedOldMessages = result?.messages.reverse() ?? [];
        firstMessageRef.current = reversedOldMessages[reversedOldMessages.length - 1];
        setMessages((prev) => [...reversedOldMessages, ...prev]);
      } else {
        console.log(messagesEndRef.current);
        
        const reversedOldMessages = result?.messages.reverse() ?? [];
        messagesEndRef.current = reversedOldMessages[reversedOldMessages.length - 1];
        console.log("END REF", messagesEndRef.current);
        
        if (isOnBottom()) {
          setCurrentMessages([...reversedOldMessages]);
          console.log("SET MESSAGE FETCH");
        }
        setMessages([...reversedOldMessages]);
      }
      
      setNextMessagesPage(result?.next ?? null);
      setPreviousMessagesPage(result?.previous ?? null);
    
      console.log(error);
      setMessagesLoading(false);
   
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const result = await deleteMessage(id)
      if(result?.success){
        toast.error(error?.message)
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (id: number, message: string): Promise<void> => {
    setEditMessage(message);
    setEditIndex(id);
  };

  const submitEdit = (e: React.FormEvent, id: number): void => {
    e.preventDefault();
    try {
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          'action_type': 'edit_message',
          'message_id': id,
          'new_content': editMessage
        }));
        setEditIndex(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitDelete = (e: React.FormEvent, id: number): void => {
    e.preventDefault();
    if (confirm('Are You Sure?')) {
      try {
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({
            'action_type': 'delete_message',
            'message_id': id,
          }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const contextValue: ChatContextType = {
    direct_messages,
    setDirectMessages,
    messages,
    setMessages,
    loading,
    setLoading,
    messagesLoading,
    setMessagesLoading,
    currentDmId,
    setCurrentDmId,
    message,
    setMessage,
    messagesEndRef,
    hoveredIndex,
    setHoveredIndex,
    editIndex,
    setEditIndex,
    editMessage,
    setEditMessage,
    userStatus,
    setUserStatus,
    nextDmPage,
    setNextDmPage,
    nextMessagesPage,
    setNextMessagesPage,
    previousMessagesPage,
    setPreviousMessagesPage,
    dmInitialized,
    setdmInit,
    newMesNot,
    setNewMesNot,
    currentMessages,
    setCurrentMessages,
    otherUser,
    setOtherUser,
    fetchDms,
    connectDm,
    isOnBottom,
    chatWindowRef,
    fetchMessages,
    firstMessageRef,
    fileInputRef,
    setFile,
    file,
    sendMessage,
    handleEdit,
    handleDelete,
    submitEdit,
    submitDelete,
    fetchChannels,
    getIsAdmin,
    channelsLoading,
    isAdminLoading,
    channels,
    isAdmin,
    connectChannel,
    currentChannelId,
    setCurrentChannelId,
    channelInitialized,
    setChannelInit,
    fileData,
    setFileData,
    completed,
    setCompleted
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};