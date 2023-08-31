import React from "react";
import "./EventCard.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const VolunteerCard = (props) => {
  const { key, name } = props;
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        className="volunteerCard"
      >
        Name: {name}
        <br />
        Address: Chennai
      </AccordionSummary>
      <div className="eventCard">Volunteer details</div>
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
        {ev.start.getHours()}:{ev.start.getMinutes()} to {ev.end.getHours()}:
        {ev.end.getMinutes()}
      </span>

      <br style={{ clear: "both" }} />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {ev.title}
          <br />
          {/* {ev.address} */}
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
