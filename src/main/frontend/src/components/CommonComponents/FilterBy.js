import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  Typography,
  InputLabel,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";

const FilterBy = ({ options, onFilterChange, label, filterByAgencies }) => {
  const [selectedValues, setSelectedValues] = useState([]);

  const allOption = { id: "all", name: "All" };
  const otherOption = { id: "other", name: "Other" };
  const allOptionValues = options?.map((option) => option.name) || [];
  const allOptionIds = options.map((option) => option.id);

  useEffect(() => {
    if (options.length > 0) {
      const initialSelected = [allOption.id, ...allOptionIds, otherOption.id];
      console.log(otherOption, initialSelected);
      setSelectedValues(initialSelected);
      onFilterChange(initialSelected);
    }
  }, [options]);

  const handleChange = (event) => {
    const value = event.target.value;

    if (value?.includes(allOption.id)) {
      if (selectedValues.includes(allOption.id)) {
        if (selectedValues.length > value.length) {
          value.shift();
          setSelectedValues([...value]);
          onFilterChange([...value]);
        } else {
          setSelectedValues([]);
          onFilterChange([]);
        }
      } else {
        // if (filterByAgencies) {
        //   setSelectedValues([allOption.id]);
        //   onFilterChange([allOption.id]);
        // } else {
        setSelectedValues([allOption.id, ...allOptionIds, otherOption.id]);
        onFilterChange([allOption.id, ...allOptionIds, otherOption.id]);
        // }
      }
    } else {
      if (!value?.includes(allOption.id) && value?.includes(otherOption.id)) {
        if (selectedValues.includes(otherOption.id)) {
          if (selectedValues.length < value.length) {
            // value.shift();
            setSelectedValues([...value]);
            onFilterChange([...value]);
          } else {
            setSelectedValues([otherOption.id]);
            onFilterChange([otherOption.id]);
          }
        }
      }
      if (!value?.includes(allOption.id) || !value?.includes(otherOption.id)) {
        if (selectedValues.length > value.length) {
          setSelectedValues([]);
          onFilterChange([]);
        } else {
          const filteredValues = value.filter((id) => id !== allOption.id);

          if (filteredValues?.length === allOptionIds.length) {
            setSelectedValues([allOption.id, ...allOptionIds]);
            onFilterChange([allOption.id, ...allOptionIds]);
          } else {
            setSelectedValues(filteredValues);
            onFilterChange(filteredValues);
          }
        }
      }
    }
  };

  return (
    <Box width={"16rem"}>
      <FormControl fullWidth>
        <InputLabel
          id="demo-simple-select-label"
          component="legend"
          variant="outlined"
        >
          {label}
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          multiple
          value={selectedValues}
          label={label}
          onChange={handleChange}
          renderValue={(selected) =>
            selected
              ?.filter((id) => id !== "all") // Remove "All" from display
              ?.map((id) => {
                const option = options.find((option) => option.id === id);
                return option ? option.name : id;
              })
              ?.join(", ") || "Select Options"
          }
        >
          <MenuItem key={allOption.id} value={allOption.id}>
            <Checkbox checked={selectedValues.includes(allOption.id)} />
            <ListItemText primary={allOption.name} />
          </MenuItem>

          {options?.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              <Checkbox checked={selectedValues.includes(option.id)} />
              <ListItemText primary={option.name} />
            </MenuItem>
          ))}

          <MenuItem key={otherOption.id} value={otherOption.id}>
            <Checkbox checked={selectedValues.includes(otherOption.id)} />
            <ListItemText primary={otherOption.name} />
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterBy;
