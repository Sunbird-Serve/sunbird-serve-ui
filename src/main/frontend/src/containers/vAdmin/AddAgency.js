import React from "react";
import {
  Modal,
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";

const schema = yup.object().shape({
  name: yup.string().required("Agency name is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  establishedDate: yup.date().required("Established date is required"),
  type: yup.string().required("Agency type is required"),
  houseNo: yup.string().required("House No/Floor/Street is required"),
  city: yup.string().required("City is required"),
  district: yup.string().required("District is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  website: yup.string().url("Enter a valid URL"),
});

const AddAgency = ({ handlePopupClose }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log("Agency Registered: ", data);
    handlePopupClose();
  };

  return (
    <Modal open={true}>
      <Box
        sx={{
          width: "70vw",
          bgcolor: "white",
          p: 3,
          m: "auto",
          mt: 5,
          borderRadius: 2,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h6" gutterBottom>
            Add New Agency
          </Typography>
          <IconButton onClick={handlePopupClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ bgcolor: "black" }} />
        <Box paddingTop={"1rem"}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Details */}
            <Typography variant="subtitle1">Personal Details</Typography>
            <Box
              display={"flex"}
              flexDirection={"row"}
              gap={"1rem"}
              paddingBottom={"1rem"}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Agency Name"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Agency Type"
                    fullWidth
                    margin="normal"
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="Need Agency">Need Agency</MenuItem>
                    <MenuItem value="Volunteer Agency">
                      Volunteer Agency
                    </MenuItem>
                  </TextField>
                )}
              />
            </Box>

            {/* Contact Details */}
            <Typography variant="subtitle1">Contact Details</Typography>
            <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    margin="normal"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Box>
            <Controller
              name="establishedDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Established Date"
                  type="date"
                  sx={{ width: "49%", paddingBottom: "1rem" }}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.establishedDate}
                  helperText={errors.establishedDate?.message}
                />
              )}
            />
            {/* Address Details */}
            <Typography variant="subtitle1">Address Details</Typography>
            <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
              <Controller
                name="houseNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="House No, Floor, Street"
                    fullWidth
                    margin="normal"
                    error={!!errors.houseNo}
                    helperText={errors.houseNo?.message}
                  />
                )}
              />
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    margin="normal"
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                )}
              />
            </Box>
            <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="District"
                    fullWidth
                    margin="normal"
                    error={!!errors.district}
                    helperText={errors.district?.message}
                  />
                )}
              />
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    margin="normal"
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                )}
              />
            </Box>
            <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    margin="normal"
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  />
                )}
              />
              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Website (Optional)"
                    fullWidth
                    margin="normal"
                    error={!!errors.website}
                    helperText={errors.website?.message}
                  />
                )}
              />
            </Box>

            {/* Submit Button */}
            <Box display={"flex"} justifyContent={"center"}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2, width: "30%" }}
              >
                Register
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddAgency;
