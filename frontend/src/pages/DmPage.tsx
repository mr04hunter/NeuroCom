import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profilePhoto from '../assets/icons/profile.jpeg'
import ClipLoader from 'react-spinners/ClipLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import MessagesList from '../components/MessagesList';
import MessageSender from '../components/MessageSender';
import '../styles/dm-page.css'
import { useAuth, useChat } from '../types/hooks';


const DmPage = () => {
    const navigate = useNavigate();

    const {user,userSettings,loadingAuth,changePassword,deleteAccount,error} = useAuth()
    const socketRef = useRef(null)
    const {onlineUsers} = useAuth()
    const [socket, setSocket] = useState(null)
    const [file, setFile] = useState(null)
    const fileInputRef = useRef(null);
    const dmWindowRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            navigate("/unauthorized")
        }

    },[loadingAuth,user])

    
    const {fetchDms,direct_messages,loading,setCurrentDmId,messages,messagesLoading,currentDmId,dmInitialized,newMesNot,setNewMesNot,otherUser,nextDmPage,userStatus,
        editIndex,setEditIndex,editMessage,setEditMessage, nextMessagesPage,sendMessage, message,setOtherUser, setCurrentMessages, setdmInit, setNextMessagesPage,connectDm,setHoveredIndex,hoveredIndex
    } = useChat()




    useEffect(() => {
        fetchDms('/chat/get_direct_messages/',false)
        
    
    },[])


    useEffect(() => {
        console.log(userStatus);
        
    },[userStatus])

    


    useEffect(() => {
        const DmWindow = dmWindowRef.current;
        if (DmWindow) {
            DmWindow.addEventListener("scroll", handleScrollDm);
          return () => {
            DmWindow.removeEventListener("scroll", handleScrollDm); // Clean up event listener
          };
        }
      }, [nextDmPage, direct_messages]);


    const handleScrollDm = async () => {
        const element = dmWindowRef.current
        if(!element){
            return
        }
        const { scrollTop, scrollHeight, clientHeight } = dmWindowRef.current;
        if (scrollTop + clientHeight >= scrollHeight && nextDmPage) {
          // If user scrolls to the top and there's a previous page, load it
          fetchDms(nextDmPage, true);
          
        }
      };

  

  return (
    <section className='chat-section'>
        <div className='chat-container'>
        <div  className='chat-nav'>
        <h2 className='chat-header'>Direct Messages</h2> 
            <nav className='dm-nav'>
            <div ref={dmWindowRef} className='dm-nav-container'>
           
                <ul className='dm-boxes-ul'>
                
                {loading ? (
                    <ClipLoader></ClipLoader>
                ): (
                    <>
                    
                    
                        {direct_messages?.map((dm,index) => (
                            <li key={index} className='dm-item'>
                            <a onClick={(e) => connectDm(e,dm.id,dm.other_user.username) } className={currentDmId === dm.id  ? 'dm-button-active'  : 'dm-user-item'} href="#">
                                <div className='dm-pp-username-container'>
                                {dm.other_user.profile_picture ? (
                                    <img className='profile-image' src={dm.other_user.profile_picture.url} alt="" width={40} height={40} />
                                ) : (
                                    <img className='profile-image' src={profilePhoto} alt="" width={40} height={40} />
                                )}
                                <div className='dm-user-div'>{dm.other_user.username}</div>
                                {(onlineUsers.some(user => user.id === dm.other_user.id)) ? (
                                    
                                    <div className='online-div'>
                                    <FontAwesomeIcon icon={faCircle} style={{color:"green",marginTop:'8px'}}></FontAwesomeIcon>
                                    </div>
                                ) : (
                                    <>
                                    </>
                                )}

                                </div>
                                {userStatus.some(user => String(user.user_id) === String(dm.other_user.id) && user.in_the_chat_status === "True" && user.typing === "True") ? (
                                    <span className='in-the-chat'>In The Chat (typing...)</span>
                                ): (
                                    <>
                                    </>
                                )}
                                {userStatus.some(user => String(user.user_id) === String(dm.other_user.id) && user.in_the_chat_status === "True" && user.typing === "False") ? (
                                    <span className='in-the-chat'>In The Chat</span>
                                ): (
                                    <>
                                    </>
                                )}
                                
                            </a>
                        </li>
                        ))}
                           
                    </>
                    
                )}
                
                
                
                </ul>
                </div> 
                

            </nav>
            
            

        </div>
        

        <div className='chat-content'>
        

                {currentDmId ? (
                    <>
                    <div className='dm-chat-top-bar'>

            </div>
                    <MessagesList></MessagesList>

                    {/* <div ref={messagesEndRef} /> */}
                    {/* {newMesNot ? (
                        <>
                        <div className='new-messages-notif'>
                     <a onClick={(e) => handleNewMesNot(e)} className='new-mes-a'>New Messages <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon></a>

                    </div>
                        </>
                    ) : (
                        <></>
                    )} */}
                    
                    <MessageSender></MessageSender>

                    {/* <div className='dm-input-container'>
                    <div className='dm-chat-input-div'>
                    <input value={message} id='message-input' onChange={(e) => setMessage(e.target.value)} className='dm-chat-input'type="text" />
                    <button className='send-button' onClick={(e) => sendMessage(e,message)}>
                        <FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>
                    </button>
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }}  // Hide the default file input
                    onChange={handleFileChange} 
                />
                    <button className='send-button' onClick={handleFileButtonClick}>
                        <FontAwesomeIcon icon={faUpload}></FontAwesomeIcon>
                    </button>
                </div>
                
            </div>
            <div className='input-bottom'></div> */}
                    </>
                ) : (
                    <>
                        
                    </>
                )}
            

                
            </div>
            </div>

        



    </section>
  )
}

export default DmPage