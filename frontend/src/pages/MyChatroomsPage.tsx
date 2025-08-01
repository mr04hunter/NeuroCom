import React from 'react'
import { useEffect,useState, useRef} from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/chatrooms-page.css'
import { useApi, useAuth, useError } from '../types/hooks';
import { Chatroom } from '../types/chat';
import { toast } from 'react-toastify';

const MyChatroomsPage = () => {

    const [chatroomsData, setChatroomsData] = useState<Chatroom[]>([])
    const [loading,setLoading] = useState(true)
    const [openDropDownIndex, setOpenDropdownIndex] = useState<number | null>(null)
    const navigate = useNavigate()
    const [nextPage, setNextPage] = useState<string | null>(null)
    const chatroomsWindowRef = useRef<HTMLDivElement>(null);
    const {user,userSettings,loadingAuth,changePassword,deleteAccount} = useAuth()
    const {executeWithErrorHandling, getAllFieldErrors,error} = useError()
    const {getMyChatrooms, deleteChatroom} = useApi(executeWithErrorHandling)

    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            navigate("/unauthorized")
        }

    },[loadingAuth,user])

    const listMyChatrooms = async (url: string, prepend: boolean) => {
        
            const result = await getMyChatrooms(url) 
            const chatrooms = result?.chatrooms ?? []
            if(prepend){
                setChatroomsData((prev) => [...prev, ...chatrooms.reverse()])
            }
            else{
                setChatroomsData(chatrooms)
            }

            setNextPage(result?.next ?? null)
            
            
     
            
      
            setLoading(false)
        
    }

    const handleEnterChatroom = (e: React.MouseEvent<HTMLButtonElement>,chatroom_id: number,title: string) => {
        navigate(`/chatrooms/${chatroom_id}/${title}`)
    }


    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>,id: number) => {
        e.preventDefault();
        const confirm = window.confirm('Are You Sure?')
     
            if (confirm) {
                const result = await deleteChatroom(id)
                result?.success ? toast.success('Chatroom deleted Successfully') : toast.error('Unexpected Error')
        
            listMyChatrooms('/chatroom/my_chatrooms/',false);

            }
            
       
    }

    const handleDropDown = (index: number) => {
        if (openDropDownIndex === index) {
            setOpenDropdownIndex(null)
        }
        else{
            setOpenDropdownIndex(Number(index))
        }

    }

    useEffect(() => {
        const chatroomsWindow = chatroomsWindowRef.current;
        if (chatroomsWindow) {
            chatroomsWindow.addEventListener("scroll", handleScroll);
          return () => {
            chatroomsWindow.removeEventListener("scroll", handleScroll); // Clean up event listener
          };
        }
      }, [nextPage,chatroomsData]);


    const handleScroll = async () => {
        const element = chatroomsWindowRef.current
        if(!element){
            return
        }
        const { scrollTop, scrollHeight, clientHeight } = chatroomsWindowRef.current;
        if (scrollTop + clientHeight >= scrollHeight && nextPage) {
          // If user scrolls to the top and there's a previous page, load it
          listMyChatrooms(nextPage, true);
          
        }
      };

    useEffect(() => {
    
        
        listMyChatrooms('/chatroom/my_chatrooms/', false);
        

    },[])
  return (

    <section  className='chatrooms-section'>
        {loading ? (
            <ClipLoader color="#09f" size={50}></ClipLoader>
        ) : (
            <>
            <div ref={chatroomsWindowRef} className='chatrooms-container'>
            {chatroomsData.map((chatroom,index) => (
                <div key={index} className='chatroom-card'>
                <div className='chatroom-edit-div'>
                
                <button onClick={() => handleDropDown(index)}><FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon></button>
                {openDropDownIndex === index && (
                <div className='chatroom-dropdown-menu'>
                <div className="dropdown-content">
                <NavLink to={`/chatroom_send_invitations/${chatroom.id}`}>Invite Users</NavLink>
                <NavLink to={`/chatroom_settings/${chatroom.id}`}>Settings</NavLink>
                <button onClick={(e) => handleDelete(e,chatroom.id)}>Delete</button>
                </div>
                </div>
            )}  
                </div>
                
                
                <div className='chatroom-header'>
                    <h2 className='chatroom-title'>{chatroom.title}</h2>
                </div>
                <div className='chatroom-body'>
                    <p className='chatroom-description'>{chatroom.description}</p>
                    <div className='chatroom details'>
                        <p className='total-members-text'>Total Members: <span className='total-members'>{chatroom.users.length}</span></p>
                        <p className='active-users-text'>Active Users <span className='active-users'>{chatroom.users.length}</span></p>
                    </div>
                </div>
                <div className='chatroom-footer'>
                    <button onClick={(e) => handleEnterChatroom(e,chatroom.id,chatroom.title)}>Enter</button>
                </div>
            </div>
           ))}
           </div>
            </>
            
           
        )}
    
       
        
    </section>
  )
}

export default MyChatroomsPage