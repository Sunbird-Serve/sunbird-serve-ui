import React from "react";
import AssignAgency from "./AgencyToVAdmin";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const AgencyToVolunteer = ({ handlePopupClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detects mobile screens

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "70%" : "400px", // 90% width on mobile, 400px on larger screens
    maxWidth: "500px",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px", // More rounded for better UI
    p: isMobile ? 2 : 3, // Less padding on mobile
  };

  return (
    <Modal
      open={true}
      onClose={handlePopupClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {/* Close Button */}
        <IconButton
          onClick={handlePopupClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "grey.600",
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Title */}
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          textAlign="center"
          fontSize={isMobile ? "1rem" : "1.25rem"} // Smaller text on mobile
        >
          Assign Agency to Volunteer
        </Typography>

        {/* Content */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={isMobile ? 1 : 2}
        >
          <AssignAgency label="Select Agency" />
        </Box>
      </Box>
    </Modal>
  );
};

export default AgencyToVolunteer;
