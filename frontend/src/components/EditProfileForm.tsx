import React from 'react'
import { useEffect,useState,useContext } from 'react'
import logo from '../assets/images/neuro_com.png'
import { useNavigate } from 'react-router-dom'
import profilePhoto from '../assets/icons/profile.jpeg'
import { useRef } from 'react'
import axios from 'axios'
import { useApi, useAuth, useError } from '../types/hooks'
import { toast } from 'react-toastify'
import { FormErrors } from '../types/errors'
import { UpdateProfileData } from '../types/api'

//Edit profile

const EditProfileForm = () => {
    const [first_name, setName] = useState("");
    const [last_name, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const navigate = useNavigate();
    const [formErrors, setErrors] = useState<FormErrors>({})
    const {user,loadingAuth,updateProfile} = useAuth()
    const {getAllFieldErrors, executeWithErrorHandling} = useError()
    const {uploadProfilePhoto} =  useApi(executeWithErrorHandling)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string| null>(null)


  //Validations
    const validateForm = () => {
      
        let isValid = true;
    
        if (!first_name) {
            formErrors.name = 'Name is required'
            isValid = false;
        }
        if (!last_name) {
            formErrors.surname= 'Name is required'
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
        setErrors(formErrors);
        return isValid;
    
      }

    //waiting until auth completes
    useEffect(() => {
        if (loadingAuth){
            return
        }
        if (!user){
          navigate('/unauthorized')
        }
        else{
          //set the user data
          setName(user.first_name)
          setLastName(user.last_name)
          setUsername(user.username)
          setEmail(user.email)
          setBio(user.bio? user.bio : '')
        }
        
    },[loadingAuth])

    //Profile photo select
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFile(file);
        setPreview(URL.createObjectURL(file));  // Preview the image
      }
  };

  //trigger the file upload button when the custom button clicked
  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    fileInputRef.current?.click();  // Trigger the hidden file input
};

    

    //submit the edited data
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Submitted:', first_name,last_name,email,bio);
            const updateData: UpdateProfileData = {
              first_name:first_name,
              last_name: last_name,
              username: username,
              email: email,
              bio: bio
              
            }
            
            const result = await updateProfile(updateData);
            if(!result?.success){
              setErrors(getAllFieldErrors())
              return
            }
            toast.success('Profile Updated Successfully')

            navigate('/profile')

        }
        else{
            toast.error("please fill all required fields")
        }
}

  //upload the profile photo
  const handleUpload = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if(!file){
      toast.error("No file selected!")
      return
    }

    const result = await uploadProfilePhoto(file)
    
    result?.success ? toast.success("Profile Photo Updated Successfully") : toast.error('Unexpected Error')
    navigate("/profile")
    
  }
  return (
    <section className='edit-section'>
    <form onSubmit={handleSubmit} className='edit-form'>
    <h2 className='edit-header'>Edit Profile</h2>
    <div className='edit-div-profile-photo'> 
    {preview ? (
      <>
      <img className='profile-photo' src={preview} width={50} height={50}></img>
      <button onClick={(e) => handleUpload(e)}>Save</button>
      </>
     
    ) : (
      <img className='profile-photo' src={profilePhoto} width={50} height={50}></img>
    )}
    
    <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }}  // Hide the default file input
                    onChange={handleFileChange} 
                />
    <button onClick={(e) => handleFileButtonClick(e)}>Change Profile Photo</button>
    {formErrors.name && <p className='error'>{formErrors.name}</p>}
  </div>
    <div data-testid='test-name' className='edit-div'> 
    <label className='edit-label' htmlFor='name'>Name:</label>
    <input
      data-testid='test-name-input'
      type='text'
      id='name'
      value={first_name}
      onChange={(event) => setName(event.target.value)}
      required
    />
    {formErrors.name && <p className='error'>{formErrors.name}</p>}
  </div>
  <div data-testid='test-surname' className='edit-div'> 
    <label className='edit-label' htmlFor='surname'>Surname:</label>
    <input
      data-testid='test-surname-input'
      type='text'
      id='surname'
      value={last_name}
      onChange={(event) => setLastName(event.target.value)}
      required
    />
    {formErrors.surname && <p className='error'>{formErrors.surname}</p>}
  </div>
  <div data-testid='test-username' className='edit-div'> 
    <label className='edit-label' htmlFor='username'>Username:</label>
    <input
    data-testid='test-username-input'
      type='text'
      id='username'
      value={username}
      onChange={(event) => setUsername(event.target.value)}
      required
    />
    {formErrors.username && <p className='error'>{formErrors.username}</p>}
  </div>
  <div data-testid='test-email' className='edit-div'> 
    <label className='edit-label' htmlFor='username'>Email:</label>
    <input
    data-testid='test-email-input'
      type='text'
      id='email'
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      required
    />
    {formErrors.email && <p className='error'>{formErrors.email}</p>}
  </div>
  <div data-testid='test-bio' className='edit-div'> 
    <label className='edit-label' htmlFor='username'>Bio</label>
    <textarea
    data-testid='test-bio-input'
      id='bio'
      value={bio}
      onChange={(event) => setBio(event.target.value)}
    />
    {formErrors.email && <p className='error'>{formErrors.bio}</p>}
    <button type='submit'>Submit</button>
  </div>
  
</form>

<img className='edit-logo-image' src={logo}></img>


</section>
  )
}

export default EditProfileForm