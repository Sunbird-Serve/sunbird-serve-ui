import './Header.css'
import {auth} from '../../firebase.js'
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from "react";

function Header() {
  const [open,setOpen] = useState(false);

  return (
    <div className="header">
      <div className="wrapHead">

        <div className="leftHead">
          <div className="headname">  </div> 
        </div>

        <div className="rightHead">
          <div className="notification">
            <Badge variant="dot" color="secondary">
              <NotificationsIcon color="action" />
            </Badge>
          </div>

          <button className='btnProf' onClick={() => setOpen(!open)}>
            <div className="profile">
              <div className="profIcon"> <Avatar>M</Avatar></div>
              <div className="user">
                <div className='userName'> Meg Griffin</div>
                <div className='userTag'> UX Designer</div>
              </div>
              <div><i> <ExpandMoreIcon /></i></div>
            </div>
            {open && 
            (<div className="dropDownProfile">
              <ul>
                <li>Profile</li>
                <li>
                  <button className="btnLogout" onClick={() => auth.signOut()}>Logout</button>
                </li>
              </ul>
            </div>)
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header

/* <div className="logout"></div> */