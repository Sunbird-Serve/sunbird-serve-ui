import React, { useEffect, useState } from "react";
import "./VolunteerProfileInfo.css";
import LoginForm from "../LoginForm/LoginForm";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router";
import axios from "axios";
const configData = require("../../configure.js");

function VolunteerProfileInfoView() {
  //get userData from redux store
  const userData = useSelector((state) => state.user.data);
  const [user, setUser] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (userData) {
      setUser(true);
    }
  }, [userData]);
  console.log(userData);

  //get user profile for volunteer
  const [userProfile, setUserProfile] = useState([]);
  useEffect(() => {
    axios
      .get(`${configData.USER_PROFILE_BY_ID}/${userData.osid}`)
      .then((response) => {
        console.log(response.data);
        setUserProfile(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const history = useHistory();
  const handleEditClick = () => {
    history.push("/vprofile/vpedit");
  };

  const redirectToChangePassword = () => {
    setChangePassword(true);
  };

  const onPasswordChange = () => {
    setChangePassword(false);
  };

  return (
    <div className="main-content">
      {/* Header */}
      {!changePassword ? (
        <div>
          <div className="pro">
            <div className="proInfo-title">
              <div className="main-header">Profile Info</div>
              <div className="gray-text">
                Info about you and your preferences
              </div>
            </div>
            <div className="button-group">
              <button
                className="discord-profile-custom-button"
                onClick={handleEditClick}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {user && userData && (
            <div>
              <div className="profile-info-box">
                <div className="box-header">Basic Info</div>
                <div className="info-group">
                  <div className="info-box">
                    <p className="info-label">Name</p>
                    <p className="info-data">
                      {userData.identityDetails
                        ? userData.identityDetails.fullname
                        : ""}
                    </p>
                  </div>
                  <div className="info-box">
                    <p className="info-label">Gender</p>
                    <p className="info-data">
                      {userData.identityDetails
                        ? userData.identityDetails.gender
                        : ""}
                    </p>
                  </div>
                  <div className="info-box">
                    <p className="info-label">Date of Birth</p>
                    <p className="info-data">
                      {userData.identityDetails
                        ? userData.identityDetails.dob
                        : ""}
                    </p>
                  </div>
                  <div className="info-box">
                    <p className="info-label">Nationality</p>
                    <p className="info-data">
                      {userData.identityDetails
                        ? userData.identityDetails.Nationality
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {
                <div className="profile-info-box">
                  <div className="box-header">Contact Info</div>
                  <div className="info-group">
                    <div className="info-box">
                      <p className="info-label">Email Id</p>
                      <p className="info-data">
                        {userData.contactDetails
                          ? userData.contactDetails.email
                          : ""}
                      </p>
                    </div>
                    {
                      <div className="info-box">
                        <p className="info-label">Phone</p>
                        <p className="info-data">
                          {userData.contactDetails
                            ? userData.contactDetails.mobile
                            : ""}
                        </p>
                      </div>
                    }
                    {
                      <div className="info-box">
                        <p className="info-label">Address</p>
                        <p className="info-data">
                          {`${userData.contactDetails ? userData.contactDetails.address.city : ""}, 
                  ${userData.contactDetails ? userData.contactDetails.address.state : ""}, 
                  ${userData.contactDetails ? userData.contactDetails.address.country : ""}`}
                          {/* {`${userData.contactDetails.address.plot}, ${userData.contactDetails.address.street}, ${userData.contactDetails.address.landmark}, ${userData.contactDetails.address.locality}, ${userData.contactDetails.address.state}, ${userData.contactDetails.address.district}, ${userData.contactDetails.address.village}, ${userData.contactDetails.address.pincode}`} */}
                        </p>
                      </div>
                    }
                  </div>
                </div>
              }

              {
                <div className="profile-info-box">
                  <div className="box-header">Preferences</div>
                  <div className="info-group">
                    <div className="info-box">
                      <p className="info-label">Language</p>
                      <p className="info-data">
                        {userProfile.userPreference
                          ? userProfile.userPreference.language
                          : ""}
                      </p>
                    </div>
                    {
                      <div className="info-box">
                        <p className="info-label">Day Preferred</p>
                        <p className="info-data">
                          {userProfile.userPreference
                            ? userProfile.userPreference.dayPreferred
                            : ""}
                        </p>
                      </div>
                    }
                    {
                      <div className="info-box">
                        <p className="info-label">Time Preferred</p>
                        <p className="info-data">
                          {`${userProfile.userPreference ? userProfile.userPreference.timePreferred : ""}`}
                          {/* {`${userData.contactDetails.address.plot}, ${userData.contactDetails.address.street}, ${userData.contactDetails.address.landmark}, ${userData.contactDetails.address.locality}, ${userData.contactDetails.address.state}, ${userData.contactDetails.address.district}, ${userData.contactDetails.address.village}, ${userData.contactDetails.address.pincode}`} */}
                        </p>
                      </div>
                    }
                  </div>
                </div>
              }

              {
                <div className="profile-info-box">
                  <div className="box-header">Change Password</div>
                  <div className="info-group">
                    <div className="textInfo p-3">
                      To change Password click
                      <span>
                        {" "}
                        <a href="#" onClick={redirectToChangePassword}>
                          here{" "}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          )}
        </div>
      ) : (
        <LoginForm
          loginState={false}
          changePasswordRequest={true}
          passwordChanged={onPasswordChange}
        />
      )}
    </div>
  );
}

export default VolunteerProfileInfoView;
