import React, { useEffect } from 'react'
import profilePhoto from '../assets/icons/profile.jpeg'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useRef } from 'react';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader'
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/friends-page.css'
import { useApi, useAuth, useError } from '../types/hooks';
import { User } from '../types/auth';


const FriendsPage = () => {
    const [friends, setFriends] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [openDropDownIndex, setOpenDropdownIndex] = useState<number | null>(null)
    const friendsWindowRef = useRef<HTMLDivElement>(null);
    const {user,loadingAuth} = useAuth()
    const navigate = useNavigate()
    const {executeWithErrorHandling, error} = useError()

    const {getFriends, blockUser, removeFriend} = useApi(executeWithErrorHandling)

    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            navigate("/unauthorized")
        }

    },[loadingAuth,user])

    const handleDropDown = (index: number) => {
        if (openDropDownIndex === index) {
            setOpenDropdownIndex(null)
        }
        else{
            setOpenDropdownIndex(index)
        }

    }

    const handleScroll = async () => {
        const element = friendsWindowRef.current
        if(!element){
            return
        }
        const { scrollTop, scrollHeight, clientHeight } = friendsWindowRef.current;
        if (scrollTop + clientHeight >= scrollHeight && nextPage) {
          // If user scrolls to the top and there's a previous page, load it
         handleGetFriends(nextPage, true);
          
        }
      };
    
    useEffect(() => {
        const friendsWindow = friendsWindowRef.current;
        if (friendsWindow) {
            friendsWindow.addEventListener("scroll", handleScroll);
          return () => {
            friendsWindow.removeEventListener("scroll", handleScroll); // Clean up event listener
          };
        }
      }, [nextPage,friends]);


    const handleRemoveFriend = async (id: number) => {
        const conf = confirm('Are you sure?')
        if (conf) {
            
                const result = await removeFriend(id)
                result?.success ? toast.success('Removed Friend') : toast.error('Unexpected Error')

                setFriends((prevF) => prevF.filter(friend => friend.id !== id))
            
        }
        
    }



    const handleBlockFriend = async (id: number) => {
        const conf = confirm('Are you sure?')
        if (conf) {
           
                
               const result = await blockUser(id)
                result?.success ? toast.success('User is blocked') : toast.error('Unexpected Error')
            
            
                setFriends((prevF) => prevF.filter(friend => friend.id !== id))
            
        }
        
    }


    const handleGetFriends = async (url: string, prepend: boolean) =>{
        
            const result = await getFriends(url)
            const friends = result?.friends ?? []
    
            if (prepend){
                setFriends((prev) => [...prev,...friends])
            }
            else{
                setFriends(friends)
            }
            
            setNextPage(result?.next ?? null)
        
            
      
            setLoading(false)
      
    }

    const renderDate = (date_string: Date) => {
        const date = new Date(date_string)
        const readableDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          return readableDate
    }

    useEffect(() =>{
        handleGetFriends('/user/get_friends/',false)

    },[])
  return (
    <section className='friends-section'>
        <div ref={friendsWindowRef} className='friends-div'>
            {loading ? (
                <ClipLoader></ClipLoader>
            ) : (
                <>
                {friends.map((friend,index) => (
                     <div key={index} className='friend-div'>
                     <div className='user-div-item'><NavLink to={`/user_profile/${friend.username}`}>{friend.profile_picture ? (
                                    <img className='profile-image' src={friend.profile_picture.url} alt="" width={40} height={40} />
                                ) : (
                                    <img className='profile-image' src={profilePhoto} alt="" width={40} height={40} />
                                )}</NavLink></div>
                     <div className='user-div-text-item'><p className='friend-name'>{friend.username}</p></div>
                     <div className='user-div-text-item'><p className='friend-name'>{renderDate(friend.created_at)}</p></div>
                     <div className='user-div-item'><button onClick={() => handleDropDown(index)} className='friend-options-button'><FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon></button></div>
                     
                     
                     
                    
                     
                     
                     {openDropDownIndex === index && (
                <div className='friends-dropdown-menu'>
                <div className="friends-dropdown-content">
                <a onClick={() => handleRemoveFriend(friend.id)}>Remove Friend</a>
                <button onClick={(e) => handleBlockFriend(friend.id)}>Block</button>
                </div>
                </div>
            )}  
                       
                     
                 </div>  
                 
                ))}
                
               
                </>
            )}

        </div>
        



    </section>


  )
}

export default FriendsPage