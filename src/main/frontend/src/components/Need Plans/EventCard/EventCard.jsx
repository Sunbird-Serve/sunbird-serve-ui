import React from "react";
import "./EventCard.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const VolunteerCard = (props) => {
  const { key, name } = props;
  return (
    <Accordion style = {{margin: '0.5vh', borderRadius: '0.5vh'}}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <span className="eventVol">{name}</span>
      </AccordionSummary>
      <div className="eventCard">
        <span className="volNo">9876543210</span>
        <br />
        <div className="taskDesc">
          Complete the cleaning of shores and collect pebbles
        </div>
      </div>
    </Accordion>
  );
};

function EventCard(props) {
  const { ev } = props;

  const RepeatComponent = ({ n, volunteers }) => {
    const components = [];

    for (let i = 0; i < n; i++) {
      components.push(<VolunteerCard key={i} name={volunteers[i]} />);
    }

    return <>{components}</>;
  };

  return (
    <div>
      <span className="timestamp">
        {ev.start.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} to {ev.end.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
      </span>

      <br style={{ clear: "both" }} />
      <Accordion style = {{ background: '#F6F7FB', borderRadius: '1vh'}}> 
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <div className="eventContainer">
           <span className="eventTitle">{ev.title}</span>
           <br />
           <span className="eventDesc">Description |{ev.address}</span>
          </div>
        </AccordionSummary>
        <div className="eventCard">
          <RepeatComponent
            n={ev.volunteers.length}
            volunteers={ev.volunteers}
          />
        </div>
      </Accordion>
    </div>
  );
}

export default EventCard;
