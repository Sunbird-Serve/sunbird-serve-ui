import React from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const NeedCard = ({ matrixData }) => {
  if (!matrixData || matrixData.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No data available
      </Typography>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" gap="0.5rem">
      {matrixData?.map((matrix, index) => (
        <Box
          key={index}
          sx={{
            // width: { xs: "100%", sm: "48%", md: "32%", lg: "24%" },
            maxWidth: "14rem",
            width: "100%",
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" gap="1rem" alignItems="center">
                <Box>
                  <img
                    src={matrix?.icon || ""}
                    // alt={matrix?.status || ""}
                    height="20px"
                    style={{ objectFit: "contain" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" component="div">
                    {matrix?.count || 0}
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {matrix?.status || "Status"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

NeedCard.propTypes = {
  matrixData: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      count: PropTypes.number,
      status: PropTypes.string,
    })
  ),
};

export default NeedCard;
