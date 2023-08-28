import React, { useEffect, useState } from 'react'
import './VolunteerProfileNominations.css'
import VolunteerNeedsNominated from '../../assets/needsNominated.png';
import VolunteerNeedsApproved from '../../assets/needsApproved.png';
import VolunteerNeedsInProgress from '../../assets/needsInProgress.png';
import VolunteerPlansDelivered from '../../assets/plansDelivered.png';
import VolunteerHrs from '../../assets/volunteerHrs.png';
import axios from 'axios'
import NeedsImage from '../../assets/tempNeedsImage.png'
import VolunteerProfileDeliverable from '../VolunteerProfileDeliverables/VolunteerProfileDeliverable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function VPNominations() {
  const [activeTab, setActiveTab] = useState('tabN');
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }

  const [nominations,setNominations] = useState([])

  useEffect(()=> {

  axios.get('http://localhost:3031/Nomination').then(
    response => setNominations(Object.values(response.data))
   ).catch(function (error) {
     console.log(error)
  })
},[])

const [fullDetails, setFullDetails] = useState(false)
const handleDetail = () => {
  setFullDetails(!fullDetails)
}

  return (
    <div>

      {!fullDetails &&<>
      <div className="headerVPNoms">
        <div className="titleVPNoms"> Nominations</div>
        <div className="tagVPNoms">Check your nominations and metrics</div>
      </div>
      <div className="statsVPNoms">
        <div className="statsVPNomsItem">
          <div className="statsVPNomsCount">
            <img src={VolunteerNeedsNominated} alt="Nominated Needs" height="35px" />
            <span>24</span>
          </div>
          <div className="statsVPNomsName">Needs Nominated</div>
        </div>
        <div className="statsVPNomsItem">
          <div className="statsVPNomsCount">
            <img src={VolunteerNeedsApproved} alt="Approved Needs" height="35px" />
            <span>6</span>
          </div>
          <div className="statsVPNomsName">Needs Approved</div>
        </div>
        <div className="statsVPNomsItem">
          <div className="statsVPNomsCount">
            <img src={VolunteerNeedsInProgress} alt="Needs In Progress" height="35px" />
            <span>8</span>
          </div>
          <div className="statsVPNomsName">Needs In Progress</div>
        </div>
        <div className="statsVPNomsItem">
          <div className="statsVPNomsCount">
            <img src={VolunteerPlansDelivered} alt="Nominated Needs" height="35px" />
            <span>120</span>
          </div>
          <div className="statsVPNomsName">Total Volunteer Hrs</div>
        </div>
        <div className="statsVPNomsItem">
          <div className="statsVPNomsCount">
            <img src={VolunteerHrs} alt="Nominated Needs" height="35px" />
            <span>120</span>
          </div>
          <div className="statsVPNomsName">Total Plans Delivered</div>
        </div>
      </div>
      <div className="vnomTabs">
        <div className={`${activeTab === 'tabN' ? 'VNomTabN selectedVNomTab' : 'VNomTabN'}`} onClick={() => handleTabClick('tabN')}>Nominated</div>
        <div className={`${activeTab === 'tabP' ? 'VNomTabP selectedVNomTab' : 'VNomTabP'}`} onClick={() => handleTabClick('tabP')}>In Progress</div>
        <div className={`${activeTab === 'tabR' ? 'VNomTabR selectedVNomTab' : 'VNomTabR'}`} onClick={() => handleTabClick('tabR')}>Requested</div>
        <div className={`${activeTab === 'tabA' ? 'VNomTabA selectedVNomTab' : 'VNomTabA'}`} onClick={() => handleTabClick('tabA')}>Approved</div>
      </div>

      <div className="nomination-grid">
      {nominations.map(nomination => (
        <div key={nomination.id} className="nomination-item">
          <img src={NeedsImage} alt="Nominated Needs" height="120px" />
          <div className="needItemVolunteer">
            <p className="needNameVP">{nomination.needName}</p>
            <button className="viewFull" onClick={() => handleDetail()}>View full details</button>
          </div>
        </div>
      ))}
      </div>
    </> }
    {fullDetails && <div>
      <button className="backBtnVDeliverable" onClick={() => handleDetail()}>
        <ArrowBackIcon />
        Back
      </button>
      <VolunteerProfileDeliverable />
      </div>
      }
    </div>
  )
}

export default VPNominations