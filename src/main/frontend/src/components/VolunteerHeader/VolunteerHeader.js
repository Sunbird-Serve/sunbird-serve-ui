import React, { useState } from 'react'
import SBLogo from '../../assets/sunbirdlogo.png';
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import {auth} from '../../firebase.js'
import './VolunteerHeader.css'
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';

function VHeader({ activeComponent, onToggle }) {
    const [open,setOpen] = useState(false);
    const [avatarColor, setAvatarColor] = useState(randomColor())
    const currentUser = auth.currentUser;

  return (
    <div className="wrapVHeader">
        <div className="vhLogo">
            <img src={SBLogo} alt="SunBirdLogo" height="50px" />
        </div>
        <div className="vhProfile">
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
        </div>
    </div>
  )
}

export default VHeader