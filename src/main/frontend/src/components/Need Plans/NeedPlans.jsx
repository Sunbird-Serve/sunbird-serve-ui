import React from 'react';
import './NeedPlans.css';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs'
import "react-big-calendar/lib/css/react-big-calendar.css";

function NeedPlans() {

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
    console.log(new Date(2023, 5, 1));

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
    
    return (
        <div className="wrapNeeds">
            <div className="needPlansGrid">
                <div>
                    <Calendar
                    localizer={localizer}
                    events={mockEvents}
                    startAccessor="start"
                    defaultDate={new Date()}
                    step={50}
                    endAccessor="end"
                    style={{ height: 500 }}
                    views={{month: true}}
                    eventPropGetter={eventStyleGetter}
                     />
                </div>
                <div>Events</div>
            </div>
        </div>
    );
}

export default NeedPlans;