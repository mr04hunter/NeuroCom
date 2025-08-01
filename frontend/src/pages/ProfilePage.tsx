import React, { useEffect, useState } from 'react'
import profileP from '../assets/icons/profile.jpeg'
import { useNavigate } from 'react-router-dom'
import '../styles/profile-page.css'
import { ClipLoader } from 'react-spinners'
import { useAuth } from '../types/hooks'
import { Profile } from '../types/auth'
const ProfilePage = () => {
    const navigate = useNavigate();

    const {user,userSettings,loadingAuth,changePassword,deleteAccount,error} = useAuth()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    
    useEffect(() => {
        if (loadingAuth){
            return
        }
        if (!user){
            navigate('/unauthorized')
        }
    },[loadingAuth])


    useEffect(() => {
        if (loadingAuth) {
            return;
        }
        console.log('USERR',user);
        if (user)
            setProfile(user)
            setLoadingProfile(false)
        
        
    },[loadingAuth])

    const handleEditProfile = () => {
        navigate('/edit_profile')
    }

  return (
    <section className='profile-section'>
    {loadingAuth ?(
        <ClipLoader></ClipLoader>
    ) :  (
        <>
        <div className='profile-div'>
        {profile?.profile_picture ? (
            <img className='profile-image' src={profile.profile_picture.url} alt="" width='160' height='170' />
        ) : (
            <img className='profile-image' src={profileP} alt="" width='160' height='170' />
        )}
            <div className='username-label'>{profile?.username}</div>
            <hr></hr>
            <div id='bio-row' className='row'>Bio
                <p className='bio-text'>{profile?.bio}</p>
                <hr />
            </div>
            <div id='profile-info-div' className='row'><h2 className='profile-header'>PROFILE INFO</h2>
                <div className='info-container'>
                    <div className='info-div'>
                        <div className='info-label'>First Name:</div>
                        <div className='info'>{profile?.first_name}</div>
                    </div>
                </div>
                <div className='info-container'>
                    <div className='info-div'>
                        <div className='info-label'>Last Name:</div>
                        <div className='info'>{profile?.last_name}</div>
                    </div>
                </div>
                <div className='info-container'>
                    <div className='info-div'>
                        <div className='info-label'>Username:</div>
                        <div className='info'>{profile?.username}</div>
                    </div>
                </div>
                <div className='info-container'>
                    <div className='info-div'>
                        <div className='info-label'>Email:</div>
                        <div className='info'>{profile?.email}</div>
                    </div>
                </div>
            </div>
            <button onClick={handleEditProfile} className='edit-profile-button'>EDIT PROFILE</button>
        </div>

        </>
    )}
       


    </section>
  )
}

export default ProfilePage