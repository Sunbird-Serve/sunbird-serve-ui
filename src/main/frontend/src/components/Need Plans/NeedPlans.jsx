import React, { useState } from 'react';
import './NeedPlans.css';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs'
import "react-big-calendar/lib/css/react-big-calendar.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventsSideBar from './EventsSideBar/EventsSideBar';

function NeedPlans() {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const mockEvents = [
        {
            title: 'Event 1',
            start: new Date(2023, 5, 10),
            end: new Date(2023, 5, 11),
            color: 'blue', // Custom property to define the color
          },
          {
            title: 'Event 4',
            start: new Date(2023, 5, 10),
            end: new Date(2023, 5, 11),
            color: 'blue', // Custom property to define the color
          },
          {
            title: 'Event 5',
            start: new Date(2023, 5, 10),
            end: new Date(2023, 5, 11),
            color: 'blue', // Custom property to define the color
          },
          {
            title: 'Event 2',
            start: new Date(2023, 5, 15),
            end: new Date(2023, 5, 16),
            color: 'red', // Custom property to define the color
          },
    ];

    const localizer = dayjsLocalizer(dayjs);

    // Custom event style getter
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color, // Set the background color dynamically
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  function dateHandler(date, flag) {
    const modifiedDate = new Date(date);
    switch(flag) {
        case '+':
            modifiedDate.setMonth(modifiedDate.getMonth() + 1);
            break;
        case '-':
            modifiedDate.setMonth(modifiedDate.getMonth() - 1);
            break;
        default:
            break;
    }
    console.log(date, 'date here');
    console.log(modifiedDate, 'check here');
    setCurrentDate(modifiedDate);
  }

  const handleSelectEvent = (event, e) => {
    // Handle the selection of an event
    console.log('Selected event:', JSON.stringify(event));
    setSelectedDate(event.start);
    // Perform any additional logic or dispatch actions
    // based on the selected event
  };

  const handleDrillDown = (date, view) => {
    // Handle the click on the "More" link
    console.log('Drill down date:', date);
    console.log('Drill down view:', view);
    setSelectedDate(date);
  };
    
    return (
        <div className="wrapNeeds">
            <div className="needPlansGrid">
                <div className = 'calendar'>
                  <div>
                    <div>
                      <span style={{float: 'left', width: '8%', marginRight: '1%'}}>{currentDate.toLocaleString('default', { month: 'long' })}</span>
                      <span style={{float: 'left', width: '5%', marginRight: '1%'}}>{currentDate.getFullYear()}</span>
                    </div>
                    <div style={{float: 'left'}}>
                        <button type="button" onClick={() => dateHandler(currentDate, '-')} >{'<'}</button>
                        <button type="button" onClick={() => dateHandler(currentDate, '+')} >{'>'}</button>
                    </div>
                  </div>
                  <br style={{clear: 'both'}}/>
                    <div className="box">
                      <div className="content">
                        <div className="label"><VisibilityIcon style = {{fontSize: 'small', paddingRight: '0.5vw'}} />Needs</div>
                        <div className="value">565</div>
                      </div>
                      <div className="content">
                        <div className="label"><VisibilityIcon style = {{fontSize: 'small', paddingRight: '0.5vw'}} />Volunteers</div>
                        <div className="value">565</div>
                      </div>
                    </div>
                  <br style={{clear: 'both'}}/>
                    <div>
                    <Calendar
                    localizer={localizer}
                    events={mockEvents}
                    toolbar={false}
                    startAccessor="start"
                    date={currentDate}
                    step={50}
                    endAccessor="end"
                    style={{ height: 500 }}
                    views={{month: true}}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    onDrillDown={handleDrillDown}
                     />
                    </div>
                </div>
                <div className = 'events'>
                  <EventsSideBar selectedDate={selectedDate}/>
                </div>
            </div>
        </div>
    );
}

export default NeedPlans;