import React from 'react'
import './VolunteerFooter.css'
import SunBirdLogo from '../../assets/logoInFooter.png'
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function VolunteerFooter() {
  return (
    <div className='wrapFooter'>
        <div className="contentFooter col-sm-8">
            <img src={SunBirdLogo} alt="SunBirdLogo" height="40px" />
            <p>
                Sunbird Serve building block can enable efficient volunteer interactions that add significant
                value to society and overall human development. It enables relevant actors to crowdsource
                volunteers for their needs and participate in interactions towards realization of the value.
            </p>
            <div className="wrapFooterTabs">
                <div className="footerTab">ABOUT US</div>
                <div className="footerTab">TERMS&CONDITIONS</div>
                <div className="footerTab">PRIVACY POLICY</div>
                <div className="footerTab">CONTACT US</div>
            </div>
            <div className="footerIcons">
                <span>Follow us on: </span>
                <i><TwitterIcon style={{backgroundColor:"white",color:"#003953",borderRadius:"50%",height:"25px",width:"25px",padding:"5px",marginLeft:"10px"}} /></i>
                <i><InstagramIcon style={{backgroundColor:"white",color:"#003953",borderRadius:"50%",height:"25px",width:"25px",padding:"5px",marginLeft:"10px"}} /></i>
                <i><LinkedInIcon style={{borderRadius:"50%",height:"32px",width:"42px"}} /></i>
            </div>
        </div>
        <div className="copyright">&copy; Sunbird. All rights reserved.</div>
    </div>
  )
}

export default VolunteerFooter