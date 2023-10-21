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
  const history = useHistory()
  const handleEditClick = () => {
    history.push('/vprofile/vpedit')
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div className="pro">
        <div className="proInfo-title">
          <div className="main-header">Profile Info</div>
          <div className="gray-text">Info about you and your preferences</div>
        </div>
        <div className="button-group">
          <button className="discord-profile-custom-button" onClick={handleEditClick}>Edit Profile</button>
        </div>
      </div>

      { user && userData && (
        <div>
          <div className="profile-info-box">
            <div className="box-header">Basic Info</div>
              <div className="info-group">
                <div className="info-box">
                  <p className="info-label">Name</p>
                  <p className="info-data">{userData.identityDetails ? userData.identityDetails.fullname : ''}</p>
                </div> 
                <div className="info-box">
                  <p className="info-label">Gender</p>
                  <p className="info-data">{userData.identityDetails ? userData.identityDetails.gender : ''}</p>
                </div>
                <div className="info-box">
                  <p className="info-label">Date of Birth</p>
                  <p className="info-data">{userData.identityDetails ? userData.identityDetails.dob : ''}</p>
                </div>
                <div className="info-box">
                  <p className="info-label">Nationality</p>
                  <p className="info-data">{userData.identityDetails ?  userData.identityDetails.nationality : ''}</p>
                </div> 
              </div>
            </div>

          {<div className="profile-info-box">
            <div className="box-header">Contact Info</div>
            <div className="info-group">
              <div className="info-box">
                <p className="info-label">Email Id</p>
                <p className="info-data">{userData.contactDetails ? userData.contactDetails.email : ''}</p>
              </div>
              {<div className="info-box">
                <p className="info-label">Phone</p>
                <p className="info-data">{userData.contactDetails ? userData.contactDetails.mobile : ''}</p>
              </div> }
              { <div className="info-box">
                <p className="info-label">Address</p>
                <p className="info-data">
                  {`${userData.contactDetails ? userData.contactDetails.address.state : ''}, 
                  ${userData.contactDetails ? userData.contactDetails.address.city : ''}, 
                  ${userData.contactDetails ? userData.contactDetails.address.country :''}`}
                  {/* {`${userData.contactDetails.address.plot}, ${userData.contactDetails.address.street}, ${userData.contactDetails.address.landmark}, ${userData.contactDetails.address.locality}, ${userData.contactDetails.address.state}, ${userData.contactDetails.address.district}, ${userData.contactDetails.address.village}, ${userData.contactDetails.address.pincode}`} */}
                </p>
              </div> }
            </div>
          </div> }

          <div className="profile-info-box">
            <div className="box-header">Password Info</div>
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
