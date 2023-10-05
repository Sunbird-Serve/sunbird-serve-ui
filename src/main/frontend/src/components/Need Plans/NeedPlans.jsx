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
import configData from '../../configData.json'
import axios from 'axios'
import randomColor from 'randomcolor'
import Avatar from '@mui/material/Avatar';
import {format} from 'date-fns'
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


const localizer = momentLocalizer(moment);

const NeedPlans = () => {
  const userId = useSelector((state)=> state.user.data.osid)
  const userList = useSelector((state) => state.userlist.data);
  const userMap = {}
  for (const user of userList){
    userMap[user.osid] = user;
  }

  //get needs raised by nCoordinator
  const needList = useSelector((state) => state.need.data);
  console.log(needList)
  const needsByUser = needList.filter(item => item && item.need && item.need.userId === userId)
  console.log(needsByUser)

  //see if needIds by user have need plans and save if they
  const [nomNeedMap, setNomNeedMap] = useState([])
  useEffect(() => {
  async function fetchNoms() {
    const promises = needsByUser.map(item => axios.get(`${configData.NEED_GET}/${item.need.id}/nominate/Approved`));

    try {
      const responses = await Promise.all(promises);

      // const nomedNeeds = responses.map(response => response.data).filter(item => item.length).map(item => item[0].needId);
      const nomedNeeds = responses.map(response => response.data).filter(item => item.length)
      const filterNomNeed = nomedNeeds.reduce((acc, elementArray) => {
        elementArray.forEach(obj => {
          const { needId, nominatedUserId } = obj;
          if (!acc[needId]) {
            acc[needId] = [];
          }
          acc[needId].push(nominatedUserId);
        });
        return acc;
      }, {});
      setNomNeedMap(filterNomNeed)
    } catch (error) {
      console.error("Error fetching plans for: ",promises);
    }
    }
    fetchNoms();
  }, [userId]);
  console.log(nomNeedMap)

  const [needPlans, setNeedPlans] = useState([]);
  useEffect(() => {
    const newResultArray = [];
    for (const needId in nomNeedMap) {
      const matchingNeed = needList.filter(needItem => needItem && needItem.need).find(needItem => needItem.need.id === needId);
      console.log(matchingNeed)
      if (matchingNeed) {
        const resultObject = {
          needId: matchingNeed.need.id,
          assignedUserId: nomNeedMap[needId],
          needInfo: matchingNeed,
        };

        newResultArray.push(resultObject);
      }
    }
    setNeedPlans(newResultArray);
  }, [nomNeedMap, needList]);

  console.log(needPlans)

  //make the events from start to end date
  function getTimeSlots(needName, startDate, endDate, timeSlots) {
    const timeSlotObject = {};
    timeSlots.forEach(slot => {
      const day = slot.day.toLowerCase();
      timeSlotObject[day] = [format(new Date(slot.startTime), 'h:mm a'), format(new Date(slot.endTime), 'h:mm a')];
      console.log(timeSlotObject[day])
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
          start: currentDate.toDateString(),
          end: currentDate.toDateString(),
          startTime: timeSlotObject[day][0],
          endTime: timeSlotObject[day][1],
          startDate: new Date(startDate).toDateString(),
          endDate: new Date(endDate).toDateString()
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
      if (item.needInfo.occurrence !== null) {
        const { startDate, endDate } = item.needInfo.occurrence;
        const sessions = getTimeSlots(item.needInfo.need.name, startDate, endDate, item.needInfo.timeSlots); // Use getTimeSlots function
        newEvents.push(...sessions);
      }
    }
    setEvents(newEvents);
  }, [needPlans]);

  console.log(events)

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

  const [filteredEvents, setFilteredEvents ] = useState([])
  useEffect(() => {
    const data = events.filter((event) => {
      const startDate = moment(event.start);
      const endDate = moment(event.end)
      const selected = moment(selectedDate)
      return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
    })

    setFilteredEvents(data)
  }, [selectedDate]);
  



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
          
          {/* Side List showing list of events */}
          {selectedDate && ( <div className="event-list">
          {/* Selected Event Date */}
          <div className="headEventList">{moment(selectedDate).format('MMMM D, YYYY')}</div>
          {/* Need and Volunteer Stats */}
          <div className="stats-need-volunteer">
              <div className="needCount1">
                <i><StickyNote2Icon /></i> Needs
              </div>
              <div className="volunteerCount1">
                <i><PeopleAltIcon /></i> Volunteers
              </div>
          </div>
          {/* EVENTS LIST when selected date falls within date range of any event */}
          { filteredEvents.map((event) => (
            <li className="dayEventList" key={event.title}>
              <div className="dayEventTitle">
                <span><ChevronRightIcon /></span>
                <span className="nameDayEvent">{event.title}</span>
                <span className="timeDayEvent">{event.startTime}</span> 
              </div>
              <div className="dayEventDate"> {event.startDate.slice(4,10)} - {event.endDate.slice(4,10)} </div>
            </li>
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