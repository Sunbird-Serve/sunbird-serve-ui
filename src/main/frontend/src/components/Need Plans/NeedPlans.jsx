import React, { useState } from 'react';
import './NeedPlans.css';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs'
import "react-big-calendar/lib/css/react-big-calendar.css";

function NeedPlans() {

    const [currentDate, setCurrentDate] = useState(new Date());

    const mockEvents = [
        {
            title: 'Event 1',
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
    
    return (
        <div className="wrapNeeds">
            <div className="needPlansGrid">
                <div>
                    <span style={{float: 'left', width: '30%'}}>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
                    <div style={{float: 'left'}}>
                        <button type="button" onClick={() => dateHandler(currentDate, '-')} >{'<'}</button>
                        <button type="button" onClick={() => dateHandler(currentDate, '+')} >{'>'}</button>
                    </div>
                    <br />
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
                     />
                    </div>
                </div>
                <div>Events</div>
            </div>
        </div>
    );
}

export default NeedPlans;