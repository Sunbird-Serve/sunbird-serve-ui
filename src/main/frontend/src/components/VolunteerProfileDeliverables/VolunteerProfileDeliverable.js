import React, { useEffect, useState } from 'react'
import './VolunteerProfileDeliverable.css'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NeedsImage from '../../assets/fileIcon.png'

const configData = require('../../configure.js');

const VolunteerProfileDeliverable = props => {
//   console.log(props.needId)
  const needsList = useSelector((state) => state.need.data);
  const userId = useSelector((state)=> state.user.data.osid)
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
  const needtypeList = useSelector((state) => state.needtype.data.content);
  const needTypeById = {};
  needtypeList.forEach(item => {
    if (item) {
      needTypeById[item.id] = item.name ;
    }
  })
  const [needplans, setNeedplans] = useState(null)
  useEffect(()=>{
    const fetchData = async () => {
        try {
          const response = await axios.get(`${configData.NEEDPLAN_GET}/${props.needId}`);
          setNeedplans(response.data);
          // console.log(response.data); 
        } catch (error) {
          console.error('Error fetching need plans');
        }
      };
  
      fetchData();
  },[props.needId])
  const plans = needplans && needplans.filter(obj => obj.plan.assignedUserId === userId)
  const planId = plans && plans[plans.length-1].plan.id 
  const [deliverables, setDeliverables] = useState(null)
  useEffect(()=>{
    const fetchData = async () => {
        try {
          const response = await axios.get(`${configData.NEEDPLAN_DELIVERABLES}/${planId}`);
          setDeliverables(response.data);
          // console.log(response.data); 
        } catch (error) {
          console.error('Error fetching need deliverables');
        }
      };
      fetchData();
  },[planId])
  const todoDeliverables = deliverables && deliverables.filter(item => item.status === 'NotStarted')
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clickMarker, setClickMarker] = useState(false);

  const handleCompleted = (deliverableId) => {
    setClickMarker(!clickMarker)
    console.log('Deliverable Completed', deliverableId)
  }
  const handleCancel = (deliverableId) => {
    setClickMarker(!clickMarker)
    console.log('Deliverable Cancelled',deliverableId)
  }

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
                      { index === selectedIndex && clickMarker && <div className="status-ticker">
                        <button className="delstat-complete" onClick={()=>handleCompleted(item.id)}>Mark as Complete</button>
                        <button className="delstat-cancel" onClick={()=>handleCancel(item.id)}>Cancel Plan</button>
                      </div> }
                       
                    </div>
                    ))}
                </div>
            </div>
            <div className="listDNVPbox"><button className="completedDNVP">Completed</button></div>
            <div className="listDNVPbox"><button className="canceledDNVP">Canceled</button></div>
        </div>
        


    </div>
  )
}

export default VolunteerProfileDeliverable