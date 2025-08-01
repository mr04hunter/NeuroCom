import React from 'react'
import { useState } from 'react'
import logo from "../assets/images/neuro_com.png"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import { useEffect } from 'react';
import { useApi, useAuth, useError, useErrorHandler } from '../types/hooks';



const CreateChatroomForm = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [allowFileShare, setAllowFileShare] = useState(true);
    const [errors, setErrors] = useState({})
    const {user,userSettings,loadingAuth,updateUserSettings,changePassword,deleteAccount,error} = useAuth()

    const {executeWithErrorHandling, getFieldError} = useError()
    const {createChatroom} = useApi(executeWithErrorHandling)

    //Wait until auth completes
    useEffect(() => {
      
      if (loadingAuth) {
          return
      }
      if (!user) {
        
          navigate("/unauthorized")
      }

  },[loadingAuth,user])


    //Create chatroom submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
        const createChatroomData = {
          name:name,
          title: title,
          description: description
        }
        const result = await executeWithErrorHandling(() => {
          return createChatroom(createChatroomData)
        })
        //navigate to homepage after submission
        
        if(!result?.success){
          return
        }
        toast.success('Chatroom Created')

        navigate('/')
        
            
     


    }

  return (
    <section className='create-chatroom-section'>
    <form onSubmit={(e) => handleSubmit(e)} className='create-chatroom-form'>
    <h2 className='chatroom-header'>Create Chatroom</h2>
    <div className='create-chatroom-div'> 
    <label className='create-chatroom-label' htmlFor='name'>Name:</label>
    <input
      type='text'
      id='name'
      value={name}
      onChange={(event) => setName(event.target.value)}
      required
    />
    {getFieldError('name') && <p className='error'>{getFieldError('name')}</p>}
  </div>
  <div className='create-chatroom-div'> 
    <label className='create-chatroom-label' htmlFor='title'>Title</label>
    <input
      type='text'
      id='title'
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      required
    />
    {getFieldError('title') && <p className='error'>{getFieldError('title')}</p>}
  </div>
  <div className='create-chatroom-div'> 
    <label className='create-chatroom-label' htmlFor='description'>Description</label>
    <textarea
      id='description'
      value={description}
      onChange={(event) => setDescription(event.target.value)}
    />
    {getFieldError('description') && <p className='error'>{getFieldError('description')}</p>}
    <button type='submit'>Submit</button>
  </div>
  
</form>

<img className='create-chatroom-logo' src={logo}></img>


</section>
  )
    
}

export default CreateChatroomForm