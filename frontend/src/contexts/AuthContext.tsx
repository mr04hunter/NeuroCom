import React, { ReactNode } from "react";
import {ChangePasswordData, LoginCredentials, Profile, RegisterData, User, UserSettings} from "../types/auth"
import {Chatroom} from "../types/chat"
import { AuthContextType } from "../types/context";
import { createContext, useEffect, useRef, useState } from "react";
import { useApi, useError, useErrorHandler } from "../types/hooks";
import { apiService } from "../services/api";
import { ChangePasswordResponse, LoginResponse, LogoutResponse, RegisterResponse, UpdateProfileData, UpdateProfileResponse, UpdateUserSettingsResponse } from "../types/api";

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
    children: ReactNode;
}


export function AuthProvider ({children} : AuthProviderProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingAuth, setLoading] = useState<boolean>(true)
    const [user,setUser] = useState<User | null>(null)
    const [userSettings,setUserSettings] = useState<UserSettings | null>(null)
    const [chatrooms,setChatrooms] = useState<Chatroom[] | null>(null)
    const [myChatrooms,setMyChatrooms] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const socketRef = useRef<WebSocket | null>(null)
    const [socket,setSocket] = useState<WebSocket | null>(null)
    const [userStatus, setUserStatus] = useState([])
    const { error, isLoading, clearError, executeWithErrorHandling, getFieldError, getAllFieldErrors} = useError()

    const {register,login} = useApi(executeWithErrorHandling)
    const web_socket_url: string = import.meta.env.VITE_WS_URL 

    const checkAuthStatus = async (): Promise<void> => {
                setLoading(true)
                const result = await executeWithErrorHandling(() => {
                    return apiService.checkAuthStatus()})
                    console.log('AUTH STATUS RES', result);
                    
                    setUser(result?.user ?? null)
                    setUserSettings(result?.success ? result?.user.settings : null)
                    setIsLoggedIn(result?.success ?? false)
                    setLoading(false)

        };


    useEffect(() => {
        const authOnMount = async () => {
            if(localStorage.getItem('auth_token')){
                await checkAuthStatus()
            }
                
        }
        authOnMount()
    },[])



    useEffect(() =>{
        document.body.className = "dark-mode"
        if (loadingAuth) {
            return
        }
        if (user){
            user.settings.darkmode ? document.body.className = "dark-mode" : document.body.className = "light-mode"
            
        }
        
        
    },[loadingAuth])

    useEffect(() => {
        if (user){
            getOnlineUsers();
        }
        
    
        return () => {
            if (socket) {
                socketRef.current?.close();
            }
        };
    }, [user,loadingAuth]);


    useEffect(() => {
        console.log("ONLINE_USERS: ",onlineUsers);
        
    },[onlineUsers])

    
    const getOnlineUsers = async (): Promise<void> =>{
        if (user) {
            if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
                try {
                    const token = localStorage.getItem('auth_token');
                    socketRef.current = new WebSocket(`${web_socket_url}/ws/activity/?token=${token}`);
                    setSocket(socketRef.current);
        
                    socketRef.current.onopen = () => {
                        console.log('WebSocket connection established DM');
                    };
        
                    socketRef.current.onclose = () => {
                        console.log('WebSocket connection closed DM');
                    };
        
                    socketRef.current.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        console.log(data);
                        
        
                        if (data.type === "online_users") {
                            console.log('received');
                            setOnlineUsers(data.online_users);
                            
                        }
                    };
                } catch (error) {
                    console.log(error);
                }
            }    
        }
        
    };

    const handleRegister = async (data:RegisterData): Promise<RegisterResponse | null> => {
        const result = await register(data)
        console.log(result);
        console.log("RESU", result);
        
        if (result?.success) {
            localStorage.setItem('auth_token', result?.token ?? '');
            setUser(result?.user ?? null);
            setIsLoggedIn(true);
            
        }
        setLoading(false);
        
     
        console.log("ESDSWDFWDFwS");
        

        return result
        

        
    }

    const handleLogin = async (loginData: LoginCredentials) : Promise<LoginResponse | null> => {
        setLoading(true)
        const result = await login(loginData)
 
        localStorage.setItem('auth_token', result?.success ? result.token : '')
        setUser(result?.user ?? null)
        setUserSettings(result?.user?.settings ?? null)
        setIsLoggedIn(result?.success ?? false)
        setLoading(false)
        return result
    };


    const logout = async (): Promise<LogoutResponse | null> =>{
        const result = await executeWithErrorHandling(async () => {
            return await apiService.logout()})
            localStorage.removeItem('auth_token')
            setUser(null)
            setIsLoggedIn(false)
            return result ?? {success: false}
    };


    const updateUserSettings = async (settings: UserSettings): Promise<UpdateUserSettingsResponse | null> => {
        setLoading(true)
        const result = await executeWithErrorHandling(() => {
            return apiService.updateUserSettings(settings)})

        setUserSettings(result?.settings ?? null)
        if(user && result?.settings){
            const updated_user = user
            updated_user.settings = result.settings
            setUser(updated_user)
            setLoading(false)
            return result
        }
        
        
        return result
    }

    const updateProfile = async (updateProfileData: UpdateProfileData): Promise<UpdateProfileResponse | null> => {
            const result = await executeWithErrorHandling(async () => {
                return await apiService.updateProfile(updateProfileData)})
            setUser(result?.user ?? null)
            return result
}

    const changePassword = async (changePasswordData: ChangePasswordData): Promise<ChangePasswordResponse | null> => {
        const result = await executeWithErrorHandling(async () => {
            return await apiService.changePassword(changePasswordData)
        });

        return result ?? {
            success: false,
            message: 'Password Update Failed',
        }

    }

    const deleteAccount = async () => {
        executeWithErrorHandling(async () => {
            return await apiService.deleteAccount()});
        setUser(null)
        setLoading(false)
        setUserSettings(null)
    }



    return (
        <AuthContext.Provider value={{ user, isLoggedIn, handleLogin, logout,error, loadingAuth, updateProfile, updateUserSettings,userSettings,changePassword, deleteAccount,handleRegister,onlineUsers, }} data-testid="auth-provider">
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext