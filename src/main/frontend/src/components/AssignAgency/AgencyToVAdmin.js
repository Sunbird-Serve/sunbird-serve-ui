import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Alert } from "@mui/material";
import axios from "axios";
import configData from "../../configure";

export default function AssignAgency({
  label,
  userId,
  agencylist,
  onAgencyAssignSuccess,
  vCoordinatorList,
  agencyId,
}) {
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedvCoordinator, setSelectedvCoordinator] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setSelectedAgency(event.target.value);
  };

  const handleChangevCoordinator = (event) => {
    setSelectedvCoordinator(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedAgency && !selectedvCoordinator) {
      setError(`Please ${label}.`);
      return;
    }

    try {
      const isCoordinator = label === "select Co-ordinator";
      const UserId = isCoordinator ? selectedvCoordinator : userId;
      const reqBody = {
        agencyId: isCoordinator ? agencyId : selectedAgency,
        send: true,
      };

      if (!UserId) {
        setError("User ID is missing.");
        return;
      }

      const res = await axios.put(
        `${configData.UPDATE_USER}/${UserId}`,
        reqBody
      );

      console.log("API Response:", res);

      if (res?.status === 200 || res?.status === 204) {
        setOpenSnackbar(true);
        onAgencyAssignSuccess();
        return;
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.log(error);
      setError("Failed to assign agency! Try again later.");
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        border: "1px solid #ddd",
        borderRadius: 2,
        width: "100%",
        maxWidth: 400,
        boxShadow: 2,
        backgroundColor: "white",
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Assign Agency
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{label}</InputLabel>
        {label === "select Co-ordinator" ? (
          <Select
            value={selectedvCoordinator}
            onChange={handleChangevCoordinator}
            label={label}
          >
            {vCoordinatorList?.map((vCoordinator) => (
              <MenuItem key={vCoordinator.osid} value={vCoordinator.osid}>
                {vCoordinator?.identityDetails?.fullname}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Select value={selectedAgency} onChange={handleChange} label={label}>
            {agencylist?.map((agency) => (
              <MenuItem key={agency.id} value={agency.id}>
                {agency.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
      </Button>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" variant="filled">
          Agency assigned successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
