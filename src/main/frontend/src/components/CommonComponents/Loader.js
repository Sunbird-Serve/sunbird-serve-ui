import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Loader = ({ fullPage }) => {
  return (
    <Box display={"flex"} alignItems="center" justifyContent="center">
      <CircularProgress />
    </Box>
  );
};

export default Loader;
