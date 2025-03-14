import React, { useEffect, useState } from "react";
import Volunteers from "../../components/Volunteer/Volunteers";
import { Box, Typography } from "@mui/material";
import FilterBy from "../../components/CommonComponents/FilterBy";
import axios from "axios";
import configData from "../../configure";
const VolunteerList = () => {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const [agencies, setAgencies] = useState([]);
  const [filteredByAgency, setFilteredByAgency] = useState([]);

  useEffect(() => {
    const getAgencies = async () => {
      try {
        const response = await axios.get(
          `${configData.SERVE_VOLUNTEERING}/agency/list`
        );
        const agencies =
          response.data
            // ?.filter((agency) => agency.status === "Active")
            ?.map((agency) => ({
              id: agency.osid,
              name: agency.name,
            })) || [];
        console.log(agencies);
        setAgencies(agencies);
      } catch (error) {
        console.log(error);
      }
    };
    getAgencies();
  }, []);

  const handleFilterChange = (selectedFilters) => {
    console.log("Selected Filters:", selectedFilters);
    setFilteredByAgency(selectedFilters);
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

      <Box display={"flex"} justifyContent={"start"} padding={"1rem"}>
        <FilterBy
          label={"Select Agency"}
          options={agencies}
          onFilterChange={handleFilterChange}
          filterByAgencies={true}
        />
      </Box>
      <Volunteers agencylist={agencies} filterByAgencies={filteredByAgency} />
    </Box>
  );
};

export default VolunteerList;
