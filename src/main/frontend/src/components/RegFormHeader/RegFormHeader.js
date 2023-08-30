import React from 'react'
import './RegFormHeader.css'
import SBLogo from '../../clogo.jpg';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';

function RegFormHeader() {
  return (
    <div className='headerBar'>
        <img className='headerLogo' src={SBLogo} alt="SunBirdLogo" width="150px" />
        <div className='headerSearch'>
            <SearchIcon className='headerSearchIcon'/>
            <input className='headerSearchInput' type='text'/>
            <select className="selectSearch" defaultValue="NeedsType">
              <option value="NeedPlans">NeedPlans</option>
              <option value="Volunteers">Volunteers</option>
            </select>
        </div>
        <div className='headerNav'>
            <div className='headerNavOption'>
                <LocationOnIcon/>
                <select className="selectCity" defaultValue="Chennai">
                  <option value="Bangalore">Bangalore</option>
                  <option value="Coimbatore">Coimbatore</option>
                </select>
            </div>
            <div className='headerNavOption'>
                <NotificationsIcon />
            </div>
            <div className='headerNavOption'>
                <span className='profileInitial'>MR</span>
            </div>
        </div>
      </div>
  )
}

export default RegFormHeader
