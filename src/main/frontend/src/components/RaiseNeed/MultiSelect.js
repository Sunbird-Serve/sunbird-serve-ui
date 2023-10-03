import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Button,
} from '@mui/material';
import './MultiSelect.css'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MultiSelect = ({ onAdd }) => {
  const [scheduleItems, setScheduleItems] = useState([{ day: '', startTime: '', endTime: '' }]);

  const handleDayChange = (event, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].day = event.target.value ;
    setScheduleItems(updatedScheduleItems);
  };

  const handleStartTimeChange = (event, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].startTime = event.target.value ;
    setScheduleItems(updatedScheduleItems);
  };

  const handleEndTimeChange = (event, index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems[index].endTime = event.target.value ;
    setScheduleItems(updatedScheduleItems);
  };

  const handleAdd = () => {
    setScheduleItems([...scheduleItems, { day: '', startTime: '', endTime: '' }]);
  };

  const handleRemove = (index) => {
    const updatedScheduleItems = [...scheduleItems];
    updatedScheduleItems.splice(index, 1);
    setScheduleItems(updatedScheduleItems);
  };

  const handleSave = () => {
    // Pass the scheduleItems to the parent component
    onAdd(scheduleItems);
  };

  return (
    <div>
      {scheduleItems.map((scheduleItem, index) => (
        <Grid container spacing={0} key={index} className="container-daysTime">
          <Grid item xs={4} >
            <FormControl fullWidth>
              {/* <InputLabel>Day</InputLabel> */}
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
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField
              // label="Start Time"
              type="time"
              value={scheduleItem.startTime}
              onChange={(e) => handleStartTimeChange(e, index)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              // label="End Time"
              type="time"
              value={scheduleItem.endTime}
              onChange={(e) => handleEndTimeChange(e, index)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={1} className="button-add-remove">
            {index === scheduleItems.length - 1 ? (
              <button onClick={handleAdd}   
              className="add-button"> + </button>
            ) : (
              <button onClick={() => handleRemove(index)}  
              className="remove-button"> x </button>
            )}
          </Grid>
        </Grid>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        className="button-save"
      >
        Save
      </Button>
    </div>
  );
};

export default MultiSelect;