import React, {useState, useEffect} from 'react'
import './Needs.css'
import NeedsList from '../NeedsList/NeedsList'
import RaiseNeed from '../RaiseNeed/RaiseNeed'
import axios from 'axios'
import ZeroDisplay from '../../zerodisplay.png';


function Needs() {
  const [popUp, setPopup] = useState(false);
  const togglePopup = () => {
    setPopup(!popUp)
    console.log(1)
  }

  const [dataNeed,setDataNeed] = useState([]);
  useEffect(()=> {
    /* axios.post('http://13.126.159.24:8081/api/v1/Need/search', {
      "offset": 0,
      "limit": 100,
      "filters": {
        "status": {
          "eq": "New"
        }
      }
    }).then(
      response => setDataNeed(Object.values(response.data))
      // function (response) {console.log(response.data)}
    ).catch(function (error) {
      console.log(error)
    }) */
    axios.get('http://localhost:3031/Need').then(
      response => setDataNeed(Object.values(response.data))
    ).catch(function (error) {
      console.log(error)
    })

  },[])  
  let totalNeeds=0;
  totalNeeds=Object.keys(dataNeed).length;
          
  return (
    <div className="wrapNeeds"> 
      <div className="needs row">
        { totalNeeds ?
          <div>
            <div className="needBar">
              <div className="needMenu">
                  <li>All</li>
                  <li>Approved</li>
                  <li>Requested</li>
              </div>
              <button onClick={togglePopup}>Raise Need</button>
            </div>
            <NeedsList statusPopup={togglePopup} />       
          </div>
          : 
          <div className="zeroNeed">
            <img src={ZeroDisplay} alt="SunBirdLogo" width="150px" />
            <div className="headZeroNeed">No Needs to display</div>
            <div className="textZeroNeed">Get started by adding a Need and Entity</div>
            <button onClick={togglePopup}>Raise Need</button>  
          </div>
        }
      </div>
      { popUp && <RaiseNeed handleClose={togglePopup} /> } 
    </div>
  )
}

export default Needs

//

//    { popUp && <RaiseNeed handleClose={togglePopup} /> }   

