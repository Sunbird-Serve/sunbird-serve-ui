import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import NeedCard from "../../components/CommonComponents/NeedCard";
import FilterBy from "../../components/CommonComponents/FilterBy";
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NeedsTable from "../../components/NeedsTable/NeedsTable";
import { setFilteredData, setAdminSearchQuery, setAdminNeedTypeFilter } from "../../state/filterSlice";
import { fetchEntityNeeds } from "../../state/needSlice";
import VolunteerNeedsNominated from "../../assets/needsNominated.png";
import VolunteerNeedsInProgress from "../../assets/needsInProgress.png";
import VolunteerNeedsApproved from "../../assets/needsApproved.png";
import totalNeedsCreated from "../../assets/totalNeedsCreated.png";
import "./Dashboard.css"; // Import the CSS file
const configData = require("../../configure");
const Dashboard = () => {
  const dispatch = useDispatch();
  const [filteredByEnitity, setFilteredByEnitity] = useState([]);
  const [enitities, setEnitities] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeedType, setSelectedNeedType] = useState("");
  const userData = useSelector((state) => state.user.data);
  const userRole = userData.role;
  const isSAdmin = userRole?.[0] === "sAdmin" ? true : false;
  const isNAdmin = userRole?.[0] === "nAdmin" ? true : false;
  const needTypes = useSelector((state) => state.needtype?.data?.content || []);
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
            `${configData.ENTITY_DETAILS_GET}/${userId}?page=0&size=1000`
          );
        }
        if (isSAdmin) {
          response = await axios.get(
            `${configData.SERVE_NEED}/entity/all?page=0&size=1000`
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
          `${configData.ENTITY_NEED_GET}/${userId}?page=0&size=1000`
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
    <Box className="dashboard-container">
      <Box
        className="welcome-section"
        padding={"1rem"} // Retaining some padding here for structure, can be moved to CSS
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
      <Box className="entity-filter-row">
        {!isSAdmin && <div className="entity-card-container"><NeedCard matrixData={EnityData} className="entity-card" /></div>}
        <Box className="filterby-container">
          <FilterBy
            label={"Select Enitity"}
            options={enitities}
            onFilterChange={handleFilterChange}
          />
        </Box>
      </Box>
      {!isSAdmin && (
        <Box className="needs-summary-row">
          <NeedCard matrixData={matrixData} className="summary-cards" />
        </Box>
      )}
      {/* Additional filters for admins */}
      {(isNAdmin || isSAdmin) && (
        <Box 
          sx={{ 
            display: "flex", 
            gap: "1rem", 
            marginBottom: "1rem",
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <Box sx={{ flex: "1", minWidth: "250px" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search needs by name, entity, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                dispatch(setAdminSearchQuery(e.target.value));
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
              variant="outlined"
            />
          </Box>
          <Box sx={{ minWidth: "200px" }}>
            <FormControl fullWidth size="small">
              <InputLabel>Need Type</InputLabel>
              <Select
                value={selectedNeedType}
                label="Need Type"
                onChange={(e) => {
                  setSelectedNeedType(e.target.value);
                  dispatch(setAdminNeedTypeFilter(e.target.value));
                }}
              >
                <MenuItem value="">All Need Types</MenuItem>
                {needTypes.map((ntype) => (
                  <MenuItem key={ntype.id} value={ntype.id}>
                    {ntype.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
      <NeedsTable filterByEntity={true} />
    </Box>
  );
};

export default Dashboard;
