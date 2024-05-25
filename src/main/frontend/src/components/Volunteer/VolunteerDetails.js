import React from 'react'
import './VolunteerDetails.css'
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'

const VolunteerDetails = props => {
    const userDetails = props.data.userDetails;
    const userProfile = props.data.userProfile;
    console.log(props.data)

    console.log(userProfile.skills)
    return (
    <div className="wrapVolunteerDetails">
        <div className="volunteerDetails">
            <div className="header-volunteerDetails">
                <div className="avatar-vInfo">
                    <Avatar style={{height:'40px',width:'40px',fontSize:'16px',backgroundColor:randomColor()}} />
                </div>
                <div className="nameEmail-vInfo">
                    <div className="volunteer-name">{userDetails.identityDetails.name}</div>
                    <div className="volunteer-email">{userDetails.contactDetails.email}</div>
                </div>
                <div className="status-vInfo"></div>
            </div>
            <div className="title-volunteerinfo">VOLUNTEER INFO</div>
            <div className="volunteerInfo">
                <div className="vInfo-half">
                    <div className="vInfo-item">
                        <div className="vInfo-key">Name</div>
                        <div className="vInfo-value">{userDetails.identityDetails.name}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Email ID</div>
                        <div className="vInfo-value">{userDetails.contactDetails.email}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Gender</div>
                        <div className="vInfo-value">{userDetails.identityDetails.gender}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">City</div>
                        <div className="vInfo-value">{userDetails.contactDetails.address.city}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Qualifications</div>
                        <div className="vInfo-value">{userProfile.genericDetails.qualification}</div>
                    </div>
                </div>
                <div className="vInfo-half">
                    <div className="vInfo-item">
                        <div className="vInfo-key">Affiliation</div>
                        <div className="vInfo-value">{userProfile.genericDetails.affiliation}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Years of Experience</div>
                        <div className="vInfo-value">{userProfile.genericDetails.yearsOfExperience}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Reference Channel</div>
                        <div className="vInfo-value">{userProfile.referenceChannelId}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Skills</div>
                        <div className="vInfo-value">Cleanig, Leadership</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Consent</div>
                        <div className="vInfo-value">{userProfile.consentDetails.consentGiven ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            </div>
            <div className="recommend-voluteer">
                {userDetails.status === 'Registered' && <button>Recommend</button>}
                {userDetails.status === 'Registered' && <button>On Hold</button>}
                {userDetails.status === 'Recommended' && <button>On Boarded</button>}
                {userDetails.status === 'OnBoarded' && <button>Active</button>}
            </div>
        </div>
        <div className="btnCloseVDetails">
            <button onClick={props.handleClose}>x</button>
        </div>
    </div>
  )
}

export default VolunteerDetails