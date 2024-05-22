import React, { useEffect, useRef, useState } from 'react'
import './VolunteerProfileDeliverable.css'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NeedsImage from '../../assets/fileIcon.png'
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';

const configData = require('../../configure.js');
const currentDate = format(new Date(), 'yyyy-MM-dd');

const VolunteerProfileDeliverable = props => {
//   console.log(props.needId)
  const needsList = useSelector((state) => state.need.data);
  const userId = useSelector((state)=> state.user.data.osid)

  //maps of need, entity, occurance by need id
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

  const [needplans, setNeedplans] = useState(null)
  useEffect(()=>{
    console.log(props.needId)
    const fetchData = async () => {
        try {
          const response = await axios.get(`${configData.NEEDPLAN_GET}/${props.needId}`);
          setNeedplans(response.data);
          console.log(response.data); 
        } catch (error) {
          console.error('Error fetching need plans');
        }
      };
  
      fetchData();
  },[props.needId])
  const plans = needplans && needplans.filter(obj => obj.plan.assignedUserId === userId)
  // const planId = plans && plans[plans.length-1].plan.id 
  const [deliverables, setDeliverables] = useState(null)

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clickMarker, setClickMarker] = useState(false);
  const [cancelPopup, setCancelPopup] = useState('')
  const [rejection, setRejection] = useState('')

  const [todoDeliverables, setTodoDeliverables] = useState(null)
  const [completedDeliverables, setCompletedDeliverables] = useState(null)
  const [cancelledDeliverables, setCancelledDeliverables] = useState(null)
  const [dstat, setDstat ] = useState(false)

  // useEffect(()=>{
  //   const fetchData = async () => {
  //       try {
  //         const response = await axios.get(`${configData.NEEDPLAN_DELIVERABLES}/${planId}`);
  //         setDeliverables(response.data);
  //         console.log(response.data); 
  //       } catch (error) {
  //         console.error('Error fetching need deliverables');
  //       }
  //   };
  //   fetchData();

  // },[planId, clickMarker, rejection, cancelPopup, dstat])

  // const todoDeliverables = deliverables && deliverables.filter(item => item.status === 'NotStarted')
  // const completedDeliverables = deliverables && deliverables.filter(item => item.status === 'Completed')
  // const cancelledDeliverables = deliverables && deliverables.filter(item => item.status === 'Cancelled')

  useEffect(()=>{
    setTodoDeliverables(deliverables && deliverables.filter(item => item.status === 'NotStarted'))
    setCompletedDeliverables(deliverables && deliverables.filter(item => item.status === 'Completed'))
    setCancelledDeliverables(deliverables && deliverables.filter(item => item.status === 'Cancelled'))
  },[deliverables, dstat])

  const handleCompleted = (item) => {}
  // const handleCompleted = (item) => {
  //   setClickMarker(!clickMarker)
  //   axios.put(`${configData.NEEDPLAN_DELIVERABLES}/update/${item.id}`,{
  //     "needPlanId": planId,
  //     "comments": item.comments,
  //     "status": "Completed",
  //     "deliverableDate": currentDate
  //   }).then(response => {
  //     console.log('Deliverable Completed')
  //     setDstat(!dstat)
  //   })
  //   .catch(error => {
  //     console.log('Error marking deliverable completed')
  //   });
  // }
  const [cindex, setCIndex] = useState('')
  const handleCancel = (item, index) => {
    setClickMarker(!clickMarker)
    setCancelPopup(item)
    setCIndex(index)
    console.log(index)
    console.log('Deliverable Cancelled')
  }
  const handleChange = (e) => {
    setRejection(e.target.value)
  }
  const confirmRejection = (item) => {}
  // const confirmRejection = (item) => {
  //   setRejection('')
  //   setCancelPopup('')
  //   console.log({
  //     "needPlanId": planId,
  //     "comments": item.comments,
  //     "status": "Cancelled",
  //     "deliverableDate": currentDate
  //   })
  //   axios.put(`${configData.NEEDPLAN_DELIVERABLES}/update/${item.id}`,{
  //     "needPlanId": planId,
  //     "comments": rejection,
  //     "status": "Cancelled",
  //     "deliverableDate": currentDate
  //   }).then(response => {
  //     console.log('Deliverable Completed')
  //     setDstat(!dstat)
  //   })
  //   .catch(error => {
  //     console.log('Error marking deliverable completed')
  //   })
  //   console.log(rejection)
  // }

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

  return (
    <div>
        <div className="detailsNeedVoluntProfile">
            <div className="nameNVP">{needById[props.needId].name}</div> 
            <div className="typeNVP">{needTypeById[needById[props.needId].needTypeId]}</div>
            <div className="aboutNVP">{needById[props.needId].description.slice(3,-4)} </div>
            <div className="rowNVP">
                <div className="itemNVP">
                    <span>Organizer :</span>  nCoordinator name
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
                    <span>Time :</span> 
                </div> 
                {/* <div className="itemNVP">
                    <span>Mode</span> : Online
                </div> */}
            </div>
        </div>
        <div className="deliverablesNeedVolunteerProfile"> 
            {/*DNVP refer to Need Plan Deliverables from Volunteer Profile*/}
            <div className="headDNVP">Need Plan Deliverables</div>
        </div>
        <div className="listDNVP">
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
                        <button className="delstat-complete" onClick={()=>handleCompleted(item)}>Mark as Complete</button>
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
        


    </div>
  )
}

export default VolunteerProfileDeliverable