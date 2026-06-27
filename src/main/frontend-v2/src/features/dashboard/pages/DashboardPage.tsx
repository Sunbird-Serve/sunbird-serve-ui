import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '@app/store';
import { useAuth } from '@features/auth';
import { Navigate } from 'react-router-dom';
import { NCoordinatorDashboard } from './NCoordinatorDashboard';
import { NAdminDashboard } from './NAdminDashboard';
import { VCoordinatorDashboard } from './VCoordinatorDashboard';
import { VAdminDashboard } from './VAdminDashboard';
import { SAdminDashboard } from './SAdminDashboard';

export function DashboardPage() {
  const { data: user, status } = useAppSelector((state) => state.user);
  const { roles } = useAuth();

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user not in backend yet, show a message
  if (!user || status === 'failed') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Use Keycloak roles first, fallback to backend user role
  const role = roles.length > 0
    ? roles[0]
    : (Array.isArray(user.role) ? user.role[0] : user.role);

  switch (role) {
    case 'nCoordinator':
      return <NCoordinatorDashboard />;
    case 'nAdmin':
      return <NAdminDashboard />;
    case 'vCoordinator':
      return <VCoordinatorDashboard />;
    case 'vAdmin':
      return <VAdminDashboard />;
    case 'sAdmin':
      return <SAdminDashboard />;
    case 'Volunteer':
      return <Navigate to="/explore/home" replace />;
    default:
      return <NCoordinatorDashboard />;
  }
}
