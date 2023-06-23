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
      <div className="logoSideNav">
          <img src={SBLogo} alt="SunBirdLogo" width="150px" />
          <i><MenuOpenIcon /></i>
      </div>
      <div className="sidebarList"> 
        <div className="navGroup">CATEGORY</div>
        <ul className="navCategory">
          <div className="wrapSideListItem">
            <NavLink to="/" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <AssessmentIcon /> 
                <p>Dashboard</p>
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/needs" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <ShoppingCartIcon /> 
                <p>Needs</p>
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/needplans" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <DescriptionIcon /> 
                <p>Need Plans</p>
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/menuca" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <DescriptionIcon /> 
                <p>Menu1</p>
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/menucb" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <DescriptionIcon /> 
                <p>Menu2</p>
              </li>
            </NavLink>
          </div>   
        </ul>
        <div className="navGroup">MANAGEMENT</div>
        <ul className="navCategory">
        <div className="wrapSideListItem">
            <NavLink to="/menuma" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <SmsIcon /> 
                <p>Menu1</p>
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/menumb" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <SmsIcon /> 
                <p>Menu2</p>
              </li>
            </NavLink>
          </div>   
        </ul>
        <div className="navGroup">CATEGORY</div>
        <ul className="navCategory">
          <div className="wrapSideListItem">
            <NavLink to="/settings" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <SettingsIcon /> 
                <p>Settings</p>
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/accounts" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <PersonIcon /> 
                <p>Accounts</p>
              </li>
            </NavLink>
          </div>
          <div className="wrapSideListItem">
            <NavLink to="/help" exact className="linkSideNav">
              <li className="sidebarListItem"> 
                <HelpIcon /> 
                <p>Help</p>
              </li>
            </NavLink>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default SideNav