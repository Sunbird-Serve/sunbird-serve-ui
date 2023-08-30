import React from 'react'
import './VolunteerProfileDeliverable.css'

function VolunteerProfileDeliverable() {
  return (
    <div>
        <div className="detailsNeedVoluntProfile">
            <div className="nameNVP">Teaching Science to 8th Class</div> 
            <div className="typeNVP">Teaching</div>
            <div className="aboutNVP">About the full description of the Need </div>
            <div className="rowNVP">
                <div className="itemNVP">
                    <span>Organizer</span> : Lions Club
                </div>
                <div className="itemNVP">
                    <span>Location</span> : Chennai
                </div>
            </div>
            <div className="rowNVP">
                <div className="itemNVP">
                    <span>Start Date</span> : 05-01-2023
                </div>
                <div className="itemNVP">
                    <span>End Date</span> : 20-01-2023
                </div>
            </div>
            <div className="rowNVP">
                <div className="itemNVP">
                    <span>Time</span> : 10 AM
                </div> 
                {/* <div className="itemNVP">
                    <span>Mode</span> : Online
                </div> */}
            </div>
        </div>
        <div className="deliverablesNeedVolunteerProfile"> 
            {/*DNVP refer to Need Plan Deliverables from Volunteer Profile*/}
            <div className="headDNVP">Need Plan Deliverables</div>
        </div>
        <div className="listDNVP">
            <div><button className="upcomingDNVP">Upcoming</button></div>
            <div><button className="todoDNVP">To-Do</button></div>
            <div><button className="completedDNVP">Completed</button></div>
            <div><button className="canceledDNVP">Canceled</button></div>
        </div>
    </div>
  )
}

export default VolunteerProfileDeliverable