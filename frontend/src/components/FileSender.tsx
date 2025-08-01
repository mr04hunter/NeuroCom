import React, { useEffect } from 'react'
import fileIcon from '../assets/icons/file.icon.png'
import '../styles/message-sender.css'
import axios, { AxiosProgressEvent } from 'axios'
import { useState } from 'react'
import { faTrash} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useApi, useChat, useError } from '../types/hooks'

const FileSender = () => {

    const { file, setFile,fileData,setFileData, completed, setCompleted} = useChat()
    const [fProgress, setProgress] = useState(0); //track the upload progress
    const {error, executeWithErrorHandling} = useError()
    const {uploadFile} = useApi(executeWithErrorHandling)
    
    const removeFile = () => {
      setFile(null)
      setFileData(null)
    }

    useEffect(() => {
      if(!file){
        return;
      }
      HandleUpload()
    },[file])


    const HandleUpload = async () =>{

        if(!file){
            return;
        }

        const result = await uploadFile(file, setProgress)

        const file_data = result?.file

        setFileData(file_data ?? null)

        setProgress(0)
        setCompleted(true)

        
        


    }
    //if no file selected display nothing
    if(!file) return null;

  return (
    <div className='file-box-container'>
    <div className='file-box'>
        <>
        <div className='remove-file-button-container'>
        
        </div>
        
        <img className='upload-file-icon' src={fileIcon} alt="" width={50} height={50} />
        <button className='remove-file-button' onClick={(e) => removeFile()}><FontAwesomeIcon className='remove-file-trash-icon' icon={faTrash}></FontAwesomeIcon></button>
        
            
        </>
        
        
        
        

    </div>
    <div className='file-name'>{file.name}</div>
    <div className='progress-bar-container'>
    <div className='progress-bar' style={{ width: `${fProgress}%` }}>
        {completed ? (
          <>
          
          <div className='completed-text'>COMPLETED</div>

          </>
          
        ) : (
          <>
          <div className='uploading-text'>uploading: % {fProgress}</div>

          </>
        )}
            
        </div>
    </div>
    
      
    </div>
  )
}

export default FileSender
