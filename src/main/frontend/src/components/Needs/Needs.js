import React, { useEffect, useState } from 'react'
import './Needs.css'
import NeedsTable from '../NeedsTable/NeedsTable'
import ZeroDisplay from '../../assets/noRecords.png';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router'
import { fetchNeeds } from "../../state/needSlice";
import AttachEntity from '../AttachEntity/AttachEntity';
import { Alert, Snackbar } from '@mui/material';

const Needs = props => {
  const dispatch = useDispatch()
  const [openAttachEntity, setOpenAttachEntity] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackMessage, setSnackMessage] = useState("")
  const [snackSeverity, setSnackSeverity] = useState("")

  const history = useHistory()
  useEffect(()=>{
    dispatch(fetchNeeds());
  },[dispatch])

  //get userId from store
  const userId = useSelector((state)=> state.user.data.osid)
  // console.log(userId)

  //get needCount from store
  const needList = useSelector((state) => state.need.data);
  const needsCount = needList.filter(item => item && item.need && item.need.userId === userId).length
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
            <button className='assign-entity-button' onClick={() => { setOpenAttachEntity(true) }}>Onboard Entity</button>
          </div>
        }
      </div>
      {openAttachEntity && <AttachEntity onClose={() => setOpenAttachEntity(false)} setOpenSnackbar={setOpenSnackbar} setSnackMessage={setSnackMessage} setSnackSeverity={setSnackSeverity} />}

      {openSnackbar && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert severity={snackSeverity} variant="filled">
            {snackMessage}
          </Alert>
        </Snackbar>
      )}
    </div>
  )
}

export default Needs;