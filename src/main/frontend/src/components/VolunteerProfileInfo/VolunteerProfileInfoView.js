import React from 'react';
import './VolunteerProfileInfoView.css';
import { useSelector, useDispatch } from 'react-redux'

function VolunteerProfileInfoView({ onEditClick, userDatas }) {
  const userData = useSelector((state)=> state.user.data)
  const handleEditClick = () => {

  };

  return (
    <div className="main-content">
      <div className="pro">
        <h3 className="main-header">Profile Info</h3>
        <p className="gray-text">Info about you and your preferences</p>
        <div className="button-group">
        <button className="discord-profile-custom-button" onClick={onEditClick}>
        Edit Profile
        </button>

        </div>
      </div>

      {userData && (
        <div>
          <div className="profile-info-box">
            <h3 className="box-header">Basic Info</h3>
            <hr className="gray-horizontal" />
            <div className="info-group">
              { <div className="info-box">
                <p className="info-label">Name</p>
                <p className="info-data">{userData.identityDetails.fullname}</p>
              </div> }
              <div className="info-box">
                <p className="info-label">Gender</p>
                <p className="info-data">{userData.identityDetails.gender}</p>
              </div>
              <div className="info-box">
                <p className="info-label">Date of Birth</p>
                <p className="info-data">{userData.identityDetails.dob}</p>
              </div>
              { <div className="info-box">
                <p className="info-label">Nationality</p>
                <p className="info-data">{userData.identityDetails.nationality}</p>
              </div> }
            </div>
          </div>

          {<div className="profile-info-box">
            <h3 className="box-header">Contact Info</h3>
            <hr className="gray-horizontal" />
            <div className="info-group">
              <div className="info-box">
                <p className="info-label">Email Id</p>
                <p className="info-data">{userData.contactDetails.email}</p>
              </div>
              {<div className="info-box">
                <p className="info-label">Phone</p>
                <p className="info-data">{userData.contactDetails.mobile}</p>
              </div> }
              { <div className="info-box">
                <p className="info-label">Address</p>
                <p className="info-data">
                  {`${userData.contactDetails.address.state}, ${userData.contactDetails.address.city}, ${userData.contactDetails.address.country}`}
                  {/* {`${userData.contactDetails.address.plot}, ${userData.contactDetails.address.street}, ${userData.contactDetails.address.landmark}, ${userData.contactDetails.address.locality}, ${userData.contactDetails.address.state}, ${userData.contactDetails.address.district}, ${userData.contactDetails.address.village}, ${userData.contactDetails.address.pincode}`} */}
                </p>
              </div> }
            </div>
          </div> }

          <div className="profile-info-box">
            <h3 className="box-header">Password Info</h3>
            <hr className="gray-horizontal" />
            <div className="info-box">
              <p className="info-label">Password</p>
              <p className="info-data">********</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerProfileInfoView;
