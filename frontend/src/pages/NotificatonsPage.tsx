import axios from 'axios';
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify'
import profilePhoto from '../assets/icons/profile.jpeg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/notifications-page.css'
import { useApi, useAuth, useError, useErrorHandler } from '../types/hooks';
import { Notification } from '../types/notifications';

const NotificatonsPage = () => {
    const [selectedSetting, setSelectedSetting] = useState('latest');
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [requestNotifications, setRequestNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const {user,userSettings,loadingAuth,updateUserSettings,changePassword,deleteAccount} = useAuth()
    const { error, isLoading, clearError, executeWithErrorHandling } = useError()
    const {getNotifications, acceptChatroomInvitation, rejectChatroomInvitation, acceptFriendshipRequest, rejectFriendshipRequest, acceptChatroomJoinRequest, rejectChatroomJoinRequest} = useApi(executeWithErrorHandling)
    const navigate = useNavigate()
    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            console.log('WORRRRKEDA 7');
            navigate("/unauthorized")
        }

    },[loadingAuth,user])


    const fetchNotifications = async () => {
   
            const result = await getNotifications()
            if(!result?.success){
              toast.error(error?.message)
              return
            }
            const resultNotifications = result?.notifications ?? []

            setNotifications(resultNotifications)
            const reqNotifications = resultNotifications.filter((n: Notification) => ['friend_request',"chatroom_join_request","chatroom_invitation"].includes(n.notification_type))
            setRequestNotifications(reqNotifications)
            
       
            
        
            setLoading(false)
        
    }

    const renderTimeAgo = (dateString: Date) => {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    };


    useEffect(() => {
        fetchNotifications()
    },[])


    const submitRequest = async (e: React.MouseEvent<HTMLButtonElement>,id: number,isAccept: boolean,type: string) => {
        try {
          if (type === 'chatroom_invitation') {
            if (isAccept) {
              const result = await acceptChatroomInvitation(id)
              result?.success ? toast.success('Accepted') : toast.error(error?.message)
              setNotifications((prev) => (
                prev.filter(notification => notification.id !== id)
              ))
            }
            else {
              const result = await rejectChatroomInvitation(id)
              result?.success ? toast.success('Rejected') : toast.error(error?.message)
              setNotifications((prev) => (
                prev.filter(notification => notification.id !== id)
              ))
  
            }
          }else if (type === 'friend_request'){
            if (isAccept) {
              const result = await acceptFriendshipRequest(id)
              result?.success ? toast.success('Accepted') : toast.error(error?.message)
              setNotifications((prev) => (
                prev.filter(notification => notification.id !== id)
              ))
            }
            else {
              const result = await rejectFriendshipRequest(id)
              result?.success ? toast.success('Rejected') : toast.error(error?.message)
              setNotifications((prev) => (
                prev.filter(notification => notification.id !== id)
              ))
  
            }
          }
          else if (type === 'chatroom_join_request'){
            if (isAccept) {
              const result = await acceptChatroomJoinRequest(id)
              result?.success ? toast.success('Rejected') : toast.error(error?.message)
              setNotifications((prev) => (
                prev.filter(notification => notification.id !== id)
              ))
            }
            else {
              const result = await rejectChatroomJoinRequest(id)
              result?.success ? toast.success('Rejected') : toast.error(error?.message)
              setNotifications((prev) => (
                prev.filter(notification => notification.id !== id)
              ))
  
            }
          }
          
        } catch (error) {
          console.log(error);
          
        }
    }



    const renderContent = () => {


        switch (selectedSetting){
            case 'latest':
                return(
                    <>      <h2 className='setting-header'>LATEST NOTIFICATIONS</h2>
                            
                            <hr></hr>


                             {loading ? (
                            <ClipLoader></ClipLoader>
                            ) : (
                            <>
                                {notifications.map((notification,index) => (
                                <div key={index} className='notification-item'>
                                <div className='notification-header'>
                                    <p className='notification-text'>{notification.notification_message}</p>
                                    <img src={profilePhoto} alt="" width={40} height={40} />
                                </div>
                                {notification.content_object.status === 'pending' ? (
                                        <>
                                        <div className='notification-content'>
                                        <button onClick={(e) => submitRequest(e,notification.id,true,notification.notification_type)} className='notification-button'><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon></button>
                                        <button onClick={(e) => submitRequest(e,notification.id,false,notification.notification_type)} className='notification-button'><FontAwesomeIcon icon={faTimes}></FontAwesomeIcon></button>
                                    </div>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                <div className='notification-footer'>
                                    <span className='date-span-notification'>{renderTimeAgo(notification.created_at)}</span>
                                </div>
                                </div>
                                ))}
                            </>
                            )}
                    </>
                )
            
            case 'requests':
                    return(
                        <>      <h2 className='setting-header'>REQUEST NOTIFICATIONS</h2>
                                
                                <hr></hr>
    
    
                                 {loading ? (
                                <ClipLoader></ClipLoader>
                                ) : (
                                <>
                                    {requestNotifications.map((notification,index) => (
                                    <div key={index} className='notification-item'>
                                    <div className='notification-header'>
                                        <p className='notification-text'>{notification.notification_message}</p>
                                        <img src={profilePhoto} alt="" width={40} height={40} />
                                    </div>
                                    {notification.content_object.status === 'pending' ? (
                                        <>
                                        <div className='notification-content'>
                                        <button onClick={(e) => submitRequest(e,notification.id,true,notification.notification_type)} className='notification-button'><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon></button>
                                        <button onClick={(e) => submitRequest(e,notification.id,false,notification.notification_type)} className='notification-button'><FontAwesomeIcon icon={faTimes}></FontAwesomeIcon></button>
                                    </div>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                    <div className='notification-footer'>
                                        <span className='date-span-notification'>{renderTimeAgo(notification.created_at)}</span>
                                    </div>
                                    </div>
                                    ))}
                                </>
                                )}
                        </>
                    )
        }
    }


  return (
    <section className='notifications-section'>
        <div className='settings-nav'>
            <h2 className='settings-header'>NOTIFICATIONS</h2>
            <nav>
                <ul>
                    <li><a className={selectedSetting==='latest' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('latest')} href="#">Latest</a></li>
                    <li><a className={selectedSetting==='requests' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('requests')} href="#">Requests</a></li>
                    <li><a className={selectedSetting==='messages' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('messages')} href="#">Messages</a></li>
                </ul>


            </nav>

        </div>
        <div className='notifications-content'>
            
            {renderContent()}

        </div>


    </section>
  )
}

export default NotificatonsPage