import React, { useState, useEffect, useRef } from 'react'
import './ModifyNeed.css' 
import Nominations from '../Nominations/Nominations'
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MultiSelect from '../RaiseNeed/MultiSelect';
import MonoSelect from '../RaiseNeed/MonoSelect';
import axios from 'axios'
import dayjs from 'dayjs';

const ModifyNeed = props => {
    // console.log(props.data)     //details of single need
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
    const { startDate, endDate, days, frequency, timeSlots } = dataOccurrence

    //scheduleTime is in object format and for passing to select
    const [ scheduleTime, setScheduleTime ] = useState([{ day:'', startTime:'', endTime:'' }])
    useEffect(()=>{
        setScheduleTime(timeSlotsArray.map(item => ({
            day: item.day,
            startTime: dayjs(item.startTime),
            endTime: dayjs(item.endTime)
        }))) 

    },[timeSlotsArray])
    //Date in backend are stored in dateTime format whereas 
    //needs to be YYYY-mm-dd format input element of type date
    const [startYMD, setStartYMD] = useState(props.data.occurrence ? props.data.occurrence.startDate.substr(0,10) : '')  
    const [endYMD, setEndYMD] = useState(props.data.occurrence ? props.data.occurrence.endDate.substr(0,10) : '')
    //while date from UI changed in YMD format, save it by adding time string to it
    const handleEndDate = e => {
        setEndYMD(e.target.value)
        setDataOccurrence({ ...dataOccurrence, endDate: (e.target.value + 'T17:00:00.000Z') })
    }
    const handleStartDate = e => {
        setStartYMD(e.target.value)
        setDataOccurrence({ ...dataOccurrence, startDate: (e.target.value + 'T09:00:00.000Z') })
    }
    const changeFrequency= e => {
        setDataOccurrence({ ...dataOccurrence, frequency: e.target.value })
    }

    const [selectedDays, setSelectedDays] = useState([])
    //selected values be in object format, convert to UTC format
    const objToUTC = (timeObj) => {
        const timeValue = timeObj.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        return timeValue.substr(0,16)+':00.000Z'
    }
    const handleSelectedDaysChange = (selected) => {
        setSelectedDays(selected && selected.map(item => ({
            day: item.day,
            startTime: objToUTC(item.startTime),
            endTime: objToUTC(item.endTime)
        })))
    }
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

    const [dataToPost, setDataToPost] = useState({
        needRequest: needData,
        needRequirementRequest: reqData
    })

    useEffect(()=>{
        setDataToPost({...dataToPost, needRequest: needData, needRequirementRequest: reqData})
    },[needData,reqData])

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

    //MODIFYING

    const [modify, setModify] = useState(false)

    const handleModify = (e) => {
        setModify(!modify)
    }

    const handleDone = (e) => {
        setModify(!modify)
        const needId = data.need.id
        axios.put(`http://serve-v1.evean.net/api/v1/serve-need/need/update/${needId}`, dataToPost)
        .then(response => {
            console.log(response.data)
        })
        .catch(error => {
            console.log(error)
        });

        // console.log(needId)
        console.log(dataToPost)
        //post API request
    }
    const formatTime = (timeString) => {
        const [hourString, minute] = timeString.split(":");
        const hour = +hourString % 24;
        return (hour % 12 || 12) + ":" + minute + (hour < 12 ? "AM" : "PM");
    }
    
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
                                {!modify && <button className="modify-button" onClick={handleModify}>Modify</button>}
                                {modify && <button className="modify-button" onClick={handleDone}>Done</button>}
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
                                            <label>Need Purpose</label>
                                            {!modify && <span>{data.need.needPurpose ? data.need.needPurpose : '-'}</span>}
                                            {modify && status == 'Approved' && <span>{data.need.needPurpose ? data.need.needPurpose : '-'}</span>}
                                            {modify && status != 'Approved' && <input type="text" name="needPurpose" value={needPurpose} onChange={changeHandler}/>}
                                    </div>
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

                                    { status == 'Approved' && <div className="itemNInfo">
                                            <label>Platform</label>
                                            {!modify && <span>Google Meet</span>}
                                            {modify && <input type="text" name="platform" value={platform} onChange={changeHandler}/>}
                                    </div> }

                                </div>  
                                <div className="needInfoTopRight col-sm-6">
                                <div className="itemNInfo">
                                    <label>Need Type</label>
                                    {<span>{data.needType.name ? data.needType.name : ''}</span>}
                                </div>

                                {/* Date */}
                                <div className="itemNInfo">
                                    <div className="itemWrapNInfoDate">
                                        {!modify && <div className="itemNInfoDate-modified">
                                            <label>Start Date</label>
                                            <span>{data.occurrence ? data.occurrence.startDate.substr(0,10) : '-'}</span>
                                        </div>}

                                        {modify && <div className="itemNInfoDate-modify">
                                            <label>Start Date</label>
                                            <input type="date" name="startYMD" value={startYMD} onChange={handleStartDate} />
                                        </div>}
                                        
                                        {!modify && <div className="itemNInfoDate-modified">
                                            <label>End Date</label>
                                            <span>{data.occurrence ? data.occurrence.endDate.substr(0,10) : '-'}</span>
                                        </div>}

                                        {modify && <div className="itemNInfoDate-modify">
                                            <label>End Date</label>
                                            <input type="date" name="endYMD" value={endYMD} onChange={handleEndDate} />
                                        </div>}

                                        {modify && <div className="itemNInfoDate-modify">
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
                                </div>

                                <div className="itemNInfo-dayNtime">
                                    {!modify && <div className="itemDaysTime">
                                        <label>Event days and time</label>
                                        {data.timeSlots.map((slot, index) => (
                                            <span key={index}> {slot.day} {formatTime(slot.startTime.substr(11,5))} - {formatTime(slot.endTime.substr(11,5))} </span>
                                        ))}
                                    </div>}

                                    {modify && <div className="itemWrapNInfoFreq">
                                        <div className="label-eventdaytime">
                                            <label>Event Days</label>
                                            <label>Start Time</label>
                                            <label>End Time</label>
                                        </div>
                                        <div className="itemDaySelect">
                                        {frequency === 'off' ? 
                                            <MultiSelect onAdd={handleSelectedDaysChange} scheduleTime={scheduleTime} /> 
                                            : <MonoSelect onAdd={handleSelectedDaysChange} frequency={frequency} scheduleTime={scheduleTime}/>}
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