import React, { useEffect, useRef, useState } from 'react'
import './VolunteerProfileDeliverable.css'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NeedsImage from '../../assets/fileIcon.png'
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const configData = require('../../configure.js');
const currentDate = format(new Date(), 'yyyy-MM-dd');

const VolunteerProfileDeliverable = props => {
  // For need section, fetch needId wise information
  const needsList = useSelector((state) => state.need.data);

  //maps of need, entity, occurance by needId
  const needById = {};
  const entityById = {};
  const occurrenceById = {};
  needsList.forEach(item => {
    if (item && item.need) {
      const { id, name, needTypeId, description } = item.need;
      needById[id] = { name, needTypeId, description } ;
    }
    if (item && item.entity ) {
        entityById[item.need.id] = item.entity.name ;
    }
    if (item && item.occurrence ) {
        const { startDate, endDate } = item.occurrence;
        occurrenceById[item.need.id] = { startDate, endDate} ;
    }
  })

  //map of need type with its id
  const needtypeList = useSelector((state) => state.needtype.data.content);
  const needTypeById = {};
  needtypeList.forEach(item => {
    if (item) {
      needTypeById[item.id] = item.name ;
    }
  })

  // get fulfillments of particular volunteerId, ie. assignedId
  // filter fulfillments by needId passed here
  // for each needPlanId in the filtered fullfilments, get deliverables and make list

  const userId = useSelector((state)=> state.user.data.osid)
  const [volunteerHrs, setVolunteerHrs] = useState(0);
  const [fulfils, setFulfils] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    axios.get(`${configData.SERVE_FULFILL}/fulfillment/volunteer-read/${userId}?page=0&size=10`)
      .then((response) => {
        setFulfils(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    // Fetch current volunteer hours
    axios.get(`${configData.SERVE_VOLUNTEERING}/volunteer/volunteer-hours/read/${userId}`)
      .then((response) => {
        console.log("Fetching Vol Hours");
        console.log(response.data.totalHours);
        setVolunteerHrs(response.data.totalHours);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [userId]);


  const needFulfils = fulfils ? fulfils.filter(item => item.needId === props.needId) : []

  const userList = useSelector((state) => state.userlist.data);
  const ncoordInfo = needFulfils.length ? userList.filter(item => item.osid === needFulfils[0].coordUserId) : []
  
  // considering only one fulfilment for a (nomination)needId+volunteerId
  const planId = needFulfils[0] ? needFulfils[0].needPlanId : ''
  // const planId = '0e09a476-bac3-4256-8ff6-e2ba1192bd4f'


  const [deliverables, setDeliverables] = useState([])
  const [inParas, setInParas] = useState([])

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clickMarker, setClickMarker] = useState(false);  //for three dots
  const [cancelPopup, setCancelPopup] = useState('')
  const [completePopup, setCompletePopup] = useState('')
  const [rejection, setRejection] = useState('')

  const [todoDeliverables, setTodoDeliverables] = useState(null)
  const [completedDeliverables, setCompletedDeliverables] = useState(null)
  const [cancelledDeliverables, setCancelledDeliverables] = useState(null)
  const [dstat, setDstat ] = useState(false)

  const filterDeliverablesByMonth = (deliverables, month) => {
    if (!month) return deliverables;
    return deliverables.filter(item => {
      const deliverableMonth = new Date(item.deliverableDate).getMonth();
      return deliverableMonth === parseInt(month, 10);
    });
  };

  useEffect(()=>{
    const fetchData = async () => {
        try {
          const response = await axios.get(`${configData.NEEDPLAN_DELIVERABLES}/${planId}`);
          setDeliverables(response.data.needDeliverable);
          setInParas(response.data.inputParameters)
        } catch (error) {
          console.error('Error fetching need deliverables');
        }
    };
    fetchData();

  },[planId, clickMarker, rejection, cancelPopup, dstat])

 
  useEffect(() => {
    const filteredDeliverables = filterDeliverablesByMonth(deliverables, selectedMonth);
    setTodoDeliverables(filteredDeliverables && filteredDeliverables.filter(item => item.status === 'NotStarted'));
    setCompletedDeliverables(filteredDeliverables && filteredDeliverables.filter(item => item.status === 'Completed'));
    setCancelledDeliverables(filteredDeliverables && filteredDeliverables.filter(item => item.status === 'Cancelled'));
  }, [deliverables, selectedMonth,dstat]); // Depend on both deliverables and selectedMonth


  const handleMonthFilter = (e) => {
    setSelectedMonth(e.target.value);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => (
    <option key={i} value={i}>
      {new Date(0, i).toLocaleString('default', { month: 'long' })}
    </option>
  ));



  const [cindex, setCIndex] = useState('') //display on popup
  const handleCancel = (item, index) => {
    setClickMarker(!clickMarker)
    setCancelPopup(item)  //for popup to appear
    setCIndex(index)
    console.log(index)
    console.log('Deliverable Cancelled')
  }
  const handleChange = (e) => {
    setRejection(e.target.value)
  }
  //const confirmRejection = (item) => {}
  const confirmRejection = (item) => {
    setRejection('')
    setCancelPopup('')
    console.log({
      "needPlanId": planId,
      "comments": item.comments,
      "status": "Cancelled",
      "deliverableDate": currentDate
    })
    axios.put(`${configData.NEEDPLAN_DELIVERABLES}/update/${item.id}`,{
      "needPlanId": planId,
      "comments": rejection,
      "status": "Cancelled",
      "deliverableDate": currentDate
    }).then(response => {
      console.log('Deliverable Completed')
      setDstat(!dstat)
    })
    .catch(error => {
      console.log('Error marking deliverable completed')
    })
    console.log(rejection)
  }

  const [numBenefics, setNumBenefics] = useState(null)
  const handleBenefics = e => {
    setNumBenefics(e.target.value)
  }
  const [notes, setNotes] = useState(null)
  const handleNotes = e => {
    setNotes(e.target.value)
  }

  const handleCompleted = (item, index) => {
    setClickMarker(!clickMarker)
    setCompletePopup(item)
    setCIndex(index)
  }
  const confirmCompleted = (item) => {
    setRejection('');
    setCompletePopup('');
    console.log({
      "needDeliverableId": item.id,
      "numberOfAttendees": numBenefics,
      "submittedUrl": "",
      "remarks": notes
    });
  
    axios.post(`${configData.SERVE_NEED}/deliverable-output/create`, {
      "needDeliverableId": item.id,
      "numberOfAttendees": numBenefics,
      "submittedUrl": "",
      "remarks": notes
    })
    .then(response => {
      console.log('Deliverable output created');
      return axios.put(`${configData.NEEDPLAN_DELIVERABLES}/update/${item.id}`, {
        "needPlanId": planId,
        "comments": notes,
        "status": "Completed",
        "deliverableDate": currentDate
      });
    })
    .then(response => {
      console.log('Volunteer hours updated');
      setVolunteerHrs(volunteerHrs + 1); // Update local state
      setDstat(!dstat); // Trigger re-render to reflect changes
      return axios.put(`${configData.VOLUNTEER_HOURS}/${userId}/needDeliverableId/${item.id}`, {
        "deliveryHours": 1,
        "deliveryDate": new Date().toISOString() // Use current date and time in ISO format
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    })
    .catch(error => {
      console.log('Error completing deliverable or updating volunteer hours', error);
    });
  };
  

  const divRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setClickMarker(false);
      }
    };

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTime = (dateTimeString) => {
    let hours = parseInt(dateTimeString.slice(11,13))
    const ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours.toString().padStart(2, '0') : '12'; // the hour '0' should be '12'
    return hours+dateTimeString.slice(13,16)+ampm
  };




  return (
    <div>
        {/* NEED INFORMATION */}
        <div className="detailsNeedVoluntProfile">
            <div className="nameNVP">{needById[props.needId].name}</div> 
            <div className="typeNVP">{needTypeById[needById[props.needId].needTypeId]}</div>
            <div className="aboutNVP">{needById[props.needId].description.slice(3,-4)} 
            </div>
            <div className="rowNVP">
                <div className="itemNVP">
                    <span>Organizer :</span>  {ncoordInfo.length ? ncoordInfo[0].identityDetails.fullname : ''}
                </div>
                <div className="itemNVP">
                    <span>Entity :</span>  {entityById[props.needId]}
                </div>
            </div>
            <div className="rowNVP">
                <div className="itemNVP">
                    <span>Start Date :</span>  
                    {occurrenceById[props.needId] ? occurrenceById[props.needId].startDate.slice(0,10) : ''}
                </div>
                <div className="itemNVP">
                    <span>End Date : </span>  
                    {occurrenceById[props.needId] ? occurrenceById[props.needId].endDate.slice(0,10) : ''}
                </div>
            </div>
            <div className="rowNVP">
                <div className="itemNVP">
                    <span>Time :</span> { inParas.length ? formatTime(inParas[0].startTime)+' - '+formatTime(inParas[0].endTime) : ''}
                </div> 
                <div className="itemNVP"> 
                   <span>Content Resources: </span>  
                   {inParas.length && inParas[0].resourceUrl ? (
            <a href={inParas[0].resourceUrl} target="_blank" rel="noopener noreferrer">
                Resource Link
            </a>
        ) : <a href="https://serve-jcms.evean.net/home/view_course/"> View  </a>}
                  
                </div> 
            </div>
            <div className="rowNVP">
            <div className="itemNVP">
  <span>Platform :</span> 
  {inParas.length && inParas[0].softwarePlatform 
    ? (inParas[0].inputUrl === "To be added soon" 
        ? "Available Shortly" 
        : inParas[0].softwarePlatform)
    : ""}
</div>
                <div className="itemNVP"> 
  <span>URL: </span> 
  {inParas.length && inParas[0].inputUrl && inParas[0].inputUrl !== "To be added soon" ? (
  <a href={inParas[0].inputUrl} target="_blank" rel="noopener noreferrer">
    Session Link
  </a>
) : (
  <span>Available Shortly</span>
)}
</div>
            </div>
        </div>

        {/* NEED PLAN DELIVERABLES*/}
        <div className="deliverablesNeedVolunteerProfile"> 
            {/*DNVP refer to Need Plan Deliverables from Volunteer Profile*/}
            <div className="headDNVP">Need Plan Deliverables
            <div className="monthFilterContainer">
            <div className="selectMonth">
              <i className="nSortDateIcon">
                <CalendarTodayIcon style={{ fontSize: "18px", margin: "0px 3px" }} />
              </i>
              <select
                className="selectMonthType"
                value={selectedMonth}
                onChange={handleMonthFilter}
              >
                <option value="">All Months</option>
                {monthOptions}
              </select>
            </div>
          </div>
          </div>
        </div>
        {deliverables.length ? <div className="listDNVP">
            <div className="listDNVPbox">
                <button className="todoDNVP">To-Do</button>
                <div>
                    {todoDeliverables && todoDeliverables.map((item, index) => (
                    <div key={index} className="deliverable-container">
                      <div className="deliverable-title">
                            <div><img src={NeedsImage} alt="Nominated Needs" width="20px" /></div>
                            <div>{needById[props.needId].name}: Session {index+1}</div>
                      </div>
                      <div className="date-deliverable">
                        <div>Due {item.deliverableDate}</div>
                        <div>
                          <button className="button-dstat" 
                            onClick={() => {
                              setSelectedIndex(index);
                              setClickMarker(!clickMarker);
                             }}
                          >
                            <MoreVertIcon style={{color:'black',fontSize:'16px'}} />     
                          </button>
                        </div>
                      </div>
                      { index === selectedIndex && clickMarker && <div ref={divRef} className="status-ticker">
                        <button className="delstat-complete" onClick={()=>handleCompleted(item, index+1)}>Mark as Completed</button>
                        <button className="delstat-cancel" onClick={()=>handleCancel(item, index+1)}>Cancel Plan</button>
                      </div> }

                      { /* CANCEL popup */ }
                      { cancelPopup && <div className="wrap-cpopup">
                        <div className="inwrap-cpopup">
                          <div className="cpopup">
                            <div className="topbar-cpopup">
                              <div>Reason for Rejection</div>
                              <div> 
                                <button className="cancel-button" onClick={()=>setCancelPopup('')} >
                                  <div className="close-cpopup"><CloseIcon style={{height:"20px"}}/></div>
                                </button>
                              </div>
                            </div>
                            <div className="title-cancel">
                            {needById[props.needId].name}: Session {cindex}
                            </div>
                            <div className="wrap-reasonbox">
                              <label>Reason</label>
                              <textarea className="reject-reason" value={rejection} onChange={handleChange} rows={4} cols={60}
                               placeholder='Write a reason for cancelling the need plan deliverable'
                              ></textarea>
                            </div>
                            <div className="cancel-buttons">
                              <button className="reject-cancel-button" onClick={()=>setCancelPopup('')}>Cancel</button>
                              <button className="reject-confirm-button" onClick={()=>confirmRejection(item)}>Confirm</button>
                            </div>
                          </div>
                        </div>
                      </div>}

                      { /* COMPLETE popup */ }
                      { completePopup && <div className="wrap-cpopup">
                        <div className="inwrap-cpopup">
                          <div className="cpopup">
                            <div className="topbar-cpopup">
                              <label>Confirmation</label>
                              <div> 
                                <button className="cancel-button" onClick={()=>setCompletePopup('')} >
                                  <div className="close-cpopup"><CloseIcon style={{height:"20px"}}/></div>
                                </button>
                              </div>
                            </div>
                            <div className="title-cancel">
                            {needById[props.needId].name}: Session {cindex}
                            </div>
                            <div className="wrap-reasonbox">
                              <label>Comments/Notes</label>
                              <textarea className="reject-reason" value={notes} onChange={handleNotes} rows={4} cols={60}
                               placeholder='Write comments or notes on the need plan deliverable'
                              ></textarea>
                            </div>
                            <div className="wrap-beneficbox">
                              <label>Beneficiaries Attended</label>
                              <input type="text" name="numBenfics" value={numBenefics} onChange={handleBenefics} />
                            </div>
                            <div className="cancel-buttons">
                              <button className="reject-cancel-button" onClick={()=>setCompletePopup('')}>Cancel</button>
                              <button className="reject-confirm-button" onClick={()=>confirmCompleted(item)}>Confirm</button>
                            </div>
                          </div>
                        </div>
                      </div>}


                       
                    </div>
                    ))}
                </div>
            </div>
            <div className="listDNVPbox">
              <button className="completedDNVP">Completed</button>
              <div>
                {completedDeliverables && completedDeliverables.map((item, index) => (
                    <div key={index} className="deliverable-container">
                      <div className="deliverable-title">
                            <div><img src={NeedsImage} alt="Nominated Needs" width="20px" /></div>
                            <div>{needById[props.needId].name}: Session {index+1}</div>
                      </div>
                      <div className="date-completed-deliverable">Completed on {item.deliverableDate}</div>
                      
                    </div>
                    ))}
                </div>
            </div>
            <div className="listDNVPbox">
              <button className="canceledDNVP">Canceled</button>
              {cancelledDeliverables && cancelledDeliverables.map((item, index) => (
                    <div key={index} className="deliverable-container">
                      <div className="deliverable-title">
                            <div><img src={NeedsImage} alt="Nominated Needs" width="20px" /></div>
                            <div>{needById[props.needId].name}: Session {index+1}</div>
                      </div>
                      <div className="date-completed-deliverable">Cancelled on {item.deliverableDate}</div>
                      
                    </div>
                    ))}
            </div>
        </div>
        :
        <div className="deliverable-unapproved">
          Need is yet to be approved, Coordinator will get in touch with you soon
        </div>
        }
        


    </div>
  )
}

export default VolunteerProfileDeliverable