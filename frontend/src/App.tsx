import React from 'react'
import './App.css'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import './styles/main.css'
import LogInPage from './pages/LogInPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import SettingsPage from './pages/SettingsPage'
import { AuthProvider } from './contexts/AuthContext'
import ChatroomsPage from './pages/ChatroomsPage'
import CreateChatroomPage from './pages/CreateChatroomPage'
import MyChatroomsPage from './pages/MyChatroomsPage'
import ChatroomSettingsPage from './pages/ChatroomSettingsPage'
import SearchUsersPage from './pages/SearchUsersPage'
import FriendsPage from './pages/FriendsPage'
import DmPage from './pages/DmPage'
import NotificatonsPage from './pages/NotificatonsPage'
import UserProfilePage from './pages/UserProfilePage'
import ChatroomPage from './pages/ChatroomPage'
import ChatroomSendInvitatios from './pages/ChatroomSendInvitatios'
import JoinedChatrooms from './pages/JoinedChatrooms'
import { ChatProvider } from './contexts/ChatContext'
import NotFoundPage from './pages/NotFoundPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import { ErrorHandlerProvider } from './contexts/ErrorContext'
function App() {

  const router = createBrowserRouter(createRoutesFromElements(<Route path='/' element={<MainLayout />}>

      <Route index element={<HomePage></HomePage>}></Route>
      <Route path='/login' element={<LogInPage></LogInPage>}></Route>
      <Route path='/register' element={<RegisterPage></RegisterPage>}></Route>
      <Route path='/profile' element={<ProfilePage></ProfilePage>}></Route>
      <Route path='/edit_profile' element={<EditProfilePage></EditProfilePage>}></Route>
      <Route path='/settings' element={<SettingsPage></SettingsPage>}></Route>
      <Route path='/chatrooms' element={<ChatroomsPage></ChatroomsPage>}></Route>
      <Route path='/joined_chatrooms' element={<JoinedChatrooms></JoinedChatrooms>}></Route>
      <Route path='/create_chatroom' element={<CreateChatroomPage></CreateChatroomPage>}></Route>
      <Route path='/my_chatrooms' element={<MyChatroomsPage></MyChatroomsPage>}></Route>
      <Route path='/unauthorized' element={<UnauthorizedPage></UnauthorizedPage>}></Route>
      <Route path='*' element={<NotFoundPage></NotFoundPage>}></Route>
      <Route path='chatroom_settings/:id' element={<ChatroomSettingsPage></ChatroomSettingsPage>}></Route>
      <Route path='chatroom_send_invitations/:id' element={<ChatroomSendInvitatios></ChatroomSendInvitatios>}></Route>
      <Route path='chatrooms/:chatroom_id/:chatroom_title' element={<ChatProvider mode='chatroom'><ChatroomPage></ChatroomPage></ChatProvider>}></Route>
      <Route path='user_profile/:username' element={<UserProfilePage></UserProfilePage>}></Route>
      <Route path='/search_users' element={<SearchUsersPage></SearchUsersPage>}></Route>
      <Route path='/direct_messages' element={<ChatProvider mode='dm'><DmPage></DmPage></ChatProvider>}></Route>
      <Route path='/friends' element={<FriendsPage></FriendsPage>}></Route>
      <Route path='/notifications' element={<NotificatonsPage></NotificatonsPage>}></Route>






    </Route>))
 return (
  <ErrorHandlerProvider>
    <AuthProvider>
  
      <RouterProvider router={router} />


  </AuthProvider>
  </ErrorHandlerProvider>
  
);

}

export default App
