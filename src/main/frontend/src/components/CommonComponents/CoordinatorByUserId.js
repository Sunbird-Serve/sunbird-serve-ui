import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";

const configData = require("../../configure");
const CoordinatorByUserId = ({ userId, showName, showContact }) => {
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinatorContact, setCoordinatorContact] = useState([]);

  useEffect(() => {
    axios
      .get(`${configData.USER_GET}/${userId}`)
      .then((response) => {
        console.log("response", response.data);
        setCoordinatorName(response?.data?.identityDetails?.fullname);
        setCoordinatorContact(response?.data?.contactDetails?.mobile);
      })
      .catch((error) => {
        console.error("Fetching Entity failed:", error);
      });
  }, [userId]);

  return (
    <Box>
      {showName && (
        <Typography variant="body1" color="text.primary">
          {coordinatorName}
        </Typography>
      )}
      {showContact && (
        <Typography variant="body1" color="text.primary">
          {coordinatorContact}
        </Typography>
      )}
    </Box>
  );
};

export default CoordinatorByUserId;
