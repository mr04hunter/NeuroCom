import React, { useEffect } from 'react';
import { useState } from 'react';
import logo from '../assets/images/neuro_com.png'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth, useError, useErrorHandler } from '../types/hooks';
import { FormErrors } from '../types/errors';
import { RegisterData, User } from '../types/auth';
import { RegisterResponse } from '../types/api';

const RegisterForm = () => {
  //fields
  const [firstName, setName] = useState('');
  const [lastName, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setErrors] = useState<FormErrors>({})
  const {handleRegister} = useAuth()
  const {error,isLoading, getFieldError, getAllFieldErrors} = useError()


 

  useEffect(() => {
    if(isLoading){
      return
    }
    if(error){
      console.log('ERRORRR',error);
      console.log('FIELD ERRORS', getFieldError('username'));
      
      
      toast.error(error.message)
    }
  },[isLoading,error])

  const navigate = useNavigate();

  //validation
  const validateForm = () => {
    let isValid = true;

    if (!firstName) {
        formErrors.name = 'Name is required'
        isValid = false;
    }
    if (!lastName) {
        formErrors.surname = 'Name is required'
        isValid = false;
    }

    if (!email) {
        formErrors.email = 'Email required';
        isValid = false;
    }
    else if (!/\S+@\S+\.\S+/.test(email)){
        formErrors.email = 'Email is invalid'
        isValid = false
    }
    if (!password) {
        formErrors.password = 'Password is required';
        isValid = false;
    }else if (password.length < 6){
        formErrors.password = 'Password must be at longer than 6 characters'
        isValid = false;
    }
    if (password != confirmPassword) {
        formErrors.confirmPassword = 'passwords do not match'
        isValid = false;
        
    }
    setErrors(formErrors);
    return isValid;

  }


  //submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm()) {
        console.log('submitted:', firstName, lastName, email, username, password, confirmPassword);

          const regData: RegisterData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            username: username,
            password: password
          }

          const result: RegisterResponse | null = await handleRegister(regData)
          if (!result?.success) {
            console.log('ALALEALA', result);
            setErrors(getAllFieldErrors())
            toast.error(result?.message)
            return
 
          }
          toast.success('Registered Successfully')

          navigate('/') 
      
          
          
       
       
          
          
      

        
    }
  };
  return (
    <section className='register-section'>
    <form onSubmit={handleSubmit} className='register-form'>
    <h2 className='register-header'>Register</h2>
    <div className='register-div'> 
    <label className='register-label' htmlFor='name'>Name:</label>
    <input
      data-testid='test-register-name'
      type='text'
      id='name'
      value={firstName}
      onChange={(event) => setName(event.target.value)} // Corrected
      required
    />
    {getFieldError('name') && <p className='error'>{getFieldError('name')}</p>}
    {formErrors.name && <p className='error'>{formErrors.name}</p>}
  </div>
  <div className='register-div'> 
    <label className='register-label' htmlFor='surname'>Surname:</label>
    <input
    data-testid='test-register-surname'
      type='text'
      id='surname'
      value={lastName}
      onChange={(event) => setSurname(event.target.value)} // Corrected
      required
    />
    {getFieldError('surname') && <p className='error'>{getFieldError('surname')}</p>}
    {formErrors.surname && <p className='error'>{formErrors.surname}</p>}
  </div>
  <div className='register-div'> 
    <label className='register-label' htmlFor='username'>Username:</label>
    <input
    data-testid='test-register-username'
      type='text'
      id='username'
      value={username}
      onChange={(event) => setUsername(event.target.value)} // Corrected
      required
    />
    {getFieldError('username') && <p className='error'>{getFieldError('username')}</p>}
    {formErrors.username && <p className='error'>{formErrors.username}</p>}
  </div>
  <div className='register-div'> 
    <label className='register-label' htmlFor='username'>Email:</label>
    <input
      data-testid='test-register-email'
      type='text'
      id='email'
      value={email}
      onChange={(event) => setEmail(event.target.value)} // Corrected
      required
    />
    {getFieldError('email') && <p className='error'>{getFieldError('email')}</p>}
    {formErrors.email && <p className='error'>{formErrors.email}</p>}
  </div>
  <div className='register-div'>
    <label className='register-label' htmlFor='password'>Password:</label>
    <input
      data-testid='test-register-password'
      type='password'
      id='password'
      value={password}
      onChange={(event) => setPassword(event.target.value)} // Corrected
      required
    />
    {getFieldError('password') && <p className='error'>{getFieldError('password')}</p>}
    {formErrors.password && <p className='error'>{formErrors.password}</p>}
  </div>
  <div className='register-div'>
    <label className='register-label' htmlFor='password'>Confirm Password:</label>
    <input
      data-testid='test-register-confirm-password'
      type='password'
      id='confirm-password'
      value={confirmPassword}
      onChange={(event) => setConfirmPassword(event.target.value)} // Corrected
      required
    />
    {getFieldError('confirm_password') && <p className='error'>{getFieldError('confirm_password')}</p>}
    {formErrors.confirmPassword && <p className='error'>{formErrors.confirmPassword}</p>}
  </div>
  <button type='submit'>Register</button>
</form>

<img className='register-logo-image' src={logo}></img>


</section>
  )
}

export default RegisterForm