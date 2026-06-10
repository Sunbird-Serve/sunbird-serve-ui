import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './providers';
import { useAuth } from '@features/auth';
import { useAppDispatch, useAppSelector } from './store';
import { fetchUserByEmail } from '@features/auth/state/userSlice';
import { getRoleConfig } from '@config/roles';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';

// Full-screen loading state shown during Keycloak init or user data fetch
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

// Inner component that has access to auth context
function AppInner() {
  const { initialized, authenticated, user, roles } = useAuth();
  const dispatch = useAppDispatch();
  const { status: userStatus } = useAppSelector((state) => state.user);

  // Fetch user details (osid, identityDetails) after Keycloak authenticates
  useEffect(() => {
    if (authenticated && user?.email) {
      const encodedEmail = user.email.replace(/@/g, '%40');
      dispatch(fetchUserByEmail(encodedEmail));
    }
  }, [authenticated, user?.email, dispatch]);

  // Role-based redirect after user data loads
  useEffect(() => {
    if (authenticated && userStatus === 'succeeded' && roles.length > 0) {
      const roleConfig = getRoleConfig(roles);
      if (roleConfig) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/login', '/signup', '/reset-password'];
        const isOnPublicPage = publicPaths.some(
          (p) => currentPath === p || currentPath.startsWith('/signup/'),
        );
        if (isOnPublicPage) {
          router.navigate(roleConfig.defaultRoute);
        }
      }
    }
  }, [authenticated, userStatus, roles]);

  // Show loader during Keycloak initialization
  if (!initialized) {
    return <FullScreenLoader />;
  }

  // Show loader while fetching user details after auth
  if (authenticated && userStatus === 'loading') {
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
