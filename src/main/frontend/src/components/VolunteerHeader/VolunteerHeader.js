import React, { useEffect, useState } from 'react'
import SBLogo from '../../assets/sunbirdlogo.png';
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import {auth} from '../../firebase.js'
import './VolunteerHeader.css'
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VolunterLogin from '../VolunteerLogin/VolunteerLogin'

function VHeader({ activeComponent, onToggle }) {
    const [open,setOpen] = useState(false);
    const [avatarColor, setAvatarColor] = useState(randomColor())
    const currentUser = auth.currentUser;

    const [vlogin, setVlogin ] = useState(false)
    const loginVolunteer = () => {
      setVlogin(!vlogin)
    };
    useEffect(()=> {
      setVlogin(false)
    },[currentUser]);

  return (
    <div className="wrapVHeader">
        <div className="vhLogo">
            <img src={SBLogo} alt="SunBirdLogo" height="50px" />
        </div>
        {!currentUser && 
          <button className="btnLoginVolunteer" onClick={loginVolunteer}>Login</button>
        }
        {currentUser && <div className="vhProfile">
          <div className="notification">
            <Badge variant="dot" color="secondary">
              <NotificationsIcon color="action" style={{height:'24px'}} />
            </Badge>
          </div>
          <button className="btnProf" onClick={onToggle}>
            <div className="profIcon"> 
              <Avatar style={{height:'40px',width:'40px',fontSize:'16px',backgroundColor:avatarColor}}>
              </Avatar>
            </div>
          </button>
        </div>}
        {vlogin && <VolunterLogin onClose={loginVolunteer}/> }
    </div>
  )
}

export default VHeader