import React from "react";
import { NavLink } from "react-router-dom"
import { useEffect, useState } from "react";
import DropDownMenu from "./DropDownMenu";
import { faHome } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ChatroomsDropDownMenu from "./ChatroomsDropDownMenu";
import SocialDropDownMenu from './SocialDropDownMenu'
import NotificationsDropDownMenu from "./NotificationsDropDownMenu";
import '../styles/nav-bar.css'
import { useAuth } from "../types/hooks";

const NavBar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const {user, loadingAuth} = useAuth()

    useEffect(() => {
        if (loadingAuth){
            return
        }
        else{
            //set the user data after auth
            if (user) {
                setIsLoggedIn(true)
                console.log('user set as ', user);
                
            }
            else{
                setIsLoggedIn(false)
            }
        }
        
    },[user,loadingAuth])
  return (
    <>
       <nav className="navbar">
        <div className="navbar-container">
            <div className="navbar-home-chatrooms-social-menu">
            <ul className="navbar-menu">
            
            <li className="navbar-item">
            <div className="home-div">
                
                <NavLink data-testid='test-home-link' to="/">
                {<FontAwesomeIcon icon={faHome} className="navbar-icon"></FontAwesomeIcon>}
            
                Home</NavLink></div></li>
            {isLoggedIn ? (
                <>
                <li><ChatroomsDropDownMenu></ChatroomsDropDownMenu></li>
                <li><SocialDropDownMenu></SocialDropDownMenu></li>
                </>
            ) : (
                <>

                </>
            )}
           


            </ul>
            </div>
            <div className="navbar-profile-notifications-container">
            <ul className="navbar-menu">

                {isLoggedIn ? (
                    
                    <>
                        <NotificationsDropDownMenu ></NotificationsDropDownMenu>
                        <DropDownMenu ></DropDownMenu>
                       
                    </>
                    ) : (
                    <>
                    <li data-testid='test-register-button' className="navbar-item"><NavLink to="/register">Register</NavLink></li>
                    <li data-testid='test-login-button' className="navbar-item"><NavLink to="/login">Log In</NavLink></li>
                    </>
                )}
                

            </ul>
            </div>

        </div>
        
       </nav>
    
    </>
  )
}

export default NavBar