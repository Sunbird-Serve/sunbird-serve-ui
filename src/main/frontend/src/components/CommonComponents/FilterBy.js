import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  Typography,
  InputLabel,
  FormControl,
} from "@mui/material";

const FilterBy = ({ options, onFilterChange, label = "Filter By" }) => {
  const [selectedValues, setSelectedValues] = useState(["All"]);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValues(value);
    onFilterChange(value);
  };

  return (
    <Box sx={{ width: "100%" }}>
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
          onChange={handleChange}
          renderValue={(selected) => selected.join(", ")}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={selectedValues.includes(option)} />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

// Prop validation
FilterBy.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

// Default props
FilterBy.defaultProps = {
  label: "Filter By",
};

export default FilterBy;
