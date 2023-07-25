import './SideNav.css';
import SBLogo from '../../clogo.jpg';
import { NavLink } from "react-router-dom" ;
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DescriptionIcon from '@mui/icons-material/Description';
import SmsIcon from '@mui/icons-material/Sms';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';

function SideNav() {
  return ( 
    <div className="sideNav">
      <div className="wrapSideLogo">
        {/* Logo in Side navigation*/}
        <div className="logoSideNav">
          <img src={SBLogo} alt="SunBirdLogo" height="35px" />
          <i><MenuOpenIcon /></i>
        </div>
      </div>
      <div className="navGroup row">
          <div className="groupName">CATEGORY</div>
          {/* switch to dashboard page*/}
          <div className="wrapSideListItem">
            <NavLink to="/" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <i><AssessmentIcon /> </i>  Dashboard
              </li>
            </NavLink>
          </div>
          {/* switch to needs page */}
          <div className="wrapSideListItem">
            <NavLink to="/needs" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><ShoppingCartIcon /> </i>Needs
              </li>
            </NavLink>
          </div>
          {/* switch to needs plan page */}
          <div className="wrapSideListItem">
            <NavLink to="/needplans" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><DescriptionIcon /> </i>Need Plans
              </li>
            </NavLink>
          </div>
          {/* switch to volunteers page */}
          <div className="wrapSideListItem">
            <NavLink to="/volunteer" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><DescriptionIcon /></i> Volunteer
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/menucb" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><DescriptionIcon /></i> Menu2
              </li>
            </NavLink>
          </div>   
      </div>
      <div className="navGroup row">
        <div className="groupName">MANAGEMENT</div>
        <div className="wrapSideListItem">
            <NavLink to="/menuma" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><SmsIcon /> </i>Menu 1
              </li>
            </NavLink>
        </div>
        <div className="wrapSideListItem">
            <NavLink to="/menumb" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><SmsIcon /></i> Menu 2
              </li>
            </NavLink>
        </div>   
      </div>
      <div className="navGroup row">
        <div className="groupName">OTHERS</div>
          <div className="wrapSideListItem">
            <NavLink to="/settings" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><SettingsIcon /> </i>Settings
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/accounts" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><PersonIcon /> </i>Accounts
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/help" exact className="linkSideNav">
              <li className="sidebarListItem"> 
              <i><HelpIcon /></i> Help
              </li>
            </NavLink>
          </div>
        </div>
      </div>
  )
}

export default SideNav