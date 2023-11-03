import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Grid } from '@mui/material';
import './MultiSelect.css';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MultiSelect = ({ onAdd }) => {
  const today = dayjs()
  const [scheduleItems, setScheduleItems] = useState([{ day: '', startTime: today, endTime: today }]);

  const handleDayChange = (event, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].day = event.target.value;
    setScheduleItems(updatedScheduleItems);
    onAdd(updatedScheduleItems); 
  };

  const handleStartTimeChange = (newValue, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].startTime = newValue.format('YYYY-MM-DDTHH:mm:ss.SSSZ') ;
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
    <div className="container-multiselect">
      {scheduleItems.map((scheduleItem, index) => (
        <div className="container-daysTime">
          <div className="day-container">
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
          <div className="button-add-remove">
            <button onClick={() => handleRemove(index)} className="remove-button"> x </button>
          </div>
          
          </div>
          <div className="time-container">
          <div className="time-item">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
            <TimePicker
              value={scheduleItem.startTime}
              renderInput = {(params) => <TextField {...params} />}
              onChange={(newValue) => handleStartTimeChange(newValue, index)}
            />
            </DemoContainer>
          </LocalizationProvider>
          </div>

          <div className="time-item">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
            <TimePicker
              value={scheduleItem.endTime}
              renderInput = {(params) => <TextField {...params} />}
              onChange={(newValue) => handleEndTimeChange(newValue, index)}
            />
            </DemoContainer>
          </LocalizationProvider>
          </div>

          </div>

        </div>
      ))}
      <button onClick={handleAdd} className="add-button"> + </button>
    </div>
  );
};

export default MultiSelect;