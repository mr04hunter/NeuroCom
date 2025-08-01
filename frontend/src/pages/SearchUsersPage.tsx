import React, { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import profilePhoto from '../assets/icons/profile.jpeg'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { toast } from 'react-toastify';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/search-users-page.css'
import { useApi, useAuth, useError } from '../types/hooks';
import { User } from '../types/auth';

const SearchUsersPage = () => {
    const [users,setUsers] = useState<User[]>([])
    const [loading,setLoading] = useState(true)
    const [nextPage, setNextPage] = useState<string| null>(null)
    const [openDropDownIndex, setOpenDropdownIndex] = useState<number | null>(null)
    const usersWindowRef = useRef<HTMLDivElement>(null);
    const {user,userSettings,loadingAuth,changePassword,deleteAccount} = useAuth()
    const {executeWithErrorHandling, error} = useError()
    const {blockUser, getSearchUsers, sendFriendRequest} = useApi(executeWithErrorHandling)
    const navigate = useNavigate()

    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            console.log('WORRRRKEDA 5');
            navigate("/unauthorized")
        }

    },[loadingAuth,user])

    const handleFriendRequest = async (e: React.MouseEvent<HTMLButtonElement>,id: number) => {
        e.preventDefault();
        
        const result = await sendFriendRequest(id)
        if(!result?.success){
            toast.error(error?.message)
            return
        }
        toast.success("Request Sent")
            
        setUsers((prevUsers) => prevUsers.filter(user => user.id != id))

    }


    const handleDropDown = (index: number) => {
        if (openDropDownIndex === index) {
            setOpenDropdownIndex(null)
        }
        else{
            setOpenDropdownIndex(index)
        }

    }

    const handleScroll = async () => {
        const element = usersWindowRef.current
        if(!element){
            return
        }
        const { scrollTop, scrollHeight, clientHeight } = usersWindowRef.current;
        if (scrollTop + clientHeight >= scrollHeight && nextPage) {
          // If user scrolls to the top and there's a previous page, load it
          getUsers(nextPage, true);
          
        }
      };

    useEffect(() => {
        const usersWİndow = usersWindowRef.current;
        if (usersWİndow) {
            usersWİndow.addEventListener("scroll", handleScroll);
          return () => {
            usersWİndow.removeEventListener("scroll", handleScroll); // Clean up event listener
          };
        }
      }, [nextPage,users]);


      const getUsers = async (url: string, prepend: boolean) => {
        
            const result = await getSearchUsers(url)

            result?.success === false && toast.error(error?.message)
            
            if (prepend){
                setUsers((prev) => [...prev,...result?.users.reverse() ?? []])
            }
            else{
                setUsers(result?.users ?? [])
            }
            setNextPage(result?.next ?? null)
            
            setLoading(false)
        
            
        }


        const handleBlockUser = async (id: number) => {
            const conf = confirm('Are you sure?')
            if (conf) {

                const result = await blockUser(id)
                if(!result?.success){
                    toast.error(error?.message)
                    return
                }

                toast.success(result?.message)
               
                    
              
                setUsers((prevU) => prevU.filter(user => user.id !== id))
                
            }
            
        }



    useEffect(() => {
        
        getUsers('/user/get_users/',false);

    },[])
  return (
    <>
        <section className='search-users-section'>
        <div className='search-user-div'>
            <div className='search-user-input-div'>
                <input className='search-user-input' type="text" />
                <button><FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>Search</button>
            </div>

        </div>
        <div ref={usersWindowRef} className='search-users-div'>
          {loading ? (<ClipLoader></ClipLoader>) : (
            <>
            {users.map((user,index) => (
                <div key={index} className='friend-div'>
                    <>
                    <div className='user-div-item'> <NavLink to={`/user_profile/${user.username}`}>{user.profile_picture ? (
                                    <img className='profile-image' src={user.profile_picture.url} alt="" width={40} height={40} />
                                ) : (
                                    <img className='profile-image' src={profilePhoto} alt="" width={40} height={40} />
                                )}</NavLink></div>
                    <div className='user-div-text-item'><p className='friend-name'>{user.username}</p></div>
                    <div className='user-div-item'> <button onClick={(e) => handleFriendRequest(e,user.id)} className='send-friend-request-button'>Add Friend</button></div>
                    <div className='user-div-text-item'><p className='friend-name'>Since: 2024-09-09</p></div>
                    <div className='user-div-item'><button onClick={() => handleDropDown(index)} className='friend-options-button'><FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon></button></div>
                    
                   
                    
                   
                    
                    
                      
                    
                    {openDropDownIndex === index && (
                <div className='friends-dropdown-menu'>
                <div className="friends-dropdown-content">
                <button onClick={(e) => handleBlockUser(user.id)}>Block</button>
                </div>
                </div>
            )}  


                

                
                    </>
                    </div>
                ))}
            </>
          )}
            

        </div>
        </section>
    </>
  )
}

export default SearchUsersPage