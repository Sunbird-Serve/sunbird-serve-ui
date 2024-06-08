import React, {useState} from 'react'
import './VolunteerDetails.css'
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import axios from 'axios'
import { fetchUserList } from "../../state/userListSlice";
import { useDispatch } from 'react-redux'



const VolunteerDetails = props => {
    const dispatch = useDispatch()
    const userDetails = props.data.userDetails;
    const userProfile = props.data.userProfile;
    // console.log(props.data)

    const handleVStatus = (newStatus) => {
        const userToPost = { ...userDetails }
        delete userToPost.osid
        delete userToPost.osCreatedAt
        delete userToPost.osCreatedBy
        delete userToPost.osOwner
        delete userToPost.osUpdatedAt
        delete userToPost.osUpdatedBy
        userToPost.status = newStatus
        console.log(userDetails.osid)
        console.log(userToPost)
        axios.put(`https://serve-v1.evean.net/api/v1/serve-volunteering/user/${userDetails.osid}`, userToPost)
        .then(response => {
            console.log('API response:', response.data);
            dispatch(fetchUserList())
        })
        .catch(error => {
            console.error('API error:', error);
        });
    }

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
                {userDetails.status === 'Registered' && <button onClick={()=>handleVStatus('Recommended')}>Recommend</button>}
                {userDetails.status === 'Registered' && <button onClick={()=>handleVStatus('OnHold')}>On Hold</button>}
                {userDetails.status === 'Recommended' && <button onClick={()=>handleVStatus('OnBoarded')}>On Boarded</button>}
                {userDetails.status === 'OnBoarded' && <button onClick={()=>handleVStatus('Active')}> Make Active</button>}
                {userDetails.status === 'Register' && <button onClick={()=>handleVStatus('Registered')}>Register</button>}
            </div>
        </div>
        <div className="btnCloseVDetails">
            <button onClick={props.handleClose}>x</button>
        </div>
    </div>
  )
}

export default VolunteerDetails