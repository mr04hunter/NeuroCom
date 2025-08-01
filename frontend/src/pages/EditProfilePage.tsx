import EditProfileForm from '../components/EditProfileForm'
import { useNavigate } from 'react-router-dom'
import '../styles/edit-profile.css'
import { useAuth } from '../types/hooks'
const EditProfilePage = () => {
  const navigate = useNavigate()
  const {user,userSettings,loadingAuth,changePassword,deleteAccount,error} = useAuth()

   
  return (
    <EditProfileForm></EditProfileForm>
  )
}

export default EditProfilePage