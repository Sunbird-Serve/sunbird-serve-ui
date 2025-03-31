import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
import Registration from "../Registration/Registration";
import { Redirect, useHistory } from "react-router-dom";
const configData = require("../../configure");

const RegistrationSection = ({ agencyId }) => {
  const history = useHistory();
  const [copied, setCopied] = useState(false);
  const [vRegistration, setVRegistration] = useState(false);
  let registrationLink;
  // = `${configData.REGISTRATION_DOMAIN}/volunteer/${agencyId}/vregistration`;
  if (agencyId === "1-e183cda9-6afd-4a91-b14e-79a140801ab8") {
    registrationLink = `${configData.REGISTRATION_DOMAIN}/volunteer/v8410/vregistration`;
  } else {
    registrationLink = `${configData.REGISTRATION_DOMAIN}/volunteer/${agencyId}/vregistration`;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRegistrationClick = () => {
    // history.push("/vregistration");
  };

  return (
    <Box>
      {!vRegistration ? (
        // <Box
        //   sx={{
        //     p: 2,
        //     border: "1px solid #ccc",
        //     borderRadius: 2,
        //     display: "flex",
        //     alignItems: "center",
        //     gap: 1,
        //   }}
        // >
        //   <Typography variant="body1" fontWeight="bold">
        //     Registration Link:
        //   </Typography>
        //   <Typography
        //     variant="body2"
        //     color="primary"
        //     sx={{ wordBreak: "break-all" }}
        //     component="a"
        //     href={registrationLink}
        //     onClick={handleRegistrationClick}
        //   >
        //     {registrationLink}
        //   </Typography>
        //   <Tooltip title={copied ? "Copied!" : "Copy"}>
        //     <IconButton onClick={handleCopy} size="small">
        //       <ContentCopyIcon fontSize="small" />
        //     </IconButton>
        //   </Tooltip>
        // </Box>
        <Box>
          <Typography
            variant="body2"
            color="primary"
            sx={{ wordBreak: "break-all" }}
            component="a"
            href={registrationLink}
            onClick={handleRegistrationClick}
          >
            Register to Agency
          </Typography>
          <Tooltip title={copied ? "Copied!" : "Copy"}>
            <IconButton onClick={handleCopy} size="small">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box>
          show vRegistration
          <Registration />
        </Box>
      )}
    </Box>
  );
};
export default RegistrationSection;
