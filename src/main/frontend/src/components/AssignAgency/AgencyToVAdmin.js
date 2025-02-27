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

const vcoordinators = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Michael Johnson" },
];

export default function AssignAgency({
  label,
  userId,
  agencylist,
  onAgencyAssignSuccess,
}) {
  const [selectedAgency, setSelectedAgency] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setSelectedAgency(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedAgency) {
      setError(`Please ${label}.`);
      return;
    } else {
      try {
        console.log(userId, selectedAgency);
        const reqBody = {
          agencyId: selectedAgency,
          send: true,
        };
        const res = await axios.put(
          `${configData.UPDATE_USER}/${userId}`,
          reqBody
        );
        console.log(res);
        setOpenSnackbar(true);
        onAgencyAssignSuccess();
      } catch (error) {
        console.log(error);
        setError("Failed to assign agency. Please try again.");
      }
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
        <Select value={selectedAgency} onChange={handleChange} label={label}>
          {agencylist?.map((agency) => (
            <MenuItem key={agency.id} value={agency.id}>
              {agency.name}
            </MenuItem>
          ))}
        </Select>
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
