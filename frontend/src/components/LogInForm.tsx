import React from 'react';
import { useState } from 'react';
import logo from '../assets/images/neuro_com.png'
import { useNavigate } from 'react-router-dom';
import { useAuth, useError } from '../types/hooks';
import { toast } from 'react-toastify';
import { LoginCredentials } from '../types/auth';
const LogInForm = () => {
  //fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const {getAllFieldErrors, getFieldError,error} = useError()
  const {handleLogin} = useAuth()

  //submit login
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('submitted:', username, password);
  
            const loginData: LoginCredentials = {
              username: username,
              password: password
            }
            const response = await handleLogin(loginData)
            if(!response?.success){
              console.log('ERESS', getAllFieldErrors());
              toast.error(error?.message)
              return
            }
            console.log('RESPONSE LOGIN', response);
            
            response.success ? toast.success(response.message) : toast.error(response.message)
            navigate("/")
        

  };

  return (
    <section className='login-section'>
        <form onSubmit={(e) => handleSubmit(e)} className='login-form'>
        <h2 className='login-header'>Log In</h2>
      <div className='login-div'> 
        <label className='login-label' htmlFor='username'>Username:</label>
        <input
          data-testid='username-input'
          type='text'
          id='username'
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        {getFieldError('username') && <p className='error'>{getFieldError('username')}</p>}
      </div>
      <div className='login-div'>
        <label className='login-label' htmlFor='password'>Password:</label>
        <input
          data-testid='password-input'
          type='password'
          id='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {getFieldError('password') && <p className='error'>{getFieldError('password')}</p>}
      </div>
      <button type='submit'>Log In</button>
    </form>

    <img className='login-logo-image' src={logo}></img>


    </section>
    
  );
};

export default LogInForm;