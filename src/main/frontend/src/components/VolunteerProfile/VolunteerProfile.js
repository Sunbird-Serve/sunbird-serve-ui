import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import randomColor from "randomcolor";
import "./VolunteerProfile.css";
import { NavLink, Redirect } from "react-router-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import VolunteerProfileInfo from "../VolunteerProfileInfo/VolunteerProfileInfo";
import VolunteerProfileEdit from "../VolunteerProfileInfo/VolunteerProfileEdit";
import VolunteerProfileNominations from "../VolunteerProfileNominations/VolunteerProfileNominations";
import VolunteerProfileNeedPlans from "../VolunteerProfileNeedPlans/VolunteerProfileNeedPlans";
import VolunteerProfileFavourites from "../VolunteerProfileFavourites/VolunteerProfileFavourites";
import { auth } from "../../firebase.js";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserByEmail } from "../../state/userSlice";
import { useHistory } from "react-router";

function VProfile() {
  const dispatch = useDispatch();

  const userData = useSelector((state) => state.user.data);
  const [user, setUser] = useState(false);
  useEffect(() => {
    if (userData) {
      setUser(true);
    }
  }, [userData]);

  const [avatarColor, setAvatarColor] = useState(randomColor());

  const handleLogout = () => {
    localStorage.removeItem("regEmail");
    auth.signOut();
    dispatch(fetchUserByEmail(""));
    history.push("/");
    window.location.reload();
  };
  const history = useHistory();

  const handleRegisterClick = (e) => {
    e.preventDefault();
    history.push("/vregistration");
  };
  const statusInfo = {
    Recommended: "You have been endorsed for fulfilling the need",
    "Not Recommended": "Your involvement is not advised at this time",
    "On Hold": "Your status is temporarily pending further review",
    Registered: "You have recently joined our program. Please Nominate a need",
    Active: "You are currently engaged and participating",
    Inactive: "You are currently not engaged and inactive in the program",
  };

  return (
    <div className="wrapVProfile col">
      <div className="vProfileBanner">
        <div className="wrapUserInfo">
          <div className="profVIcon">
            <Avatar
              style={{
                height: "64px",
                width: "64px",
                fontSize: "32px",
                backgroundColor: avatarColor,
              }}
            ></Avatar>
          </div>
          <div className="userInfo">
            <div className="vName">
              {" "}
              {user && userData.identityDetails
                ? userData.identityDetails.fullname
                : "Unregistered User"}
            </div>
            <div className="vContact">
              <div className="vEmail">
                {user && userData.identityDetails
                  ? userData.contactDetails.email
                  : "Complete registration to create profile"}
              </div>
              <span>.</span>
              <div className="vMobile">
                {user && userData.identityDetails
                  ? userData.contactDetails.mobile
                  : ""}
              </div>
            </div>
            {user && userData.identityDetails ? (
              <></>
            ) : (
              <div>
                <button
                  className="register-vprofile"
                  onClick={handleRegisterClick}
                >
                  Click here to Register
                </button>
              </div>
            )}
            <div className="wrap-status">
              <div className="volunteerStatus">
                {" "}
                Status: {user && userData.status ? userData.status : "Unknow"}
              </div>
              {user && userData.status && (
                <div>
                  <button
                    className="vtooltip"
                    title={statusInfo[userData.status]}
                  >
                    i
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="logoutButton">
          <button className="btnVLogout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="vProfNav">
        <div className="navContainer">
          <NavLink
            to="/vprofile/vpinfo"
            exact
            className="vpNavItem"
            activeClassName="selectedTab"
          >
            <span>Profile</span>
          </NavLink>
          <NavLink
            to="/vprofile/vpnominations"
            className="vpNavItem"
            activeClassName="selectedTab"
          >
            <span>Nominations</span>
          </NavLink>
          <NavLink
            to="/vprofile/vpneedplans"
            className="vpNavItem"
            activeClassName="selectedTab"
          >
            <span>Need Plans</span>
          </NavLink>
          <NavLink
            to="/vprofile/vpfavourites"
            className="vpNavItem"
            activeClassName="selectedTab"
          >
            <span>Favourites</span>
          </NavLink>
        </div>
      </div>
      {user && userData && (
        <div className="vpContent">
          <Switch>
            <Route
              exact
              path="/vprofile/vpinfo"
              component={VolunteerProfileInfo}
            />
            <Route path="/vprofile/vpedit" component={VolunteerProfileEdit} />
            <Route
              path="/vprofile/vpnominations"
              component={VolunteerProfileNominations}
            />
            <Route
              path="/vprofile/vpneedplans"
              component={VolunteerProfileNeedPlans}
            />
            <Route
              path="/vprofile/vpfavourites"
              component={VolunteerProfileFavourites}
            />
            <Redirect from="/vprofile" to="/vprofile/vpinfo" />
          </Switch>
        </div>
      )}
    </div>
  );
}

export default VProfile;
