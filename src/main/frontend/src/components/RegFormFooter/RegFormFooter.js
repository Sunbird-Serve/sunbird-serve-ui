import React from 'react'
import './RegFormFooter.css'
import SBBlueLogo from '../../sunbirdBlueLogo.png'
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
function RegFormFooter() {
  return (
    <div className='footerFull'>
        
        <div className='footer'>
          <img className='footerLogo' src={SBBlueLogo} alt="SunBirdLogo" width="150px" />
          <div className='footerText'>
            Sunbird Serve building block can enable efficient volunteer interactions that add significant value to society and overall human development. It enables relevant actors to crowdsource volunteers for their needs and participate in interactions towards realization of the value.
          </div>
          <div className='footerNav1'>
            <span className='footerOption'>ABOUT US</span>
            <span className='footerOption'>TERMS & CONDITIONS</span>
            <span className='footerOption'>PRIVACY POLICY</span>
            <span className='footerOption'>CONTACT US</span>
          </div>
          <div className='footerNav2'>
            <span className='footerOption'>Follow us on: </span>
            <span className='footerOption'><TwitterIcon /></span>
            <span className='footerOption'><InstagramIcon /></span>
            <span className='footerOption'><LinkedInIcon /></span>
          </div>
        </div>
        <div className='footerEnd'>
            <span>© Sunbird. All rights reserved.</span>
        </div>
      </div>
  )
}

export default RegFormFooter
