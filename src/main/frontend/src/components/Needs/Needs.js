import React, {useState, useEffect} from 'react'
import './Needs.css'
import RaiseNeed from '../RaiseNeed/RaiseNeed'
import NeedsTable from '../NeedsTable/NeedsTable'
import axios from 'axios'
import ZeroDisplay from '../../assets/noRecords.png';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import configData from './../../configData.json'
import {auth} from '../../firebase.js'


const Needs = props => {
  console.log('sunbird repo updated on 21Aug 2023 13:01 PM')
  const [popUp, setPopup] = useState(false);
  const togglePopup = () => {
    setPopup(!popUp)
  }
  const [dataNew,setDataNew] = useState([]);
  const [dataApproved,setDataApproved] = useState([]);
  const [staus, setStatus ] = useState('all')
  const [activeTab, setActiveTab] = useState('all');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }

  const currentUser = auth.currentUser;
  

  const [data, setData] = useState([]);
  const [userId, setUserId] = useState('')

  useEffect(() => {
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
  }, [currentUser.email, userId]);


  useEffect(() => {
  
    const fetchData = async () => {
      try {
        const newNeedsResponse = axios.get(`${configData.NEED_BY_USER}/${userId}?page=0&size=10&status=New`);
        const approvedNeedsResponse = axios.get(`${configData.NEED_BY_USER}/${userId}?page=0&size=10&status=Approved`);
  
        const [newNeeds, approvedNeeds] = await Promise.all([newNeedsResponse, approvedNeedsResponse]);
  
        setDataNew(newNeeds.data.content);
        setDataApproved(approvedNeeds.data.content);
        setData([...newNeeds.data.content, ...approvedNeeds.data.content]);
      } catch (error) {
        console.log("Error fetching needs:", error);
      }
    };
  
    fetchData();
    console.log(data)
  }, [userId]);

  let totalNeeds=0;
  totalNeeds=Object.keys(data).length;

  return (
    <div className="wrapNeedsContent"> 
      <div className="needsList">
        { totalNeeds ?  //when needs number is non-zero, open needs in table
          <div className="needTable">
            <div className="needBar">
              <div className="needMenu">
                  <div className={`tabNeed ${activeTab === 'all' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('all')}>All</div>
                  <div className={`tabNeed ${activeTab === 'approved' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('approved')}>Approved</div>
                  <div className={`tabNeed ${activeTab === 'requested' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('requested')}>Requested</div>
              </div>
              <button onClick={togglePopup}>Raise Need</button>
            </div>
            <NeedsTable statusPopup={togglePopup} dataNeed={data} tab={activeTab} /> 
          </div>
        : 
          /* when zero needs, display no needs to display page*/
          <div className="zeroNeed">  
            <img src={ZeroDisplay} alt="SunBirdLogo" width="120px" />
            <div className="headZeroNeed">No Needs to display</div>
            <div className="textZeroNeed">Get started by raising needs and appoint volunteers</div>
            <button onClick={togglePopup}>Raise Need <ArrowRightIcon/></button>  
          </div>
        }
      </div> 
      {/* Open Raise Need popoup  */}
      { popUp && <RaiseNeed handleClose={togglePopup} uId={userId} /> }  
    </div>
  )
}

export default Needs;