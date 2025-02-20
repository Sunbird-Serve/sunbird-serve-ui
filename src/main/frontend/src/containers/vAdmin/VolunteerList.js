import React from "react";
import Volunteers from "../../components/Volunteer/Volunteers";
import { Box, Typography } from "@mui/material";

const VolunteerList = () => {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

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
      <Volunteers />
    </Box>
  );
};

export default VolunteerList;
