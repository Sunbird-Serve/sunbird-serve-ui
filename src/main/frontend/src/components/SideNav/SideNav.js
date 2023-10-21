import './SideNav.css';
import SBLogo from '../../assets/sunbirdicon.png';
import { NavLink } from "react-router-dom" ;
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

function SideNav() {
  return ( 
    <div className="sideNav row">
      {/* Logo in Side navigation*/}
      <div className="wrapSideLogo">
        <div className="logoSideNav">
          <img src={SBLogo} alt="SunBirdLogo" height="35px" />
        </div>
        <div className="logotext">
          <div className="logotitle">SUNBIRD SERVE</div>
          <div className="usertag">NCoordinator Management</div>
        </div>
      </div>
      {/* Navigation Menu options */}
      <div className="navMenu">
        {/* switch to dashboard page*/}
        <NavLink to="/" exact className="sideNavItem row" activeClassName="active">
          <i><DashboardOutlinedIcon /></i>  
          <span>Dashboard</span>
        </NavLink>

        {/* switch to needs page */}
        <NavLink to="/needs" exact className="sideNavItem row">
          <i><StickyNote2OutlinedIcon /></i>
          <span>Needs</span>
        </NavLink>

        {/* switch to needs plan page */}
        <NavLink to="/needplans" exact className="sideNavItem row">
          <i><CalendarTodayOutlinedIcon /></i>
          <span>Needs Schedule</span>
        </NavLink>

        <NavLink to="/volunteers" exact className="sideNavItem row">
              <i><VolunteerActivismOutlinedIcon /></i> 
              <span>Volunteers</span>
        </NavLink>

        {/* switch to volunteers page */}
        {/* 
        <NavLink to="/volunteer" exact className="sideNavItem row">
              <i><VolunteerActivismOutlinedIcon /></i> 
              <span>Volunteer</span>
        </NavLink>  
        */}
        <div></div>
        <NavLink to="/settings" exact className="sideNavItem row">
              <i><SettingsOutlinedIcon /> </i>
              <span>Settings</span>
        </NavLink>
        <NavLink to="/help" exact className="sideNavItem row">
              <i><HelpOutlineOutlinedIcon /></i> 
              <span>Help</span>
        </NavLink>
      </div>
    </div>
  )
}

export default SideNav