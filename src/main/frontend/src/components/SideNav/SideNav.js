import "./SideNav.css";
import SBLogo from "../../assets/sunbirdicon.png";
import { NavLink } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useSelector } from "react-redux";

function SideNav() {
  //get userInfo from store
  const userRole = useSelector((state) => state.user.data.role);
  console.log(userRole);
  return (
    <div className="sideNav row">
      {/* Logo in Side navigation*/}
      <div className="wrapSideLogo">
        <div className="logoSideNav">
          <img src={SBLogo} alt="SunBirdLogo" height="35px" />
        </div>
        <div className="logotext">
          <div className="logotitle">SUNBIRD SERVE</div>
          {/* <div className="usertag">NCoordinator Management</div> */}
        </div>
      </div>
      {/* Navigation Menu options */}
      {userRole && userRole.includes("nCoordinator") && (
        <div className="navMenu">
          {/* switch to needs page */}
          <NavLink
            to="/needs"
            exact
            className="sideNavItem row"
            activeClassName="active"
          >
            <i>
              <StickyNote2OutlinedIcon />
            </i>
            <span>Needs</span>
          </NavLink>

          {/* switch to needs plan page */}
          <NavLink to="/needplans" exact className="sideNavItem row">
            <i>
              <CalendarTodayOutlinedIcon />
            </i>
            <span>Needs Schedule</span>
          </NavLink>
        </div>
      )}

      {/* switch to vCoordinator page */}
      {userRole && userRole.includes("vCoordinator") && (
        <div className="navMenu">
          <NavLink to="/volunteers" exact className="sideNavItem row">
            <i>
              <VolunteerActivismOutlinedIcon />
            </i>
            <span>Volunteers</span>
          </NavLink>
        </div>
      )}

      {userRole && userRole.includes("nAdmin") && (
        <div className="navMenu">
          <NavLink to="/nAdmin-dashboard" exact className="sideNavItem row">
            <i>
              <DashboardIcon />
            </i>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/entities" exact className="sideNavItem row">
            <i>
              <BusinessIcon />
            </i>
            <span>Entity</span>
          </NavLink>
          <NavLink
            to="/nAdmin-sessionDetails"
            exact
            className="sideNavItem row"
          >
            <i>
              <CalendarMonthIcon />
            </i>
            <span>Session Details</span>
          </NavLink>
        </div>
      )}

      {userRole &&
        (userRole.includes("vAdmin") || userRole.includes("sAdmin")) && (
          <div className="navMenu">
            <NavLink to="/volunteer-list" exact className="sideNavItem row">
              <i>
                <VolunteerActivismOutlinedIcon />
              </i>
              <span>Volunteers</span>
            </NavLink>
            <NavLink to="/agencies" exact className="sideNavItem row">
              <i>
                <BusinessIcon />
              </i>
              <span>Agency</span>
            </NavLink>
            {userRole.includes("sAdmin") && (
              <NavLink to="/entities" exact className="sideNavItem row">
                <i>
                  <SchoolOutlinedIcon />
                </i>
                <span>Entity</span>
              </NavLink>
            )}
          </div>
        )}

      <div className="navMenu">
        <NavLink to="/settings" exact className="sideNavItem row">
          <i>
            <SettingsOutlinedIcon />{" "}
          </i>
          <span>Settings</span>
        </NavLink>
        <NavLink to="/help" exact className="sideNavItem row">
          <i>
            <HelpOutlineOutlinedIcon />
          </i>
          <span>Help</span>
        </NavLink>
      </div>
    </div>
  );
}

export default SideNav;
