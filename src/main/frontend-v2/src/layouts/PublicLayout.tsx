import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

// Layout for public pages: Home, Login, Registration
// No sidebar, minimal chrome
export function PublicLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Outlet />
    </Box>
  );
}
