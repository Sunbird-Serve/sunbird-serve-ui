import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { UserRole, getRoleConfig } from '@config/roles';
import { useAppSelector } from '@app/store';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  /**
   * Where to send a user who is authenticated but lacks an allowed role.
   * When omitted, the user is redirected to their own role's default route
   * so admins hitting volunteer pages (and vice-versa) land in the right place.
   */
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, redirectTo }: RoleGuardProps) {
  const { initialized, authenticated, roles } = useAuth();
  const backendUser = useAppSelector((state) => state.user.data);

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

  // Prefer roles from the token; fall back to the backend user record while
  // the token catches up (e.g. right after a fresh registration).
  const effectiveRoles = roles.length > 0 ? roles : (backendUser?.role || []);

  // No role resolved yet — token may still be propagating. Show a spinner
  // rather than bouncing the user to the wrong area.
  if (effectiveRoles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasAccess = effectiveRoles.some((role) => allowedRoles.includes(role as UserRole));

  if (!hasAccess) {
    const fallback = redirectTo || getRoleConfig(effectiveRoles[0])?.defaultRoute || '/';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
