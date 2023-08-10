import React, {useState, useEffect} from 'react'
import './Needs.css'
//import NeedsList from '../NeedsList/NeedsList'
import RaiseNeed from '../RaiseNeed/RaiseNeed'
import NeedsTable from '../NeedsTable/NeedsTable'
import axios from 'axios'
import ZeroDisplay from '../../assets/noRecords.png';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const Needs = props => {
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

  useEffect(()=> {

    
    /*
  
    axios.get('http://ecs-integrated-239528663.ap-south-1.elb.amazonaws.com/api/v1/need/?offset=0&limit=10&status=New').then (
    response => setDataNew(response.data),
    function (response) {console.log(response.data)}
    ).catch(function (error) {
    console.log(error)
    })
    */

    
    // New Needs
    axios.post('http://43.204.25.161:8081/api/v1/Need/search', {
     "offset": 0,
     "limit": 100,
     "filters": {
     "status": {
     "eq": "New"
     }
   }
   }).then (
   response => setDataNew(response.data),
   function (response) {console.log(response.data)}
   ).catch(function (error) {
   console.log(error)
   })

   //Approved Needs
   axios.post('http://43.204.25.161:8081/api/v1/Need/search', {
     "offset": 0,
     "limit": 100,
     "filters": {
     "status": {
     "eq": "Approved"
     }
   }
   }).then (
   response => setDataApproved(response.data),
   //function (response) {console.log(response.data)}
   ).catch(function (error) {
   console.log(error)
   })
  



   //Total Needs


   //APIs from local server//
   /*axios.get('http://localhost:3031/Need').then(
     response => setData(Object.values(response.data))
   ).catch(function (error) {
     console.log(error)
   })
    */

   //API from firebase
   /*
   axios.get('https://vidyaloka-40f2c-default-rtdb.firebaseio.com/needs.json').then(
     response => setData(Object.values(response.data))
   )
   */
   
  },[]);

  console.log(dataNew)
  const data = [ ...dataNew, ...dataApproved];
  let totalNeeds=0;
  totalNeeds=Object.keys(dataNew).length;

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
      { popUp && <RaiseNeed handleClose={togglePopup} /> }  
    </div>
  )
}

export default Needs;

