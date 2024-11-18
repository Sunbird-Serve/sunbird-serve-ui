import React, {useEffect, useState} from 'react'
import './VolunteerDetails.css'
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import axios from 'axios'
import { fetchUserList } from "../../state/userListSlice";
import { useSelector, useDispatch } from 'react-redux'
import DoneIcon from '@mui/icons-material/Done';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const configData = require('../../configure.js');
const VolunteerDetails = props => {
    const dispatch = useDispatch()
    const userDetails = props.data.userDetails;
    const userProfile = props.data.userProfile;
    // console.log(props.data)

    //Need name map with its Id
    const needsList = useSelector((state) => state.need.data);
    const needById = {};
    needsList.forEach(item => {
        if (item && item.need) {
          needById[item.need.id] = item.need.name ;
        }
    })

    //handle Tabclick
    const [activeTab, setActiveTab] = useState('tDetails');
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }

    //Modify the status of volunteer on button click
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
        axios.put(`${configData.USER_GET}/${userDetails.osid}`, userToPost)
        .then(response => {
            console.log('API response:', response.data);
            dispatch(fetchUserList());
        })
        .catch(error => {
            console.error('API error:', error);
        });
    }

    //get needplans for volunteer
    const [vfulfils, setVfulfils] = useState([])
    useEffect(()=>{
        axios.get(`${configData.SERVE_FULFILL}/fulfillment/volunteer-read/${userDetails.osid}`)
        .then(response => {
            console.log(response.data);
            setVfulfils(response.data)
        })
        .catch(error => {
            console.error(error);
        });
    },[])

    //get deliverables
    const [viewDelivs, setViewDelivs] = useState(false)
    const [ deliverables, setDeliverables ] = useState([])
    const [ inParas, setInParas ] = useState([])
    const [planId, setPlanId] = useState('')
    const handleViewDeliverable = (planId) => {
        axios.get(`${configData.SERVE_NEED}/need-deliverable/${planId}`)
        .then(response => {
            setDeliverables(response.data.needDeliverable)
            setInParas(response.data.inputParameters)
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
        setViewDelivs(true)
        setPlanId(planId)
    }

    //display deliverables
    const [formData, setFormData] = useState([]);
    useEffect(() => {
        const initialFormData = deliverables.map((item, index) => ({
            deliverableId: item.id,
            deliverableDate: item.deliverableDate,
            startTime: inParas.length ? inParas[index].startTime : '',
            endTime: inParas.length ? inParas[index].endTime : '',
            softwarePlatform: inParas.length ? inParas[index].softwarePlatform : '',
            inputUrl: inParas.length ? inParas[index].inputUrl : '',
            status: item.status,
        }));
        setFormData(initialFormData);
    }, [deliverables, inParas]);

    //allow vcoordinator to change the deliverable info
    const handleDeliverableChange = (e, index, field) => {
        const { value } = e.target;
        setFormData((prevFormData) => {
          const newFormData = [...prevFormData];
          newFormData[index][field] = value;
          return newFormData;
        });
      };

    const [editIndex, setEditIndex] = useState('')
    const handleEditDeliverable = (item, index) => {
        console.log(item)
        setEditIndex(index)
    }
    const handleDoneDeliverable = (index) => {
        setEditIndex('')
        console.log(formData[index].deliverableId)
        console.log({
          "inputUrl": formData[index].inputUrl,
          "softwarePlatform": formData[index].softwarePlatform,
          "startTime": formData[index].startTime,
          "endTime": formData[index].endTime
        })
        axios.put(`${configData.SERVE_NEED}/deliverable-details/update/${formData[index].deliverableId}`,{
          "inputUrl": formData[index].inputUrl,
          "softwarePlatform": formData[index].softwarePlatform,
          "startTime": formData[index].startTime,
          "endTime": formData[index].endTime
        })
    }

    //add platform and meet info for all deliverables of a plan at a time
    const [planData, setPlanData] = useState({
        planPlatform: '',
        planLink: '',
        planStartTime: "2024-06-07T10:30:25.176Z",
        planEndTime: "2024-06-07T11:30:25.176Z"
    });
    const {planPlatform, planLink, planStartTime, planEndTime} = planData;
    const handleComnInfo = e => {
        setPlanData({...planData, [e.target.name]:e.target.value})
    }
    const submitComnInfo = () => {
        console.log({
          "inputUrl": planData.planLink,
          "softwarePlatform": planData.planPlatform,
          "startTime": planData.planStartTime,
          "endTime": planData.planEndTime
        })
        axios.put(`${configData.SERVE_NEED}/all-deliverable-details/update/${planId}`,{
          "inputUrl": planData.planLink,
          "softwarePlatform": planData.planPlatform,
          "startTime": "2024-06-07T21:37:25.176Z",
          "endTime": "2024-06-07T23:37:25.176Z"
        })
        .then((response) => {
          console.log(response.data)
       })
        .catch((error)=> {
          console.log(error); 
        })
    }

    return (
    <div className="wrapVolunteerDetails">
        <div className="volunteerDetails">
            {/* Header */}
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
            <div className='switch-vdetail-vdeliv'>
                <div className={`tab ${activeTab === 'tDetails' ? 'selVinfoTab' : 'vinfoTab'}`} onClick={() => handleTabClick('tDetails')}>Volunteer Info</div>
                <div className={`tab ${activeTab === 'tDelivs' ? 'selVinfoTab' : 'vinfoTab'}`} onClick={() => handleTabClick('tDelivs')}>Need Assignment Info</div>
            </div>
            
            {activeTab === 'tDetails' && <div className="list-volunteers">
                <div className="volunteerInfo">
                <div className="vInfo-half">
                    <div className="vInfo-item">
                        <div className="vInfo-key">Name</div>
                        <div className="vInfo-value">{userDetails.identityDetails.name}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Phone Number</div>
                        <div className="vInfo-value">{userDetails.contactDetails.mobile}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Gender</div>
                        <div className="vInfo-value">{userDetails.identityDetails.gender}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Years of Experience</div>
                        <div className="vInfo-value">{userProfile.genericDetails.yearsOfExperience}</div>
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
                        <div className="vInfo-key">Email ID</div>
                        <div className="vInfo-value">{userDetails.contactDetails.email}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">City</div>
                        <div className="vInfo-value">{userDetails.contactDetails.address.city}</div>
                    </div>
                    <div className="vInfo-item">
                        <div className="vInfo-key">Skills</div>
                        <div className="vInfo-value">Teaching</div>
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
                    {userDetails.status === 'Recommended' && <button onClick={()=>handleVStatus('Active')}>Mark Active</button>}
                    {userDetails.status === 'OnBoarded' && <button onClick={()=>handleVStatus('Active')}> Make Active</button>}
                    {userDetails.status === 'Register' && <button onClick={()=>handleVStatus('Registered')}>Register</button>}
                </div>
            </div>}

            {activeTab === 'tDelivs' && !viewDelivs && <div className="vcFulfils">
            {vfulfils.length > 0 ? (
    vfulfils.map((data, index) => (
        <div className="vcfulfil-list" key={index}>
            <div className="vcfulfil-item">
                <div className="vcfulfil-needname">{needById[data.needId]}</div>
                <div className="vcfulfil-status">{data.fulfillmentStatus}</div>
                <div className="vcfulfil-button">
                    <button onClick={() => handleViewDeliverable(data.needPlanId)}>View Deliverables</button>
                </div>
            </div>
        </div>
    ))
) : (
    <div className="no-need-assigned">Need is not yet assigned</div>
)}

            </div>}

            {activeTab === 'tDelivs'  && viewDelivs && <div className="vcDeliverables">
                <div className="backToPlans">
                    <span> Need Deliverable Details</span>
                    <button onClick={()=>setViewDelivs(false)} ><ArrowBackIcon/></button>
                </div>

                

                <div className="deliverable-head">
                    <div className="deliv-serial">S.No.</div>
                    <div className="deliv-date">Date</div>
                    <div className="deliv-time">Time</div>
                    <div className="deliv-url">Link</div>
                    <div className="deliv-status">Status</div>
                    {!!inParas.length && <div className="deliv-action">Action</div>}
                </div>

                {formData.length && formData.map((data, index) => (
                <div className="deliverable-item" key={index}>
                    <div className="deliv-serial">{index + 1}</div>
                        <div className="deliv-date">
                            {data.deliverableDate}
                        </div>
                        <div className="deliv-time">
                            {data.startTime ? data.startTime.slice(11, 16) : ''} - {data.endTime ? data.endTime.slice(11, 16) : ''}
                        </div>
                        <div className="deliv-url">
                            {index === editIndex ? 
                                <input type="text" value={data.inputUrl} onChange={(e) => handleDeliverableChange(e, index, 'inputUrl')} />
                            : 
                                <a href={data.inputUrl} target="_blank" rel="noopener noreferrer">Class Link</a>
                            }
                        </div>
                        <div className="deliv-status">
                            {index === editIndex ? 
                                <input type="text" value={data.status} onChange={(e) => handleDeliverableChange(e, index, 'status')} />
                            : 
                                data.status
                            }
                        </div>
                        {!!inParas.length && <div className="deliv-action">
                            {index === editIndex ? 
                                <button onClick={() => handleDoneDeliverable(index)}><DoneIcon className="done-icon" /></button>
                            : 
                                <button onClick={() => handleEditDeliverable(data, index)}><ModeEditIcon className="edit-icon" /></button>
                            }
                        </div>}
                    </div>
                ))}

            </div>}
        </div>
        
        <div className="btnCloseVDetails">
            <button onClick={props.handleClose}>x</button>
        </div>
    </div>
   )
}

export default VolunteerDetails