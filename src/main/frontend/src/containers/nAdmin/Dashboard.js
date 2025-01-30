import React, { useState } from "react";
import NeedCard from "../../components/CommonComponents/NeedCard";
import FilterBy from "../../components/CommonComponents/FilterBy";
import { matrixData } from "../../components/CommonComponents/sampleData";
import { Box, Typography } from "@mui/material";
import NeedsTable from "../../components/NeedsTable/NeedsTable";
const Dashboard = () => {
  const [filteredData, setFilteredData] = useState([]);

  const handleFilterChange = (selectedFilters) => {
    console.log("Selected Filters:", selectedFilters);
    setFilteredData(selectedFilters);
  };

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
              DemoAdmin!
            </Typography>
          </Box>
          <Typography variant="h4" color="text.primary">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your needs analytics data
          </Typography>
        </Box>

        <Box width={"20%"} marginTop={"3rem"}>
          <FilterBy
            options={["All", "Option 1", "Option 2", "Option 3", "Option 4"]}
            onFilterChange={handleFilterChange}
          />
        </Box>
      </Box>
      <NeedCard matrixData={matrixData} />
      <Box bgcolor={"white"}>
        <NeedsTable />
      </Box>
    </Box>
  );
};

export default Dashboard;
