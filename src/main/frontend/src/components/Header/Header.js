import './Header.css'
import {auth} from '../../firebase.js'
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import SBLogo from '../../clogo.jpg';

function Header() {
  const [open,setOpen] = useState(false);

  const currentUser = auth.currentUser;
  
  return (
        <div className="head row">
          {/* Right side of header bar showing name of current screen*/}
          <div className="rightHead col-12 col-sm-4 order-sm-2 justify-content-between justify-content-sm-end" >
            <div className="wrapSideMenu d-sm-none">
              <div className="menuIcon">
                <i><MenuIcon/></i>
              </div>
              <img src={SBLogo} alt="SunBirdLogo" height="35px" />
            </div>
            <div className="wrapProfile">
              <div className="notification">
                <Badge variant="dot" color="secondary">
                  <NotificationsIcon color="action" />
                </Badge>
              </div>
              <div className="verticalLine"></div>
              <button className="btnProf" onClick={() => setOpen(!open)}>
                <div className="profIcon"> 
                  <Avatar style={{height:'30px',width:'30px',fontSize:'1.2rem'}}>{currentUser.email.slice(0,1)}</Avatar>
                </div>
                <div className="user d-none d-md-block">
                  <div className='userName'>{currentUser.displayName}</div>
                  <div className='userTag'>{currentUser.email}</div>
                </div>
                <div><i> <ExpandMoreIcon /></i></div>
              </button>
            </div>
          </div>
          {/* Left side of header bar showing notifications, avatar and logout*/}
          <div className="leftHead col-12 col-sm-8 order-sm-1">
            <div className="headname">  </div> 
          </div>
          {/* open dropdown on clicking profile button*/}
          {open && 
          (<div className="wrapDropDownProfile col-12 col-sm-8 col-lg-10">
              <div className="dropDownProfile col-2 col">    
                <li> <div className="profileInfo">Profile</div></li>
                {/* Logout button */}
                <button className="btnLogout" onClick={() => auth.signOut()}><li>Logout</li></button> 
              </div>
        
          </div>)
          }
        </div>
  )
}

export default Header