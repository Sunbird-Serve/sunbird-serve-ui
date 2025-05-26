import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Loader = ({ fullPage }) => {
  return (
    <Box display={"flex"} alignItems="center" justifyContent="center"
      sx={fullPage ? {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        zIndex: 1100,
      } : undefined}
    >
      <CircularProgress />
    </Box>
  );
};

export default Loader;
