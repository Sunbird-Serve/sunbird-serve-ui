import React, { useState, useEffect } from 'react';
import './VolunteerProfileInfoEdit.css'

function VolunteerProfileInfoEdit({ onSaveClick, onDiscordClick, userData }) {
  const [editedUserData, setEditedUserData] = useState(null);

  useEffect(() => {
    setEditedUserData(userData);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData((prevData) => ({
      ...prevData,
      identityDetails: {
        ...prevData.identityDetails,
        [name]: value,
      },
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData((prevData) => ({
      ...prevData,
      contactDetails: {
        ...prevData.contactDetails,
        address: {
          ...prevData.contactDetails.address,
          [name]: value,
        },
      },
    }));
  };


  return (
    <div className="main-content1">
      <div className="pro1">
        <h3 className="main-header1">Profile Info</h3>
        
        
        <p className="gray-text1">Info about you and your preferences</p>
        <div className="button-group1">
          <button className="discord-profile1" onClick={onDiscordClick}>
            Discard
          </button>
          <button className="save-profile1" onClick={() => onSaveClick(editedUserData)}>
            Save
          </button>
        </div>
      </div>
      {editedUserData && (
        <div>

           
<div className="profile-info-box1">
            <h3 className="box-header1">Basic Info</h3>
            <hr className="gray-horizontal1" />
            <div className="info-group1">
              <div className="info-row">
                <div className="info-item">
                  <p className="info-label1">Name</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="fullname"
                    value={editedUserData.identityDetails.fullname}
                    onChange={handleChange}
                  />
                </div>
                <div className="info-item">
                  <p className="info-label1">Gender</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="gender"
                    value={editedUserData.identityDetails.gender}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p className="info-label1">Date of Birth</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="dob"
                    value={editedUserData.identityDetails.dob}
                    onChange={handleChange}
                  />
                </div>
                {<div className="info-item">
                  <p className="info-label1">Nationality</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="Nationality"
                    value={editedUserData.identityDetails.Nationality}
                    onChange={handleChange}
                  />
                </div> }
              </div>
      
            </div>
          </div>

          {<div className="profile-info-box1">
            <h3 className="box-header1">Contact Info</h3>
            <hr className="gray-horizontal1" />
            <div className="info-group1">
              <div className="info-row">
                <div className="info-item">
                  <p className="info-label1">Email</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="email"
                    value={editedUserData.contactDetails.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="info-item">
                  <p className="info-label1">Phone</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="phone"
                    value={editedUserData.contactDetails.mobile}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p className="info-label1">Address</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="plot"
                    value={editedUserData.contactDetails.address.city}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="info-item">
                  <p className="info-label1">City</p>
                  {<input
                    className="info-input1"
                    type="text"
                    name="locality"
                    value={editedUserData.contactDetails.address.state}
                    onChange={handleAddressChange}
                  /> }
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <p className="info-label1">District</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="district"
                    value={editedUserData.contactDetails.address.country}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="info-item">
                  <p className="info-label1">State</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="state"
                    value={editedUserData.contactDetails.address.state}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              { <div className="info-row">
                <div className="info-item">
                  <p className="info-label1">Landmark</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="landmark"
                    value={editedUserData.contactDetails.address.city}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="info-item">
                  <p className="info-label1">Pincode</p>
                  <input
                    className="info-input1"
                    type="text"
                    name="pincode"
                    value={editedUserData.contactDetails.address.city}
                    onChange={handleAddressChange}
                  />
                </div>
              </div> }
            </div>
          </div> }

   
          <div className="profile-info-box">
            <h3 className="box-header">Password Info</h3>
            <hr className="gray-horizontal" />
            <div className="info-box">
              <p className="info-label">Password</p>
              <p className="info-data">********</p>

              {/* <input
                className="info-input1"
                type="password"
                value={editedUserData.password}
                name="password"
                onChange={handleChange}
              /> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default VolunteerProfileInfoEdit;