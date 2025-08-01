import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { useParams } from 'react-router-dom';
import MessagesList from '../components/MessagesList';
import MessageSender from '../components/MessageSender';
import '../styles/chatroom-page.css'
import { useApi, useAuth, useChat, useError } from '../types/hooks';
import { toast } from 'react-toastify';
const ChatroomPage = () => {

    const {chatroom_id,chatroom_title} = useParams<string>();
    const {error, executeWithErrorHandling} = useError()
    const {handleLeaveChatroom} = useApi(executeWithErrorHandling)

    const navigate = useNavigate();
    const {user,loadingAuth} = useAuth()


    useEffect(() => {
        if (loadingAuth) {
            console.log(chatroom_id);
            console.log(chatroom_title);
            
            
            return
        }
        else if (!user) {
            console.log('WORRRRKEDA 3');
            navigate("/unauthorized")
        }

    },[loadingAuth,user])
    



    const {getIsAdmin,fetchChannels, channelsLoading, isAdminLoading, channels, isAdmin, messages, messagesLoading, connectChannel, currentChannelId, setCurrentChannelId,
        channelInitialized, setChannelInit, 
    } = useChat()

    

    useEffect(() => {
        if(!chatroom_id){
            return
        }
        getIsAdmin(Number(chatroom_id))
        fetchChannels(`/chatroom/get_channels/${chatroom_id}`,false)
        
    
    },[chatroom_id])
    



    const leaveChatroom = async (chatroom_id: number) => {
        const conf = confirm('Are you sure you want to leave this chatroom?')
        if (conf) {
            const result = await handleLeaveChatroom(chatroom_id)

            result?.success ? toast.success('Successfully left the chatroom') : toast.error(error?.message)
            navigate('/')
        }
        
    }


    const navigateToSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
        navigate(`/chatroom_settings/${chatroom_id}`)
    }


  return (
    <section className='chatroom-section'>
        <div className='chatroom-nav-div'>
        <div className='chatroom-nav-container'>
            <h1 className='chatroom-nav-header'>{chatroom_title}</h1>
            <div className='chatroom-channels-container'>
            <nav className='chatroom-nav'>
                <h2 className='chatroom-channels-header'>#Channels</h2>
                <ul>
                    {channelsLoading ? (
                        <ClipLoader></ClipLoader>
                    ) : (
                        <>
                        {channels?.map((channel,index) => (
                            <a onClick={(e) => connectChannel(Number(chatroom_id), Number(channel.id))} key={index} href='#' id={channel.name} className={currentChannelId === channel.id ? 'chatroom-channel-list-item-active' : 'chatroom-channel-list-item'}>
                            <li className={currentChannelId === channel.id ? 'chatroom-channel-list-item-active' : 'chatroom-channel-list-item'}>#{channel.name} <FontAwesomeIcon icon={faComments}></FontAwesomeIcon></li>
                            </a>
                        ))}
                        

                        </>
                    )}
                    

                </ul>
            </nav>
            
            </div>
            
        
        </div>
        
        <div className='chatroom-options-div'>
                <div className='chatroom-options-container'>
                {isAdminLoading ? (
                    <ClipLoader></ClipLoader>
                ) : (
                    isAdmin ? (<div className='chatroom-button-container'>
                        <button onClick={(e) => navigateToSettings(e)} className='chatroom-options-button'>Settings</button>
                    </div>) :(
                        <div className='chatroom-button-container'>
                        <button onClick={() => leaveChatroom(Number(chatroom_id))} className='chatroom-options-button'>Leave</button>
                    </div>
                    )
                )}
                    
                    
                  
                </div>

        </div>

        </div>


        <div className='chatroom-chat-container'>
            <div className='chatroom-chat-top-bar'>

            </div>

            <div className='chatroom-chat-content'>
                {currentChannelId ? (
                    <>
                    <MessagesList></MessagesList>
                    <MessageSender></MessageSender>    
                    </>
                    
                ) : (
                    <></>
                )}
                
        </div>
        
        <div ></div>
        
        </div>
        


        

    </section>
  )
}

export default ChatroomPage
