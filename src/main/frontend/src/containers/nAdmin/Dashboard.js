import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import NeedCard from "../../components/CommonComponents/NeedCard";
import FilterBy from "../../components/CommonComponents/FilterBy";
import {
  matrixData,
  matrixDataRow2,
} from "../../components/CommonComponents/sampleData";
import { Box, Typography } from "@mui/material";
import NeedsTable from "../../components/NeedsTable/NeedsTable";
import { setFilteredData } from "../../state/filterSlice";
import { fetchEntityNeeds } from "../../state/needSlice";
import VolunteerNeedsApproved from "../../assets/needsApproved.png";
const configData = require("../../configure");

const Dashboard = () => {
  const dispatch = useDispatch();
  const [filteredByEnitity, setFilteredByEnitity] = useState([]);
  const [enitities, setEnitities] = useState([]);

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const userId = localStorage.getItem("userId");
  console.log("userDetails", userId);

  useEffect(() => {
    if (filteredByEnitity) {
      dispatch(fetchEntityNeeds());
      dispatch(setFilteredData(filteredByEnitity));
    }
  }, [filteredByEnitity, dispatch]);

  useEffect(() => {
    const getEntityDetails = async () => {
      try {
        if (userId) {
          const response = await axios.get(
            `${configData.ENTITY_DETAILS_GET}/${userId}?page=0&size=10`
          );
          const entities =
            response.data?.content
              ?.filter((entity) => entity.status === "Active")
              .map((entity) => ({
                id: entity.id,
                name: entity.name,
              })) || [];
          setEnitities(entities);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getEntityDetails();
  }, [userId]);

  const handleFilterChange = (selectedFilters) => {
    console.log("Selected Filters:", selectedFilters);
    setFilteredByEnitity(selectedFilters);
    dispatch(setFilteredData(selectedFilters));
  };

  const EnityData = [
    {
      icon: VolunteerNeedsApproved,
      count: enitities?.length,
      status: "Total Active Enities",
    },
  ];

  return (
    <Box padding={"1rem"}>
      <Box
        padding={"1rem"}
        gap={"0.5rem"}
        display={"flex"}
        width={"100%"}
        justifyContent={"space-between"}
      >
        <Box>
          <Box display={"flex"} gap={"0.5rem"}>
            <Typography variant="body1" color="text.secondary">
              Welcome Back,
            </Typography>
            <Typography variant="body1" color="text.primary">
              {userDetails?.fullname + "!"}
            </Typography>
          </Box>
          <Typography variant="h4" color="text.primary">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your needs analytics data
          </Typography>
        </Box>
      </Box>
      <Box padding={"0.5rem 0"} gap={"0.5rem"} display={"flex"}>
        <NeedCard matrixData={EnityData} />
        <Box paddingLeft={"3rem"} display={"flex"} alignItems={"center"}>
          <FilterBy
            label={"Select Enitity"}
            options={enitities}
            onFilterChange={handleFilterChange}
          />
        </Box>
      </Box>
      <Box padding={"0.5rem 0"}>
        <NeedCard matrixData={matrixData} />
      </Box>
      <NeedsTable showOnlyTable={true} filterByEntity={true} />
    </Box>
  );
};

export default Dashboard;
