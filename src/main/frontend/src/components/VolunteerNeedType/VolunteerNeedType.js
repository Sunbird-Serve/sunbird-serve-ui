import React, { useState, useEffect } from 'react'
import './VolunteerNeedType.css'
import axios from 'axios'
import SearchIcon from '@mui/icons-material/Search';
import GridOnIcon from '@mui/icons-material/GridOn';
import ListIcon from '@mui/icons-material/List';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import VolunteerNeeds from '../VolunteerNeeds/VolunteerNeeds';
import configData from '../../configData.json'
import ntypeImage01 from '../../assets/content_development.png'
import ntypeImage02 from '../../assets/field_activity.png'
import ntypeImage03 from '../../assets/mentoring.png'
import ntypeImage04 from '../../assets/online_teaching.png'



function VolunteerNeedType() {
  const [ntypeData,setNtypeData] = useState([])   //for storing need types
  const [sortedNTs,setSortedNTs] = useState([])   //after sorting need types
  const [needsCount, setNeedsCount ] = useState([])  //store count of needs under each type
  const [countFetched, setCountFetched] = useState(false)  //status of counting needs

  //fetch need types
  useEffect(()=> {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${configData.NEEDTYPE_GET}/?page=0&size=100&status=Approved`);
        setNtypeData(response.data.content); 
      } catch (error) {
        console.error('Error fetching ntypeData:', error);
      }
    };
    fetchData();
  },[]);

  //sort the fetched need types
  const sortedList = [...ntypeData].sort((a,b)=>a.name.localeCompare(b.name));
  

  //filter the sorted need types
  const [searchQueryNT, setSearchQueryNT] = useState('')

  const handleSearchChange = (event) => {
    setSearchQueryNT(event.target.value)
  }
  const filteredNTs =  sortedList.filter(item => {
    return item.name.toLowerCase().includes(searchQueryNT.toLowerCase())
  })

  useEffect(()=> {
    setSortedNTs(filteredNTs)
  },[ntypeData, searchQueryNT]);

  //count needs under each type
  useEffect(() => {
    const fetchNeedsCountForItem = async (item) => {    
      try {
        const responseNew = await axios.get(`${configData.NEED_BY_TYPE}/${item.id}?page=0&size=100&status=New`)
        const responseNominated = await axios.get(`${configData.NEED_BY_TYPE}/${item.id}?page=0&size=100&status=Nominated`)
        const responseApproved = await axios.get(`${configData.NEED_BY_TYPE}/${item.id}?page=0&size=100&status=Approved`)
        const responseRejected = await axios.get(`${configData.NEED_BY_TYPE}/${item.id}?page=0&size=100&status=Rejected`)
        const numberOfNeeds = responseNew.data.content.length+responseNominated.data.content.length+responseApproved.data.content.length+responseRejected.data.content.length;
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
  const [ nTypeName, setNTypeName ] = useState('')

  const handleNTClick = (typeId, typeName) => {
    setNeedsList(true)
    setSelectedNeedTypeId(typeId)
    setNTypeName(typeName)
  }

  const updateNeedList = (status) => {
    setNeedsList(status)
  }

  const [activeView, setActiveView] = useState('grid');
  const handleView = (tab) => {
    setActiveView(tab);
  }

  const imageMap = {
    'Content Development': ntypeImage01,
    'Field Activity': ntypeImage02,
    'Mentoring': ntypeImage03,
    'Online Teaching': ntypeImage04
  }
 
  return (
    <div className="wrapVolunteer">
      {/* display need types (NTs) when needList is unset*/}
      {!needsList && (
      <div className="vNeedType">
        {/* Header */}
        <div className="vNtypesHeader">
            <div className="vGreetNT"> </div> {/* auth.currentUser.displayName */}
            <div className="vTitleNT">Explore Opportunities </div>
            <div className="vCaptionNT">Select a need type to view needs </div>

        </div>
        <div className="vfilterHeader">
            <div className="vSortNT">
              <select value={sortRev} onChange={handleSort}>
                <option value="" disabled hidden select>Sort By</option>
                <option value="true">Sort A to Z</option>
                <option value="false">Sort Z to A</option>
              </select>
            </div>
            <div className="vSearchNT">
              <i><SearchIcon /></i>
              <input type="text" name="searchQueryNT" placeholder="Search need type" value={searchQueryNT} onChange={handleSearchChange} ></input>
              
            </div>
            <div className="toggleView">
              <button className={`${activeView === 'grid' ? 'activeView' : 'viewNT'}`} onClick={() => handleView('grid')}>
                <i><GridOnIcon style={{height:"20px"}}/></i> <span>Grid View</span>
              </button>
              <button className={`${activeView === 'list' ? 'activeView' : 'viewNT'}`} onClick={() => handleView('list')}>
                <i className="vList"><ListIcon /></i><span>List View</span>
              </button>
            </div>
          </div>
        {/* List of need types in grid view */}
        <div className="wrapAllNT">
          {Object.entries(groupedNTs).map(
            ([firstAlphabet, groupedList]) => (
              <div key={firstAlphabet} className="wrapGrid">
                {/* <div className="alphabetNT">{firstAlphabet}</div> */}
                {groupedList.map((item) => ( 
                  <div key={item.name} className="gridItem" onClick={() => handleNTClick(item.id, item.name)}>
                    <div className="imgGridNT">
                      <img src={imageMap[item.name]} alt="SunBirdLogo" height="118px" />
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
    {needsList && <VolunteerNeeds needTypeId={selectedNeedTypeId} nTypeName={nTypeName} updateNeedList={updateNeedList} />}
    </div>
  )

}

export default VolunteerNeedType