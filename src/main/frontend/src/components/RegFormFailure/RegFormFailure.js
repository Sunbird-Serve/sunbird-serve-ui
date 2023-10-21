import React from 'react'
import './RegFormFailure.css'
import formFailureImg from './Illustration_Error.jpg'

function RegFormFailure() {
  return (
    <div className='errorPage'>
      <div className='errorImg'>
        <img className='errorLogo' src={formFailureImg} alt="errorLogo" width="40%" />
        <div className='errorComment1'>
            Registration Failed
        </div>
        <div className='errorComment2'>
            Oops! Network Error
        </div>
      </div>
      {/* <div className='errorMsg'>
        <div className='msgBody'>
          <p className='msg'>
            No Internet Connection. Please try again
          </p>
        </div>
        <button className='retryButton'>
            View more details
        </button>
        <button className='homeButton'>
            Back to home
        </button>
      </div> */}
    </div>
  )
}

export default RegFormFailure
