import React, { useState, useEffect } from 'react';
import './VolunteerProfileInfoEdit.css';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import the DatePicker styles


function VolunteerProfileInfoEdit({ onSaveClick, onDiscordClick, userData }) {
  const [editedUserData, setEditedUserData] = useState(null);
  const [selectedGender, setSelectedGender] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Added this line
  const [selectedNationality, setSelectedNationality] = useState('');
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);


  useEffect(() => {
    setEditedUserData(userData);
    setSelectedGender(userData?.identityDetails?.gender || ''); // Set the selected gender
  }, [userData]);
  
  useEffect(() => {
    setEditedUserData(userData);
  }, [userData]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'gender') {
      setSelectedGender(value);
    }

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

  const handleDiscard = () => {
    // Reset all fields to their original empty state
    setEditedUserData({
      identityDetails: {
        fullname: '',
        gender: '',
        dob: '',
        Nationality: '',
      },
      contactDetails: {
        email: '',
        phone: '',
        address: {
          plot: '',
          locality: '',
          district: '',
          state: '',
          landmark: '',
          pincode: '',
        },
      },
      password: '',
    });


    setSelectedGender('');
    setSelectedNationality('');
    // Notify that "Discard" was clicked
    onDiscordClick();
  };

  return (
    <div className="main-content1">
      <div className="pro1">
        <h3 className="main-header1">Profile Info</h3>
        <p className="gray-text1">Info about you and your preferences</p>
        <div className="button-group1">
          <button className="discord-profile1" onClick={handleDiscard}>
            Discard
          </button>
          <button className="save-profile1" onClick={() => onSaveClick(editedUserData)}>
            Save
          </button>
        </div>
      </div>
      {editedUserData && (
        <div className="profile-info-box1">
          <h4 className="box-header1">Basic Info</h4>
          <hr className="gray-horizontal1" />
          <div className="info-group1">
            {/* Basic Info */}
            <div className="info-row">
              <div className="info-item">
                <p className="info-label1">Name</p>
                <input
                  className="info-input1"
                  type="text"
                  name="fullname"
                  value={editedUserData.identityDetails.fullname}
                  placeholder="Enter Name"
                  onChange={(e) => {
                    setSelectedGender(e.target.value);
                    handleChange(e);
                  }} />
            </div>




         <div className="info-item">
        <p className="info-label1">Gender</p>
         <div className="custom-dropdown">
        <div className="input-with-dropdown">
          <input
            className="info-input3"
            type="text"
            value={selectedGender || ''}
            readOnly
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            placeholder="Select "
          />
          <div
            className={`dropdown-symbol ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
          ^
          </div>
        </div>
        <div className={`dropdown-options ${isDropdownOpen ? 'open' : ''}`}>
          <div
            className={`option ${selectedGender === 'male' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedGender('male');
              setIsDropdownOpen(false);
              handleChange({ target: { name: 'gender', value: 'male' } });
            }}
          >
            Male
          </div>
          <div
            className={`option ${
              selectedGender === 'female' ? 'selected' : ''
            }`}
            onClick={() => {
              setSelectedGender('female');
              setIsDropdownOpen(false);
              handleChange({ target: { name: 'gender', value: 'female' } });
            }}
          >
            Female
          </div>
          <div
            className={`option ${
              selectedGender === 'other' ? 'selected' : ''
            }`}
            onClick={() => {
              setSelectedGender('other');
              setIsDropdownOpen(false);
              handleChange({ target: { name: 'gender', value: 'other' } });
            }}
          >
            Other
          </div>
        </div>
      </div>
    </div>
      </div>



    
      <div className="info-row">
            <div className="info-item">
              <p className="info-label1">Date of Birth</p>
              <div className="input-with-icon">
                <DatePicker
             
                  selected={
                    editedUserData.identityDetails.dob
                      ? new Date(editedUserData.identityDetails.dob)
                      : null
                  }
                  onChange={(date) =>
                    handleChange({
                      target: { name: 'dob', value: date },
                    })
                  }
                  dateFormat="dd/mm/yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                  customInput={
                    <div className="date-input">
                   <input
                          className="info-input1"
                          type="text"
                          name="dob"
                          placeholder="dd/mm/yyyy"
                          value={editedUserData.identityDetails.dob ? new Date(editedUserData.identityDetails.dob).toLocaleDateString('en-GB') : ''}
                          readOnly
                        />

                      <CalendarTodayOutlinedIcon className="calendar-icon-gray" />
                    </div>
                  }
                />
              </div>
            </div>
         





















            <div className="info-item">
  <p className="info-label1">Nationality</p>
  <div className="custom-dropdown">
    <div className="input-with-dropdown">
      <input
        className="info-input3"
        type="text"
        value={selectedNationality || ''}
        readOnly
        onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
        placeholder="Select"
      />
      <div
        className={`dropdown-symbol ${isNationalityDropdownOpen ? 'open' : ''}`}
        onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
      >
        ^
      </div>
    </div>
    <div className={`dropdown-options ${isNationalityDropdownOpen ? 'open' : ''}`}>
      <div
        className={`option ${selectedNationality === 'India' ? 'selected' : ''}`}
        onClick={() => {
          setSelectedNationality('India');
          setIsNationalityDropdownOpen(false);
          handleChange({ target: { name: 'Nationality', value: 'India' } });
        }}
      >
        India
      </div>
      <div
        className={`option ${selectedNationality === 'American' ? 'selected' : ''}`}
        onClick={() => {
          setSelectedNationality('American');
          setIsNationalityDropdownOpen(false);
          handleChange({ target: { name: 'Nationality', value: 'American' } });
        }}
      >
        American
      </div>
      <div
        className={`option ${selectedNationality === 'Afghan' ? 'selected' : ''}`}
        onClick={() => {
          setSelectedNationality('Afghan');
          setIsNationalityDropdownOpen(false);
          handleChange({ target: { name: 'Nationality', value: 'Afghan' } });
        }}
      >
        Afghan
      </div>
      {/* Add more countries here */}
    </div>
  </div>
</div>
</div>












            <br></br>


            {/* Contact Info */}
            <h4 className="box-header1">Contact Info</h4>
            <hr className="gray-horizontal1" />
            <div className="info-row">
         
              <div className="info-item">
                <p className="info-label1">E-mail ID</p>
                <input
                  className="info-input1"
                  type="text"
                  name="email"
                  value={editedUserData.contactDetails.email}
                  placeholder="Enter Email"
                  onChange={handleChange}
                />
              </div>
              <div className="info-item">
                <p className="info-label1">Phone</p>
                <input
                  className="info-input1"
                  type="text"
                  name="phone"
                  value={editedUserData.contactDetails.phone}
                  placeholder="Enter your Mobile"
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
                  value={editedUserData.contactDetails.address.plot}
                  placeholder="Enter house no., floor, street"
                  onChange={handleAddressChange}
                />
              </div>
              <div className="info-item">
                <p className="info-label1">City</p>
                <input
                  className="info-input1"
                  type="text"
                  name="locality"
                  value={editedUserData.contactDetails.address.locality}
                  placeholder="Eg. Koramangala"
                  onChange={handleAddressChange}
                />
              </div>
            </div>
            <div className="info-row">
              <div className="info-item">
                <p className="info-label1">District</p>
                <input
                  className="info-input1"
                  type="text"
                  name="district"
                  value={editedUserData.contactDetails.address .district}
                  placeholder="Eg. Bangalore Urban"
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
                  placeholder="Eg. Karnataka"
                  onChange={handleAddressChange}
                />
              </div>
            </div>
            <div className="info-row">
              <div className="info-item">
                <p className="info-label1">Landmark</p>
                <input
                  className="info-input1"
                  type="text"
                  name="landmark"
                  value={editedUserData.contactDetails.address.landmark}
                  placeholder="Enter your nearest landmark"
                  onChange={handleAddressChange}
                />
              </div>
              <div className="info-item">
                <p className="info-label1">Pincode</p>
                <input
                  className="info-input1"
                  type="text"
                  name="pincode"
                  value={editedUserData.contactDetails.address.pincode}
                  placeholder="Enter your pincode"
                  onChange={handleAddressChange}
                />
              </div>
            </div>
            <br></br>

            {/* Password Info */}
            <div className="profile-info-box no-margin-bottom">
                <h4 className="box-header1">Password Info</h4>
                <hr className="gray-horizontal" />
                <div className="info-box">
                  <p className="info-label">Password</p>

                  <input
                    className="info-input1"
                    type="password"
                    value={editedUserData.password}
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                  />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerProfileInfoEdit;

