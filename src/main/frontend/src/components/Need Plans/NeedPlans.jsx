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
  const needsByUser = needList.filter(item => item && item.need && item.need.userId === userId)

  //see if needIds by user have need plans and save if they
  const [needPlans, setNeedPlans] = useState([]);
  useEffect(() => {
    async function getNeedPlan(needId) {
      try {
        const response = await axios.get(`${configData.NEEDPLAN_GET}/${needId}`);
        return response.data || [];
      } catch (error) {
        return []
      }
    }

    // Use async/await inside the useEffect to fetch data
    async function fetchData() {
      let flattenedNeedPlans = [];
      for (const needByUserItem of needsByUser) {
        const needId = needByUserItem.need.id; 
        const response = await getNeedPlan(needId);
        flattenedNeedPlans = [...flattenedNeedPlans, ...response]
      }
      setNeedPlans(flattenedNeedPlans)
    }

    // Call the fetchData function when the component mounts
    fetchData();
  }, []); 
  console.log(needPlans)


  function VolunteerByNeedId({ needId }) {
    const [volunteerList, setVolunteerList] = useState(null);
    const [volunteerNames, setVolunteerNames] = useState([]);
    console.log(volunteerList);
    console.log(volunteerNames)
     useEffect(() => {
       axios
         .get(`${configData.NEED_GET}/${needId}/nominate`)
         .then((response) => {
           setVolunteerList(response.data);
         })
         .catch((error) => {
           console.error("Fetching Entity failed:", error);
         });
     }, [needId]);
     
     useEffect(() => {
      if (volunteerList) {
        const volunteerIds = volunteerList.map((item) => item['nominatedUserId']);
        // Function to fetch volunteer details by volunteerId: NAME
        const fetchVolunteerDetails = async (volunteerId) => {
          try {
            const response = await axios.get(`${configData.USER_GET}/${volunteerId}`); 
            return response.data.identityDetails.name; // Assuming your API returns a name field
          } catch (error) {
            console.error(`Error fetching volunteer details for ID ${volunteerId}:`, error);
            return null;
          }
        };
  
        // Use Promise.all to make API calls for all volunteerIds concurrently
        const fetchDataForAllVolunteers = async () => {
          const promises = volunteerIds.map((volunteerId) => fetchVolunteerDetails(volunteerId));
          const volunteerNames = await Promise.all(promises);
          setVolunteerNames(volunteerNames);
        };
  
        fetchDataForAllVolunteers();
      }
    }, [volunteerList]);

    return volunteerNames;

  }

  
  const [needPlanDetails, setNeedPlanDetails] = useState([])

  useEffect(() => {
    const planDetails = needPlans.map((plan) => {
      const need = needList.find((need) => need && need.need.id === plan.needId);
      async function fetchData() {
        try {
          const response = await axios.get(`${configData.NEED_GET}/${plan.needId}/nominate`);      
          const volunteer = response.data.map((item) => userMap[item['nominatedUserId']]);
          return volunteer;
        } catch (error) {
          console.error("Fetching Entity failed:", error);
        }
      }
    let volunteerArray = [];
    fetchData()
    .then((volunteerArray) => {
      console.log(volunteerArray); // Access the resolved array
    })
    .catch((error) => {
      console.error("Error:", error);
    });
    
      if(need && volunteerArray ){
        return {...plan, needInfo: need, volunteerInfo: volunteerArray }
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
    timeSlot: item.needInfo.needRequirement.startDate.slice(11,16),
    needId: item.needId
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
  console.log(selectedDate)

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
  
  console.log(filteredEvents.length)




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
          {/* When selected date falls within date range of any event */}
            { filteredEvents.map((event) => (
      <li className="dayEventList" key={event.title}>
        <div className="dayEventTitle">
          <span className="nameDayEvent">{event.title}</span>
          {/* <span className="timeDayEvent">{event.timeSlot}</span> */}
        </div>
      <div className="dayEventDate"> {month[event.start.slice(5,7)]} {event.start.slice(8,10)} - {month[event.end.slice(5,7)]} {event.end.slice(8,10)}</div>
        {/* <div className="dayEventDetails">View Full Details</div> */}
        <div className="vAvatars-container">{}
        </div>
      </li>
    )) }


            {/* NO EVENTS SCREEN */}
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