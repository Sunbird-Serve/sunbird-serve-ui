import React, { useState, useEffect } from 'react';
import './NeedPopup.css';
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';
import ShareIcon from "@mui/icons-material/Share";
import { auth } from '../../firebase'
import VolunteerSignup from '../VolunteerSignup/VolunteerSignup';
import { useHistory } from 'react-router-dom';
import VolunteerLogin from '../VolunteerLogin/VolunteerLogin';
import EmailIcon from '@mui/icons-material/Email';
import { useSelector, useDispatch } from 'react-redux'
import NominationSuccess from '../../assets/nominationSuccess.png';
import { formatEntityName } from '../../utils/entityNameFormatter';


const configData = require('../../configure.js');

function NeedPopup({ open, onClose, need }) {
  console.log(need)
  const userId = useSelector((state)=> state.user.data.osid)
  const [alertLogin, setAlertLogin] = useState(false)
  const [notifyRegister, setNotifyRegister] = useState(false)
  const [alreadyNominated, setAlreadyNominated] = useState(false); // NEW
  const [nominationsLoading, setNominationsLoading] = useState(false); // NEW
  const [nominationError, setNominationError] = useState(""); // NEW

  // Fetch user's nominations on mount
  useEffect(() => {
    if (userId && open) {
      setNominationsLoading(true);
      axios.get(`${configData.NOMINATIONS_GET}/${userId}?page=0&size=1000`)
        .then((response) => {
          const nominations = Object.values(response.data);
          // Only consider active nominations (Nominated, Inprogress)
          // Ignore old fulfilled, rejected, or approved nominations
          const activeNominations = nominations.filter(nomination => 
            nomination.nominationStatus === "Nominated" || 
            nomination.nominationStatus === "Inprogress"
          );
          
          if (activeNominations.length > 0) {
            setAlreadyNominated(true);
          } else {
            setAlreadyNominated(false);
          }
        })
        .catch((error) => {
          setNominationError("Could not check nominations. Please try again later.");
        })
        .finally(() => {
          setNominationsLoading(false);
        });
    }
  }, [userId, open]);

  //NOMINATION to a need on Nominate button click
  const nominateNeed = () => {
    if (alreadyNominated) {
      setNominationError("You can nominate once and only to one need.");
      return;
    }
    const needId = need.need.id;
    if(userId){
      setIsNominating(true); // Start loading
      axios.post(`${configData.NEED_SEARCH}/${needId}/nominate/${userId}`)
        .then((response) => {
          console.log("Nomination successful!");
          setNominationStatus(true)
        })
        .catch((error) => {
          console.error("Nomination failed:", error);
          // You might want to show an error message to the user here
        })
        .finally(() => {
          setIsNominating(false); // Stop loading regardless of success or failure
        });
    } else {
      if(auth.currentUser){
        setNotifyRegister(true)
      } else {
        setAlertLogin(true)
      }
    }
  };

  const [nominationStatus, setNominationStatus] = useState(false)
  const [isNominating, setIsNominating] = useState(false) // New state for tracking nomination progress

  const [vlogin, setVlogin ] = useState(false)
  const handleVolunteerLogin = () => {
    setVlogin(!vlogin)
    setAlertLogin(false)
  };

  const [vsignup, setVsignup] = useState(false);
  const handleVolunteerSignup = () => {
    setVsignup(!vsignup)
    setAlertLogin(false)
  }

  const history = useHistory();

  // Helper function to format entity name and separate UDISE codes
  const handleRegisterClick = (e) => {
    e.preventDefault();
    history.push("/vregistration")
  }

  const historyNom = useHistory();
  const gotoHome = (e) => {
    e.preventDefault();
    setNominationStatus(false)
    historyNom.push("/vprofile/vpnominations");
  }

  const formatTime = (timeString) => {
    const [hourString, minute] = timeString.split(":");
    const hour = +hourString % 24;
    return (hour % 12 || 12) + ":" + minute + (hour < 12 ? "AM" : "PM");
  }

  return (
    <div className={`need-popup ${open ? "open" : ""}`}>
      {/*Nomination Popup*/}
      <div className="wrapNeedPopup">
      <div className="close-button" onClick={onClose}>
        <CloseIcon />
      </div>
      <div className="contentNeedPopup">
        <div>
        <div className="needPTitle">{need.need.name}</div>
            <br/>
            <button 
              className={`nominate-button ${isNominating ? 'nominating' : ''}`} 
              onClick={nominateNeed}
              disabled={isNominating || alreadyNominated || nominationsLoading}
            >
              {isNominating ? 'Nominating...' : 'Nominate'}
            </button>
            {alreadyNominated && (
              <div style={{ color: 'red', marginTop: '10px', fontWeight: 500 }}>
                You can nominate once and only to one need.
              </div>
            )}
            {nominationError && (
              <div style={{ color: 'red', marginTop: '10px' }}>{nominationError}</div>
            )}
            {isNominating && <div className="nomination-loader"></div>}
        <p className="notification-needpopup">Hurry! Nominations will be closed soon</p>
        {/* <div className="aboutHeading">About</div> */}
        <p className="popupNKey">About the Need </p>
        <p className="popupNValue">{ (need.need && need.need.description) ? need.need.description.slice(3,-4) : '' }</p>
        <p className="popupNKey">Need Type </p>
        <p>{need.needType.name} </p>
        <div className="date-container">
          <div className="date-item">
            <span className="popupNKey"> Start Date </span>
            <p>{ (need.occurrence && need.occurrence.startDate)? need.occurrence.startDate.substr(0,10) : '' }</p>
          </div>
          <div className="date-item">
            <p className="popupNKey">End Date </p>
            <p>{ (need.occurrence && need.occurrence.endDate)? need.occurrence.endDate.substr(0,10) : '' }</p>
          </div>
        </div>

        <div className="itemDaysTime">
          <p className="popupNKey">Need timings</p>
          {need.timeSlots.map((slot, index) => (
            <p className="popupNValue" key={index}> {slot.day} {formatTime(slot.startTime.substr(11,5))} - {formatTime(slot.endTime.substr(11,5))} </p>
          ))}
        </div>
        <p className="popupNKey">Entity Name </p>
        <p>{ formatEntityName(need.entity.name) }</p>
        <p className="popupNKey">Skills Required</p>
        <p className="popupNValue">{ (need.needRequirement && need.needRequirement.skillDetails)? need.needRequirement.skillDetails : '' }</p>
        </div>
        <div className="inviteToEvent">
            <ShareIcon style={{ fontSize: "15px" }} />
            <p style={{ margin: "0 10px", fontSize: "15px", width: "400px" }}>Invite your friends to this event</p>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/1024px-Gmail_icon_%282020%29.svg.png?20221017173631"
              alt="Gmail Icon"
              style={{ width: "24px", height: "15px", marginRight: "10px", cursor: "pointer" }}
            />
            <img
              src="https://thenounproject.com/api/private/icons/3039256/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0"
              alt="Copy Icon"
              style={{ width: "24px", height: "24px", cursor: "pointer" }}
            />
        </div>
        {/* { <p className="nominationSuccess">Nomination Successful</p>} */}
      </div>
      </div>

      { nominationStatus && <div className="nominationSuccess">
          <div className="buttonNSClose"><button onClick={gotoHome}>X</button></div>
          <div className="imageNomSuccess">
            <img src={NominationSuccess} alt="SunBirdLogo" width="400px" />
          </div>
          
          <div className="textNomSuccess">
            Hurray! You've successfully nominated for the event "<span>{need.name}</span>". You'll be notified
            once the organiser accepts your nomination.
          </div>
      </div> }
      
      {alertLogin && <div className="alertLogin">
        <div className='closeBtnLoginVol'>
          <button onClick={()=>setAlertLogin(false)}>x</button>
        </div> 
        <div className="alterVolLoginHead">
          <div className="textHeadVolLogin">Hey There!</div>
          <p>Create an account to nominate, save your favourite events, and much more</p>
        </div>
        <div className="createVolAccount">
          <button type="login" onClick={handleVolunteerSignup}> 
            <i><EmailIcon/></i>Create account with Email ID 
          </button>
        </div> 
        <div className="signInVolunteer">
          <span>Already have an account?</span>
          <button onClick={handleVolunteerLogin}> Login </button>
        </div>
      </div>}

      {notifyRegister && <div className="notifyRegister">
            <p>You are logged in with email id <span>{auth.currentUser ? auth.currentUser.email : ''}</span>.</p> 
            <p>Please complete registration to nominate a need.</p>
            <button onClick={handleRegisterClick}>Click to Register</button>
            </div>} 
     
      { vsignup && <VolunteerSignup onClose={handleVolunteerSignup}/>}
      { vlogin && <VolunteerLogin onClose={handleVolunteerLogin}/> }
    </div>


  );
}
export default NeedPopup;