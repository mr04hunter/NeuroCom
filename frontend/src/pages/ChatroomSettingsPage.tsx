import React from 'react'
import { useState,useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader'
import { formatDistanceToNow, set } from 'date-fns';
import '../styles/chatroom-settings-page.css'
import { useApi, useAuth, useError } from '../types/hooks';
import { ChatroomSettings } from '../types/chat';
import { Channel } from '../types/chat';
import { Member } from '../types/chat';
import { ChannelData } from '../types/api';

const ChatroomSettingsPage = () => {
    const [activeButton,setActiveButton] = useState()
    const {id} = useParams();
    const [loading,setLoading] = useState<boolean>(true)
    const [channelName, setChannelName] = useState<string>('') 
    const [channelIsPublic, setChannelPublic] = useState<boolean>(false)
    const [editChannel, setEditChannel] = useState<boolean>(false)
    const [members, setMembers] = useState<Member[] | []>([])
    const [membersNextPage, setMembersNextPage] = useState<string | null>(null)
    const [editChannelName, setEditChannelName] = useState<string>('')
    const [editChannelIsPublic, setEditChannelIsPublic] = useState<boolean>(false)
    const [editChannelId, setEditChannelId] = useState<number | null>(null)
    const navigate = useNavigate();
    const {user,userSettings,loadingAuth,updateUserSettings,changePassword,deleteAccount} = useAuth()
    const [settings,setSettings] = useState<ChatroomSettings>({})
    const {executeWithErrorHandling, getAllFieldErrors, error, getFieldError} = useError()
    const {getChatroomSettings, getChannels, getMembers, addChannel, updateChannel, deleteChannel, removeMember, updateChatroomSettings} = useApi(executeWithErrorHandling)

    useEffect(() => {
        if (loadingAuth) {
            return
        }
        if (!user) {
            navigate("/unauthorized")
        }

    },[loadingAuth,user])
    const [channels, setChannels] = useState<Channel[] | []>([])
    const [channelsNextPage, setChannelsNextPage] = useState<string | null>(null)


    useEffect(() => {
        const handleGetChatroomSettings = async (id: number) => {
            const result = await getChatroomSettings(id)
            result?.success === false && toast.error(error?.message) 
            setSettings(result?.chatroomSettings ?? {})
            setLoading(false)
        }
        handleGetChatroomSettings(Number(id));
        handleGetChannels(Number(id))
        handleGetMembers(Number(id))

    
    },[])
    const [selectedSetting, setSelectedSetting] = useState('details');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [id]: checked
        }));
    };

    const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target
        setChannelPublic(checked)
    }

    const handleEditPublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target
        setEditChannelIsPublic(checked)
    }

    const handleGetChannels = async (chatroom_id: number) => {
        const result = await getChannels(chatroom_id)
        result?.success ? toast.success('Your Channels') : toast.error(error?.message)
        setChannels(result?.channels ?? [])
        setChannelsNextPage(result?.next ?? null)
       
    }


    const handleGetMembers= async (chatroom_id: number) => {
            
            const result = await getMembers(chatroom_id)
            result?.success ? toast.success('Server Members') : toast.error(error?.message)
            setMembers(result?.members ?? [])
            setMembersNextPage(result?.next ?? null)

    }


    const handleChannelName = (e: React.ChangeEvent<HTMLInputElement>) =>  {
        setChannelName(e.target.value)
    }

    const handleEditChannelName = (e: React.ChangeEvent<HTMLInputElement>) =>  {
        setEditChannelName(e.target.value)
    }

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const {id,value} = e.target;
        setSettings((prevSettings) => ({
            ...prevSettings,
            [id]:value
        }))
    }

    const handleNumbersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setSettings((prevSettings) => ({
            ...prevSettings,
            [id]: value
        }))
    }

    const handleAddChannel = async (id: number) => {
        if (channelName.trim() === "") {
            toast.error('Please Enter The Channel Name')
        }else{
            const data: ChannelData = {
                name:channelName,
                is_public: channelIsPublic
            }

            const result = await addChannel(id, data)

            if(!result?.success){
                console.log('sadasdasdasd');
                return
                
            }
                
        
            setChannelName('')
            setChannelPublic(false)
            await handleGetChannels(id)
            toast.success('Channel Added Successfully')
            
        }
        
        
    }

    const renderTimeAgo = (dateString: Date) => {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    };



    const handleUpdateChannel = async () => {
        if (editChannelName.trim() === "") {
            toast.error('Please Enter The Channel Name')
        }else{
            
            const editChannelData: ChannelData = {
                name: editChannelName,
                is_public: editChannelIsPublic
            }

            const result = await updateChannel(editChannelId, editChannelData)

            result?.success ? toast.success('Channel Updated Successfully') : toast.error('Unexpected Error')
                
        
            setEditChannel(false)
            handleGetChannels(Number(id))
        
        }
        
        
    }

    const handleEditChannel = (e: React.MouseEvent<HTMLButtonElement>,channel_name: string,channel_is_public: boolean,channel_id: number) => {
        e.preventDefault()
        setEditChannelName(channel_name)
        setEditChannelIsPublic(channel_is_public)
        setEditChannelId(channel_id)
        setEditChannel(true)
    }

    const handleDeleteChannel = async (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
        const conf = confirm('Are you sure?')
        if (conf){
                const result = await deleteChannel(id)
                result?.success ? toast.success('Channel Deleted Successfully') : toast.error('Unexpected Error')
                setChannels((prevC) => prevC.filter(channel => channel.id !== id))
            }
            
        
        
    }


    const handleRemoveMember = async (e: React.MouseEvent<HTMLButtonElement>, member_id: number) => {
        const conf = confirm('Are you sure?')
        if (conf){
            
            const result = await removeMember(member_id, Number(id))
            
            setMembers((prevM) => prevM.filter(member => member.user.id !== member_id))
            toast.success('Member Removed Successfully')
            
            
        }
        
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await updateChatroomSettings(Number(id), settings)
        result?.success ? toast.success('Chatroom Settings Successfully Updaetd') : toast.error('Unexpected Error')
        navigate(`/chatroom_settings/${id}`)
        toast.success('Settings Saved Successfully')
    }
    const renderContent = () => {


        switch (selectedSetting){
            case 'details':
                return(
                    <>      <h2 className='setting-header'>CHATROOM SETTINGS</h2>
                            <div className='chatroom-details-header'>CHATROOM DETAILS</div>
                            <form onSubmit={(e) => handleSubmit(e)} className='settings-chatroom-form'>
                            <div className='settings-chatroom-div'> 
                                <label className='settings-chatroom-label' htmlFor='name'>Name:</label>
                                <input
                                type='text'
                                id='name'
                                value={settings.name}
                                onChange={handleFieldChange}
                                required
                                />
                            </div>
                            <div className='settings-chatroom-div'> 
                                <label className='settings-chatroom-label' htmlFor='surname'>Title</label>
                                <input
                                type='text'
                                id='title'
                                value={settings.title}
                                onChange={handleFieldChange}
                                required
                                />
                            </div>
                            <div className='settings-chatroom-div'> 
                                <label className='settings-chatroom-label' htmlFor='username'>Description</label>
                                <textarea
                                className='settings-chatroom-textarea'
                                id='description'
                                value={settings.description}
                                onChange={handleFieldChange}
                                />
                            </div>
                            <button className='chatroom-settings-edit-button' type='submit'>Save</button>
                            </form>
                            <hr></hr>
                
                    </>
                )
            case 'privacy':
                return (
                    <>
                        <h2 className='setting-header'>PRIVACY SETTINGS</h2>
                        <hr></hr>
                        <form onSubmit={(e) => handleSubmit(e)} >
                        <div className="chatroom-toggle-container">
                        <label className="chatroom-switch">
                            <input 
                            type="checkbox" 
                            id="is_public"
                            checked={settings.is_public}
                            onChange={handleChange}>

                            </input>
                            <span className="slider round"></span>
                            <span className="chatroom-label-text">Public</span>
                        </label>
                        <label className="chatroom-switch">
                            <input
                             type="checkbox"
                              id="allow_file_sharing"
                              checked={settings.allow_file_sharing}
                              onChange={handleChange}>

                              </input>
                            <span className="slider round"></span>
                            <span className="chatroom-label-text">Allow File Share</span>
                        </label>
        
                        </div>

                        <button type='submit'>Save</button>
                        </form>
                        <hr></hr>
            
                    
                    </>
                )
            case 'notifications':
                return (
                    <>
                        <h2 className='setting-header'>NOTIFICATION SETTINGS</h2>
                        <form onSubmit={(e) => handleSubmit(e)} >
                        <div className="chatroom-toggle-container">
                        <label className="chatroom-switch">
                            <input 
                            type="checkbox" 
                            id="mute_notifications"
                            checked={settings.mute_notifications}
                            onChange={handleChange}>

                            </input>
                            <span className="slider round"></span>
                            <span className="label-text">Mute Notifications</span>
                        </label>
                        </div>

                        <button type='submit'>Save</button>
                        </form>
                    </>
                )
            case 'users':
                return (
                    <>
                        <h2 className='setting-header'>User Settings</h2>
                        <form onSubmit={(e) => handleSubmit(e)}>
                        <div className="chatroom-user_settings_container">
                        <span className="label-text">Max Members</span>
                            <input type="number"
                            onChange={handleNumbersChange}
                            value={settings.max_members}
                            id="max_members" 
                            min="1" max="100" step="1">
                            </input>
            

                        </div>
                        <div className="chatroom-user_settings_container">
                        <span className="label-text">Message retention days</span>
                            <input type="number"
                            onChange={handleNumbersChange}
                            value={settings.message_retention_days}
                            id="message_retention_days" 
                            min="1" max="100" step="1">
                            </input>
            

                        </div>

                        <button type='submit'>Save</button>
                        </form>
                    
                    
                    
                    </>
                )
                case 'channels':
                return (
                    <>
                    <div className='channels-div-container'>

                    
                    <div className='channels-div'>
                    <div className='blocked-users-list-div'>
                    <h2 className='setting-header'>Channels</h2>
                    <hr></hr>
                    {editChannel ? (
                        <>
                        <div className='add-channel-input-container'>
                    <label className='add-channel-label-div'>Name</label>
                        <input onChange={(e) => handleEditChannelName(e)} value={editChannelName} className='add-channel-input'></input>
                        {getFieldError('name') && <p className='error'>{getFieldError('name')}</p>}
                    </div>
                    
                    <div className='add-channel-input-container'>
                    <div className='add-channel-label-div'><label className='add-channel-label'>Public?</label></div>
                        <div className='add-channel-checkbox-div'>
                        <input 
                            type="checkbox" 
                            id="is_public"
                            checked={editChannelIsPublic}
                            onChange={handleEditPublicChange}>

                            </input>
                        </div>
                       
                            
                    </div>
                    <button onClick={(e) => handleUpdateChannel()} className='add-channe-button'>Edit</button>
                    <button onClick={(e) => setEditChannel(false)} className='add-channe-button'>Cancel</button>
                        </>

                    ) : (
                        <>
                        <div className='add-channel-input-container'>
                    <label className='add-channel-label-div'>Name</label>
                        <input onChange={(e) => handleChannelName(e)} value={channelName} className='add-channel-input'></input>
                        {getFieldError('name') && <p className='error'>{getFieldError('name')}</p>}
                    </div>
                    
                    
                    <div className='add-channel-input-container'>
                    <div className='add-channel-label-div'><label className='add-channel-label'>Public?</label></div>
                        <div className='add-channel-checkbox-div'>
                        <input 
                            type="checkbox" 
                            id="is_public"
                            checked={channelIsPublic}
                            onChange={handlePublicChange}>

                            </input>

                        </div>
                       
                            
                    </div>
                    <button onClick={(e) => handleAddChannel(Number(id))} className='add-channe-button'>Add</button>
            
                        </>
                    )}
                    

                    
                    {/* {channels.map((channel,index) => (
                        <>
            
                        <div key={index} className='friend-div'>
                        <p className='friend-name'>{channel.name}</p>
                        {channel.name !== 'Main' ? (
                            <button onClick={(e) => handleDeleteChannel(e,channel.id)} className='send-friend-request-button'>Delete</button>
                        ) : (
                            <></>
                        )}
                       
                        <p className='friend-name'>Since: 2024-09-09</p>
                        </div>
                        </>
                    ))} */}
                    </div>

                

                    
                    </div>

                    <div className='channels-table-div'>
                    <table className="channels-table table table-dark">
                        <thead>
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Public</th>
                            <th scope="col">Edit</th>
                            <th scope="col">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                        {channels.map((channel, index) => (
                            
                            <tr key={index}>
                            <th scope="row">{index}</th>
                            <td>{channel.name}</td>
                            <td>{channel.is_public === true ? (
                                <>Yes</>
                            ):(
                                <>
                                    No
                                </>
                            )}</td>
                            <td><button className='channel-settings-button' onClick={(e) => handleEditChannel(e,channel.name,channel.is_public,channel.id)}>Edit</button></td>
                            <td><button className='channel-settings-button' onClick={(e) => handleDeleteChannel(e,channel.id)}>Delete</button></td>
                            </tr>
                            
                        ))}
                        
                            
                        </tbody>
                        </table>

                    </div>
                    </div>
                        
                        
                    
                    
                    </>
                )
                case 'members':
                return (
                    <>
                    <div className='channels-div-container'>

                    
                    <div className='members-div'>
                    <div className='blocked-users-list-div'>
                    <h2 className='setting-header'>Members</h2>
                    <hr></hr>
                    </div>

                

                    
                    </div>

                    <div className='channels-table-div'>
                    <table className="channels-table table table-dark">
                        <thead>
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Since</th>
                            <th scope="col">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                        {members.map((member, index) => (
                            
                            <tr key={index}>
                            <th scope="row">{index+1}</th>
                            <td>{member.user.username}</td>
                            <td>{renderTimeAgo(member.joined_at)}</td>
                            <td><button onClick={(e) => handleRemoveMember(e,member.user.id)}>Remove</button></td>
                            </tr>
                            
                        ))}
                        
                            
                        </tbody>
                        </table>

                    </div>
                    </div>
                        
                        
                    
                    
                    </>
                )
        }
    }
  return (

    <section className='settings-section'>
        {loading ? (
            <ClipLoader></ClipLoader>
        ) : (
            <>
                <div className='settings-nav'>
            <h2 className='settings-header'>SETTINGS</h2>
            <nav>
                <ul>
                    <li><a className={selectedSetting==='details' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('details')} href="#">Details</a></li>
                    <li><a className={selectedSetting==='privacy' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('privacy')} href="#">Privacy</a></li>
                    <li><a className={selectedSetting==='notifications' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('notifications')} href="#">Notifications</a></li>
                    <li><a className={selectedSetting==='users' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('users')} href="#">Users</a></li>
                    <li><a className={selectedSetting==='members' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('members')} href="#">Members</a></li>
                    <li><a className={selectedSetting==='channels' ? 'setting-button-active' : 'setting-button'} onClick={() => setSelectedSetting('channels')} href="#">Channels</a></li>
                </ul>


            </nav>

        </div>

        <div className='settings-content'>
            {renderContent()}


        </div>

            </>

        )}
        


    </section>

  )
}

export default ChatroomSettingsPage