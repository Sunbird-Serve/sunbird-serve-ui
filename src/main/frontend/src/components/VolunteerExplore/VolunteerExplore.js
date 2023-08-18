import React, { useState, useEffect } from 'react'
import './VolunteerExplore.css'
import {auth} from '../../firebase.js'
import axios from 'axios'
import SearchIcon from '@mui/icons-material/Search';
import GridOnIcon from '@mui/icons-material/GridOn';
import ListIcon from '@mui/icons-material/List';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import VolunteerNeeds from '../VolunteerNeeds/VolunteerNeeds';
import NeedTypeLogo from '../../assets/phNeedType.png'
import configData from './../../configData.json'

function VolunteerExplore() {
  const [ntypeData,setNtypeData] = useState([])   //for storing need types
  const [sortedNTs,setSortedNTs] = useState([])   //after sorting need types
  const [needsCount, setNeedsCount ] = useState([])  //store count of needs under each type
  const [countFetched, setCountFetched] = useState(false)  //status of counting needs

  //fetch need types
  useEffect(()=> {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${configData.NEEDTYPE_GET}/?page=0&size=10&status=New`);
        setNtypeData(response.data.content); 
      } catch (error) {
        console.error('Error fetching ntypeData:', error);
      }
    };
    fetchData();
  },[]);

  //sort the fetched need types
  useEffect(()=> {
    const sortedList = [...ntypeData].sort((a,b)=>a.name.localeCompare(b.name));
    setSortedNTs(sortedList)
  },[ntypeData]);

  //count needs under each type
  useEffect(() => {
    const fetchNeedsCountForItem = async (item) => {    
      try {
        const needTypeId='3af122b5-2907-40e1-a3ed-c432e336c1b9'
        const response = await axios.get(`${configData.NEED_BY_TYPE}/${item.id}?page=0&size=10&status=New`)
        const numberOfNeeds = response.data.content.length;
        console.log(numberOfNeeds)
        setNeedsCount(prevNeedsCount => ({
          ...prevNeedsCount,
          [item.id]: numberOfNeeds,
        })) 
      } catch (error) {
        console.error('Error fetch needs count',Error)
      }
    };
    ntypeData.forEach(item => {
        fetchNeedsCountForItem(item)
    })
    setCountFetched(true)
  },[ntypeData])

  const [sortRev, setSortRev] = useState('')
  const handleSort = (e) => {
    setSortRev(e.target.value);
    console.log(sortRev)
    setSortedNTs(sortedNTs.reverse())
  };

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
     
  const [ needsList,setNeedsList ] = useState(false)
  const [ selectedNeedTypeId, setSelectedNeedTypeId ] = useState(null)

  const handleNTClick = (typeId) => {
    setNeedsList(true)
    setSelectedNeedTypeId(typeId)
  }
 
  return (
    <div className="wrapVolunteer">
      {/* display need types (NTs) when needList is unset*/}
      {!needsList && (
      <div className="vNeedType">
        {/* Header */}
        <div className="vHeader">
          <div className="vleftHeader">
            <div className="vGreetNT">Welcome Back, </div> {/* auth.currentUser.displayName */}
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
        {/* List of need types in grid view */}
        <div className="wrapAllNT">
          {Object.entries(groupedNTs).map(
            ([firstAlphabet, groupedList]) => (
              <div key={firstAlphabet} className="wrapGrid">
                <div className="alphabetNT">{firstAlphabet}</div>
                {groupedList.map((item) => ( 
                  <div key={item.name} className="gridItem" onClick={() => handleNTClick(item.id)}>
                    <div className="imgGridNT">
                      <img src={NeedTypeLogo} alt="SunBirdLogo" height="118px" />
                    </div>
                    {item.name}
                    <div className="numNeedsNT">
                      <i><StickyNote2Icon style={{height:"12px"}} /></i>
                      <span>
                        {needsCount[item.id] } Needs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )) 
          }
        </div>
      </div>    
      )}
    {needsList && <VolunteerNeeds needTypeId={selectedNeedTypeId}/>}
    </div>
  )

}

export default VolunteerExplore