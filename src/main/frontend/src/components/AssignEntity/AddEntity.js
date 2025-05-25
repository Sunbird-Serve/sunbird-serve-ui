import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
const configData = require("../../configure");

const schema = yup.object().shape({
  name: yup.string().required("Entity name is required"),
  mobile: yup.number(),
  // .matches(/^\d{10}$/, "mobile number must be 10 digits")
  // .required("mobile number is required"),
  category: yup.string().required("Entity type is required"),
  status: yup.string(),
  address_line1: yup.string(),
  district: yup.string().required("District is required"),
  state: yup.string().required("State is required"),
  pincode: yup.number().required("Pincode is required"),
  website: yup
    .string()
    .url("Enter a valid URL")
    .required("Website is required"),
});

const AddEntity = ({
  handlePopupClose,
  onEntityAdded,
  onEntityUpdate,
  needAdminId,
  entityDetails,
  isEdit,
  entityId,
  isSAdmin,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: entityDetails ? entityDetails[0] : {},
  });

  const categoryOptions = [
    "Educational Institute",
    "Civic Organization",
    "Healthcare & Wellness",
    "Technology & Digital Services",
    "Corporate & CSR Initiatives",
    "Research & Development",
    "Skill Development & Employment",
    "Social Welfare & Support",
  ];

  const statusOptions = ["New", "Verified", "Active", "Inactive"];

  useEffect(() => {
    if (isEdit && (!entityDetails || entityDetails?.length === 0)) {
      const getEntityDetails = async () => {
        try {
          if (needAdminId && !isSAdmin) {
            const response = await axios.get(
              `${configData.ENTITY_DETAILS_GET}/${needAdminId}?page=0&size=100`
            );
            const entities = response.data?.content?.filter(
              (entity) => entity.status !== "Inactive"
            );
            const entityDetails = entities?.filter(
              (entity) => entity.id === entityId
            );
            reset({
              ...entityDetails[0],
              category: entityDetails[0]?.category,
              status: entityDetails[0]?.status,
            });
          }
          if (isSAdmin) {
            const response = await axios.get(
              `${configData.SERVE_NEED}/entity/${entityId}`
            );

            const entityDetails = response.data;
            reset({
              ...entityDetails,
              category: entityDetails?.category,
              status: entityDetails?.status,
            });
          }
        } catch (error) {
          console.log(error);
        }
      };
      getEntityDetails();
    } else if (isEdit && entityDetails) {
      reset({
        ...entityDetails[0],
        category: entityDetails[0]?.category || "",
        status: entityDetails[0]?.status,
      });
    }
  }, [isEdit, entityDetails, reset]);

  useEffect(() => {
    if (entityDetails || entityDetails?.length > 0) {
      reset({
        ...entityDetails[0],
        category: entityDetails[0]?.category || "",
        status: entityDetails[0]?.status || "",
      });
    }
  }, [entityDetails, reset]);

  const onSubmit = async (data) => {
    const reqBody = {
      name: data?.name,
      category: data?.category,
      state: data?.state,
      address_line1: data?.address_line1,
      district: data?.district,
      pincode: data?.pincode,
      mobile: data?.mobile,
      status: isEdit ? data?.status : "Verified",
      website: data?.website,
    };
    try {
      let res;
      if (isEdit) {
        res = await axios.put(
          `${configData.SERVE_NEED}/entity/edit/${entityId}`,
          reqBody
        );
        onEntityUpdate();
      } else {
        res = await axios.post(
          `${configData.SERVE_NEED}/entity/create`,
          reqBody
        );
        onEntityAdded();

        const entityID = res?.data?.id;
        const onboardReq = {
          entityId: entityID,
          userId: needAdminId,
          userRole: "nAdmin",
        };

        const entityOnboarding = await axios.post(
          `${configData.SERVE_NEED}/entity/assign`,
          onboardReq
        );
      }
      handlePopupClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          bgcolor: "white",
          p: 3,
          m: "auto",
          borderRadius: 2,
          maxHeight: "80vh",
        }}
      >
        <Box>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                    label="Entity Name"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputLabelProps={{ shrink: !!field.value }}
                  />
                )}
              />
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
                    InputLabelProps={{ shrink: !!field.value }}
                  />
                )}
              />
            </Box>

            <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mobile Number"
                    fullWidth
                    margin="normal"
                    type="number"
                    error={!!errors.mobile}
                    helperText={errors.mobile?.message}
                    InputLabelProps={{ shrink: !!field.value }}
                  />
                )}
              />
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={!!errors.category}
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      {...field}
                      labelId="category-label"
                      label="Category"
                      value={field.value || ""}
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.category?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>
            {isEdit && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl
                    margin="normal"
                    sx={{ width: "49%" }}
                    error={!!errors.category}
                  >
                    <InputLabel id="category-label">Status</InputLabel>
                    <Select
                      {...field}
                      labelId="status-label"
                      label="status"
                      value={field.value || ""}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.status?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            )}
            <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
              <Controller
                name="address_line1"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Block"
                    fullWidth
                    margin="normal"
                    error={!!errors.address_line1}
                    helperText={errors.address_line1?.message}
                    InputLabelProps={{ shrink: !!field.value }}
                  />
                )}
              />
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
                    InputLabelProps={{ shrink: !!field.value }}
                  />
                )}
              />
            </Box>
            <Box display={"flex"} flexDirection={"row"} gap={"1rem"}>
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
                    InputLabelProps={{ shrink: !!field.value }}
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
                    type="number"
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                    InputLabelProps={{ shrink: !!field.value }}
                  />
                )}
              />
            </Box>
            <Box display={"flex"} justifyContent={"center"}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2, width: "30%" }}
                onClick={() => console.log("Button Clicked")}
              >
                {isEdit ? "Update" : "Register"}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default AddEntity;
