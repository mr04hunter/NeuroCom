import React from 'react'
import { useEffect,useState, useRef } from 'react'
import { ClipLoader } from 'react-spinners'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import '../styles/chatrooms-page.css'
import { useApi, useAuth, useError } from '../types/hooks'
import { Chatroom } from '../types/chat'

const ChatroomsPage = () => {
    const {user,loadingAuth} = useAuth()
    const [loading, setLoading] = useState(true)
    const [chatroomsData, setChatroomsData] = useState<Chatroom[]>([])
    const [nextPage, setNextPage] = useState<string | null>(null)
    const chatroomsWindowRef = useRef<HTMLDivElement>(null);
    const {executeWithErrorHandling, error} = useError()
    const {getChatrooms, joinChatroom} = useApi(executeWithErrorHandling)
    const navigate = useNavigate()


    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            navigate("/unauthorized")
        }

    },[loadingAuth,user])

    useEffect(() => {
        handleGetChatrooms('/chatroom/chatrooms/',false)
    },[])

    const handleGetChatrooms = async (url: string, prepend: boolean) => {


            const result = await getChatrooms(url)
            result?.success == false && toast.error(error?.message)
            const chatrooms = result?.chatrooms ?? []
            if (prepend){
                setChatroomsData((prev) => [...prev,...chatrooms.reverse()])
            }else{
                setChatroomsData(chatrooms)
            }
            setNextPage(result?.next ?? null)
            
        
            setLoading(false)
        }
    


    useEffect(() => {
        const chatroomsWİndow = chatroomsWindowRef.current;
        if (chatroomsWİndow) {
            chatroomsWİndow.addEventListener("scroll", handleScroll);
          return () => {
            chatroomsWİndow.removeEventListener("scroll", handleScroll); // Clean up event listener
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
          handleGetChatrooms(nextPage, true);
          
        }
      };



      const handleJoinRequest = async (e: React.MouseEvent<HTMLButtonElement>, chatroom_id: number) => {
        e.preventDefault()
            const result  = await joinChatroom(chatroom_id)

            result?.success ? toast.success('Request Sent') : toast.error(error?.message)
            
          
            setChatroomsData((prevC) => prevC.filter(chatroom => chatroom.id !== chatroom_id))
            
       
            
        
        
      }

  return (
    <section className='chatrooms-section'>
        {loading ? (
            <>
                <ClipLoader></ClipLoader>
            </>
        ):(
            <>
            <div ref={chatroomsWindowRef} className='chatrooms-container'>
            {chatroomsData.map((chatroom,index) => (
             <div key={index} className='chatroom-card'>
             <div className='chatroom-header'>
                 <h2 className='chatroom-title'>{chatroom.title}</h2>
             </div>
             <div className='chatroom-body'>
                 <p className='chatroom-description'>{chatroom.description}</p>
                 <div className='chatroom-details'>
                     <p className='total-members-text'>Total Members: <span className='total-members'>{chatroom.users.length}</span></p>
                     <p className='active-users-text'>Active Users <span className='active-users'>{chatroom.users.length}</span></p>
                 </div>
             </div>
             <div className='chatroom-footer'>
                 <button onClick={(e) => handleJoinRequest(e,chatroom.id)}>Join</button>
             </div>
         </div>
        ))}
        </div>

            </>
        )}
        

       

    </section>
  )
}

export default ChatroomsPage