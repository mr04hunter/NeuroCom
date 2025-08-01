import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser,faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import '../styles/chatrooms-dropdown-menu.css'
import { useAuth } from '../types/hooks'

const ChatroomsDropDownMenu = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const {user,loadingAuth} = useAuth()
    const navigate = useNavigate();

    
    //Wait until auth completes
    useEffect(() => {
      if (loadingAuth) {
          return
      }
      if (!user) {
          navigate("/unauthorized")
      }

  },[loadingAuth,user])


    //Dropdown function
    const toggleDropDown = () => {
        setIsOpen(!isOpen)
    }
    const {logout} = useAuth()
    

    //Detect clicks outside of the dropdown button and close the dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }

      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } 
  
      // Cleanup function to remove event listener when component unmounts
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };

    },[isOpen])

  return (
    <div data-testid='test-chatrooms-dropdown' className="chatrooms-dropdown-menu"  ref={dropdownRef} >
      <button  data-testid='dropdown-toggle' onClick={toggleDropDown} className="chatrooms-dropdown-button">
        Chatrooms
        
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className='dropdown-icon' />
      </button>
      {isOpen && (
        <div data-testid='dropdown-menu' className="chatrooms-dropdown-content">
          <NavLink to="/create_chatroom">Create</NavLink>
          <NavLink to="/chatrooms">Browse</NavLink>
          <NavLink to="/joined_chatrooms">Joined Chatrooms</NavLink>
          <NavLink to="/my_chatrooms">My Chatrooms</NavLink>
        </div>
      )}
    </div>
  )
}

export default ChatroomsDropDownMenu