import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './VolunteerProfileNeedPlans.css'
import moment from 'moment';
import IconButton from '@mui/material/IconButton'; // Import IconButton from Material-UI
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import TodayIcon from '@mui/icons-material/Today';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import noRecords from '../../assets/noRecords.png'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import {format} from 'date-fns'
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const configData = require('../../configure.js');
const localizer = momentLocalizer(moment);

const NeedPlans = () => {
  // const userId = useSelector((state)=> state.user.data.osid)
  const userId='1-153e9fdf-a17c-40f1-83ca-4d7d10ff495a'
  console.log(userId)
  //get fullfillments by volunteerId
  const [fulfillments, setFulfillments] = useState([])
  useEffect(()=>{
    if(userId){
      axios.get(`https://serve-v1.evean.net/api/v1/serve-fulfill/fulfillment/volunteer-read/${userId}?page=0&size=10`)
      .then(response => {
          console.log(response.data)
          setFulfillments(response.data)
      })
      .catch(error => {
          console.log(error)
      });
    }
  },[userId])
  console.log(fulfillments)

  //
  //fetch all plans from fulfillments
  const [needPlans, setNeedPlans] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = () => {
      
      const fetchRequests = fulfillments.map(obj => {
        const { needId, needPlanId } = obj;


      // Fetch needPlan details
        const fetchNeedPlan = axios.get(`https://serve-v1.evean.net/api/v1/serve-need/need-plan/read/${needPlanId}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching needPlan for ${needPlanId}:`, error);
            return null;
          });

        // Fetch need details
        const fetchNeed = axios.get(`https://serve-v1.evean.net/api/v1/serve-need/need/${needId}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching need for ${needId}:`, error);
            return null;
          });
        // Fetch platform details
        const fetchPlatform = axios.get(`https://serve-v1.evean.net/api/v1/serve-need/deliverable-details/${needId}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching platform for ${needId}:`, error);
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
  console.log(needIdCount)
  console.log(assignedUserIdCount)

  //make the events from start to end date
  function getTimeSlots(needName, startDate, endDate, timeSlots, assignedUserId, needId) {
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
          startTime: timeSlotObject[day][0],
          endTime: timeSlotObject[day][1],
          startDate: new Date(startDate).toDateString(),//for entire plan
          endDate: new Date(endDate).toDateString(),//for entire plan
          assignedUserId: assignedUserId,
          needId: needId
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
        const sessions = getTimeSlots(item.needPlan.plan.name, startDate, endDate, item.needPlan.timeSlots, item.assignedUserId, item.needId); // Use getTimeSlots function
        newEvents.push(...sessions);
      }
    }
    setEvents(newEvents);
  }, [needPlans]);
  console.log(events)


  //list of approved nominations for a volunteer
  //need plan is from needIds

  const views = {
    month: true,
    week: false,
    day: false,
    agenda: false,
  }
  const customEventPropGetter = (event, start, end, isSelected) => {
    const eventStyle = {
      backgroundColor: 'white', // Customize background color based on event property
      borderRadius: '5px',
      color: 'black',
      boxShadow: "2px 0px #0080BC inset",
      border: 'solid 1px #DBDBDB'
    };
  return {
    style: eventStyle,
  };
    
    
  };

  const month = {'01':'Jan','02':'Feb', '03':'Mar', '04':'Apr', '05':'May', '06':'Jun', '07':'Jul', '08':'Aug', '09':'Sep', '10':'Oct', '11':'Nov', '12':'Dec'}

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

  const [selectedDate, setSelectedDate] = useState(new Date()); 

  useEffect(() => {
    const selectedDateString = moment(selectedDate).format('YYYY-MM-DD');
    setSelectedDate(selectedDateString); 
  }, [selectedDate]);

  const handleSelectSlot = (slotInfo) => {
    const selectedDateString = moment(slotInfo.start).format('YYYY-MM-DD');
    setSelectedDate(selectedDateString); // Capture selected date
  };

  // to show selection of date on calender
  const customDayPropGetter = (date) => {
    const isSelectedDate = moment(date).format('YYYY-MM-DD') === selectedDate;
    const classNames = isSelectedDate ? 'selected-date-cell' : '';
    return { className: classNames };
  };

  return (
      <div>
        <div className="wrapCalender">
          <Calendar className="vCalender"
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
          
        {selectedDate && ( <div className="event-list">
          <div className="headEventList">{moment(selectedDate).format('MMMM D, YYYY')}</div>

          {events.some((event) => {
              const startDate = moment(event.start);
              const endDate = moment(event.end);
              const selected = moment(selectedDate);

              return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
            }) && (
            <div className="statsEventList">
              {/* <span>To Do</span>
              <span>Completed</span>
              <span>Canceled</span> */}
            </div>
          )}

          {events.filter((event) => {
            const startDate = moment(event.start);
            const endDate = moment(event.end)
            const selected = moment(selectedDate)
            return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
            })
            .map((event) => (
              <li className="dayEventList" key={event.title}>
                <div className="dayEventTitle">
                  <span className="nameDayEvent">{event.title}</span>
                  <span className="timeDayEvent">
                    <i><AccessTimeIcon style={{fontSize:"18px",color:'grey',paddingBottom:"2px"}}/></i>
                    {event.startTime}
                  </span> 
                </div>
                <div className="dayEventDate"> {event.startDate.slice(4,10)} - {event.endDate.slice(4,10)}</div>
                  {/* <div className="dayEventDetails">View Full Details</div> */}
              </li>
          ))}  

          {!events.some((event) => {
            const startDate = moment(event.start);
            const endDate = moment(event.end);
            const selected = moment(selectedDate);
            return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
            }) && (<div className="noEventsOnDay">
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