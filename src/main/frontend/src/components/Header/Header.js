// Header.js
import './Header.css'
import { auth } from '../../firebase.js'
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import SBLogo from '../../assets/sunbirdlogo.png';
import randomColor from 'randomcolor'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUserByEmail } from '../../state/userSlice'
import { useHistory } from 'react-router-dom';

function Header({ toggleSideNav }) { // Receive toggleSideNav function as prop
  const [open,setOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState(randomColor())
  const currentUser = auth.currentUser;
  const dispatch = useDispatch()
  const userData = useSelector((state)=> state.user.data)
  const history = useHistory();

  const handleLogout = () => {
    auth.signOut()
    dispatch(fetchUserByEmail(''))
    console.log(userData)
    //history.push("/");
    //window.location.reload()
  }
  const userRole = userData.role;
  
  return (
        <div className="head row">

          {/* icons near profile button */}
          <div className="rightHead col-12 col-sm-6 order-sm-2 justify-content-between justify-content-sm-end" >
            <div className="wrapSideMenu d-sm-none">
            <div className="menuIcon" onClick={toggleSideNav}>
                <i><MenuIcon/></i>
              </div>
              <img src={SBLogo} alt="SunBirdLogo" height="35px" />
            </div>
            <div className="wrapProfile">
              <div className="verticalLine"></div>
              <div className="notification">
                <Badge variant="dot" color="secondary">
                  <NotificationsIcon color="action" style={{height:'24px'}} />
                </Badge>
              </div>
              <button className="btnProf" onClick={() => setOpen(!open)}>
                <div className="profIcon"> 
                  <Avatar style={{height:'30px',width:'30px',fontSize:'16px',backgroundColor:avatarColor}}>
                    {currentUser.email.slice(0,1).toUpperCase()}
                  </Avatar>
                </div>
              </button>
            </div>
          </div>
          
          {/* nCoord or vCoord depending on role of user loggedin */}
          <div className="leftHead col-12 col-sm-6 order-sm-1">
            { userRole && userRole.includes('nCoordinator') && <div className="headname"> 
              Need Coordinator Management
            </div>}
            { userRole && userRole.includes('vCoordinator') && <div className="headname"> 
              Volunteer Coordinator Management 
            </div>}
          </div>

          {/* onclicking PROFILE */}
          {open && 
          ( <div className="wrapDropDownProfile col-sm-10">
              <div className="dropDownProfile">    
                <div className="profileInfo">
                  <div className='userName'>{currentUser.displayName}</div>
                  <div className='userTag'>{currentUser.email}</div>
                </div>
                <button className="btnLogout" onClick={handleLogout}>Logout</button>
              </div>
            </div>)
          } 
        </div>
  )
}

export default Header
