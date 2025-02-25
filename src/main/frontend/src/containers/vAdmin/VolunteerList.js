import React from "react";
import Volunteers from "../../components/Volunteer/Volunteers";
import { Box, Typography } from "@mui/material";
import FilterBy from "../../components/CommonComponents/FilterBy";
const VolunteerList = () => {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  const agencies = [
    {
      id: "01",
      name: "Tekdi",
    },
    {
      id: "02",
      name: "e-Vidyaloka",
    },
    {
      id: "03",
      name: "ekStep",
    },
  ];

  const handleFilterChange = (selectedFilters) => {
    console.log("Selected Filters:", selectedFilters);
    // setFilteredByEnitity(selectedFilters);
    // dispatch(setFilteredData(selectedFilters));
  };

  return (
    <Box padding={"1rem"}>
      <Box
        // padding={"1rem"}
        gap={"0.5rem"}
        display={"flex"}
        width={"100%"}
        justifyContent={"space-between"}
      >
        <Box display={"flex"} gap={"0.5rem"}>
          <Typography variant="body1" color="text.secondary">
            Welcome Back,
          </Typography>
          <Typography variant="body1" color="text.primary">
            {userDetails?.fullname + "!"}
          </Typography>
        </Box>
      </Box>

      <Box display={"flex"} justifyContent={"center"} paddingLeft={"10rem"}>
        <FilterBy
          label={"Select Agency"}
          options={agencies}
          onFilterChange={handleFilterChange}
        />
      </Box>
      <Volunteers />
    </Box>
  );
};

export default VolunteerList;
