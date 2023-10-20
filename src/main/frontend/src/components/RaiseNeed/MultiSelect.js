import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import './MultiSelect.css';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MultiSelect = ({ onAdd }) => {
  const [scheduleItems, setScheduleItems] = useState([{ day: '', startTime: '', endTime: '' }]);

  const handleDayChange = (event, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].day = event.target.value;
    setScheduleItems(updatedScheduleItems);
    onAdd(updatedScheduleItems); // Save values immediately
  };

  const handleStartTimeChange = (event, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].startTime = event.target.value ;
    setScheduleItems(updatedScheduleItems);
    onAdd(updatedScheduleItems); 
  };

  const handleEndTimeChange = (event, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].endTime = event.target.value;
    setScheduleItems(updatedScheduleItems);
    onAdd(updatedScheduleItems); 
  };

  const handleRemove = (index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems.splice(index, 1);
    setScheduleItems(updatedScheduleItems);
    onAdd(updatedScheduleItems); 
  };

  const handleAdd = () => {
    const newScheduleItem = { day: '', startTime: '', endTime: '' };
    const updatedScheduleItems = [...scheduleItems, newScheduleItem];
    setScheduleItems(updatedScheduleItems);
    onAdd(updatedScheduleItems); // Save values immediately
  };

  return (
    <div>
      {scheduleItems.map((scheduleItem, index) => (
        <div className="container-daysTime">
          <div >
              <Select
                value={scheduleItem.day}
                onChange={(e) => handleDayChange(e, index)}
                className="days-label"
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
          </div>
          <div className="time-item">
            <input
              type="time"
              value={scheduleItem.startTime}
              onChange={(e) => handleStartTimeChange(e, index)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>

          <div >
            <input
              type="time"
              value={scheduleItem.endTime}
              onChange={(e) => handleEndTimeChange(e, index)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>

          <div className="button-add-remove">
            <button onClick={() => handleRemove(index)} className="remove-button"> x </button>
          </div>
        </div>
      ))}
      <button onClick={handleAdd} className="add-button"> + </button>
    </div>
  );
};

export default MultiSelect;