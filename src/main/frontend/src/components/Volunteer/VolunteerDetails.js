import React from 'react'
import './VolunteerDetails.css'
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'

const VolunteerDetails = props => {
  return (
    <div className="wrapVolunteerDetails">
        <div className="volunteerDetails">
            <div className="header-volunteerDetails">
                <div className="avatar-vInfo">
                    <Avatar style={{height:'40px',width:'40px',fontSize:'16px',backgroundColor:randomColor()}} />
                </div>
                <div className="nameEmail-vInfo">
                    <div className="volunteer-name">Raviteja</div>
                    <div className="volunteer-email">raviteja@egurukulapps.com</div>
                </div>
                <div className="status-vInfo"></div>
            </div>
            <div className="title-volunteerinfo">VOLUNTEER INFO</div>
            <div className="volunteerInfo">
                <div className="vInfo-half">
                    <div className="vInfo-item">
                        <div className="vInfo-key">Name</div>
                        <div className="vInfo-value">Raviteja</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Email ID</div>
                        <div className="vInfo-value">raviteja@egurukulapps.com</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Gender</div>
                        <div className="vInfo-value">Male</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">City</div>
                        <div className="vInfo-value">Chennai</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Qualifications</div>
                        <div className="vInfo-value">Bachelodrs of Engineering</div>
                    </div>
                </div>
                <div className="vInfo-half">
                    <div className="vInfo-item">
                        <div className="vInfo-key">Affiliation</div>
                        <div className="vInfo-value">Egurukul</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Years of Experience</div>
                        <div className="vInfo-value">4</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Reference Channel</div>
                        <div className="vInfo-value">Friends</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Skills</div>
                        <div className="vInfo-value">Cleanig, Leadership</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Consent</div>
                        <div className="vInfo-value">Yes</div>
                    </div>
                </div>
            </div>
            <div className="recommend-voluteer">
                <button>Recommend</button>
                <button>Not Recommend</button>
                <button>Hold</button>
            </div>
        </div>
        <div className="btnCloseVDetails">
                <button onClick={props.handleClose}>x</button>
        </div>
    </div>
  )
}

export default VolunteerDetails