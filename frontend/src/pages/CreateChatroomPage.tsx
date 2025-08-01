import React from 'react'
import CreateChatroomForm from '../components/CreateChatroomForm'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/create-chatroom-page.css'
import { useAuth } from '../types/hooks'

const CreateChatroomPage = () => {
  const {user,userSettings,loadingAuth,changePassword,deleteAccount,error} = useAuth()

  const navigate = useNavigate()


  useEffect(() => {
    if (loadingAuth) {
        return
    }
    if (!user) {
        navigate("/unauthorized")
    }

},[loadingAuth,user])

  return (
    <CreateChatroomForm></CreateChatroomForm>
  )
}

export default CreateChatroomPage