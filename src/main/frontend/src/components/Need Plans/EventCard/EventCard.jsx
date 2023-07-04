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
    const {startTime, endTime, title,address} = props;

    const RepeatComponent = ({ n }) => {
        const components = [];
      
        for (let i = 0; i < n; i++) {
          components.push(<VolunteerCard key={i} />);
        }
      
        return <>{components}</>;
      };

    return (
        <div>
            <span className='timestamp'>{startTime} to {endTime}</span>
            <br style={{clear: 'both'}} />
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {title}
                    <br />
                    {address}
                </AccordionSummary>
                <div className='eventCard'>
                    <RepeatComponent n={5} />
                </div>
            </Accordion>
        </div>
    );

};

export default EventCard;