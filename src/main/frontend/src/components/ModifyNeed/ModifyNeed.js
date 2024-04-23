import React, { useState, useEffect, useRef } from 'react'
import './ModifyNeed.css' 
import Nominations from '../Nominations/Nominations'
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MultiSelect from '../RaiseNeed/MultiSelect';
import MonoSelect from '../RaiseNeed/MonoSelect';

const ModifyNeed = props => {
    console.log(props.data)     //details of single need
    const [data,setData] = useState(null)
   
    useEffect(()=> {
         setData(props.data);
         console.log(props.data)
    },[props.data]);

    const [timeSlotsArray, setTimeSlotsArray] = useState(props.data.timeSlots)

    const [dataOccurrence, setDataOccurrence ] = useState({
        startDate: props.data.occurrence ? props.data.occurrence.startDate : '',
        endDate: props.data.occurrence ? props.data.occurrence.endDate : '',
        days: props.data.occurrence ? props.data.occurrence.days : '',
        frequency: props.data.occurrence ? props.data.occurrence.frequency : '',
        timeSlots: timeSlotsArray
    })
    const { startDate, endDate, days, frequency, timeSlots } = dataOccurrence;

    //change start date, end date, frequency
    const handleStartDate = e => {
        setDataOccurrence({ ...dataOccurrence, startDate: (e.target.value + 'T08:57:00.000Z') })
    }
    const handleEndDate = e => {
        setDataOccurrence({ ...dataOccurrence, endDate: (e.target.value + 'T08:57:00.000Z') })
    }
    const changeFrequency= e => {
        setDataOccurrence({ ...dataOccurrence, frequency: e.target.value })
    }
    const [selectedDays, setSelectedDays] = useState([]);
    const handleSelectedDaysChange = (selected) => {
        setSelectedDays(selected);
    };
    //updating selected days and timeslots
    useEffect(() => {
        setDataOccurrence({ ...dataOccurrence, timeSlots: selectedDays, days: selectedDays.map((obj) => obj.day).join(', ') })
    }, [selectedDays])

    //initialize need requirement
    const [reqData, setReqData] = useState({
        skillDetails: props.data.needRequirement.skillDetails,
        volunteersRequired: props.data.needRequirement.volunteersRequired,
        occurrence: dataOccurrence,
        priority: props.data.needRequirement.priority
    })
    const {skillDetails, volunteersRequired, occurrence, priority} = reqData;
    //update need requirement
    useEffect(()=>{
        setReqData({...reqData, occurrence: dataOccurrence})
    },[dataOccurrence])

    const [needData, setNeedData] = useState({
        needTypeId: props.data.needType.id || '',      
        name: props.data.need.name || '',    
        needPurpose: props.data.need.needPurpose || '',
        description: props.data.need.description || '',     
        status: props.data.need.status,     
        userId: props.data.need.userId,      
        entityId: props.data.need.entityId,
        //requirementId: '',       
    });
    const {needTypeId, name, needPurpose, description, status, userId, entityId } = needData;
    const changeHandler = e => {
        setNeedData({ ...needData, [e.target.name]: e.target.value })
    }

    const [dataPost, setDataPost] = useState({
        needRequest: needData,
        needRequirementRequest: reqData
    })

    const [platform, setPlatform] = useState('')
    const [link, setLink] = useState('')


    // Handle Nomination tab
    const [nomin,setNomin] = useState(true)
    const [popupType, setPopupType] = useState(null)
    const openPopup = (type) => {
        setPopupType(type)
    }
    const closePopup = () => {
        setPopupType(null);
      };
    console.log(popupType)

    //MODIFYING

    const [modify, setModify] = useState(false)

    const handleModify = (e) => {
        console.log('modifying')
        setModify(!modify)
    }

    useEffect(()=> {
        //do update API call
   },[modify]);
    
  return (
    <div className="wrapModifyNeed">
    <div className="wrapNeedNominations">
        {/* show list of nominations to need and need information*/}
        <div className="needNominations">
            {/* Header for Tabs*/}
            <div className="wrapTabs">
                <button onClick={()=>setNomin(true)}><div className={nomin ? "ulTab" : null}>Nominations</div></button>
                <button onClick={()=>setNomin(false)}><div className={nomin ? null : "ulTab"}>Need Info</div></button>
            </div>

            { nomin ? 
                //load nominations component
                <Nominations needData={props.data} openPopup={openPopup} /> 
            : ( 
                //load need information
                    <div className="needInfoBox">
                        <div className="needInfoBar">
                            <div className="wrapInfoName"> 
                                <div className="needIName">{data.need.name ? data.need.name : '-'}</div>
                                <div className="needITag">{data.need.description ? data.need.description.slice(3,-4) : '-'}</div>
                            </div>
                            <div className="wrap-modify-button">
                                <div>{status}</div>
                                {!modify && <button className="modify-button" onClick={handleModify}>Modify</button>}
                                {modify && <button className="modify-button" onClick={handleModify}>Done</button>}
                            </div>
                        </div>
                        {/* Need info below */}
                        <form className="needInfoForm row" id="modifyForm" >
                            <div className="catergoryNInfo">NEED INFO</div>
                            <div className="needIFormTop">
                                <div className="needInfoTopLeft col-sm-6">
                                    <div className="itemNInfo">
                                            <label>Need Name</label>
                                            {!modify && <span>{data.need.name ? data.need.name : ''}</span>}
                                            {modify && status == 'Approved' && <span>{data.need.name ? data.need.name : ''}</span>}
                                            {modify && status != 'Approved' && <input type="text" name="name" value={name} onChange={changeHandler}/>}
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Type</label>
                                            {<span>{data.needType.name ? data.needType.name : ''}</span>}
                                    </div>
                                    <div className="itemNInfo">
                                            <label>Need Purpose</label>
                                            {!modify && <span>{data.need.needPurpose ? data.need.needPurpose : '-'}</span>}
                                            {modify && status == 'Approved' && <span>{data.need.needPurpose ? data.need.needPurpose : '-'}</span>}
                                            {modify && status != 'Approved' && <input type="text" name="needPurpose" value={needPurpose} onChange={changeHandler}/>}
                                    </div>
                                    { status == 'Approved' && <div className="itemNInfo">
                                            <label>Platform</label>
                                            {!modify && <span>Google Meet</span>}
                                            {modify && <input type="text" name="platform" value={platform} onChange={changeHandler}/>}
                                    </div> }

                                </div>  
                                <div className="needInfoTopRight col-sm-6">
                                    <div className="itemNInfo">
                                        <label>Need Description</label>
                                        {!modify && <span>{data.need.description ? data.need.description.slice(3,-4) : '-'}</span>}
                                        {modify && status == 'Approved' && <span>{data.need.description ? data.need.description.slice(3,-4) : '-'}</span>}
                                        {modify && status != 'Approved' && <input type="text" name="name" value={description} onChange={changeHandler}/>}
                                    </div>
                                    {/* Entity Name */}
                                    <div className="itemNInfo">
                                        <label>Entity Name</label>
                                        {<span>{data.entity.name ? data.entity.name : ''} </span>}
                                    </div>
                                    {/* Date */}
                                    <div className="itemNInfo">

                                    <div className="itemWrapNInfoDate">
                                        <div className="itemNInfoDate-modify">
                                            <label>Start Date</label>
                                            {!modify && <span>{data.occurrence ? data.occurrence.startDate.substr(0,10) : '-'}</span>}
                                            {modify && <input type="date" name="startYMD" value={startDate} onChange={handleStartDate} />}
                                        </div>
                                        <div className="itemNInfoDate-modify">
                                            <label>End Date</label>
                                            {!modify && <span>{data.occurrence ? data.occurrence.endDate.substr(0,10) : '-'}</span>}
                                            {modify && <input type="date" name="endYMD" value={endDate} onChange={handleEndDate} />}
                                        </div>
                                        {modify && <div className="itemDate">
                                            <label>Recurrence </label>
                                            <select className="selectFrequency" name="frequency" value={frequency} onChange={changeFrequency}>
                                                <option value="off" defaultValue>Off</option>
                                                <option value="weekdays">Every Weekday</option>
                                                <option value="weekend">Every Weekend</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                             </select>
                                        </div>}
                                    </div>

                                    {modify && <div className="itemWrapNInfoFreq">
                                        <div className="label-eventdaytime">
                                            <label>Event Days</label>
                                            <label>Start Time</label>
                                            <label>End Time</label>
                                        </div>
                                        <div className="itemDaySelect">
                                        {frequency === 'off' ? 
                                            <MultiSelect onAdd={handleSelectedDaysChange} /> 
                                            : <MonoSelect onAdd={handleSelectedDaysChange} frequency={frequency} />}
                                        </div>
                                    </div>}

                                    </div>
                                    { status == 'Approved' && <div className="itemNInfo">
                                            <label>Link</label>
                                            {!modify && <span> meet.google.com/xyz-abcd-pqr </span>}
                                            {modify && <input type="text" name="link" value={link} onChange={changeHandler} />}
                                    </div>}
                                </div>                      
                            </div>           
                            <div className="catergoryNInfo">VOLUNTEER PREREQUISITE</div>                          
                            <div className="needIFormBottom row">
                                <div className="formBLeft col-sm-6">
                                    { /* Skills Required */}
                                    { data &&
                                     <div className="itemNInfo">
                                        <label>Skills Required</label>
                                        {<span>{data.needRequirement.skillDetails ? data.needRequirement.skillDetails : ''}</span>}
                                        {/*<span>{data.skillDetail.map(item => item.value)}</span> */}
                                    </div> }
                                </div>
                                <div className="formBRight col-sm-6">
                                    {/* No. of Volunteers Required */}
                                    <div className="itemNInfo">
                                        <label>No. of Volunteers required</label>
                                        {<span>{data.needRequirement.volunteersRequired ? data.needRequirement.volunteersRequired : ''}</span>}
                                    </div>
                                </div>
                            </div>
                            
                        </form>
                    </div>
                )}
        </div>   

        <div className="btnCloseNomination">
            <button onClick={props.handleClose}>x</button>
        </div>   
    </div>

    { popupType == 'accept' && (
    <div className="alertNomin"> 
        <span>
            <CheckIcon style={{height:"20px",width:"20px",borderRadius:"50%",backgroundColor:"#2F9346",padding:"2px",color:"#4D4D4D",margin:"2px 5px"}}/> 
            Nomination has been accepted successfully</span>
        <button onClick={closePopup}>x</button>
    </div>
    )}
    { popupType == 'reject' && (
    <div className="alertNomin"> 
        <span>
            <ClearIcon style={{height:"20px",width:"20px",borderRadius:"50%",backgroundColor:"red",padding:"2px",color:"#4D4D4D",margin:"2px 5px"}}/> 
            Nomination has been rejected</span>
        <button onClick={closePopup}>x</button>
    </div>
    )}

    </div>
  )
}

export default ModifyNeed