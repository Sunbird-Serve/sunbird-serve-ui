import React, { useState, useEffect } from "react";
import "./VolunteerNeeds.css"; // Import the CSS file
import SearchIcon from "@mui/icons-material/Search";
import GridOnIcon from "@mui/icons-material/GridOn";
import ListIcon from "@mui/icons-material/List";
import NeedPopup from "./NeedPopup"; // Import the NeedPopup component
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"; // Import the location icon from Material Icons
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"; 
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux'
import DateRangeIcon from '@mui/icons-material/DateRange';

export const VolunteerNeeds = props => {
  const needList = useSelector((state) => state.need.data);
  const dataNeeds = needList.filter(item => item && item.need && item.need.needTypeId === props.needTypeId && (item.need.status === 'Approved'));
  const [searchQueryNeed, setSearchQueryNeed] = useState('');
  
  const handleSearchChange = (event) => {
    setSearchQueryNeed(event.target.value);
  };
  
  const dataNotSorted = dataNeeds.filter(item => {
    const needNameMatches = item.need.name.toLowerCase().includes(searchQueryNeed.toLowerCase());
    const entityNameMatches = item.entity && item.entity.name && item.entity.name.toLowerCase().includes(searchQueryNeed.toLowerCase());
    return needNameMatches || entityNameMatches;
  });

  const [sortingOrder, setSortingOrder] = useState('ascending');
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Clone the needList to avoid modifying the original array
    const sortedList = [...dataNotSorted];

    // Separate items into two lists: one with occurrence as null and another with non-null occurrence
    const itemsWithOccurrence = sortedList.filter(item => item.occurrence !== null);
    const itemsWithNullOccurrence = sortedList.filter(item => item.occurrence === null);

    // Sort the list with non-null occurrence based on the selected sorting order
    if (sortingOrder === 'ascending') {
      itemsWithOccurrence.sort((a, b) => new Date(a.occurrence.startDate) - new Date(b.occurrence.startDate));
    } else {
      itemsWithOccurrence.sort((a, b) => new Date(b.occurrence.startDate) - new Date(a.occurrence.startDate));
    }

    // Concatenate the two lists based on where you want to place items with null occurrence
    let finalSortedList = [];
    if (sortingOrder === 'ascending') {
      finalSortedList = itemsWithOccurrence.concat(itemsWithNullOccurrence);
    } else {
      finalSortedList = itemsWithNullOccurrence.concat(itemsWithOccurrence);
    }

    setData(finalSortedList);
  }, [sortingOrder, searchQueryNeed]);

  const [view, setView] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null); // State to store the selected need
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

  const handlePopupOpen = (need) => {
    setSelectedNeed(need); 
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleBackButton = () => {
    props.updateNeedList(false);
  };

  const truncateString = (str, num) => {
    if (str.length > num) {
      return str.slice(0, num) + '...';
    } else {
      return str;
    }
  };

  return (
    <div className="wrapvolunteerNeeds">
      <div className="volunteerNeeds">
        {/* Back Button */}
        <div className="vHeaderBack">
          <button onClick={handleBackButton}><ArrowBackIcon /></button>
          {props.nTypeName}
        </div>
        {/* Filter bar */}
        <div className="vNeedFilters">  
          <div className="vSortNeed">
            <i className="vSortDateIcon"><DateRangeIcon /></i>
            <select onChange={(e) => setSortingOrder(e.target.value)}>
              <option value="" disabled hidden select>Sort By</option>
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>
          <div className="vSearchNeed">
              <i><SearchIcon /></i>
              <input type="text" name="searchQueryNeed" placeholder="Search needs" value={searchQueryNeed} onChange={handleSearchChange} ></input>
          </div>
          <div className="toggleNeedView">  
              <button className={`${view ? "blueText" : "grayText"}`} onClick={handleToggleGrid}> 
                <i><GridOnIcon style={{fontSize:"14px"}}/></i>
                Grid view 
              </button>
              
              <button className={`${!view ? "blueText" : "grayText"}`} onClick={handleToggleList}>
                <i><ListIcon /></i>
                List view
              </button>
          </div>
        </div>
        {/* Needs List Display */}
      {(!data.length) && <div className="emptyNeedType"> No needs under this type</div>}
      {data.length && 
        <div className="needs">
          <div className="needContainer">
            {data.map((item) => (
              <div key={item.need.id} className="needBox" onClick={() => handlePopupOpen(item)} >
                <div className="need-container-volunteer">
                  <div className="h3-container">{truncateString(item.need.name,20)}</div>
                  <i className="heart-icon"><FavoriteIcon/></i>
                </div>
                <div className="location-container gray-text">
                    <LocationOnOutlinedIcon style={{ fontSize: 15 }} />
                    <span>{(item.entity && item.entity.name) ? item.entity.name : ''}</span>
                </div>
                <div className="location-vrequired">
                  <div className="location-container gray-text">
                    <span>{(item.need && item.need.status) ? item.need.status : ''}</span>
                  </div>
                  <div className="required-container gray-text">
                    <PeopleIcon style={{ fontSize: 15 }} />
                    <span>{(item.needRequirement && item.needRequirement.volunteersRequired) ? item.needRequirement.volunteersRequired : ''}</span>
                  </div>
                </div>
                <div className="calendar-container gray-text">
                  <i><CalendarTodayOutlinedIcon style={{ fontSize: 15 }} /></i>
                  <span> {(item.occurrence && item.occurrence.startDate) ? item.occurrence.startDate.slice(0,10) : ''} </span>
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
