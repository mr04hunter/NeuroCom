import logo from '../assets/images/neuro_com.png'
import { useEffect, useState, useRef} from 'react';
import '../styles/home-page.css'
import { useAuth, useTypingAnimation } from '../types/hooks';
import { TypingText } from '../components/Typing';
const HomePage = () => {
    const typingElementRef = useRef(true)
    const [animationInitialized, setAnimationInitialized] = useState(false)
    const {user,userSettings,loadingAuth,updateUserSettings,changePassword,deleteAccount,error} = useAuth()
    let welcomeText = "Online Chatting App Developed By @mr_hunter01";

    useEffect(() => {
  if (loadingAuth) {
    console.log('loading');
    return;
  }
 
}, [loadingAuth]);
  return (

    <>
    <section className="home-section">

        <div className="text-center">

            <div className="cover-container d-flex h-100 p-3 mx-auto flex-column">
                <header className="masthead mb-auto">
                <div className="inner">
                    <nav className="nav nav-masthead justify-content-center">
            
                    </nav>
                </div>
            <div className="image">
                <img className='logo-image' src={logo} alt=""></img>
            </div>

                </header>

                <main id='inner-cover' role="main" className="inner-cover">

                <p >
                
                    <>
                        <TypingText 
                        text={user ? `Welcome ${user.username}` : welcomeText} 
                        speed={50} 
                        className="typing-animation" 
                        />
                    </>
               
                    
                
                    
                    </p>
                    <a href="#" className="btn btn-lg btn-secondary">Learn more</a>

                </main>

            </div>

        </div>

</section>
    
    </>
    
    

  )
}

export default HomePage