import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VolunteerNeeds.css"; // Import the CSS file
import SearchIcon from "@mui/icons-material/Search";
import GridOnIcon from "@mui/icons-material/GridOn";
import ListIcon from "@mui/icons-material/List";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import NeedPopup from "./NeedPopup"; // Import the NeedPopup component
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"; // Import the location icon from Material Icons
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"; 
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import ShareIcon from '@mui/icons-material/Share';
import configData from './../../configData.json'
import SortIcon from "@mui/icons-material/Sort";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const VolunteerNeeds = props => {
  const [data, setData] = useState([]);
  const [view, setView] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null); // State to store the selected need
  const [entityName, setEntityName] = useState(null);
  const [sortRev, setSortRev] = useState("");

  const [needBoxesPerRow, setNeedBoxesPerRow] = useState(3); // Initialize with 3 boxes per row for grid view

  //for grid, view is true
  const handleToggleGrid = () => {
    setView(true);
    setNeedBoxesPerRow(3);
  };
  const handleToggleList = () => {
    setView(false);
    setNeedBoxesPerRow(4);
  };

  const handleSort = (event) => {
    setSortRev(event.target.value);
  };

  useEffect(() => {
    const fetchNeeds = async () => {    
      try {
        const responseNew = await axios.get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=New`)
        const responseNominated = await axios.get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=Nominated`)
        const responseApproved = await axios.get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=Approved`)
        const responseRejected = await axios.get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=Rejected`)
        setData([...responseNew.data.content, ...responseNominated.data.content, ...responseApproved.data.content, ...responseRejected.data.content])
      } catch (error) {
        console.error('Error fetch needs count',Error)
      }
    };
    fetchNeeds()
  },[props.needTypeId])
  
{/*
  const [needsNew, setNeedsNew] = useState([]);
  const [needsNominated, setNeedsNominated] = useState([]);
  const [needsApproved, setNeedsApproved] = useState([]);
  const [needsRejected, setNeedsRejected] = useState([]);
  useEffect(() => {
    axios
      .get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=New`)
      .then((response) => {
        setNeedsNew(response.data.content);
      })
      .catch((error) => console.log(error));
    axios
      .get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=Nominated`)
      .then((response) => {
        setNeedsNominated(response.data.content);
      })
      .catch((error) => console.log(error));
    axios
      .get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=Approved`)
      .then((response) => {
        setNeedsApproved(response.data.content);
      })
      .catch((error) => console.log(error));
    axios
      .get(`${configData.NEED_BY_TYPE}/${props.needTypeId}?page=0&size=100&status=Rejected`)
      .then((response) => {
        setNeedsRejected(response.data.content);
      })
      .catch((error) => console.log(error));
    setData([...needsNew, ...needsNominated, ...needsApproved, ...needsRejected])
  }, [props.needTypeId, needsNew, needsNominated]);
*/}

  // function EntityById( entityId ) {
  //      axios
  //        .get(`${configData.ENTITY_FETCH}/${entityId}`)
  //        .then((response) => {
  //          setEntityName(response.data.name);
  //        })
  //        .catch((error) => {
  //          console.error("Fetching Entity failed:", error);
  //        });
  //    return entityName || '';
  // }

  const handlePopupOpen = (need) => {
    setSelectedNeed(need); // Store the selected need in the state
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleBackButton = () => {
    props.updateNeedList(false)
  }

  return (
    <div className="wrapvolunteerNeeds">
      <div className="volunteerNeeds">
        <div className="vHeaderBack">
          <button onClick={handleBackButton}><ArrowBackIcon /></button>
          {props.nTypeName}
        </div>
        <div className="vNeedFilters">  
          <div className="vSortNeed">
            <i className="vsort1"><SortIcon /></i>
            <select value={sortRev} onChange={handleSort}>
              <option value="" disabled hidden> Sort by</option>
              <option value="true">Today</option>
              <option value="false">Current Month</option>
              <option value="true">Yesterday</option>
              <option value="false">Last Week</option>
              <option value="false">Last Month</option>
              <option value="false">Last Year</option>
            </select>
          </div>
          <div className="toggleNeedView">  
              <button className={`${view ? "blueText" : "grayText"}`} onClick={handleToggleGrid}> 
                <i><GridOnIcon style={{fontSize:"19px"}}/></i>
                Grid view 
              </button>
              
              <button className={`${!view ? "blueText" : "grayText"}`} onClick={handleToggleList}>
                <i><ListIcon /></i>
                List view
              </button>
          </div>
        </div>
      {(!data.length) && <div> No needs under this type</div>}
      { data.length && 
        <div className="needs">
          <div className="needContainer">
            {data.map((need) => (
              <div key={need.id} className="needBox" onClick={() => handlePopupOpen(need)} >
                <div className="need-container-volunteer">
                  <div class="h3-container">{need.name}</div>
                  <i class="heart-icon"><FavoriteIcon/></i>
                </div>
                <div className="location-vrequired">
                  <div className="location-container gray-text">
                    <LocationOnOutlinedIcon style={{ fontSize: 15 }} />
                    <span>Chennai</span>
                  </div>
                  <div className="required-container gray-text">
                    <PeopleIcon style={{ fontSize: 15 }} />
                    <span>Required</span>
                  </div>
                </div>
                <div className="calendar-container gray-text">
                  <i><CalendarTodayOutlinedIcon style={{ fontSize: 15 }} /></i>
                  <span> 10, Jul 2023 | 10AM </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
        {showPopup && (
          <NeedPopup
            open={showPopup}
            onClose={handlePopupClose}
            need={selectedNeed}
          />
        )}
        </div>
    </div>
  );
}

export default VolunteerNeeds;