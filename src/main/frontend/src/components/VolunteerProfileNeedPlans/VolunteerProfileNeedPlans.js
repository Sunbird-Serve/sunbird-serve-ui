import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './VolunteerProfileNeedPlans.css'
import moment from 'moment';
import IconButton from '@mui/material/IconButton'; // Import IconButton from Material-UI
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import TodayIcon from '@mui/icons-material/Today';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import noRecords from '../../assets/noRecords.png'

const localizer = momentLocalizer(moment);

const NeedPlans = () => {
  const events = [
    {
      start: new Date('2023-08-25T10:00:00'),
      end: new Date('2023-08-25T12:00:00'),
      title: 'Kaveri River Cleaning',
      timeSlot: '10:00 AM'
    },
    {
      start: new Date('2023-08-21T10:00:00'),
      end: new Date('2023-08-21T12:00:00'),
      title: 'Teaching Science Class 8',
      timeSlot: '10:00 AM'
    },
    {
      start: new Date('2023-08-12T10:00:00'),
      end: new Date('2023-08-12T12:00:00'),
      title: 'Python programming for Data Analysis',
      timeSlot: '10:00 AM'
    },
    {
      start: new Date('2023-08-12T14:00:00'),
      end: new Date('2023-08-12T16:00:00'),
      title: 'Web development',
      timeSlot: '10:00 AM'
    },
  ];

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
        events={events}
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
        {selectedDate && (
        <div className="event-list">
          <div className="headEventList">{moment(selectedDate).format('MMMM D, YYYY')}</div>
          {events.some((event) => moment(event.start).format('YYYY-MM-DD') === selectedDate) && (
          <div className="statsEventList">
            <span>To Do</span>
            <span>Completed</span>
            <span>Canceled</span>
          </div>
          )}
            {events
              .filter((event) => moment(event.start).format('YYYY-MM-DD') === selectedDate)
              .map((event) => (
                <li className="dayEventList" key={event.title}>
                  <div className="dayEventTitle">
                    <span className="nameDayEvent">{event.title}</span>
                    <span className="timeDayEvent">{event.timeSlot}</span>
                  </div>
                  <div className="dayEventDate"> Aug 15 - Aug 18</div>
                  <div className="dayEventDetails">View Full Details</div>
                </li>
              ))}

            {!events.some((event) => moment(event.start).format('YYYY-MM-DD') === selectedDate) && (
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