import React from 'react'
import { useEffect,useState, useRef } from 'react'
import { ClipLoader } from 'react-spinners'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/chatrooms-page.css'
import { useApi, useAuth, useError } from '../types/hooks'
import { Member } from '../types/chat'
import { toast } from 'react-toastify'
const JoinedChatrooms = () => {





    const {user,loadingAuth} = useAuth()
    const [loading, setLoading] = useState(true)
    const [chatroomsData, setChatroomsData] = useState<Member[]>([])
    const [nextPage, setNextPage] = useState<string | null>(null)
    const chatroomsWindowRef = useRef<HTMLDivElement>(null);
    const {executeWithErrorHandling, error} = useError()
    const {getJoinedChatrooms} = useApi(executeWithErrorHandling)
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
        handleGetChatrooms('/chatroom/get_joined_chatrooms/',false)
    },[])

    const handleGetChatrooms = async (url: string ,prepend: boolean) => {
            const result = await getJoinedChatrooms(url)

            result?.success === false && toast.error(error?.message)
            const memberships = result?.memberships ?? []
            if (prepend){
                setChatroomsData((prev) => [...prev,...memberships.reverse()])
            }else{
                setChatroomsData(memberships)
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

      const handleEnterChatroom = (e: React.MouseEvent<HTMLButtonElement>, chatroom_id: number,title: string) => {

        navigate(`/chatrooms/${chatroom_id}/${title}`)
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
        {chatroomsData.map((membership,index) => (
         <div key={index} className='chatroom-card'>
         <div className='chatroom-header'>
             <h2 className='chatroom-title'>{membership.chatroom.title}</h2>
         </div>
         <div className='chatroom-body'>
             <p className='chatroom-description'>{membership.chatroom.description}</p>
             <div className='chatroom details'>
                 <p className='total-members-text'>Total Members: <span className='total-members'>{membership.chatroom.users.length}</span></p>
                 <p className='active-users-text'>Active Users <span className='active-users'>{membership.chatroom.users.length}</span></p>
             </div>
         </div>
         <div className='chatroom-footer'>
             <button onClick={(e) => handleEnterChatroom(e, membership.chatroom.id,membership.chatroom.title)}>Enter</button>
         </div>
     </div>
    ))}
    </div>

        </>
    )}
    

   

</section>
  )
}

export default JoinedChatrooms
