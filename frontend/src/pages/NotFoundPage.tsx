import React from 'react'
import logo from '../assets/images/neuro_com.png'

const NotFoundPage = () => {
  return (
    <section className='not-found-section'>
        <div className='not-found-container'>
            <h1 className='not-found-header'>404 NOT FOUND</h1>
        </div>
        <img src={logo}></img>

    </section>
  )
}

export default NotFoundPage
