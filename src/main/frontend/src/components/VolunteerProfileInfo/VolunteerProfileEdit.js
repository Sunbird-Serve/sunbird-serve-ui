import React, { useState, useMemo, useEffect } from "react";
import "./VolunteerProfileEdit.css";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import Select from "react-select";
import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import the DatePicker styles
import countryList from "react-select-country-list"; // Import from react-select-country-list
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { auth } from "../../firebase";
import { fetchUserByEmail } from '../../state/userSlice'
import axios from 'axios'

const configData = require('../../configure.js');

function VolunteerProfileEdit() {
  const userData = useSelector((state) => state.user.data);
  console.log(userData);
  const history = useHistory();
  const dispatch = useDispatch()

  const handleDiscordClick = () => {
    history.push("/vprofile/vpinfo");
  };

  //get user profile for volunteer
  const [userProfile, setUserProfile] = useState({});

useEffect(() => {
    axios.get(`${configData.USER_PROFILE_BY_ID}/${userData.osid}`)
        .then(response => {
            console.log(response.data);
            setUserProfile(response.data);
        })
        .catch(error => {
            console.error("Error fetching user profile:", error);
        });
}, []);

const language = userProfile?.userPreference?.language || " ";
const dayPreferred = userProfile?.userPreference?.dayPreferred || " ";
const timePreferred = userProfile?.userPreference?.timePreferred || " ";


  const [identityDetailsData, setIdentityDetailsData] = useState({
    fullname: userData.identityDetails.fullname || '',
    name: userData.identityDetails.name || '',
    gender: userData.identityDetails.gender || '',
    dob: userData.identityDetails.dob || '',
    Nationality: userData.identityDetails.Nationality || '',
  })
  const { fullname, name, gender, dob, Nationality } = identityDetailsData

  const [addressData, setAddressData] = useState({
    city: userData.contactDetails.address.city,
    state: userData.contactDetails.address.state,
    country: userData.contactDetails.address.country,
  })
  const {city, state, country } = addressData

  const [contactDetailsData, setContactDetailsData] = useState({
    email: userData.contactDetails.email,
    mobile: userData.contactDetails.mobile,
    address: addressData,
  })
  const {email, mobile, address} = contactDetailsData

  const [editedUserData, setEditedUserData] = useState({
    identityDetails: identityDetailsData,
    contactDetails: contactDetailsData,
    agencyId: userData.agencyId,
    status: userData.status,
    role: userData.role,
  });

  const { identityDetails, contactDetails, agencyId, status, role } = editedUserData

  const handleChange = (e) => {
    setEditedUserData({ ...editedUserData, [e.target.name]: e.target.value });
  };

  const handleChangeIdentityDetails = (e) => {
    setIdentityDetailsData({ ...identityDetailsData, [e.target.name]: e.target.value });
  };

  const handleChangeAddress = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleChangeContactDetails = (e) => {
    setContactDetailsData({ ...contactDetailsData, [e.target.name]: e.target.value });
  };

  const [location,setLocation] = useState(null)

  const [selectedGender, setSelectedGender] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Added this line
  const [selectedNationality, setSelectedNationality] = useState("");
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] =
    useState(false);

  const countries = useMemo(() => countryList().getData(), []); // Country options

  useEffect(() => {
    setContactDetailsData({ ...contactDetailsData, address : addressData });
  },[addressData])

  useEffect(() => {
    setEditedUserData({ ...editedUserData, contactDetails : contactDetailsData, identityDetails : identityDetailsData });
  },[contactDetailsData, identityDetailsData])

  const handleSaveClick = () => {
    console.log(editedUserData)
    const userEmail = auth.currentUser.email.replace(/@/g, "%40") || '';
    console.log(userEmail)

    axios.put(`${configData.SERVE_VOLUNTEERING}/user/${userData.osid}`, editedUserData)
      .then(response=>{
        console.log('user edit sucessful');
        dispatch(fetchUserByEmail(userEmail))
        handleDiscordClick()
      })
      .catch(function (error) {
        console.log(error); 
    }) 
  };


  return (
    <div className="main-content1">
      <div className="pro1">
        <div>
          <div className="main-header1">Profile Info</div>
          <p className="gray-text1">Info about you and your preferences</p>
        </div>
        <div className="button-group1">
          <button className="discord-profile1" onClick={handleDiscordClick}>
            Discard
          </button>
          <button className="save-profile1" onClick={handleSaveClick}>
            Save
          </button>
        </div>
      </div>

      <div className="profile-info-box1">
        {/* Basic Info */}
        <div className="box-header1">Basic Info</div>
        <div className="info-group1">
          {/* Name and Gender rows*/}
          <div className="info-row">
            <div className="info-item1">
              <p className="info-label1">Name</p>
              <input
                className="info-input1"
                type="text"
                value={fullname}
                name="fullname"
                onChange={handleChangeIdentityDetails}
              />
            </div>

            <div className="info-item1">
              <p className="info-label1">Gender</p>
              <div className="custom-dropdown">
                  <select className="info-input3"  name="gender" value={gender} onChange={handleChangeIdentityDetails}>
                    <option value="Female" >Female</option>
                    <option value="Male" >Male</option>
                  </select>
              </div>
            </div>
          </div>

          {/* DOB and Nationality */}
          <div className="info-row">
            <div className="info-item1">
              <p className="info-label1">Date of Birth</p>
              <div className="input-with-icon">
                <input className="editProfileDOB" type="date" name="dob" value={dob} onChange={handleChangeIdentityDetails}/>
              </div>
            </div>

            <div className="info-item1">
              <p className="info-label1">Nationality</p>
              <div className="custom-dropdown">
                <input className="info-input1" type="text" name="Nationality" value={Nationality} onChange={handleChangeIdentityDetails}/>
              </div>
            </div>
          </div>
        </div>


        {/* Contact Info */}
        <div className="box-header1">Contact Info</div>
          {/* Email-ID */}
          <div className="info-row">
            <div className="info-item1">
              <p className="info-label1">E-mail ID</p>
              <input
                className="info-input1"
                type="text"
                name="email"
                value={email}
                onChange={handleChangeContactDetails}
              />
            </div>
          {/* Mobile Number */}
            <div className="info-item1">
              <p className="info-label1">Mobile Number</p>
              <input
                className="info-input1"
                type="text"
                name="mobile"
                value={mobile}
                onChange={handleChangeContactDetails}
              />
            </div>
          </div>

          {/* Address */}
          <div className="info-row">
            {/* <div className="info-item1">
              <p className="info-label1">Address</p>
              <input
                className="info-input1"
                type="text"
                name="location"
                value={location}
                onChange={handleChangeAddress}
              />
            </div> */}
          {/* City */}
            <div className="info-item1">
              <p className="info-label1">City</p>
              <input
                className="info-input1"
                type="text"
                name="city"
                value={city}
                placeholder="Eg. Koramangala"
                onChange={handleChangeAddress}
              />
            </div>
          </div>

           {/* State */}
           <div className="info-row">
            <div className="info-item1">
              <p className="info-label1">State</p>
              <input
                className="info-input1"
                type="text"
                name="state"
                value={state}
                onChange={handleChangeAddress}
              />
            </div>
            {/* Country */}
            <div className="info-item1">
              <p className="info-label1">Country</p>
              <input
                className="info-input1"
                type="text"
                name="country"
                value={country}
                onChange={handleChangeAddress}
              />
            </div>
          </div>

          {/*
          <div className="info-row">
            <div className="info-item1">
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
            <div className="info-item1">
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
          */}
          
        {/* Password Info */}
          <h4 className="box-header1">Preference Info</h4>
          <div className="info-row">
            <div className="info-item1">
              <p className="info-label1">Language</p>
              <input
                className="info-input1"
                type="text"
                name="language"
                value={language}
                onChange={handleChangeContactDetails}
              />
            </div>
          {/* Mobile Number */}
            <div className="info-item1">
              <p className="info-label1">Day Preferred</p>
              <input
                className="info-input1"
                type="text"
                name="dayPreferred"
                value={dayPreferred}
                onChange={handleChangeContactDetails}
              />
            </div>
          </div>
          <div className="info-row">
            <div className="info-item1">
              <p className="info-label1">Time Preferred</p>
              <input
                className="info-input1"
                type="text"
                name="timePreferred"
                value={timePreferred}
                onChange={handleChangeAddress}
              />
            </div>
            </div>
          
      </div>
    </div>
  );
}

export default VolunteerProfileEdit;
