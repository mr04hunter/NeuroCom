import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser,faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import '../styles/profile-dropdown-menu.css'
import { useAuth, useError } from '../types/hooks'
import { toast } from 'react-toastify'


//User dropdown menu

const DropDownMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const {user,userSettings,loadingAuth,updateUserSettings,changePassword,deleteAccount} = useAuth()
    const {error} = useError()
    const toggleDropDown = () => {
        setIsOpen(!isOpen)
    }
    const {logout} = useAuth()
    const navigate = useNavigate();

    //wait until auth completes
    useEffect(() => {
      if (loadingAuth) {
          return
      }
      if (!user) {
          navigate("/")
      }

  },[loadingAuth,user])

    //logout submit function
    const logoutSubmit = async () => {
        const result = await logout()
        result?.success ? toast.success('logged out successfully') : toast.error(error?.message)
        setIsOpen(false)
        navigate('/')
    }

    //close the dropdown menu when click detected outside of the menu
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
    <div data-testid='test-profile-dropdown' className="profile-dropdown-menu" ref={dropdownRef}>
      <button data-testid='profile-dropdown-toggle' onClick={toggleDropDown} className="profile-dropdown-button">
        <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className='dropdown-icon' />
      </button>
      {isOpen && (
        <div data-testid='profile-dropdown-menu' className="dropdown-content">
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <button onClick={logoutSubmit}>Log out</button>
        </div>
      )}
    </div>
  )
}

export default DropDownMenu