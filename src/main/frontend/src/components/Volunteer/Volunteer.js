import React, { useState, useEffect } from 'react'
import './Volunteer.css'
import {auth} from '../../firebase.js'
import axios from 'axios'
import SearchIcon from '@mui/icons-material/Search';
import GridOnIcon from '@mui/icons-material/GridOn';
import ListIcon from '@mui/icons-material/List';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';

function Volunteer() {
  const [ntypeData,setNtypeData] = useState([])
  const [sortedNTs,setSortedNTs] = useState([])

  useEffect(()=> {
    axios.get('http://localhost:3031/NeedType').then (
      response => setNtypeData(Object.values(response.data)),
      //function (response) {console.log(response.data)}
      ).catch(function (error) {
      console.log(error)
    })
  },[]);
  useEffect(()=> {
    const sortedList = [...ntypeData].sort((a,b)=>a.name.localeCompare(b.name));
    setSortedNTs(sortedList)
  },[ntypeData]);
  
  const [sortRev, setSortRev] = useState('')
  const handleSort = (e) => {
    setSortRev(e.target.value);
    console.log(sortRev)
    setSortedNTs(sortedNTs.reverse())
  };
  console.log(sortedNTs.length)

  const groupByFirstAlphabet = (data) => {
    const groupedData = {};
    data.forEach((item) => {
      const firstAlphabet = item.name[0].toUpperCase();
      if(!groupedData[firstAlphabet]){
        groupedData[firstAlphabet] = [];
      }
      groupedData[firstAlphabet].push(item);
    });
    return groupedData;
  };

    const groupedNTs = groupByFirstAlphabet(sortedNTs);
    console.log(groupedNTs)
     
 

  return (
    <div className="wrapVolunteer">
      <div className="vNeedType">
        <div className="vHeader">
          <div className="vleftHeader">
            <div className="vGreetNT">Welcome Back, {auth.currentUser.displayName}</div>
            <div className="vTitleNT">Volunteer Need Type </div>
            <div className="vCaptionNT">Select a need type to view needs </div>
          </div>
          <div className="vrightHeader">
            <div className="vSearchNT">
              <i><SearchIcon /></i>
              <input type="search" name="nsearch" placeholder="Search need type" ></input>
              
            </div>
            <div className="vSortNT">
              <select value={sortRev} onChange={handleSort}>
                <option value="" disabled hidden select>Sort By</option>
                <option value="true">Sort A to Z</option>
                <option value="false">Sort Z to A</option>
              </select>
            </div>
            <div className="vline"></div>
            <div className="toggleView">
              <i className="vGrid"><GridOnIcon /></i>
              <i className="vList"><ListIcon /></i>
            </div>
          </div>
        </div>
          
        <div className="wrapAllNT">
          {Object.entries(groupedNTs).map(
            ([firstAlphabet, groupedList]) => (
              <div key={firstAlphabet} className="wrapGrid">
                <h4>{firstAlphabet}</h4>
                {groupedList.map((item) => ( 
                  <div key={item.name} className="gridItem">
                    <div className="imgGridNT"></div>
                    {item.name}
                    <div className="numNeedsNT">
                      <i><StickyNote2Icon /></i>
                      Needs
                    </div>
                  </div>
                ))}
              </div>
            )) 
          }

        </div>
      </div>    
    </div>
  )
}

export default Volunteer
