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
  TextField,
  InputAdornment,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import SearchIcon from "@mui/icons-material/Search";

const FilterBy = ({ options, onFilterChange, label, filterByAgencies }) => {
  const [selectedValues, setSelectedValues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);

  const allOption = { id: "all", name: "All" };
  const otherOption = { id: "other", name: "Other" };
  const allOptionValues = options?.map((option) => option.name) || [];
  const allOptionIds = options.map((option) => option.id);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

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

    // Handle "All" option
    if (value.includes(allOption.id)) {
      if (selectedValues.includes(allOption.id)) {
        // If "All" was already selected and we're adding more items
        if (value.length > selectedValues.length) {
          setSelectedValues([allOption.id, ...allOptionIds, otherOption.id]);
          onFilterChange([allOption.id, ...allOptionIds, otherOption.id]);
        } else {
          // If "All" was selected and we're removing items
          const newValues = value.filter(id => id !== allOption.id);
          setSelectedValues(newValues);
          onFilterChange(newValues);
        }
      } else {
        // If "All" wasn't selected and now it is
        setSelectedValues([allOption.id, ...allOptionIds, otherOption.id]);
        onFilterChange([allOption.id, ...allOptionIds, otherOption.id]);
      }
    } else {
      // Handle individual selections without "All"
      if (value.includes(otherOption.id)) {
        // Handle "Other" option
        if (selectedValues.includes(otherOption.id)) {
          if (value.length > selectedValues.length) {
            setSelectedValues(value);
            onFilterChange(value);
          } else {
            setSelectedValues([otherOption.id]);
            onFilterChange([otherOption.id]);
          }
        } else {
          setSelectedValues(value);
          onFilterChange(value);
        }
      } else {
        // Handle regular entity selections
        const newValues = value.filter(id => id !== allOption.id);
        
        // If all entities are selected, automatically select "All"
        if (newValues.length === allOptionIds.length) {
          setSelectedValues([allOption.id, ...allOptionIds, otherOption.id]);
          onFilterChange([allOption.id, ...allOptionIds, otherOption.id]);
        } else {
          setSelectedValues(newValues);
          onFilterChange(newValues);
        }
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clear search when dropdown closes
  const handleClose = () => {
    setSearchTerm("");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: "20rem" } }}>
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
          onClose={handleClose}
          renderValue={(selected) =>
            selected
              ?.filter((id) => id !== "all") // Remove "All" from display
              ?.map((id) => {
                const option = options.find((option) => option.id === id);
                return option ? option.name : id;
              })
              ?.join(", ") || "Select Options"
          }
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 400,
              },
            },
          }}
        >
          {/* Search Input */}
          <Box sx={{ p: 1, borderBottom: "1px solid #e0e0e0" }}>
            <TextField
              size="small"
              placeholder="Search entities..."
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Box>

          <MenuItem key={allOption.id} value={allOption.id}>
            <Checkbox checked={selectedValues.includes(allOption.id)} />
            <ListItemText primary={allOption.name} />
          </MenuItem>

          {filteredOptions?.map((option) => (
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
