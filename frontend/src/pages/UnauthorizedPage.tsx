import React from 'react'
import logo from '../assets/images/neuro_com.png'
const UnauthorizedPage = () => {
  return (
    <section className='unauthorized-section'>
        <div className='unauthorized-div'>
            <h1 className='unauthorized-header'>
                401 UNAUTHORIZED
            </h1>
        </div>
        <img src={logo}></img>
    </section>
  )
}

export default UnauthorizedPage
