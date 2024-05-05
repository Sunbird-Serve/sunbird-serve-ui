import React, { useState, useEffect } from 'react';
import {  FormControl,  InputLabel,  Select,  MenuItem, TextField,  Grid } from '@mui/material';
import './MonoSelect.css';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MonoSelect = (props) => {
  const { onAdd, frequency, scheduleTime } = props
  const [selectedDay, setSelectedDay] = useState(''); 
  //scheduleTime is in dayjs object format, being converted in ModifyNeed.js
  const [startTime, setStartTime] = useState(scheduleTime[0].startTime)
  const [endTime, setEndTime] = useState(scheduleTime[0].endTime)

  //Set the default selected day based on the frequency prop
  useEffect(() => {
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

  //splitting day range into days
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

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
    saveValues();
  }

  const handleStartTimeChange = (newValue) => {
    setStartTime(newValue)
  }

  const handleEndTimeChange = (newValue) => {
    setEndTime(newValue)
  }

  useEffect(()=> {
    saveValues();
    // console.log(startTime)
    // console.log(endTime)
  },[selectedDay, startTime, endTime])

  return (
    <div className="wrapDayTime">
      {/* automatically select event days */}
      <div>
        <Select value={selectedDay} onChange={handleDayChange} className="label-days">
          { frequency === 'weekdays' ? ( <MenuItem value="Mon-Fri">Mon-Fri</MenuItem>) 
          : frequency === 'weekend' ? ( <MenuItem value="Sat-Sun">Sat-Sun</MenuItem>) 
          : frequency === 'daily' ? (<MenuItem value="Mon-Sun">Mon-Sun</MenuItem>) 
          : ( daysOfWeek.map((day) => ( <MenuItem key={day} value={day}> {day}</MenuItem>))
          )}
        </Select>
      </div>
        
      <div className="container-time">
        {/* Start time */}
        <div className="label-time ">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
              <TimePicker
                className="label-startTime"
                renderInput = {(params) => <TextField {...params} />}
                value={startTime}
                onChange={(newValue)=>handleStartTimeChange(newValue)}
              />
            </DemoContainer>
          </LocalizationProvider>
        </div>

        {/* End time */}
        <div className="label-time ">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
              <TimePicker
                className="label-startTime"
                renderInput = {(params) => <TextField {...params} />}
                value={endTime}
                onChange={(newValue)=>handleEndTimeChange(newValue)}
              />
            </DemoContainer>
          </LocalizationProvider>
        </div>
      </div>
    </div>
  );
};

export default MonoSelect;