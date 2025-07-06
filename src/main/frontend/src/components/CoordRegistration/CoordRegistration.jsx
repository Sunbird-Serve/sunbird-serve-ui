import React, { useEffect, useState, useMemo } from "react";
import "./CoordRegistration.css";
import {
  Autocomplete,
  Checkbox,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import axios from "axios";
import RegFormSuccess from "../RegFormSuccess/RegFormSuccess.js";
import RegFormFailure from "../RegFormFailure/RegFormFailure.js";
import { useSelector, useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { useHistory } from "react-router-dom";
import CoordSignup from "../VolunteerSignup/VolunteerSignup.js";
const configData = require("../../configure.js");
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const CoordRegistration = (props) => {
  const dispatch = useDispatch();
  const navigate = useHistory();

  const [coordSignup, setCoordSignup] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");
  const genderOptions = ["Male", "Female", "Transgender", "Others"];
  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Cote d'Ivoire",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Democratic Republic of the Congo",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, North",
    "Korea, South",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  const initFormData = {
    skills: [{ skillName: "", skillLevel: "" }],
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    nationality: "",
    mobileNumber: "",
    email: "",
    address: "",
    city: "",
    district: "",
    state: "",
    country: "",
    pincode: "",
    languages: [],
    prefDays: [],
    prefTime: [],
    interests: [],
    qualification: "",
    affiliation: "",
    empStatus: "",
    yoe: "",
    reference: "",
    consent: false,
  };

  const [formData, setFormData] = useState(initFormData);

  const [nav, setNav] = useState(0);

  const refArray = Array.from({ length: 6 }, () => React.createRef());

  useEffect(() => {
    const regEmail = localStorage.getItem("regEmail");
    if (regEmail) {
      setPrefillEmail(regEmail);
    }
  }, []);

  useEffect(() => {
    if (prefillEmail && !formData.email) {
      setFormData((prev) => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  const handleChange = (event, count = 0) => {
    // console.log(event, "check this");
    const { name, value } = event.target;
    if (name === "skillName" || name === "skillLevel") {
      const updatedSkills = [...formData.skills];
      updatedSkills[count][name] = value;
      // console.log("updated skills", updatedSkills);
      setFormData({
        ...formData,
        skills: updatedSkills,
      });
      return;
    }
    if (name === "email" && value !== "") {
      localStorage.setItem("regEmail", value);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const dataToPost = useMemo(() => ({
    identityDetails: {
      fullname: formData.firstName,
      name: formData.lastName,
      gender: formData.gender,
      dob: formData.dob,
      Nationality: formData.nationality,
    },
    contactDetails: {
      email: !props.agencyId ? prefillEmail : formData.email,
      mobile: formData.mobileNumber,
      address: {
        city: formData.city,
        state: formData.state,
        country: formData.country,
      },
    },
    agencyId: props.agencyId ?? "9270607102",
    status: "Registered",
    role: [props.role],
  }), [formData, prefillEmail, props.agencyId, props.role]);

  const [regStatus, setRegStatus] = useState("");

  const [userId, setUserId] = useState("");
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const currentDate = `${year}-${month}-${day}`;
  // const currentDate = new Date().toLocaleDateString();

  const onboradingInfo = {
    onboardStatus: [
      {
        onboardStep: "Discussion",
        status: "completed",
      },
    ],
    refreshPeriod: "2 years",
    profileCompletion: "50",
  };

  const [dataProfile, setDataProfile] = useState({
    skills: formData.skills,
    genericDetails: {
      qualification: formData.qualification,
      affiliation: formData.affiliation,
      yearsOfExperience: formData.yoe,
      employmentStatus: formData.empStatus,
    },
    userPreference: {
      timePreferred: formData.prefTime,
      dayPreferred: formData.prefDays,
      interestArea: formData.interests,
      language: formData.languages,
    },
    agencyId: "",
    userId: userId,
    onboardDetails: onboradingInfo,
    consentDetails: {
      consentGiven: true,
      consentDate: currentDate,
      consentDescription:
        "Consent given for sharing preference to other volunteer agency through secure network",
    },
    referenceChannelId: "",
    volunteeringHours: {
      totalHours: 0,
      hoursPerWeek: 0,
    },
  });

  useEffect(() => {
    if (userId) {
      setDataProfile((prev) => ({
        ...prev,
        skills: formData.skills,
        genericDetails: {
          qualification: formData.qualification,
          affiliation: formData.affiliation,
          yearsOfExperience: formData.yoe,
          employmentStatus: formData.empStatus,
        },
        userPreference: {
          timePreferred: formData.prefTime,
          dayPreferred: formData.prefDays,
          interestArea: formData.interests,
          language: formData.languages,
        },
        agencyId: "",
        userId: userId,
        onboardDetails: onboradingInfo,
        consentDetails: {
          consentGiven: true,
          consentDate: currentDate,
          consentDescription:
            "Consent given for sharing preference to other volunteer agency through secure network",
        },
        referenceChannelId: "",
        volunteeringHours: {
          totalHours: 0,
          hoursPerWeek: 0,
        },
      }));
    }
  }, [userId]); // Only run when userId changes, not on every form field change

  const [loading, setLoading] = useState(false);

  const submitForm = (e) => {
    e.preventDefault();
    
    // Basic validation - temporarily disable email validation checks
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    axios
      .post(`${configData.USER_GET}/`, dataToPost)
      .then(function (response) {
        setUserId(response.data.result.Users.osid);
        console.log(response.data);
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
        // Handle specific error cases
        if (error.response && error.response.status === 409) {
          alert("This email is already registered. Please use a different email or try logging in.");
        } else {
          alert("Registration failed. Please try again.");
        }
      });
  };

  useEffect(() => {
    if (dataProfile.userId) {
      console.log(userId);
      console.log(dataProfile);
      axios
        .post(`${configData.USER_PROFILE}`, dataProfile)
        .then(function (response) {
          console.log(response.data);
          console.log("user created sucessfully", response);
          if (props.agencyId) {
            setCoordSignup(true);
          } else {
            setRegStatus("success");
          }
        })
        .catch(function (error) {
          console.log(error);
          if (props.agencyId) {
            setCoordSignup(true);
          } else {
            setRegStatus("success");
          }

          // setRegStatus("failure");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, dataProfile]);

  const onNavClick = (key) => {
    const currentRef = refArray[key];
    currentRef.current.scrollIntoView({
      behaviour: "smooth",
      block: "end",
      inline: "nearest",
    });
    setNav(key);
  };

  const retryReg = () => {
    setRegStatus("");
  };

  const closeCoordSignUp = () => {
    setCoordSignup(!coordSignup);
  };

  return (
    <div>
      {/* Loading */}
      {loading && (
        <div className="loading-box">
          <span>Creating the user. Please wait...</span>
          <Box sx={{ width: "80%" }}>
            <LinearProgress />
          </Box>
        </div>
      )}
      {!regStatus && (
        <div className="reg-main">
          <div className="title-container">
            <span className="title">{props.title}</span>
            <div className="info-card">
              <span>Online</span>
              <FiberManualRecordIcon
                style={{ fontSize: "1vh", color: "#5D5B5B", margin: "0 0.5vw" }}
              />
              <span>July 10 - July 24</span>
              <FiberManualRecordIcon
                style={{ fontSize: "1vh", color: "#5D5B5B", margin: "0 0.5vw" }}
              />
              <span>Starts @10 AM</span>
            </div>
          </div>
          <hr className="seperator" />
          <div className="button-container">
            <span style={{ float: "left" }}>
              Fill all the details below and be a Need Coordinator
            </span>
            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                className="clear-btn"
                onClick={() => setFormData(initFormData)}
              >
                Clear All
              </button>
              <button
                type="submit"
                className="clear-btn register-btn"
                form="registation-form"
              >
                Register
              </button>
            </div>
          </div>
          <div className="regContainer">
            <div className="nav-container ">
              <span
                className={nav === 0 ? "nav-element active" : "nav-element"}
                onClick={() => onNavClick(0)}
              >
                Personal Details
              </span>
              <hr className="nav-line" />
              <span
                className={nav === 1 ? "nav-element active" : "nav-element"}
                onClick={() => onNavClick(1)}
              >
                Contact Details
              </span>
            </div>

            {/* registration form */}
            <form
              className="formContainer"
              id="registation-form"
              onSubmit={submitForm}
            >
              <div className="form-section" id={0} ref={refArray[0]}>
                <span className="formCat">Personal Details</span>
                <hr className="form-line" />
                <div className="formEntries">
                  <div className="formElement">
                    <label>
                      First Name<span className="req-mark">*</span>
                    </label>
                    <br />
                    <input
                      className="form-input"
                      placeholder="Enter your first name"
                      name="firstName"
                      value={formData.firstName ? formData.firstName : ""}
                      onChange={handleChange}
                      required
                    ></input>
                  </div>
                  <div className="formElement">
                    <label>
                      Last Name<span className="req-mark">*</span>
                    </label>
                    <br />
                    <input
                      className="form-input"
                      placeholder="Enter your last name"
                      name="lastName"
                      value={formData.lastName ? formData.lastName : ""}
                      onChange={handleChange}
                      required
                    ></input>
                  </div>
                  <div className="formElement">
                    <label>
                      Gender<span className="req-mark">*</span>
                    </label>
                    <br />
                    <Select
                      displayEmpty
                      renderValue={
                        formData.gender !== "" ? undefined : () => "Select"
                      }
                      style={{
                        height: "4vh",
                        width: "100%",
                        textAlign: "left",
                      }}
                      name="gender"
                      value={formData.gender ? formData.gender : ""}
                      onChange={handleChange}
                      required
                    >
                      {genderOptions.map((gender, index) => (
                        <MenuItem key={index + gender} value={gender}>
                          {gender}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="formElement">
                    <label>
                      Date of Birth<span className="req-mark">*</span>
                    </label>
                    <br />
                    <input
                      className="form-input"
                      label="DD/MM/YYYY"
                      type="Date"
                      name="dob"
                      value={formData.dob ? formData.dob : ""}
                      onChange={handleChange}
                      required
                    ></input>
                  </div>
                  <div className="formElement">
                    <label>
                      Nationality<span className="req-mark">*</span>
                    </label>
                    <br />
                    <Select
                      displayEmpty
                      renderValue={
                        formData.nationality !== "" ? undefined : () => "Select"
                      }
                      style={{
                        height: "4vh",
                        width: "100%",
                        textAlign: "left",
                      }}
                      name="nationality"
                      value={formData.nationality ? formData.nationality : ""}
                      onChange={handleChange}
                      required
                    >
                      {countries.map((country, index) => (
                        <MenuItem key={index + country} value={country}>
                          {country}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="form-section" id={1} ref={refArray[1]}>
                <span className="formCat">Contact Details</span>
                <hr className="form-line" />
                <div className="formEntries">
                  <div className="formElement">
                    <label>
                      Block<span className="req-mark">*</span>
                    </label>
                    <br />
                    <input
                      className="form-input"
                      placeholder="Add your block"
                      name="city"
                      value={formData.city ? formData.city : ""}
                      onChange={handleChange}
                      required
                    ></input>
                  </div>
                  <div className="formElement">
                    <label>
                      State<span className="req-mark">*</span>
                    </label>
                    <br />
                    <input
                      className="form-input"
                      placeholder="Add your state"
                      name="state"
                      value={formData.state ? formData.state : ""}
                      onChange={handleChange}
                      required
                    ></input>
                  </div>
                  <div className="formElement">
                    <label>
                      Country<span className="req-mark">*</span>
                    </label>
                    <br />
                    <Select
                      displayEmpty
                      renderValue={
                        formData.nationality !== "" ? undefined : () => "Select"
                      }
                      style={{
                        height: "4vh",
                        width: "100%",
                        textAlign: "left",
                      }}
                      name="country"
                      value={formData.country ? formData.country : ""}
                      onChange={handleChange}
                      required
                    >
                      {countries.map((country, index) => (
                        <MenuItem key={index + country} value={country}>
                          {country}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="formElement">
                    <label>
                      Mobile Number<span className="req-mark">*</span>
                    </label>
                    <br />
                    <input
                      className="form-input"
                      placeholder="Add your mobile number"
                      name="mobileNumber"
                      value={formData.mobileNumber ? formData.mobileNumber : ""}
                      onChange={handleChange}
                      required
                    ></input>
                  </div>
                  <div className="formElement">
                    <label>
                      E-mail ID<span className="req-mark">*</span>
                    </label>
                    <br />
                    <input
                      className="form-input"
                      placeholder="chandlerBing@gmail.com"
                      name="email"
                      value={
                        props.agencyId !== ""
                          ? prefillEmail
                          : formData.email
                            ? formData.email
                            : ""
                      }
                      onChange={handleChange}
                      required
                    ></input>
                    {/* Email validation temporarily disabled */}
                    {/* <EmailValidation
                      email={props.agencyId !== "" ? prefillEmail : formData.email}
                      onValidationChange={(isValid, exists) => 
                        setEmailValidation({ isValid, exists })
                      }
                      showValidation={true}
                      disabled={false}
                    /> */}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {regStatus === "success" && userId && <RegFormSuccess redirect={props.role === "nCoordinator" ? "/needs" : "/volunteers"} />}
      {regStatus === "failure" && userId && (
        <RegFormFailure retryReg={retryReg} />
      )}

      {coordSignup && (
        <CoordSignup 
          onClose={closeCoordSignUp} 
          regisRedirectUrl={props.role === "nCoordinator" ? "/ncRegistration" : "/vcRegistration"} 
          successRedirectionUrl={props.role === "nCoordinator" ? "/needs" : "/volunteers"}
          RegistrationByAgencyId={props.agencyId} />
      )}
    </div>
  );
};

export default CoordRegistration;
