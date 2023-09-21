import React, {useState, useEffect} from 'react'
import './Needs.css'
import NeedsTable from '../NeedsTable/NeedsTable'
import ZeroDisplay from '../../assets/noRecords.png';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router'

const Needs = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  //get userId from store
  const userId = useSelector((state)=> state.user.data.osid)
  //get needCount from store
  const needsCount = useSelector((state)=> state.needbyuid.data.length)
  //go to raise need on click
  const gotoRaiseNeed = e => {
    history.push('/raiseneed')
  }

  return (
    <div className="wrapNeedsContent"> 
      <div className="needsList">
        { needsCount ?  
          //when needs number is non-zero, open needs in table
          <div className="needTable">
            {/*<NeedsTable statusPopup={togglePopup} dataNeed={data} tab={activeTab} /> */}
            <NeedsTable /> 
          </div>
        : 
          /* when zero needs, display no needs to display page*/
          <div className="zeroNeed">  
            <img src={ZeroDisplay} alt="SunBirdLogo" width="120px" />
            <div className="headZeroNeed">No Needs to display</div>
            <div className="textZeroNeed">Get started by raising needs and appoint volunteers</div>
            <button onClick={gotoRaiseNeed}>Raise Need <ArrowRightIcon/></button> 
          </div>
        }
      </div> 
    </div>
  )
}

export default Needs;