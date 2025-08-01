import React from 'react'
import { ClipLoader } from 'react-spinners';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import fileIcon from '../assets/icons/file.icon.png';
import profilePhoto from '../assets/icons/profile.jpeg'
import { faChevronDown, faDownload } from '@fortawesome/free-solid-svg-icons'
import DateRenderer from './DateRenderer';
import '../styles/message-displayer.css'
import { useAuth, useChat } from '../types/hooks';

const MessagesList = () => {
    
    const {user} = useAuth()

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    const {messages,messagesLoading,dmInitialized,setdmInit,newMesNot,setNewMesNot,
        editIndex,setEditIndex,editMessage,setEditMessage, nextMessagesPage,messagesEndRef,firstMessageRef,chatWindowRef,hoveredIndex,setHoveredIndex,fetchMessages,isOnBottom,
        currentMessages,submitDelete,submitEdit,handleEdit
    } = useChat()

    

    
    //keep track the hovered message
    const handleMouseLeave = () => {
        setHoveredIndex(null)
    }

    //Scroll down to end, close the new message notification
    const handleNewMesNot = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        scrollToEndMessage()
        setNewMesNot(false)
    }
    
    //Handle the scroll behaviour
    useEffect(() => {
        if (messagesLoading) {
            return
       }


        if (chatWindowRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;

            //scroll to end when the chat initialized for the first time
           if (!dmInitialized){
                console.log('MESSAGES:',messages);
                
                scrollToEndMessage()
                setdmInit(true) //set dmInit to true to prevent it to repeat
                
                
            }
            if(isOnBottom()){ //scroll to end if the user is already on the last index
                
                scrollToEndMessage()
            }
            else if(chatWindowRef.current.scrollTop === 0){ //scroll to the first message of the pagination when the user on the top
                
                scrollToFirstMessage()
                
            }


        }

      },[messages,messagesLoading])
    


    useEffect(() => {
    const chatWindow = chatWindowRef.current;
    //keep track of the scrolls if the user in a chat
    if (chatWindow) {
        chatWindow.addEventListener("scroll", handleScroll);
        return () => {
        chatWindow.removeEventListener("scroll", handleScroll); // Clean up event listener
        };
    }
    }, [nextMessagesPage,messages]); //trigger this when new messages page received


    const handleScroll = async () => {
        //close the new messages notification when the user is on bottom
        if (isOnBottom()){
            setNewMesNot(false)
            
        }

        //debug purposes
        if (!(isOnBottom())) {
            console.log('BOTTOM FALSE');
            
        }
        //if the user is on top and a next page exists fetch the next page
        if (chatWindowRef.current?.scrollTop === 0 && nextMessagesPage) {
            fetchMessages(nextMessagesPage, true);
            
            
        }
        
        };

        const scrollToFirstMessage = () => {
        
        if (firstMessageRef.current) {
            
            //debug purposes
            const firstMessageElement = document.getElementById(`message-${firstMessageRef.current.id}`)
            console.log('FIRST MESSAGE',firstMessageElement);
            
            //scroll to the first message
            if(firstMessageElement){
                
                firstMessageElement.scrollIntoView()
            }    
        }
        
    }




    //scroll to end message logic
    const scrollToEndMessage = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                
                console.log('CURRENT ID ',messagesEndRef.current.id);
                
                const endMessageElement = document.getElementById(`message-${messagesEndRef.current.id}`)
                if(endMessageElement){
                    endMessageElement.scrollIntoView()
                }    
            }    
        }, 100);
        
        
    }
    


const handleMouseEnter = (index: number) => {
        setHoveredIndex(index)
    }

  return (

        <>
                    <div ref={chatWindowRef} className='dm-messages-container'>
                    {messagesLoading && messages ? (
                        <>
                        <ClipLoader></ClipLoader>
                        {messages.map((message, index) => (
                            <div key={index}>
                           
                            <>
                            <div key={message.id} className='message-container'>
                            <div  onMouseEnter={(e) => handleMouseEnter(index)} onMouseLeave={() => handleMouseLeave()} className='message-item'>
                            <div className='message-header'>
                            <NavLink to={`/user_profile/${message.sender.username}`}>{message.sender.profile_picture ? (
                                <img className='profile-image' src={message.sender.profile_picture.url} alt="" width={40} height={40} />
                            ) : (
                                <img className='profile-image' src={profilePhoto} alt="" width={40} height={40} />
                            )}</NavLink>
                            <span className='dm-username'>{message.sender.username}: </span>
                            </div>
                            <div className='dm-message-content'>
                            {editIndex === index ?(
                                <>
                                <input className='message-edit-input' type="text" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} />
                                <button onClick={(e) => submitEdit(e,message.id)} className='edit-message-save-button'>Edit</button>
                                <button onClick={() => setEditIndex(null)} className='edit-message-save-button'>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <p data-testid = 'test-message-content'> {message.content}</p>
                                    {message.file ? (
                                        
                                
                                        


                                    message.file.file_type.startsWith('image') ? (
                                        <div className='file-div'>
                                            <span className='file-name-span'>{message.file.file_name}</span>
                                            <img onLoad={() => isOnBottom() ? scrollToEndMessage() : null} className='file-image' src={message.file.url} alt={message.file.original_name}></img>
                                        </div>
                                        
                                        
                                    ) : (
                                        <div className='file-div'>
                                            <img src={fileIcon} alt="" width={100} height={100} />
                                            <span className='file-name-span'>{message.file.original_name}</span>
                                            <a href={message.file.url} download={message.file.original_name} className='file-a'>
                                                <FontAwesomeIcon icon={faDownload} style={{color:"red"}}></FontAwesomeIcon>
                                            </a>
                                        </div>
                                    )
                                        
                                    
                                

                                ) : (
                                    null
                                )}
                                    </>
                                        
                                    )}


                            </div>


                            <div  className='dm-message-footer'>

                            <span className='dm-message-data'>{<DateRenderer mode='ago' date_string={message.timestamp}></DateRenderer>}</span>
                            {hoveredIndex === index && message.sender.id === user?.id ?  (
                            <>
                            <button onClick={(e) => handleEdit(index,message.content)} className='message-options-button'><FontAwesomeIcon icon={faEdit}></FontAwesomeIcon></button>
                            <button onClick={(e) => submitDelete(e,message.id)} className='message-options-button'><FontAwesomeIcon icon={faTrash}></FontAwesomeIcon></button>

                                

                            </>
                                
                            ) : (
                                null
                            )}

                            </div>

                            </div>
                            
                            </div>
                            
                            <div className='message-end' id={`message-${message.id}`}></div>

                            </>
                            </div>
                            ))}
                            
                            
                          
                                                    </>
                                                   

                        
                        
                    )
                        
                       :(
                        <>
                            {messages.map((message, index) => (
                                <div key={index}>
                               
                                <>
                                <div key={message.id} className='message-container'>
                                <div  onMouseEnter={(e) => handleMouseEnter(index)} onMouseLeave={() => handleMouseLeave()} className='message-item'>
                                <div className='message-header'>
                                <NavLink to={`/user_profile/${message.sender.username}`}>{message.sender.profile_picture ? (
                                    <img className='profile-image' src={message.sender.profile_picture.url} alt="" width={40} height={40} />
                                ) : (
                                    <img className='profile-image' src={profilePhoto} alt="" width={40} height={40} />
                                )}</NavLink>
                                <span className='dm-username'>{message.sender.username}: </span>
                            </div>
                            <div className='dm-message-content'>
                                {editIndex === index ?(
                                    <>
                                    <input data-testid='test-edit-input' className='message-edit-input' type="text" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} />
                                    <button data-testid='test-submit-edit-button' onClick={(e) => submitEdit(e,message.id)} className='edit-message-save-button'>Edit</button>
                                    <button onClick={() => setEditIndex(null)} className='edit-message-save-button'>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <p data-testid='message-test-content'> {message.content}</p>
                                        {message.file ? (
                                            
                                    
                                            

                                
                                        message.file.file_type.startsWith('image') ? (
                                            <div className='file-div'>
                                                <span className='file-name-span'>{message.file.original_name}</span>
                                                <img onLoad={() => isOnBottom() ? scrollToEndMessage() : null} className='file-image' src={message.file.url} alt={message.file.original_name}></img>
                                            </div>
                                            
                                            
                                        ) : (
                                            <div className='file-div'>
                                                <img src={fileIcon} alt="" width={100} height={100} />
                                                <span className='file-name-span'>{message.file.original_name}</span>
                                                <a href={message.file.url} download={message.file.original_name} className='file-a'>
                                                    <FontAwesomeIcon icon={faDownload} style={{color:"red"}}></FontAwesomeIcon>
                                                </a>
                                            </div>
                                        )
                                            
                                        
                                    
                                
                                    ) : (
                                        null
                                    )}
                                        </>
                                            
                                        )}
                                
                                
                            </div>
                            
                            <div  className='dm-message-footer'>
                            
                                <span className='dm-message-data'>{<DateRenderer mode='ago' date_string={message.timestamp}></DateRenderer>}</span>
                                {hoveredIndex === index && message.sender.id === user?.id ?  (
                                <>
                                <button data-testid='test-handle-edit-button' onClick={() => handleEdit(index,message.content)} className='message-options-button'><FontAwesomeIcon icon={faEdit}></FontAwesomeIcon></button>
                                <button data-testid='test-handle-delete-button' onClick={(e) => submitDelete(e,message.id)} className='message-options-button'><FontAwesomeIcon icon={faTrash}></FontAwesomeIcon></button>

                                    
                                
                                </>
                                    
                                ) : (
                                    null
                                )}
                                
                            </div>
                                
                            </div>
                            
                           
                        </div>
                        <div className='message-end' id={`message-${message.id}`}></div>
                        </>
                        </div>
                        
                            
                                
           
                    ))}
                    
                        
                        </>
                    )}

               
                    
                </div>
                {newMesNot ? (
                        <>
                        <div className='new-messages-notif'>
                     <a onClick={(e) => handleNewMesNot(e)} className='new-mes-a'>New Messages <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon></a>

                    </div>
                        </>
                    ) : (
                        <></>
                    )}
    </>
    
  )
}

export default MessagesList
