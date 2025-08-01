import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import profilePhoto from '../assets/icons/profile.jpeg'
import ClipLoader from 'react-spinners/ClipLoader'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns';
import '../styles/notifications-dropdown-menu.css'
import { Notification } from '../types/notifications'
import { useApi, useError } from '../types/hooks';

const NotificationsDropDownMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[] | []>([])
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const [loading,setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const [unreadCount,setCount] = useState(0)
    const {executeWithErrorHandling, error} = useError()
    const {markAllRead,getNotifications, acceptChatroomInvitation, rejectChatroomInvitation, acceptFriendshipRequest, rejectFriendshipRequest, acceptChatroomJoinRequest, rejectChatroomJoinRequest} = useApi(executeWithErrorHandling)
    const web_socket_url = import.meta.env.VITE_WS_URL 

    const navigate = useNavigate();

    //dropdown
    const toggleDropDown = () => {
      if (isOpen) {
        navigate("/notifications")
      }
        setIsOpen(!isOpen)
    }


    const renderTimeAgo = (dateString:Date) => {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
  };

    //mark all read
    const markAllReadSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      const result = await markAllRead()
      result?.success ? setNotifications([]) : toast.error(error?.message)
    }


    //submit accept/decline requests
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
                  result?.success ? toast.success('accepted') : toast.error(error?.message)
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


    //fetch the initial notifications
    const fetchNotifications = async () => {
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        try {
          const token = localStorage.getItem('auth_token')
          socketRef.current =  new WebSocket(`${web_socket_url}/ws/notifications/?token=${token}`)
          setSocket(socketRef.current)
  
  
          socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("NOT DATA: ",data);
            
            if (data.notifications) {
              setNotifications((prev) => {
                const newNotifications = [
                    ...prev,
                    ...data.notifications.filter((n : Notification) => !prev.some(p => p.id === n.id))
                ];
                console.log(newNotifications); // Log new notifications
                return newNotifications;
            });
            }
            else if(data.notification){
              setNotifications((prev) => [
                data.notification,...prev,
            ])

            }

          }
  
          socketRef.current.onopen = () => {
            console.log('WebSocket connection established NOTS');
        };
  
        // Handle connection close
        socketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
        };
  
  
        } catch (error) {
          console.log(error);
          
        }finally{
          console.log('NOTIFICATIONS:', notifications);
          setLoading(false)
        }
        
      }
      
    }

    //fetch the notifications when first initialized
    useEffect(() => {
      fetchNotifications()
      return () => {
        if (socket) {
            //close the previous connection
            socketRef.current?.close();
        }
    };

    },[])

    useEffect(() => {
      setCount(notifications.length) //number of notifications

      //close the dropdown when a click outside detected
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }

      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } 
  
      // Cleanup function to remove event listener when component unmounts
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };



    },[isOpen,notifications.length,[]])

  return (
    <div data-testid='test-notifications-dropdown' className="notifications-dropdown-menu" ref={dropdownRef}>
      {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount}</span>
                )}
      <button data-testid='notif-dropdown-button' onClick={toggleDropDown} className="notifications-dropdown-button">
      <FontAwesomeIcon icon={faBell} className='dropdown-icon' />
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className='dropdown-icon' />
      </button>

      {isOpen && (
        <div data-testid='notif-dropdown-content' className="notifications-dropdown-content">
          <div className='notifications-navbar'>
            <button onClick={(e) => markAllReadSubmit(e)} className='notifications-navbar-button'>Mark All As Read</button>
          </div>
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
              <div className='notification-content'>
              {["chatroom_invitation","chatroom_join_request", "friend_request"].includes(notification.notification_type) && (
                <>
                <button onClick={(e) => submitRequest(e,notification.id,true,notification.notification_type)} className='notification-button'><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon></button>
                <button onClick={(e) => submitRequest(e,notification.id,false,notification.notification_type)} className='notification-button'><FontAwesomeIcon icon={faTimes}></FontAwesomeIcon></button> 
                </>
              )}
              
                 
              </div>
              <div className='notification-footer'>
                  <span>{renderTimeAgo(notification.created_at)}</span>
              </div>
            </div>
            ))}
          </>
        )}
          
          
        </div>
      )}
    </div>
  )
}


const styles = {
  badge: {
    position: 'absolute' as const,
    top: '1px',
    right: '40px',
    padding: '1px 9px',
    borderRadius: '50%',
    backgroundColor: 'red',
    color: 'white',
    fontSize: '10px',
  }
};
export default NotificationsDropDownMenu