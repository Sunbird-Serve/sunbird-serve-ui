import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './NeedPlans.css'
import moment from 'moment';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import IconButton from '@mui/material/IconButton'; // Import IconButton from Material-UI
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import TodayIcon from '@mui/icons-material/Today';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import noRecords from '../../assets/noRecords.png'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import randomColor from 'randomcolor'
import Avatar from '@mui/material/Avatar';
import {format} from 'date-fns'
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const configData = require('../../configure.js');

const localizer = momentLocalizer(moment);

const NeedPlans = () => {
  const userId = useSelector((state)=> state.user.data.osid) //For current user

  //get all fulfillments corresponding to an user
  const [fulfillments, setFulfillments] = useState([])
  useEffect(()=>{
    if(userId){
      axios.get(`${configData.SERVE_FULFILL}/fulfillment/coordinator-read/${userId}?page=0&size=10`)
      .then(response => {
          setFulfillments(response.data)
      })
      .catch(error => {
          console.log(error)
      });
    }
  },[userId])
  console.log(fulfillments)

  //fetch all plans: plans created by joining needs, plans and platforms 
  const [needPlans, setNeedPlans] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = () => {
      
      const fetchRequests = fulfillments.map(obj => {
        const { needId, needPlanId } = obj;


      // Fetch needPlan details
        const fetchNeedPlan = axios.get(`${configData.SERVE_NEED}/need-plan/read/${needPlanId}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching needPlan for ${needPlanId}:`, error);
            return null;
          });

        // Fetch need details
        const fetchNeed = axios.get(`${configData.SERVE_NEED}/need/${needId}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching need for ${needId}:`, error);
            return null;
          });
        // Fetch platform details
        const fetchPlatform = axios.get(`${configData.SERVE_NEED}/need-deliverable/${needPlanId}`)
          .then(response => response.data)
          .catch(error => {
            // console.error(`Error fetching platform for ${needId}:`, error);
            return null;
          });
          return Promise.all([fetchNeedPlan, fetchNeed, fetchPlatform])
          .then(([needPlan, need, platform]) => ({
            ...obj,
            needPlan,
            need,
            platform
          }));
      });

      Promise.all(fetchRequests)
        .then(results => {
          setNeedPlans(results.filter(result => result !== null));
        })
        .catch(error => {
          setError(error.message);
        });
    };

    fetchData();
  }, [fulfillments]);
  console.log(needPlans)

  //counts
  // Extract needId and assignedUserId arrays
  const needIds = needPlans.map(item => item.needId);
  const assignedUserIds = needPlans.map(item => item.assignedUserId);
  // Create sets to get unique values
  const uniqueNeedIds = new Set(needIds);
  const uniqueAssignedUserIds = new Set(assignedUserIds);
  // Get the count of unique values
  const needIdCount = uniqueNeedIds.size;
  const assignedUserIdCount = uniqueAssignedUserIds.size;

  //this is for showing alloted voluteer details
  const userList = useSelector((state) => state.userlist.data);
  const userMap = {}
  const userContact = {}
  for (const user of userList){
    userMap[user.osid] = user.identityDetails.fullname;
    userContact[user.osid] = user.contactDetails.mobile;
  }

  const formatTime = (timeData, timeZone) => {
    const date = new Date(timeData);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZone: 'UTC',
    };
  
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  //make the events from start to end date
  function getTimeSlots(needName, startDate, endDate, timeSlots, assignedUserId, needId, platform, meetURL, startTime, endTime) {
    const timeSlotObject = {};
    timeSlots.forEach(slot => {
      const day = slot.day.toLowerCase();
      timeSlotObject[day] = [format(new Date(slot.startTime), 'hh:mm a'), format(new Date(slot.endTime), 'h:mm a')];
    });
  
    const dateWithTimeSlots = [];
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      const dayIndex = currentDate.getDay();
      const day = daysOfWeek[dayIndex];
      if (timeSlotObject[day]) {
        dateWithTimeSlots.push({
          title: needName,
          start: currentDate.toDateString(), //for session
          end: currentDate.toDateString(), //for session
          startTime: formatTime(startTime, 'Asia/Kolkata'),
          endTime: formatTime(endTime, 'Asia/Kolkata'),
          startDate: new Date(startDate).toDateString(),//for entire plan
          endDate: new Date(endDate).toDateString(),//for entire plan
          assignedUserId: assignedUserId,
          needId: needId,
          softwarePlatform: platform,
          inputUrl: meetURL
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateWithTimeSlots;
  }
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const newEvents = [];
    for (const item of needPlans) {
      if (item.needPlan.occurrence !== null) {
        const { startDate, endDate } = item.needPlan.occurrence;
        let inputURL = "";
        let softwarePlatform = "";
        let startTime="";
        let endTime="";
        if(item.platform && item.platform.inputParameters.length){
          inputURL = item.platform.inputParameters[0].inputUrl;
          softwarePlatform = item.platform.inputParameters[0].softwarePlatform;
          startTime = item.platform.inputParameters[0].startTime;
          endTime = item.platform.inputParameters[0].endTime;
        }
        const sessions = getTimeSlots(item.needPlan.plan.name, startDate, endDate, item.needPlan.timeSlots, item.assignedUserId, item.needId, softwarePlatform, inputURL, startTime, endTime); // Use getTimeSlots function
        newEvents.push(...sessions);
      }
    }
    setEvents(newEvents);
  }, [needPlans]);
  console.log(events) //in format of calender

  const grouped = events.reduce((acc, plan) => {
    const key = `${plan.start}-${plan.needId}`;
    if (!acc[key]) {
        acc[key] = {
            needId: plan.needId,
            start: plan.start,
            end: plan.end,
            startTime: plan.startTime,
            endTime: plan.endTime,
            startDate: plan.startDate,
            endDate: plan.endDate,
            title: plan.title,
            inputUrl: plan.inputUrl,
            softwarePlatform: plan.softwarePlatform,
            assignedUsers: []
        };
    }

    acc[key].assignedUsers.push(plan.assignedUserId);

    return acc;
  }, {});
  const schedules = Object.values(grouped)
  // console.log(schedules)  //for navigation on right

  //view of calender: to show monthwise
  const views = {
    month: true,
    week: false,
    day: false,
    agenda: false,
  }
  //styling of cells inside calender
  const customEventPropGetter = (event, start, end, isSelected) => {
    const eventStyle = {
      backgroundColor: 'white', 
      borderRadius: '5px',
      color: 'black',
      boxShadow: "2px 0px #0080BC inset",
      border: 'solid 1px #DBDBDB'
    };
    const currentDate = end;
    return {
      style: eventStyle,
    };
  };

  const CustomToolbar = ({ onNavigate, label }) => (
    <div className="custom-toolbar">
      <IconButton onClick={() => onNavigate('PREV')}>
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton onClick={() => onNavigate('TODAY')}>
        <TodayIcon />
      </IconButton>
      <IconButton onClick={() => onNavigate('NEXT')}>
        <KeyboardArrowRightIcon />
      </IconButton>
      <div className="calendar-month-year">
        {moment(label).format('MMMM YYYY')} {/* Display month and year */}
      </div>
    </div>
  );

  const [selectedDate, setSelectedDate] = useState(new Date()); // State to store selected date

  useEffect(() => {
    const selectedDateString = moment(selectedDate).format('YYYY-MM-DD');
    setSelectedDate(selectedDateString); 
  }, [selectedDate]);

  const handleSelectSlot = (slotInfo) => {
    const selectedDateString = moment(slotInfo.start).format('YYYY-MM-DD');
    setSelectedDate(selectedDateString); 
  };

  // to show selection of date on calender
  const customDayPropGetter = (date) => {
    const isSelectedDate = moment(date).format('YYYY-MM-DD') === selectedDate;
    const classNames = isSelectedDate ? 'selected-date-cell' : '';
    return { className: classNames };
  };
  
  const [expandEvent, setExpandEvent] = useState(false)
  const [clickedEvent, setClickedEvent] = useState(null)
  const handleEventClick = Index => {
    console.log(Index)
    setClickedEvent(Index)
    setExpandEvent(!expandEvent)
  }


  return (
      <div>
        <div className="wrapCalender">
          <Calendar className="ncCalender"
            localizer={localizer}
            events={events}     //data into calender
            startAccessor="start"
            endAccessor="end"
            views={views}   //which views to enable or disable
            style={{ width: 840 }} // Set the overall calendar width
            eventPropGetter={customEventPropGetter}
            components={{
              toolbar: CustomToolbar,
            }}
            selectable={true} // Enable date selection
            onSelectSlot={handleSelectSlot} // Handle date slot selection
            dayPropGetter={customDayPropGetter} // Apply custom day cell styling
          />
          
          {/* Side List showing list of events */}
          { selectedDate && ( <div className="event-list-nc">
          {/* Need and Volunteer Stats */}
          <div className="stats-need-volunteer">
              <div className="needCountNC">
                <i><StickyNote2Icon /></i> 
                <span>{needIdCount} Needs</span>
              </div>
              <div className="volunteerCountNC">
                <i><PeopleAltIcon /></i> 
                <span>{assignedUserIdCount} Volunteers</span>
              </div>
          </div>
          {/* Selected Event Date */}
          <div className="headEventListNC">{moment(selectedDate).format('MMMM D, YYYY')}</div>
          {/* EVENTS LIST when selected date falls within date range of any event */}
          { schedules.filter((event) => {
            const startDate = moment(event.start);
            const endDate = moment(event.end)
            const selected = moment(selectedDate)
            return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
            })
            .map((event, index) => (
            <div className="dayEventListNC" key={event.start} >
              <button className="dayEventItemNC" onClick={()=>handleEventClick(index)}>
                <div className="dayEventTitleNC" >
                  <div className="wrap-nameDayEventNC">
                    <i> { expandEvent ? <ExpandMoreIcon/> : <ChevronRightIcon /> } </i>
                    <span className="nameDayEventNC">{event.title}</span>
                  </div>
                  <div className="wrap-timeDayEventNC">
                    <span className="timeDayEventNC">
                      <i><AccessTimeIcon style={{fontSize:"18px",color:'grey',paddingBottom:"2px"}}/></i>
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>
                </div>
                <div className="dayEventDateNC"> {event.startDate.slice(4,10)} - {event.endDate.slice(4,10)} </div>
              </button>
              { expandEvent && ( index === clickedEvent ) && <div className="platformInfoNC">
                <div className="vplan-platform"> 
                    <span>Software platform:</span> {event.softwarePlatform}
                  </div>
                  <div className="vplan-url"> 
  <span>Link :</span> 
  <a href={event.inputUrl} target="_blank" rel="noopener noreferrer">
    Session Link
  </a>
</div>
                  <div className="vplan-url"> 
                    <span>Volunteers :</span> 
                  </div>
              </div>}
              { expandEvent && ( index === clickedEvent ) &&
                event.assignedUsers.map((user) => <div className="user-boxNC">
                  <div className="userNameNC">
                    <div><Avatar style={{padding:'5px',height:'24px',width:'24px',fontSize:'16px',backgroundColor:randomColor()}}></Avatar></div>
                    <div className="userName-eventList">{userMap[user]}</div>
                  </div>
                  <div className="userContact-eventList">{userContact[user]}</div>
                </div>)
              }
            </div>
          )) }


          {/* NO EVENTS LIST */}
          {!events.some((event) => {
            const startDate = moment(event.start);
            const endDate = moment(event.end);
            const selected = moment(selectedDate);
            return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
            }) && ( <div className="noEventsOnDay">
              <img src={noRecords} alt="No Events" />
              <p>No needs scheduled on this date</p>
            </div>
          )}

          </div>
          )}
        </div>
      </div>

  );
}

export default NeedPlans;