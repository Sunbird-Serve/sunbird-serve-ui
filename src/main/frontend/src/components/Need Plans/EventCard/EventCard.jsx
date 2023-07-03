import React from 'react';
import './EventCard.css';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const VolunteerCard = (props) => {
    const {key} = props;
    return (
        <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Volunteer {key}
                    <br />
                    Address Chennai
                </AccordionSummary>
                <div className='eventCard'>
                    Volunteer details
                </div>
            </Accordion>
    );
}


function EventCard(props) {
    const {event} = props;

    const RepeatComponent = ({ n }) => {
        const components = [];
      
        for (let i = 0; i < n; i++) {
          components.push(<VolunteerCard key={i} />);
        }
      
        return <>{components}</>;
      };

    return (
        <div>
            <span className='timestamp'>9:00am to 1:00pm</span>
            <br style={{clear: 'both'}} />
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Title
                    <br />
                    Address
                </AccordionSummary>
                <div className='eventCard'>
                    <RepeatComponent n={5} />
                </div>
            </Accordion>
        </div>
    );

};

export default EventCard;