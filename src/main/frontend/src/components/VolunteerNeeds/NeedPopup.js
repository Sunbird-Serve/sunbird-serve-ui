import React, { useState, useEffect } from 'react';
import './NeedPopup.css';
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';
import configData from './../../configData.json'
import {auth} from '../../firebase.js'

function NeedPopup({ open, onClose, need }) {
  const [popUp, setPopup] = useState(false);
  const [nominationStatus, setNominationStatus] = useState(false)
  const togglePopup = () => {
    setPopup(!popUp);
  };

  const currentUser = auth.currentUser;
  const [userId, setUserId] = useState('')

  if(currentUser){
    const fetchData = async () => {
      try {
        const email = currentUser.email.replace(/@/g, "%40");
        console.log(email);
  
        const response = await axios.get(`${configData.USER_GET}/?email=${email}`);
        
        if (response.data.length > 0) {
          setUserId(response.data[0].osid);
        } else {
          // Handle case when no data is returned
        }
      } catch (error) {
        console.log(error);
        // Handle error
      }
    };
  
    if (currentUser.email) {
      fetchData();
    }
  }
  console.log(userId)

  const nominateNeed = () => {
    const needId = need.id; //  the need.id represents the needId
    console.log(needId)
    axios.post(`${configData.NEED_SEARCH}/${needId}/nominate/${userId}`)
      .then((response) => {
        console.log("Nomination successful!");
        setNominationStatus(true)
      })
      .catch((error) => {
        console.error("Nomination failed:", error);
      });
  };
 
  const [needType, setNeedType] = useState(null);
  function NeedTypeById( needTypeId ) {
    axios
      .get(`${configData.NEED_BY_TYPE}/${needTypeId}?page=0&size=10&status=New`)
      .then((response) => {
        setNeedType(response.data.content.name);
      })
      .catch((error) => {
        console.error("Fetching Need Type failed:", error);
      });
   return <span>{needType || ''}</span>;
  }


  const [entityName, setEntityName] = useState(null);

  /*
  function EntityById( entityId ) {
       axios
         .get(`http://43.204.25.161:8081/api/v1/Entity/${entityId}`)
         .then((response) => {
           setEntityName(response.data.name);
         })
         .catch((error) => {
           console.error("Fetching Entity failed:", error);
         });
     return entityName || '';
  }
  */

  return (
    <div className={`need-popup ${open ? "open" : ""}`}>
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
        <div className="aboutHeading">About</div>
        <hr />
        <p className="popupNKey">About the Need </p>
        <p className="popupNValue">{need.description}</p>
        <p className="popupNKey">Need Type </p>
        <p>{NeedTypeById(need.needTypeId)}</p>
        <div className="date-container">
          <div className="date-item">
            <p className="popupNKey"> Start Date </p>
            <p>{need.startDate}</p>
          </div>
          <div className="date-item">
            <p className="popupNKey">End Date </p>
            <p>{need.endDate}</p>
          </div>
        </div>
        <p className="popupNKey">Entity Name </p>
        <p>{/*  EntityById(need.entityId) */}</p>
        <p className="popupNKey">Skills Required</p><br/>
        <p className="popupNKey">Volunteers Required</p>
        {nominationStatus && <p className="nominationSuccess">Nomination Successful</p>}
      </div>
      </div>
      
    </div>
  );
}
export default NeedPopup;