import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './providers';
import { useAuth } from '@features/auth';
import { useAppDispatch, useAppSelector } from './store';
import { fetchUserByEmail } from '@features/auth/state/userSlice';
import { getRoleConfig } from '@config/roles';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';

// Full-screen loading state shown while user data is being fetched after auth
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
          Loading your dashboard...
        </Typography>
      </Stack>
    </Box>
  );
}

// Inner component that has access to auth context and handles user fetching + redirection
function AppInner() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const dispatch = useAppDispatch();
  const { data: user, status } = useAppSelector((state) => state.user);

  // Fetch user details when Firebase auth state changes
  useEffect(() => {
    if (firebaseUser?.email) {
      const encodedEmail = firebaseUser.email.replace(/@/g, '%40');
      dispatch(fetchUserByEmail(encodedEmail));
    }
  }, [firebaseUser, dispatch]);

  // Role-based redirect after successful user fetch
  useEffect(() => {
    if (status === 'succeeded' && user?.role) {
      const roleConfig = getRoleConfig(user.role);
      if (roleConfig) {
        const currentPath = window.location.pathname;
        // Only redirect if user is on a public page (login, signup, home)
        const publicPaths = ['/', '/login', '/signup', '/reset-password'];
        const isOnPublicPage = publicPaths.some(
          (p) => currentPath === p || currentPath.startsWith('/signup/'),
        );
        if (isOnPublicPage) {
          router.navigate(roleConfig.defaultRoute);
        }
      }
    }
  }, [status, user]);

  // Show full-screen loader when:
  // 1. Firebase auth is still initializing
  // 2. User is authenticated but user details are still loading
  if (authLoading) {
    return <FullScreenLoader />;
  }

  if (firebaseUser && status === 'loading') {
    return <FullScreenLoader />;
  }

  return <RouterProvider router={router} />;
}

// Root App component — wraps everything in providers
export function App() {
  return (
    <AppProviders>
      <AppInner />
    </AppProviders>
  );
}
