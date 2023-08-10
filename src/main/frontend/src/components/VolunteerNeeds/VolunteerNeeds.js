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
// Import the calendar icon from Material Icons

export const VolunteerNeeds = props => {
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null); // State to store the selected need

  useEffect(() => {
  
    /*
    axios.get('http://ecs-integrated-239528663.ap-south-1.elb.amazonaws.com/api/v1/need/?offset=0&limit=10&status=New').
    then (
    response => setData(response.data)    ).catch(function (error) {
    console.log(error)
    }) 
    */  
    
    axios
      .post("http://43.204.25.161:8081/api/v1/Need/search", {
        offset: 0,
        limit: 100,
        filters: {
          needTypeId: {
            eq: props.needTypeId,
          },
        },
      })
      .then((response) => {
        setData(response.data);
        console.log("API response data:", response.data); // Print the data in the console
      })
      .catch((error) => console.log(error));


  }, []);
    

  // axios.get('http://localhost:3031/Need').then(
  //   response => setData(Object.values(response.data))
  // ).catch(function (error) {
  //   console.log(error)
  // })

  const handlePopupOpen = (need) => {
    setSelectedNeed(need); // Store the selected need in the state
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="wrapvolunteer">
      <div className="wrapNeedVol">
        <div className="vHeaderneeds">
          <div className="vSearchNeed">
            <i>
              <SearchIcon />
            </i>
            <input
              type="search"
              name="nsearch"
              placeholder="Search needs"
            ></input>
          </div>
          <div className="vSortNeed">
            <select>
              <option value="" disabled hidden select>
                Sort By
              </option>
              <option value="true">Sort A to Z</option>
              <option value="false">Sort Z to A</option>
            </select>
          </div>
          <div className="vline"></div>
          <div className="toggleView">
            <i className="vGrid">
              <GridOnIcon />
            </i>
            <i className="vList">
              <ListIcon />
            </i>
          </div>
        </div>
      {(!data.length) && <div> No needs under this type</div>}
      { data.length && 
        <div className="needs">
          <div className="needContainer">
            {data.map((need) => (
              <div
                key={need.id}
                className="needBox"
                onClick={() => handlePopupOpen(need)} // Pass the 'need' data to the handler
              >

              <div className="icons-container">
                <FavoriteTwoToneIcon className="favorite-icon"  style={{ fontSize: 17 }} />
                <ShareIcon className="share-icon" style={{ fontSize: 17 }}/>
              </div>
                <h3>{need.name}</h3>
                {/*<p>{need.osid}</p>*/}
                <div className="location-container">
                  <LocationOnOutlinedIcon style={{ fontSize: 15 }} />
                  <p>Chennai</p> {/* Your location text goes here */}
                </div>
                <div className="required-container">
                  <PeopleIcon style={{ fontSize: 15 }} />
                  <p>Required</p>
                </div>
                <div className="calendar-container">
                  <CalendarTodayOutlinedIcon style={{ fontSize: 15 }} />{" "}
                  <p>10, Jul 2023, 10AM</p> {/* Date text */}
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