import React from 'react'
import './RegFormSuccess.css'
import formSuccessImg from './Illustration_Success.jpg'

const RegFormSuccess = () => {
  return (
    <div className='successPage'>
      <div className='successImg'>
        <img className='successLogo' src={formSuccessImg} alt="successLogo" width="60%" />
        <div className='successComment1'>
            Registration Successful
        </div>
        <div className='successComment2'>
            Sit Back and Relax
        </div>
      </div>
      <div className='successMsg'>
        <div className='msgBody'>
          <p className='msg'>
            Hurray! You've successfully registered. 
          </p>
        </div>
        {/* <button className='moreButton'>
            View more details
        </button>
        <button className='homeButton'>
            Back to home
        </button> */}
      </div>
    </div>
  )
}

export default RegFormSuccess
