import React, {useEffect, useState} from 'react';
import './VolunteerProfileInfo.css';
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router'

function VolunteerProfileInfoView() {
  //get userData from redux store
  const userData = useSelector((state)=> state.user.data)
  const [user, setUser] = useState(false)
  useEffect(()=>{
    if(userData){
      setUser(true)
    }
  },[userData])
  console.log(userData)
  const history = useHistory()
  const handleEditClick = () => {
    history.push('/vprofile/vpedit')
    console.log('clicked edit')
  };

  return (
    <div className="main-content">
      <div className="pro">
        <h3 className="main-header">Profile Info</h3>
        <p className="gray-text">Info about you and your preferences</p>
        <div className="button-group">
        <button className="discord-profile-custom-button" onClick={handleEditClick}>Edit Profile</button>

        </div>
      </div>

      { user && (
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
      ) }
    </div>
  );
}

export default VolunteerProfileInfoView;
