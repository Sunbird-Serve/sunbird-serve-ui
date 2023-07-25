import React, {useState, useEffect} from 'react'
import './Needs.css'
//import NeedsList from '../NeedsList/NeedsList'
import RaiseNeed from '../RaiseNeed/RaiseNeed'
import NeedsTable from '../NeedsTable/NeedsTable'
import axios from 'axios'
import ZeroDisplay from '../../zerodisplay.png';


function Needs() {
  const [popUp, setPopup] = useState(false);
  const togglePopup = () => {
    setPopup(!popUp)
  }

  const [data,setData] = useState({});
  useEffect(()=> {
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
      //function (response) {console.log(response.data)}
      ).catch(function (error) {
      console.log(error)
    })
    
    //APIs from local server//
    /*axios.get('http://localhost:3031/Need').then(
      response => setDataNeed(Object.values(response.data))
    ).catch(function (error) {
      console.log(error)
    })
    */

  },[]);
  let totalNeeds=0;
  totalNeeds=Object.keys(data).length;
          
  return (
    <div className="wrapNeedsContent"> 
      <div className="needs">
        
        { totalNeeds ?  //when needs number is non-zero, open needs in table
          <div className="needTable">
            <div className="needBar">
              <div className="needMenu">
                  <li>All</li>
                  <li>Approved</li>
                  <li>Requested</li>
              </div>
              <button onClick={togglePopup}>Raise Need</button>
            </div>
            <NeedsTable statusPopup={togglePopup} dataNeed={data} /> 
          </div>
        : 
          <div className="zeroNeed">  {/* when zero needs, so no needs to display page*/}
            <img src={ZeroDisplay} alt="SunBirdLogo" width="150px" />
            <div className="headZeroNeed">No Needs to display</div>
            <div className="textZeroNeed">Get started by adding a Need and Entity</div>
            <button onClick={togglePopup}>Raise Need</button>  
          </div>
        }
      </div> 
      {/* Open Raise Need popoup  */}
      { popUp && <RaiseNeed handleClose={togglePopup} /> }  
    </div>
  )
}

export default Needs;

