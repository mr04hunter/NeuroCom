import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import profileP from '../assets/icons/profile.jpeg'
import '../styles/profile-page.css'
import { useApi, useAuth, useError } from '../types/hooks'
import { Profile } from '../types/auth'
import { toast } from 'react-toastify'
const UserProfilePage = () => {

    const {username} = useParams()
    const [userProfile, setUserProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const {executeWithErrorHandling, error} = useError()
    const {getUserProfile} = useApi(executeWithErrorHandling)

    const getUserDetails = async (username:string) => {
      
        const result = await getUserProfile(username)
        result?.success === false && toast.error(error?.message)
        setUserProfile(result?.profile ?? null)    
    
        setLoading(false)
    
        
    }

    useEffect(() => {
        if(username){
            getUserDetails(username)
        }
        

    },[])

  return (
    <section className='profile-section'>
    {loading ? (
        <ClipLoader></ClipLoader>
    ) : (
        <div className='profile-div'>
        {userProfile?.profile_picture ? (
            <img className='profile-image' src={userProfile.profile_picture.url} alt="" width='160' height='170' />
        ) : (
            <img className='profile-image' src={profileP} alt="" width='160' height='170' />
        )}
        
        <div className='username-label'>{userProfile?.username}</div>
        <hr></hr>
        <div id='bio-row' className='row'>Bio
            <p className='bio-text'>{userProfile?.bio}</p>
            <hr />
        </div>
        <div id='profile-info-div' className='row'><h2 className='profile-header'>PROFILE INFO</h2>
            <div className='info-container'>
                <div className='info-div'>
                    <div className='info-label'>First Name:</div>
                    <div className='info'>{userProfile?.first_name}</div>
                </div>
            </div>
            <div className='info-container'>
                <div className='info-div'>
                    <div className='info-label'>Last Name:</div>
                    <div className='info'>{userProfile?.last_name}</div>
                </div>
            </div>
            <div className='info-container'>
                <div className='info-div'>
                    <div className='info-label'>Username:</div>
                    <div className='info'>{userProfile?.username}</div>
                </div>
            </div>
            <div className='info-container'>
                <div className='info-div'>
                    <div className='info-label'>Email:</div>
                    <div className='info'>{userProfile?.email}</div>
                </div>
            </div>
        </div>
    </div>

    )}
    


</section>
  )
}

export default UserProfilePage
