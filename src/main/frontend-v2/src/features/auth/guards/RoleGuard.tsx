import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/store';
import { UserRole } from '@config/roles';
import { Box, CircularProgress } from '@mui/material';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, redirectTo = '/app/dashboard' }: RoleGuardProps) {
  const { data: user, status } = useAppSelector((state) => state.user);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  const hasAccess = userRoles.some((role) => allowedRoles.includes(role as UserRole));

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
