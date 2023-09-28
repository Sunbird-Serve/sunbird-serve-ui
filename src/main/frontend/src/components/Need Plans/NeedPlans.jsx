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



const localizer = momentLocalizer(moment);

const NeedPlans = () => {
  const userId = useSelector((state)=> state.user.data.osid)

  //get needs raised by nCoordinator
  const needList = useSelector((state) => state.need.data);
  const needsByUser = needList.filter(item => item && item.need && item.need.userId === userId)
  ////////////


  const [needPlans, setNeedPlans] = useState([]);

  useEffect(() => {
    setNeedPlans([])
    async function getNeedPlan(needId) {
      try {
        const response = await axios.get(`${configData.NEEDPLAN_GET}/${needId}`);
        if (response.data !== null) {
          setNeedPlans((prevNeedPlan) => [...prevNeedPlan, ...response.data]);
        }
      } catch (error) {
        console.error(`Error fetching data for need ID ${needId}: ${error.message}`);
        throw error;  
      }
    }

    // Use async/await inside the useEffect to fetch data
    async function fetchData() {
      for (const needByUserItem of needsByUser) {
        const needId = needByUserItem.need.id; 
        await getNeedPlan(needId);
      }
    }

    // Call the fetchData function when the component mounts
    fetchData();
  }, [needList]); 
  console.log(needPlans)

  //////////////////////
  
  const [needPlanDetails, setNeedPlanDetails ] = useState([])
  useEffect(() => {
    const planDetails = needPlans.map((plan) => {
      const need = needList.find((need) => need && need.need.id === plan.needId);
      if(need){
        return {...plan, needInfo: need }
      }
      return plan
    })
    setNeedPlanDetails(planDetails)
  }, [needPlans]);
  console.log(needPlanDetails)

  const events = needPlanDetails.map(item => ({
    title: item.needInfo.need.name,
    start: item.needInfo.needRequirement.startDate.slice(0,10),
    end: item.needInfo.needRequirement.endDate.slice(0,10),
    timeSlot: item.needInfo.needRequirement.startDate.slice(11,16)
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
          
        {/* Side List showing list of events */}
        {selectedDate && ( <div className="event-list">
          <div className="headEventList">{moment(selectedDate).format('MMMM D, YYYY')}</div>
          {events.some((event) => {
              const startDate = moment(event.start);
              const endDate = moment(event.end);
              const selected = moment(selectedDate);

              return selected.isSameOrAfter(startDate) && selected.isSameOrBefore(endDate);
            }) && (
              <div>
              <div className="needCount1">
              <i><StickyNote2Icon /></i>
              {/* <span>{filteredData.length}</span> */}
              <label>Needs</label>
            </div>
            <div className="volunteerCount1">
              <i><PeopleAltIcon /></i>
              <span> </span>
              <label>Volunteers</label>
            </div>
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
                  {/* <div className="dayEventDetails">View Full Details</div> */}
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