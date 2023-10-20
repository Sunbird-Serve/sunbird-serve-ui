import React, { useState, useEffect } from 'react';
import {  FormControl,  InputLabel,  Select,  MenuItem, TextField,  Grid } from '@mui/material';
import './MonoSelect.css';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MonoSelect = ({ onAdd, frequency }) => {
  const [selectedDay, setSelectedDay] = useState('Monday'); // Set 'Monday' as the default value
  const [startTime, setStartTime] = useState(dayjs())
  const [endTime, setEndTime] = useState(dayjs())

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

  useEffect(()=> {
    saveValues();
    console.log(startTime)
  },[selectedDay, startTime,endTime])

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
      <div className="wrapDayTime">
        <div>
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
        </div>
        <div className="container-time">
        <div className="label-time ">
          <span> Start Time </span>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
              <TimePicker
                className="label-startTime"
                renderInput = {(params) => <TextField {...params} />}
                value={startTime}
                onChange={(newValue)=>setStartTime(newValue.format('YYYY-MM-DDTHH:mm:ss.SSSZ'))}
              />
            </DemoContainer>
          </LocalizationProvider>
        </div>

        <div className="label-time ">
        <span> End Time </span>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
              <TimePicker
                className="label-startTime"
                renderInput = {(params) => <TextField {...params} />}
                value={endTime}
                onChange={(newValue)=>setEndTime(newValue.format('YYYY-MM-DDTHH:mm:ss.SSSZ'))}
              />
            </DemoContainer>
          </LocalizationProvider>
        </div>
        </div>
      </div>
    </div>
  );
};

export default MonoSelect;