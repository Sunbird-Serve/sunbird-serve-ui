import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '@config/roles';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, redirectTo = '/app/dashboard' }: RoleGuardProps) {
  const { initialized, authenticated, roles } = useAuth();

  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = roles.some((role) => allowedRoles.includes(role as UserRole));

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
