import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import './MonoSelect.css';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MonoSelect = ({ onAdd, frequency }) => {
  const [selectedDay, setSelectedDay] = useState('Monday'); // Set 'Monday' as the default value
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    // Set the default selected day(s) based on the frequency prop
    if (frequency === 'weekdays') {
      setSelectedDay('Mon-Fri');
    } else if (frequency === 'weekend') {
      setSelectedDay('Sat-Sun');
    } else if (frequency === 'daily') {
      setSelectedDay('Mon-Sun');
    } else if (frequency === 'weekly') {
      setSelectedDay('Monday');
    }
  }, [frequency]);

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
    saveValues();
  };

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
    saveValues();
  };

  const handleEndTimeChange = (event) => {
    setEndTime(event.target.value);
    saveValues();
  };

  const saveValues = () => {
    let selectedDaysArray = [];

    if (selectedDay === 'Mon-Fri') {
      // If selected days are "Monday-Friday," create an array of objects for each day
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
        selectedDaysArray.push({ day, startTime, endTime });
      }
    } else if (selectedDay === 'Sat-Sun') {
      // If selected days are "Saturday-Sunday," create an array of objects for each day
      for (const day of ['Saturday', 'Sunday']) {
        selectedDaysArray.push({ day, startTime, endTime });
      }
    } else if (selectedDay === 'Mon-Sun') {
      // If selected days are "Monday-Sunday," create an array of objects for each day
      for (const day of daysOfWeek) {
        selectedDaysArray.push({ day, startTime, endTime });
      }
    } else {
      // Otherwise, create an array with a single object for the selected day
      selectedDaysArray = [{ day: selectedDay, startTime, endTime }];
    }

    // Pass the array of objects to the parent component
    onAdd(selectedDaysArray);
  };

  return (
    <div>
      <Grid container spacing={0} className="wrapDayTime">
        <Grid item xs={3.2}>
          <FormControl fullWidth>
            <Select
              value={selectedDay}
              onChange={handleDayChange}
              className="label-days"
            >
              {frequency === 'weekdays' ? (
                <MenuItem value="Mon-Fri">Mon-Fri</MenuItem>
              ) : frequency === 'weekend' ? (
                <MenuItem value="Sat-Sun">Sat-Sun</MenuItem>
              ) : frequency === 'daily' ? (
                <MenuItem value="Mon-Sun">Mon-Sun</MenuItem>
              ) : (
                daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3.6}>
          <TextField
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={3.6}>
          <TextField
            type="time"
            value={endTime}
            onChange={handleEndTimeChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default MonoSelect;