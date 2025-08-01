import React, { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import profilePhoto from '../assets/icons/profile.jpeg'
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { toast } from 'react-toastify';
import { NavLink, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useApi, useAuth, useError } from '../types/hooks';
import { User } from '../types/auth';

const ChatroomSendInvitatios = () => {
    const [users,setUsers] = useState<User[] | []>([])
    const [loading,setLoading] = useState(true)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [openDropDownIndex, setOpenDropdownIndex] = useState(null)
    const usersWindowRef = useRef<HTMLDivElement>(null);
    const {id} = useParams()
    const {user,loadingAuth} = useAuth()
    const navigate = useNavigate()
    const {executeWithErrorHandling, error} = useError()
    const {sendInvitation, getInvitationUsers} = useApi(executeWithErrorHandling)

    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            console.log('WORRRRKEDA 4');
            navigate("/unauthorized")
        }

    },[loadingAuth,user])

    const submitInvitation = async (e: React.MouseEvent<HTMLButtonElement>,id: number,chatroom_id:number) => {
        e.preventDefault();
        const result = await sendInvitation(id, chatroom_id)
        if(!result?.success){
          toast.error(error?.message)
          return
        }
        setUsers((prevUsers) => prevUsers.filter(user => user.id != id))

        toast.success('Request Send')

    }


    const handleScroll = async () => {
        const element = usersWindowRef.current
        if (!element){
            return;
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
        
        
        const result = await getInvitationUsers(url)
        console.log(result);
        const resultUsers = result ? result.users : []
        if (prepend){
            setUsers((prev) => [...prev,...resultUsers.reverse()])
        }
        else{
            setUsers(resultUsers)
        }
        setNextPage(result?.next ?? null)
        

    
        console.log(error);
        
    
        setLoading(false)
       
            
        }


     



    useEffect(() => {
        
        getUsers(`/chatroom/get_invitation_users/${id}`,false);

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
                    <>
                    <div key={index} className='friend-div'>
                    <NavLink to={`/user_profile/${user.username}`}><img className='profilePhoto' src={profilePhoto} alt="" width={40} height={40} /></NavLink>
                    <p className='friend-name'>{user.username}</p>
                    <button onClick={(e) => submitInvitation(e,user.id,Number(id))} className='send-friend-request-button'>Invite</button>
                    <p className='friend-name'>Since: 2024-09-09</p>
                      
                    


                </div>

                
                    </>
                ))}
            </>
          )}
            

        </div>
        </section>
    </>
  )
}

export default ChatroomSendInvitatios
