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

const vcoordinators = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Michael Johnson" },
];

export default function AssignAgency({ label }) {
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
    }

    setLoading(true);
    setError("");

    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setOpenSnackbar(true);
    } catch (err) {
      setError("Failed to assign agency. Please try again.");
    } finally {
      setLoading(false);
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
          {vcoordinators.map((coordinator) => (
            <MenuItem key={coordinator.id} value={coordinator.id}>
              {coordinator.name}
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
