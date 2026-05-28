import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '@app/store';
import { NCoordinatorDashboard } from './NCoordinatorDashboard';
import { NAdminDashboard } from './NAdminDashboard';
import { VCoordinatorDashboard } from './VCoordinatorDashboard';
import { VAdminDashboard } from './VAdminDashboard';

export function DashboardPage() {
  const { data: user, status } = useAppSelector((state) => state.user);

  if (status === 'loading' || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const role = Array.isArray(user.role) ? user.role[0] : user.role;

  switch (role) {
    case 'nCoordinator':
      return <NCoordinatorDashboard />;
    case 'nAdmin':
      return <NAdminDashboard />;
    case 'vCoordinator':
      return <VCoordinatorDashboard />;
    case 'vAdmin':
    case 'sAdmin':
      return <VAdminDashboard />;
    default:
      return <NCoordinatorDashboard />;
  }
}
