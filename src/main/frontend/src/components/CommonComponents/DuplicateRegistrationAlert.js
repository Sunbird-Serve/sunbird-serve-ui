import React from "react";
import { Alert, Button, Box, Typography } from "@mui/material";
import { useHistory } from "react-router-dom";

const DuplicateRegistrationAlert = ({ 
  email, 
  onClose, 
  onTryDifferentEmail,
  showLoginOption = true 
}) => {
  const history = useHistory();

  const handleLoginClick = () => {
    onClose();
    history.push("/volunteer-login");
  };

  const handleTryDifferentEmail = () => {
    onClose();
    if (onTryDifferentEmail) {
      onTryDifferentEmail();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="warning" 
        onClose={onClose}
        sx={{ 
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Email Already Registered</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          The email address <strong>{email}</strong> is already registered in our system.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {showLoginOption && (
            <Button 
              size="small" 
              variant="contained" 
              color="primary"
              onClick={handleLoginClick}
            >
              Login Instead
            </Button>
          )}
          <Button 
            size="small" 
            variant="outlined" 
            color="primary"
            onClick={handleTryDifferentEmail}
          >
            Use Different Email
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};

export default DuplicateRegistrationAlert; 