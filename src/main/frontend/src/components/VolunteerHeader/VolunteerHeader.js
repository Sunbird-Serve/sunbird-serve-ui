import React, { useEffect, useState } from 'react'
import SBLogo from '../../assets/sunbirdlogo.png';
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import {auth} from '../../firebase.js'
import './VolunteerHeader.css'
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VolunterLogin from '../VolunteerLogin/VolunteerLogin'
import VolunterSignup from '../VolunteerSignup/VolunteerSignup'
import { useHistory, useLocation } from "react-router";


function VHeader({ activeComponent, onToggle }) {
  const history = useHistory();
  const location = useLocation();

    const [open,setOpen] = useState(false);
    const [avatarColor, setAvatarColor] = useState(randomColor())
    const currentUser = auth.currentUser;

    const [vlogin, setVlogin ] = useState(false)
    const [vsignup, setVsignup ] = useState(false)

    const loginVolunteer = () => {
      setVlogin(!vlogin)
    };

    const signupVolunteer = () => {
      setVsignup(!vsignup)
    };
    
    const handleProfileClick = () => {
      history.push("/vprofile")
    }

    const handleLogoClick = () => {
      history.push("/vneedtypes");
    };

    useEffect(() => {
      if (location.pathname === "/vregistration") {
        setVsignup(false);
      }
    }, [location.pathname]);

  return (
    <div className="wrapVHeader">
        <div className="vhLogo">
            <button className="logobutton" onClick={handleLogoClick}>
              <img src={SBLogo} alt="SunBirdLogo" height="50px" />
            </button>
        </div>
        {!currentUser && <div>
          <button className="btnSignupVolunteer" onClick={signupVolunteer}>Signup</button>
          <button className="btnLoginVolunteer" onClick={loginVolunteer}>Login</button>
        </div>}
        {currentUser && <div className="vhProfile">
          <div className="notification">
            <Badge variant="dot" color="secondary">
              <NotificationsIcon color="action" style={{height:'24px'}} />
            </Badge>
          </div>
          <button className="btnProf" onClick={handleProfileClick}>
            <div className="profIcon"> 
              <Avatar style={{height:'40px',width:'40px',fontSize:'16px',backgroundColor:avatarColor}}>
              </Avatar>
            </div>
          </button>
        </div>}
        {vlogin && <VolunterLogin onClose={loginVolunteer}/> }
        {vsignup && <VolunterSignup onClose={signupVolunteer}/> }
    </div>
  )
}

export default VHeader