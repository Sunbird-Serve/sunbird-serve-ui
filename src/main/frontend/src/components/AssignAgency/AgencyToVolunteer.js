import React from "react";
import AssignAgency from "./AgencyToVAdmin";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const AgencyToVolunteer = ({
  handlePopupClose,
  userId,
  agencylist,
  agencyAssignSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detects mobile screens

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "70%" : "400px",
    maxWidth: "500px",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: isMobile ? 2 : 3,
  };

  const handleAgencyAssignSuccess = () => {
    setTimeout(() => {
      handlePopupClose();
      agencyAssignSuccess();
    }, 1000);
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
          fontSize={isMobile ? "1rem" : "1.25rem"}
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
          <AssignAgency
            label="Select Agency"
            userId={userId}
            agencylist={agencylist}
            onAgencyAssignSuccess={handleAgencyAssignSuccess}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default AgencyToVolunteer;
