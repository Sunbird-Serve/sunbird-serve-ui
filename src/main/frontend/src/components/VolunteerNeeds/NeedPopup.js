import React, { useState, useEffect } from 'react';
import './NeedPopup.css';
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';
function NeedPopup({ open, onClose, need }) {
  const [popUp, setPopup] = useState(false);
  const togglePopup = () => {
    setPopup(!popUp);
  };
  const nominateNeed = () => {
    const needId = need.osid; // Assuming the need.id represents the needId
    console.log(needId)
    axios.post(`http://ecs-integrated-239528663.ap-south-1.elb.amazonaws.com/api/v1/need/${needId}/nominate/1-13962559-8fb8-4719-b241-61bf279d18fe`)
      .then((response) => {
        // Handle success, e.g., show a success message or update state if needed.
        console.log("Nomination successful!");
      })
      .catch((error) => {
        // Handle error, e.g., show an error message.
        console.error("Nomination failed:", error);
      });
  };
 
  const [needType, setNeedType] = useState(null);
  function NeedTypeById( needTypeId ) {
    axios
      .get(`http://ecs-integrated-239528663.ap-south-1.elb.amazonaws.com/api/v1/needtype/${needTypeId}`)
      .then((response) => {
        setNeedType(response.data.name);
      })
      .catch((error) => {
        console.error("Fetching Need Type failed:", error);
      });
   return <span>{needType || ''}</span>;
  }


  const [entityName, setEntityName] = useState(null);
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

  return (
    <div className={`need-popup ${open ? "open" : ""}`}>
      <div className="wrapNeedPopup">
      <div className="close-button" onClick={onClose}>
        <CloseIcon />
      </div>
      <div className="content">
        <div className="needPTitle">{need.name}</div>
        <br/>
        <button className="nominate-button" onClick={nominateNeed}>
          Nominate
        </button>

        <div className="aboutHeading">About</div>

        <hr />
        <p className="popupNKey">About the Need </p>
        <p className="popupNValue">{need.description.slice(3,-4)}</p>
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
        <p>{EntityById(need.entityId)}</p>
        <p className="popupNKey">Skills Required</p><br/>
        <p className="popupNKey">Volunteers Required</p>
      </div>
      </div>
    </div>
  );
}
export default NeedPopup;