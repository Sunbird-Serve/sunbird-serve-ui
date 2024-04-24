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
  const userId = useSelector((state)=> state.user.data.osid)
  //get nominations by userId
  const [nominations,setNominations] = useState([])
  useEffect(()=> {
    axios.get(`${configData.NOMINATIONS_GET}/${userId}?page=0&size=100`).then(
      response => setNominations(Object.values(response.data))
    ).catch (function (error) {
     console.log(error)
  })
  },[userId])
  //needIds of approved noms
  const approvedNoms = nominations.filter(item => item.nominationStatus === "Approved").map(item => item.needId)
  //needs with approved Noms
  const needsList = useSelector((state) => state.need.data);
  const approvedNeeds = needsList.filter(item => item && item.need && approvedNoms.includes(item.need.id));
  //create events
  function getTimeSlots(needName, startDate, endDate, timeSlots) {
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
      // EVENT is created 
      if (timeSlotObject[day]) {
        dateWithTimeSlots.push({
          title: needName,
          start: currentDate.toDateString(),
          end: currentDate.toDateString(),
          startTime: timeSlotObject[day][0],
          endTime: timeSlotObject[day][1],
          startDate: new Date(startDate).toDateString(),
          endDate: new Date(endDate).toDateString(),
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateWithTimeSlots;
  }

  const GetDeliverableDetails = ({ needId }) => {
    const [responseData, setResponseData] = useState(null);  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`https://api.example.com/endpoint/${needId}`);
          setResponseData(response.data);
        } catch (error) {
          setResponseData(null);
        }
      };
      fetchData();
    }, [needId]); 
    // Return the response data
    return responseData ? responseData : null;
  };

  const result = GetDeliverableDetails('8be43c75-66cc-4490-93e5-5617cc0de8d0')
  console.log(result)
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const newEvents = [];
    for (const item of approvedNeeds) {
      if (item.occurrence !== null) {
        const { startDate, endDate } = item.occurrence;
        // get deliverable details for each item.need.id
        console.log(item.need.id)
        // input to create EVENT are passed from here
        const sessions = getTimeSlots(item.need.name, startDate, endDate, item.timeSlots); // Use getTimeSlots function
        newEvents.push(...sessions);
      }
    }
    setEvents(newEvents);
  }, [nominations]);


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