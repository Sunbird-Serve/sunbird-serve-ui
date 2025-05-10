import React, {useEffect} from 'react'
import './RegFormSuccess.css'
import formSuccessImg from './Illustration_Success.jpg'
import { useHistory } from "react-router-dom";

const RegFormSuccess = ({redirect="/vneedtypes"}) => {
  const navigate = useHistory();
  const gotoHome = () => {
    navigate.push(redirect)
    window.location.reload();
  }
  const delayTime = 3000;
  useEffect(() => {
    const timeoutId = setTimeout(gotoHome, delayTime);
    // Cleanup the timeout when the component unmounts
    return () => clearTimeout(timeoutId);
  }, [navigate])
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
        <button className='homeButton2' onClick={gotoHome}>
            Back to Home
        </button> 
      </div>
    </div>
  )
}

export default RegFormSuccess
