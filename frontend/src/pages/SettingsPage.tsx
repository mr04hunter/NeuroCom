import React, { useEffect } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import profilePhoto from '../assets/icons/profile.jpeg'
import '../styles/settings-page.css'
import { useApi, useAuth, useError } from '../types/hooks';
import { ChangePasswordData, User, UserSettings } from '../types/auth';

const SettingsPage = () => {
    const [activeButton,setActiveButton] = useState()
    const [old_password, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [blockedUsers, setBlockedUsers] = useState<User[]>([])
    const navigate = useNavigate();
    const {user,userSettings,loadingAuth,updateUserSettings,changePassword,deleteAccount} = useAuth()
    const [settings,setSettings] = useState<UserSettings>({
        message_notifications: false,
        request_notifications:false,
        darkmode:false,

    })
    const {executeWithErrorHandling, getFieldError, error} = useError()
    const {getBlockedUsers, unblockUser} = useApi(executeWithErrorHandling)

    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            console.log('WORRRRKEDA 444');
            navigate("/unauthorized")
        }

    },[loadingAuth,user])

    const validatePasswordChange = () => {
        let value;
        if (newPassword === confirmNewPassword) {
            value = true
        }else{
            toast.error('New Passwords Must Match')
            value = false
        }
        return value
    }



    const handleGetBlockedUsers = async () => {

            const result = await getBlockedUsers()
            result?.success === false && toast.error(error?.message)
            setBlockedUsers(result?.blocked_users ?? [])
            
      

        
        
    }

    useEffect(() => {

        handleGetBlockedUsers()
    },[])



    const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const confirm = window.confirm('Are you sure you want to delete your account?')
        if (confirm) {
            await deleteAccount()
            localStorage.removeItem('auth_token')
            navigate('/')

            toast.success('Account Deleted Successfully')
        }

    }

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (validatePasswordChange()) {
            const passChangeData: ChangePasswordData = {
                old_password:old_password,
                new_password: newPassword,
                confirm_new_password: confirmNewPassword
            }
            const result = await changePassword(passChangeData)
            if(!result?.success){
                console.log(result);
                toast.error(error?.message)
                return
                
            }
            navigate('/')
            
            toast.success(result.message)


        }
    }

    const handleUnblock = async (e: React.MouseEvent<HTMLButtonElement>,id: number) => {
        e.preventDefault()
        const conf = confirm('Are you sure?')
        if (conf){
            const result = await unblockUser(id)
            result?.success ? toast.success(result?.message) : toast.error(error?.message)
            
            setBlockedUsers((prevUsers) => prevUsers.filter(user => user.id !== id))
   
        }
        
    }


    useEffect(() => {
        if (loadingAuth) {
            return;
        }
        if(userSettings){
            setSettings(userSettings)
        }
        
    
    },[loadingAuth,userSettings])
    const [selectedSetting, setSelectedSetting] = useState('account');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [id]: checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await updateUserSettings(settings)
        if(!result?.success){
            toast.error(error?.message)
            return
        }
        navigate('/settings')
        toast.success('Settings Saved Successfully')
    }
    const renderContent = () => {


        switch (selectedSetting){
            case 'account':
                return(
                    <>      <h2 className='setting-header'>ACCOUNT SETTINGS</h2>
                            <div className='delete-account-header'>DELETE ACCOUNT</div>
                            <p className="delete-account-text">Once you delete your account, there is no going back. Please be certain.</p>
                            <form onSubmit={handleDeleteAccount}>
                                <button type="submit" >Delete Account</button>
                            </form>
                            <hr></hr>
                
                    </>
                )
            case 'security':
                return (
                    <>
                        <h2 className='setting-header'>SECURITY SETTINGS</h2>
                        <hr></hr>
                        <div className='change-password-header'>CHANGE PASSWORD:</div>
                        <form className='change-password-form' onSubmit={handlePasswordChange}>
                            <div className='change-password-container'>
                            <div className='change-password-input-container'>
                                <div className='change-password-label'>Current Password:</div>
                                <input className='change-password-input'
                                type='password'
                                onChange={(event) => setOldPassword(event.target.value)}>
                                </input>
                                {getFieldError('old_password') && <p className='error'>{getFieldError('old_password')}</p>}
        
                            </div>
                            <div className='change-password-input-container'>
                                <div className='change-password-label'>New Password:</div>
                                <input className='change-password-input'
                                value={newPassword}
                                type='password'
                                onChange={(event) => setNewPassword(event.target.value)}>
                                </input>
                            {getFieldError('new_password') && <p className='error'>{getFieldError('new_password')}</p>}
                            </div>
                            <div className='change-password-input-container'>
                                <div className='change-password-label'>New Password Confirm:</div>
                                <input className='change-password-input'
                                type='password'
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}>
                                </input>
                            {getFieldError('confirm_new_password') && <p className='error'>{getFieldError('confirm_new_password')}</p>}
                            </div>


                            <button className='submit-change-password' type='submit'>Change Password</button>
                            </div>
                        </form>
                        <hr></hr>
            
                    
                    </>
                )
            case 'notifications':
                return (
                    <>
                        <h2 className='setting-header'>NOTIFICATION SETTINGS</h2>
                        <form onSubmit={handleSubmit} >
                        <div className="toggle-container">
                        <label className="switch">
                            <input 
                            type="checkbox" 
                            id="message_notifications"
                            checked={settings.message_notifications}
                            onChange={handleChange}>

                            </input>
                            <span className="slider round"></span>
                            <span className="label-text">Message Notifications</span>
                        </label>
                        <label className="switch">
                            <input
                             type="checkbox" 
                             id="request_notifications"
                             checked={settings.request_notifications}
                             onChange={handleChange}>

                             </input>
                            <span className="slider round"></span>
                            <span className="label-text">Request Notifications</span>
                        </label>
                        </div>

                        <button type='submit'>Save</button>
                        </form>
                    </>
                )
            case 'interface':
                return (
                    <>
                        <h2 className='setting-header'>INTERFACE</h2>
                        <form onSubmit={handleSubmit}>
                        <div className="toggle-container">
                        <label className="switch">
                            <input type="checkbox"
                            id="darkmode" 
                            checked={settings.darkmode}
                            onChange={handleChange}>
                            </input>
                            <span className="slider round"></span>
                            <span className="label-text">Dark Mode</span>
                        </label>
                        </div>

                        <button type='submit'>Save</button>
                        </form>
                    
                    
                    
                    </>
                )

                case 'blocked_users':
                return (
                    <>
                    <div className='blocked-users-div'>
                    <div className='blocked-users-list-div'>
                    <h2 className='setting-header'>BLOCKED USERS</h2>
                    <hr></hr>
                    {blockedUsers.map((user,index) => (
                        <div key={index} className='friend-div'>
                        <>
                        

                        <div className='friend-div-item'><img className='profilePhoto' src={profilePhoto} alt="" width={40} height={40} /></div>
                        <div className='friend-div-text-item'><p className='friend-name'>{user.username}</p></div>
                        <div className='friend-div-item'><button onClick={(e) => handleUnblock(e,user.id)} className='send-friend-request-button'>Unblock</button></div>
                        <div className='friend-div-text-item'><p className='friend-name'>Since: 2024-09-09</p></div>
                        
                        
                        </>
                        </div>
                    ))}
                    </div>
                    </div>
                        
                        
                    
                    
                    </>
                )
        }
    }
  return (

    <section className='settings-section'>
        <div className='settings-nav'>
            <h2 className='settings-header'>SETTINGS</h2>
            <nav>
                <ul>
                    <li><a className={selectedSetting==='account' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('account')} href="#">Account</a></li>
                    <li><a className={selectedSetting==='security' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('security')} href="#">Security</a></li>
                    <li><a className={selectedSetting==='notifications' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('notifications')} href="#">Notifications</a></li>
                    <li><a className={selectedSetting==='interface' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('interface')} href="#">Interface</a></li>
                    <li><a className={selectedSetting==='blocked_users' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('blocked_users')} href="#">Blocked Users</a></li>
                </ul>


            </nav>

        </div>

        <div className='settings-content'>
            {renderContent()}


        </div>



    </section>

  )
}

export default SettingsPage