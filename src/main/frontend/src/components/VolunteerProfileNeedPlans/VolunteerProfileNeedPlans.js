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
import configData from '../../configData.json'
import axios from 'axios'



const localizer = momentLocalizer(moment);

const NeedPlans = () => {
  const userId = useSelector((state)=> state.user.data.osid)
  
  const [nominations,setNominations] = useState([])
  useEffect(()=> {
    axios.get(`${configData.NOMINATIONS_GET}/${userId}?page=0&size=100`).then(
      response => setNominations(Object.values(response.data))
    ).catch (function (error) {
     console.log(error)
  })
  },[userId])
  console.log(nominations)
  //needIds of approved noms
  const approvedNoms = nominations
    .filter(item => item.nominationStatus === "Approved")
    .map(item => item.needId)

  console.log(approvedNoms)

  const needsList = useSelector((state) => state.need.data);
  const approvedNeeds = needsList.filter(item => item && item.need && approvedNoms.includes(item.need.id));
  console.log(approvedNeeds)
  const events = approvedNeeds.map(item => ({
    title: item.need.name,
    start: item.needRequirement.startDate.slice(0,10),
    end: item.needRequirement.endDate.slice(0,10),
    timeSlot: item.needRequirement.startDate.slice(11,16)
  }));
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
    const currentDate = end;

  if (currentDate <= event.end) {
    console.log(currentDate)
    eventStyle.backgroundColor = 'green'; // Customize background color for dates within the range
    eventStyle.color = 'white'; // Customize text color for dates within the range
  } 

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

  const [selectedDate, setSelectedDate] = useState(new Date()); // State to store selected date

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
            <span>To Do</span>
            <span>Completed</span>
            <span>Canceled</span>
          </div>
          )}
            {events
              .filter((event) => {
                const startDate = moment(event.start);
                const endDate = moment(event.end)
                const selected = moment(selectedDate)
                return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
              })
              .map((event) => (
                <li className="dayEventList" key={event.title}>
                  <div className="dayEventTitle">
                    <span className="nameDayEvent">{event.title}</span>
                    {/* <span className="timeDayEvent">{event.timeSlot}</span> */}
                  </div>
                <div className="dayEventDate"> {month[event.start.slice(5,7)]} {event.start.slice(8,10)} - {month[event.end.slice(5,7)]} {event.end.slice(8,10)}</div>
                  <div className="dayEventDetails">View Full Details</div>
                </li>
              ))}

            {!events.some((event) => {
              const startDate = moment(event.start);
              const endDate = moment(event.end);
              const selected = moment(selectedDate);

              return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
            }) && (
              <div className="noEventsOnDay">
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