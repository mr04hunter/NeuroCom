import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload,faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import '../styles/message-sender.css'
import FileSender from './FileSender';
import { useChat } from '../types/hooks';

const MessageSender = () => {

    const {sendMessage, message, fileInputRef, setMessage, setFile} = useChat()


    //file select
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file){
            return
        }
        setFile(file);
        console.log("FILEEEE", file);
        event.target.value = ""
        
    };


    const handleFileButtonClick = () => {
        fileInputRef.current?.click();  // Trigger the hidden file input
    };
  return (
    <>
        
        <div className='dm-input-container'>
        {/* display the file sender component here */}
        <FileSender></FileSender>
        
                    
                    <div className='dm-chat-input-div'>
                    <input data-testid='message-input' value={message} id='message-input' onChange={(e) => setMessage(e.target.value)} className='dm-chat-input'type="text" />
                    <button data-testid='test-send-button' className='send-button' onClick={() => sendMessage(message)}>
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
            <div className='input-bottom'></div>
    </>
  )
}

export default MessageSender
