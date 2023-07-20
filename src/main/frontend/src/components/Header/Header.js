import './Header.css'
import {auth} from '../../firebase.js'
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from "react";

function Header() {
  const [open,setOpen] = useState(false);

  const currentUser = auth.currentUser;
  console.log(currentUser)
  return (
    <div className="wrapHead">
      <div className="header row">
        <div className="leftHead col-12 col-sm-8">
          <div className="headname">  </div> 
          <div className="notification">
            <Badge variant="dot" color="secondary">
              <NotificationsIcon color="action" />
            </Badge>
          </div>
        </div>
        <div className="rightHead col-12 col-sm-4">
          <button className="btnProf" onClick={() => setOpen(!open)}>
              <div className="profIcon"> <Avatar>M</Avatar></div>
              <div className="user">
                <div className='userName'>{currentUser.displayName}</div>
                <div className='userTag'>{currentUser.email}</div>
              </div>
              <div><i> <ExpandMoreIcon /></i></div>

          </button>
          {open && 
          (<div className="dropDownProfile col-11 col-sm-2">
          <li>Profile</li>
          <li>
            <button className="btnLogout" onClick={() => auth.signOut()}>Logout</button>  
          </li>
      </div>)
      }
        </div>
      </div>
    </div>
  )
}

export default Header

/* <div className="logout"></div> */