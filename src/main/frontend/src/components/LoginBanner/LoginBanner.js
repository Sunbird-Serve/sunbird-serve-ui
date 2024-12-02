import React, { useState } from 'react';
import './LoginBanner.css';
import VolunterLogin from '../VolunteerLogin/VolunteerLogin';
import VolunterSignup from '../VolunteerSignup/VolunteerSignup';


const BannerLogin = ({volunteerStatus}) => {
    const handleVolunteerStatus = () => {
        volunteerStatus(true)
    }

  const [vlogin, setVlogin] = useState(false);
  const [vsignup, setVsignup] = useState(false);

  const loginVolunteer = () => setVlogin(!vlogin);
  const signupVolunteer = () => {
    volunteerStatus(true); // Set the volunteer status to true
    setVsignup(!vsignup); // Toggle the signup modal
};


    return(
        // Banner part in the login screen
      
        <div className='loginBanner row'>
  <div className='blurBanner'>
    <div className="bannerContent col-12 col-sm-10 offset-sm-1">
    <div className="volunteerAction">
        <div className="volunteerText">
          Do you want to volunteer?
        </div>
        <button onClick={handleVolunteerStatus} className="btnExplore">Explore Needs</button>       
<div className="authButtons">
          <button className="btnAction" onClick={signupVolunteer}>Volunteer Sign Up</button>
          <button className="btnAction" onClick={loginVolunteer}>Volunteer Login</button>
        </div>
      </div>
      <div className="headBanner">
        Join Us in Making a Difference!
      </div>
      <div className="textBanner">
        Sign up today to be a part of meaningful interactions that drive change. Your time, your effort, and your heart can help shape the future. Let's make a difference together!
      </div>
      
    </div>
  </div>
  {/* Render the modals */}
  {vlogin && <VolunterLogin onClose={loginVolunteer} />}
      {vsignup && <VolunterSignup onClose={signupVolunteer} />}
</div>

    )
}

export default BannerLogin