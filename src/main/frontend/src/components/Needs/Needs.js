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
    axios.post('http://43.204.25.161:8081/api/v1/Need/search', {
      "offset": 0,
      "limit": 100,
      "filters": {
      "status": {
      "eq": "New"
      }
    }
    }).then (
    response => setData(response.data),
    () => console.log('data fetched')
    //function (response) {console.log(response.data)}
    ).catch(function (error) {
    console.log(error)
    })
  }

  const [data,setData] = useState({});
  const [staus, setStatus ] = useState('all')

  useEffect(()=> {
     axios.post('http://43.204.25.161:8081/api/v1/Need/search', {
      "offset": 0,
      "limit": 100,
      "filters": {
      "status": {
      "eq": "Approved"
      }
    }
    }).then (
    response => setData(response.data),
    //function (response) {console.log(response.data)}
    ).catch(function (error) {
    console.log(error)
    })
    
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
  let totalNeeds=0;
  totalNeeds=Object.keys(data).length;

  

  const [activeTab, setActiveTab] = useState('tab1');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }

  return (
    <div className="wrapNeedsContent"> 
      <div className="needs">
        { totalNeeds ?  //when needs number is non-zero, open needs in table
          <div className="needTable">
            <div className="needBar">
              <div className="needMenu">
                  <div className={`tabNeed ${activeTab === 'tab1' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('tab1')}>All</div>
                  <div className={`tabNeed ${activeTab === 'tab2' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('tab2')}>Approved</div>
                  <div className={`tabNeed ${activeTab === 'tab3' ? 'activeNTab' : ''}`} onClick={() => handleTabClick('tab3')}>Requested</div>
              </div>
              <button onClick={togglePopup}>Raise Need</button>
            </div>
            <NeedsTable statusPopup={togglePopup} dataNeed={data} /> 
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

