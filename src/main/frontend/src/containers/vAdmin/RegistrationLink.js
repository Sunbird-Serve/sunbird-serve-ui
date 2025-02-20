import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
const configData = require("../../configure");

const RegistrationSection = ({ agencyId }) => {
  const [copied, setCopied] = useState(false);

  const registrationLink = `${configData.REGISTRATION_DOMAIN}/volunteer/${agencyId}/registration`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography variant="body1" fontWeight="bold">
        Registration Link:
      </Typography>
      <Typography
        variant="body2"
        color="primary"
        sx={{ wordBreak: "break-all" }}
      >
        {registrationLink}
      </Typography>
      <Tooltip title={copied ? "Copied!" : "Copy"}>
        <IconButton onClick={handleCopy} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
export default RegistrationSection;
