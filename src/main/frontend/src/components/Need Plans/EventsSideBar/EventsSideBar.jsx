import React from 'react';
import './EventsSideBar.css';
import EventCard from '../EventCard/EventCard';

function EventsSideBar(props) {
    const {selectedDate} = props;
    const options = { weekday: 'long', day: 'numeric', year: 'numeric' };
    
    return (
        <div className="events">
            <div>Needs | {new Date(selectedDate).toLocaleDateString('en-US', options)}</div>
            <div>
                <EventCard event={{time: '9:00am - 1:00pm', title: 'Event Title', address: 'event address'}}/>
            </div>
        </div>
    );
}

export default EventsSideBar;