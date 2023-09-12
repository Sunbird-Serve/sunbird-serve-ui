import React, { useState, useEffect } from 'react';
import './NeedPopup.css';
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';
import configData from './../../configData.json'
import ShareIcon from "@mui/icons-material/Share";
import { auth, gprovider, fprovider } from '../../firebase'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { FcGoogle } from "react-icons/fc"
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import SignUp from '../SignUp/SignUp';
import VolunteerSignup from '../VolunteerSignup/VolunteerSignup';
import { NavLink, Redirect, useNavigate, useHistory } from 'react-router-dom';
import VolunteerLogin from '../VolunteerLogin/VolunteerLogin';
import EmailIcon from '@mui/icons-material/Email';
import { useSelector, useDispatch } from 'react-redux'

function NeedPopup({ open, onClose, need }) {
  const userId = useSelector((state)=> state.user.data.osid)

  const [alertLogin, setAlertLogin] = useState(false)
  const [notifyRegister, setNotifyRegister] = useState(false)
  //NOMINATION to a need on Nominate button click
  const nominateNeed = () => {
    const needId = need.id; //  the need.id represents the needId
    console.log(needId)
    if(userId){
    axios.post(`${configData.NEED_SEARCH}/${needId}/nominate/${userId}`)
      .then((response) => {
        console.log("Nomination successful!");
        setNominationStatus(true)
      })
      .catch((error) => {
        console.error("Nomination failed:", error);
      });
    } else {
      if(auth.currentUser){
        setNotifyRegister(true)
      } else {
        setAlertLogin(true)
      }
    }

  };
 
  const [needType, setNeedType] = useState(null);
  function NeedTypeById( needTypeId ) {
    axios
      .get(`${configData.NEEDTYPE_GET}/${needTypeId}`)
      .then((response) => {
        setNeedType(response.data.name);
      })
      .catch((error) => {
        console.error("Fetching Need Type failed:", error);
      });
   return needType || '';
  } 

  const [entityName, setEntityName] = useState(null);
  function EntityById( entityId ) {
    axios
      .get(`${configData.ENTITY_GET}/${entityId}`)
      .then((response) => {
        setEntityName(response.data.name);
      })
      .catch((error) => {
        console.error("Fetching Entity failed:", error);
      });
  return entityName || '';
  }
  const [needRequirement,setNeedRequirement] = useState(null)
  useEffect(() => {
    if(need) {
    axios
      .get(`${configData.NEED_REQUIREMENT_GET}/${need.requirementId}`)
      .then((response) => {
         console.log(response.data)
         setNeedRequirement(response.data)
      })
      .catch((error) => {
        console.error("Fetching Entity failed:", error);
      });
    }
  }, [need]);
  console.log(needRequirement)
  console.log(userId)

  const [nominationStatus, setNominationStatus] = useState(false)

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
  const handleRegisterClick = (e) => {
    e.preventDefault();
    console.log(history)
    history.push("/vregistration")
  }

  return (
    <div className={`need-popup ${open ? "open" : ""}`}>
      {/*Nomination Popup*/}
      <div className="wrapNeedPopup">
      <div className="close-button" onClick={onClose}>
        <CloseIcon />
      </div>
      <div className="contentNeedPopup">
        <div className="needPTitle">{need.name}</div>
        <br/>
        <button className="nominate-button" onClick={nominateNeed}>
          Nominate
        </button>
        <p className="notification-needpopup">Hurry! Nominations will be closed soon</p>
        <div className="aboutHeading">About</div>
        <p className="popupNKey">About the Need </p>
        <p className="popupNValue">{need.description.slice(3,-4)}</p>
        <p className="popupNKey">Need Type </p>
        <p>{NeedTypeById(need.needTypeId)} </p>
        <div className="date-container">
          <div className="date-item">
            <span className="popupNKey"> Start Date </span>
            <p>{ (needRequirement)? needRequirement.startDate.substr(0,10) : '' }</p>
          </div>
          <div className="date-item">
            <p className="popupNKey">End Date </p>
            <p>{ (needRequirement)? needRequirement.endDate.substr(0,10) : '' }</p>
          </div>
        </div>
        <p className="popupNKey">Entity Name </p>
        <p>{EntityById(need.entityId)}</p>
        <p className="popupNKey">Skills Required</p>
        <p className="popupNValue">{ (needRequirement)? needRequirement.skillDetails : '' }</p>
        <p className="popupNKey">Volunteers Required</p>
        <p className="popupNValue">{ (needRequirement)? needRequirement.volunteersRequired : '' }</p>
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
        {nominationStatus && <p className="nominationSuccess">Nomination Successful</p>}
      </div>
      </div>
      
      {alertLogin && 
      <div className="alertLogin">
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
            <p>You are logged in with email id <span>{auth.currentUser.email}</span>.</p> 
            <p>Please complete registration to nominate a need.</p>
            <button onClick={handleRegisterClick}>Click to Register</button>
            </div>} 
     
      { vsignup && <VolunteerSignup onClose={handleVolunteerSignup}/>}
      { vlogin && <VolunteerLogin onClose={handleVolunteerLogin}/> }

    </div>


  );
}
export default NeedPopup;