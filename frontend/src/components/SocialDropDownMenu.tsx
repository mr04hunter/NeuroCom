import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
const SocialDropDownMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const toggleDropDown = () => {
        setIsOpen(!isOpen)
    }


    useEffect(() => {
      //close the dropdown when a click outside detected
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
    <div data-testid='test-social-dropdown' className="chatrooms-dropdown-menu" ref={dropdownRef}>
      <button data-testid='test-social-dropdown-button' onClick={toggleDropDown} className="chatrooms-dropdown-button">
        Social
        
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className='dropdown-icon' />
      </button>
      {isOpen && (
        <div data-testid='test-social-dropdown-content' className="chatrooms-dropdown-content">
          <NavLink to="/direct_messages">DM</NavLink>
          <NavLink to="/friends">Friends</NavLink>
          <NavLink to="/search_users">Search User</NavLink>
        </div>
      )}
    </div>
  )
}

export default SocialDropDownMenu