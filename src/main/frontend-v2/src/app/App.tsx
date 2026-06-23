import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './providers';
import { useAuth } from '@features/auth';
import { useAppDispatch, useAppSelector } from './store';
import { fetchUserByEmail } from '@features/auth/state/userSlice';
import { getRoleConfig } from '@config/roles';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';

// Full-screen loading state
function FullScreenLoader() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        zIndex: 9999,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Stack>
    </Box>
  );
}

// Inner component with auth context access
function AppInner() {
  const { initialized, authenticated, user, roles } = useAuth();
  const dispatch = useAppDispatch();
  const { status: userStatus } = useAppSelector((state) => state.user);

  // Fetch user details after Keycloak authenticates
  useEffect(() => {
    if (authenticated && user?.email) {
      const encodedEmail = user.email.replace(/@/g, '%40');
      dispatch(fetchUserByEmail(encodedEmail));
    }
  }, [authenticated, user?.email, dispatch]);

  // Role-based redirect OR registration redirect
  useEffect(() => {
    if (!authenticated) return;

    const currentPath = window.location.pathname;
    const isOnRegPage = currentPath.startsWith('/register/');

    // User exists in backend — redirect to their dashboard
    if (userStatus === 'succeeded' && roles.length > 0) {
      const publicPaths = ['/', '/login', '/explore-needs'];
      const isOnPublicPage = publicPaths.includes(currentPath);
      const roleConfig = getRoleConfig(roles);
      if (roleConfig && (isOnPublicPage || isOnRegPage)) {
        router.navigate(roleConfig.defaultRoute);
      }
    }

    // User NOT in backend — redirect to registration
    if (userStatus === 'failed' && !isOnRegPage) {
      const coordinatorRoles = ['nCoordinator', 'nAdmin', 'vCoordinator', 'vAdmin', 'sAdmin'];
      const isCoordinator = roles.some((r) => coordinatorRoles.includes(r));

      // Also check localStorage for pending registration type (set before Keycloak redirect)
      const pendingType = localStorage.getItem('pendingRegistrationType');

      if (isCoordinator || pendingType === 'coordinator') {
        localStorage.removeItem('pendingRegistrationType');
        router.navigate('/register/coordinator-profile');
      } else {
        localStorage.removeItem('pendingRegistrationType');
        router.navigate('/register/volunteer-profile');
      }
    }
  }, [authenticated, userStatus, roles]);

  // Show loader during Keycloak initialization
  if (!initialized) {
    return <FullScreenLoader />;
  }

  // Show loader while fetching user details — block everything until we know if user exists
  if (authenticated && userStatus !== 'succeeded' && userStatus !== 'failed') {
    return <FullScreenLoader />;
  }

  return <RouterProvider router={router} />;
}

// Root App component
export function App() {
  return (
    <AppProviders>
      <AppInner />
    </AppProviders>
  );
}
