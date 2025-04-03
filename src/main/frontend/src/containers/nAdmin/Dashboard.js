import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import NeedCard from "../../components/CommonComponents/NeedCard";
import FilterBy from "../../components/CommonComponents/FilterBy";
import { Box, Typography } from "@mui/material";
import NeedsTable from "../../components/NeedsTable/NeedsTable";
import { setFilteredData } from "../../state/filterSlice";
import { fetchEntityNeeds } from "../../state/needSlice";
import VolunteerNeedsNominated from "../../assets/needsNominated.png";
import VolunteerNeedsInProgress from "../../assets/needsInProgress.png";
import VolunteerNeedsApproved from "../../assets/needsApproved.png";
import totalNeedsCreated from "../../assets/totalNeedsCreated.png";
const configData = require("../../configure");
const Dashboard = () => {
  const dispatch = useDispatch();
  const [filteredByEnitity, setFilteredByEnitity] = useState([]);
  const [enitities, setEnitities] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const userData = useSelector((state) => state.user.data);
  const userRole = userData.role;
  const isSAdmin = userRole?.[0] === "sAdmin" ? true : false;
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const userId = localStorage.getItem("userId");
  console.log("userDetails", userId);

  useEffect(() => {
    if (filteredByEnitity) {
      dispatch(setFilteredData(filteredByEnitity));
      dispatch(fetchEntityNeeds(filteredByEnitity));
    }
  }, [filteredByEnitity, dispatch]);

  useEffect(() => {
    const getEntityDetails = async () => {
      try {
        let response;
        if (userId && !isSAdmin) {
          response = await axios.get(
            `${configData.ENTITY_DETAILS_GET}/${userId}?page=0&size=100`
          );
        }
        if (isSAdmin) {
          response = await axios.get(
            `${configData.SERVE_NEED}/entity/all?page=0&size=100`
          );
        }
        const entities =
          response.data?.content
            ?.filter((entity) => entity.status !== "Inactive")
            .map((entity) => ({
              id: entity.id,
              name: entity.name,
            })) || [];
        setEnitities(entities);
      } catch (error) {
        console.log(error);
      }
    };
    getEntityDetails();
  }, [userId]);

  useEffect(() => {
    const getNeedsCount = async () => {
      try {
        const response = await axios.get(
          `${configData.ENTITY_NEED_GET}/${userId}?page=0&size=100`
        );

        const statuses = [
          "New",
          "Nominated",
          "Approved",
          "Rejected",
          "Assigned",
          "Fulfilled",
        ];

        const filteredData =
          response?.data?.content?.filter((item) =>
            filteredByEnitity.includes(item.entityId)
          ) || [];

        const statusCounts = filteredData.reduce((acc, item) => {
          if (statuses.includes(item.status)) {
            acc[item.status] = (acc[item.status] || 0) + 1;
          }
          return acc;
        }, {});

        const matrixData = [
          {
            icon: totalNeedsCreated,
            count: filteredData?.length || 0,
            status: "Total Needs Raised",
          },
          {
            icon: VolunteerNeedsInProgress,
            count: statusCounts["Assigned"] || 0,

            status: "Needs in Progress",
          },
          {
            icon: VolunteerNeedsNominated,
            count: statusCounts["Nominated"] || 0,
            status: "Needs Nominated",
          },
          {
            icon: VolunteerNeedsApproved,
            count: statusCounts["Approved"] || 0,
            status: "Needs Approved",
          },
        ];

        setMatrixData(matrixData);
      } catch (error) {
        console.error("Error fetching needs:", error);
      }
    };

    if (userId) {
      getNeedsCount();
    }
  }, [userId, filteredByEnitity]);

  const handleFilterChange = (selectedFilters) => {
    // console.log("Selected Filters:", selectedFilters);
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
          <Typography variant="body1" color="text.secondary">
            Here's your needs data
          </Typography>
        </Box>
      </Box>
      <Box padding={"0.5rem 0"} gap={"0.5rem"} display={"flex"}>
        {!isSAdmin && <NeedCard matrixData={EnityData} />}
        <Box paddingLeft={"3rem"} display={"flex"} alignItems={"center"}>
          <FilterBy
            label={"Select Enitity"}
            options={enitities}
            onFilterChange={handleFilterChange}
          />
        </Box>
      </Box>
      {!isSAdmin && (
        <Box padding={"0.5rem 0"}>
          <NeedCard matrixData={matrixData} />
        </Box>
      )}
      <NeedsTable filterByEntity={true} />
    </Box>
  );
};

export default Dashboard;
