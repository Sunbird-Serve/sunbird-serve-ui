import React, { useState } from 'react';
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
    // const userId = '1-13962559-8fb8-4719-b241-61bf279d18fe'; // Replace with the actual userId
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
  return (
    <div className={`need-popup ${open ? "open" : ""}`}>
      <div className="close-button" onClick={onClose}>
        <CloseIcon />
      </div>
      <div className="content">
        <h3>{need.name}</h3>
        <br/>
        <button className="nominate-button" onClick={nominateNeed}>
          Nominate
        </button>
        <hr />
        <p>About <br /> {need.description.slice(3,-4)} </p>
        <br/>
        <br/>
        <p>Need Type {need.needTypeId}</p>
        <div className="date-container">
          <div className="date-item">
            <p>Start Date {need.startDate}</p>
          </div>
          <div className="date-item">
            <p>End Date {need.endDate}</p>
          </div>
        </div>
        <p>Entity Name {need.entityId}</p>
        <br/> <br/>
        <p>Skills Required</p><br/> <br/>
        <p>Volunteers Required</p>
      </div>
    </div>
  );
}
export default NeedPopup;