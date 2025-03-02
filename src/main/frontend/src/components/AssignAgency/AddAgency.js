import React, { useState } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import { format } from "date-fns";
const configData = require("../../configure");

const schema = yup.object().shape({
  name: yup.string().required("Agency name is required"),
  description: yup.string().required("Agency description is required"),
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
  plot: yup.string().required("House No/Floor is required"),
  street: yup.string(),
  landmark: yup.string().required("Landmark is required"),
  locality: yup.string().required("Locality is required"),
  village: yup.string().required("Village is required"),
  city: yup.string().required("City is required"),
  district: yup.string().required("District is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  pincode: yup.string().required("Pincode is required"),
  website: yup
    .string()
    .url("Enter a valid URL")
    .required("Website is required"),
});

const AddAgency = ({ handlePopupClose, onAgencyAdded }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const estDate = format(new Date(data.establishedDate), "yyyy-MM-dd");
    const reqBody = {
      name: data?.name,
      description: data?.description,
      establishedDate: estDate,
      contactDetails: {
        address: {
          state: data?.state,
          plot: data?.plot,
          street: data?.street,
          landmark: data?.landmark,
          locality: data?.locality,
          district: data?.district,
          village: data?.village,
          pincode: data?.pincode,
        },
        mobile: data?.phone,
        email: data?.email,
      },
      agencyType: data?.type,
      website: data?.website,
    };
    console.log("Agency Registered: reqBody", reqBody);
    try {
      const res = await axios.post(
        `${configData.SERVE_VOLUNTEERING}/agency/`,
        reqBody
      );
      console.log("res", res);
      setShowSuccess(true);
      onAgencyAdded();
      setOpenSnackbar(true);
      setTimeout(() => {
        handlePopupClose();
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
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
              <Typography variant="subtitle1">Agency Details</Typography>
              <Box
                display={"flex"}
                flexDirection={"row"}
                gap={"1rem"}
                paddingBottom={"1rem"}
              >
                <Box>
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
                <Box>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Agency Description"
                        fullWidth
                        margin="normal"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                  <Controller
                    name="establishedDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Established Date"
                        type="date"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.establishedDate}
                        helperText={errors.establishedDate?.message}
                      />
                    )}
                  />
                </Box>
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
                name="website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Website"
                    fullWidth
                    margin="normal"
                    error={!!errors.website}
                    helperText={errors.website?.message}
                  />
                )}
              />
              {/* Address Details */}
              <Typography variant="subtitle1">Address Details</Typography>
              <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
                <Box>
                  <Controller
                    name="plot"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Plot"
                        fullWidth
                        margin="normal"
                        error={!!errors.plot}
                        helperText={errors.plot?.message}
                      />
                    )}
                  />
                  <Controller
                    name="landmark"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="landmark"
                        fullWidth
                        margin="normal"
                        error={!!errors.landmark}
                        helperText={errors.landmark?.message}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="street"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Street  (Optional)"
                        fullWidth
                        margin="normal"
                        error={!!errors.street}
                        helperText={errors.street?.message}
                      />
                    )}
                  />
                  <Controller
                    name="locality"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Locality"
                        fullWidth
                        margin="normal"
                        error={!!errors.locality}
                        helperText={errors.locality?.message}
                      />
                    )}
                  />
                </Box>
              </Box>
              <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
                <Controller
                  name="village"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Village"
                      fullWidth
                      margin="normal"
                      error={!!errors.village}
                      helperText={errors.village?.message}
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
                <Box>
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
                </Box>
                <Box>
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
                  <Controller
                    name="pincode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Pincode"
                        fullWidth
                        margin="normal"
                        error={!!errors.pincode}
                        helperText={errors.pincode?.message}
                      />
                    )}
                  />
                </Box>
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
      {showSuccess && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert severity="success" variant="filled">
            Agency Added successfully!
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default AddAgency;
