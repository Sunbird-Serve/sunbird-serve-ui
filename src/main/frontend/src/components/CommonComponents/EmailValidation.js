import React, { useState, useEffect } from "react";
import { validateEmailFormat } from "../../utils/emailValidation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const EmailValidation = ({ 
  email, 
  onValidationChange, 
  showValidation = true,
  disabled = false 
}) => {
  const [validationState, setValidationState] = useState({
    isValid: null,
    message: "",
  });

  useEffect(() => {
    if (email && !disabled) {
      // Only validate email format
      if (!validateEmailFormat(email)) {
        setValidationState({
          isValid: false,
          message: "Please enter a valid email address"
        });
        onValidationChange && onValidationChange(false, false);
      } else {
        setValidationState({
          isValid: true,
          message: "Email format is valid"
        });
        onValidationChange && onValidationChange(true, false);
      }
    } else if (!email) {
      setValidationState({
        isValid: null,
        message: ""
      });
      onValidationChange && onValidationChange(null, false);
    }
  }, [email, disabled, onValidationChange]);

  if (!showValidation || disabled) {
    return null;
  }

  const getValidationIcon = () => {
    if (validationState.isValid === true) {
      return <CheckCircleIcon style={{ color: "#4caf50", fontSize: 16 }} />;
    }
    if (validationState.isValid === false) {
      return <ErrorIcon style={{ color: "#f44336", fontSize: 16 }} />;
    }
    return null;
  };

  const getValidationColor = () => {
    if (validationState.isValid === true) return "#4caf50";
    if (validationState.isValid === false) return "#f44336";
    return "#666";
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "8px", 
      marginTop: "4px",
      fontSize: "12px",
      color: getValidationColor()
    }}>
      {getValidationIcon()}
      {validationState.message && (
        <span style={{ fontSize: "12px" }}>
          {validationState.message}
        </span>
      )}
    </div>
  );
};

export default EmailValidation; 