import React, {useState} from 'react'
import './Needs.css'
import NeedsList from '../NeedsList/NeedsList'
import RaiseNeed from '../RaiseNeed/RaiseNeed'


function Needs() {
  const [popUp, setPopup] = useState(false);
  const togglePopup = () => {
    setPopup(!popUp)
  }
          
  return (
    <div className="wrapNeeds"> 
      <div className="needs">
        <div className="needBar">
          <div className="needMenu">
            <ul className="needMenulist">
              <li>All</li>
              <li>Approved</li>
              <li>Requested</li>
            </ul>
            <button onClick={togglePopup}>Raise Need</button>
          </div>
        </div>
        <NeedsList statusPopup={togglePopup} />
      </div>
      { popUp && <RaiseNeed handleClose={togglePopup} /> }
    </div>
  )
}

export default Needs
