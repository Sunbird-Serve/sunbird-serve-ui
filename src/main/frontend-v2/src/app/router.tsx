import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Layouts
import { PublicLayout } from '@layouts/PublicLayout';
import { AdminLayout } from '@layouts/AdminLayout';
import { VolunteerLayout } from '@layouts/VolunteerLayout';

// Guards
import { ProtectedRoute } from '@features/auth/guards/ProtectedRoute';

// Eager-loaded pages (small, critical path)
import { HomePage } from '@features/home/pages/HomePage';
import { LoginPage } from '@features/auth/pages/LoginPage';

// Lazy-loaded pages
const ResetPasswordPage = lazy(() =>
  import('@features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const SignUpPage = lazy(() =>
  import('@features/auth/pages/SignUpPage').then((m) => ({ default: m.SignUpPage })),
);
const RegistrationPage = lazy(() =>
  import('@features/auth/pages/RegistrationPage').then((m) => ({ default: m.RegistrationPage })),
);
const DashboardPage = lazy(() =>
  import('@features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const NeedsPage = lazy(() =>
  import('@features/needs/pages/NeedsPage').then((m) => ({ default: m.NeedsPage })),
);
const RaiseNeedPage = lazy(() =>
  import('@features/needs/pages/RaiseNeedPage').then((m) => ({ default: m.RaiseNeedPage })),
);
const NeedSchedulePage = lazy(() =>
  import('@features/needs/pages/NeedSchedulePage').then((m) => ({ default: m.NeedSchedulePage })),
);
const PlaceholderPage = lazy(() =>
  import('@shared/components/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })),
);

// Loading fallback
function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      {
        path: '/signup/:type',
        element: (
          <SuspenseWrapper>
            <SignUpPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/register/:agencyId',
        element: (
          <SuspenseWrapper>
            <RegistrationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/reset-password',
        element: (
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Protected admin/coordinator routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: 'dashboard',
            element: (
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'needs',
            element: (
              <SuspenseWrapper>
                <NeedsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'needs/raise',
            element: (
              <SuspenseWrapper>
                <RaiseNeedPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'needs/:id',
            element: (
              <SuspenseWrapper>
                <NeedsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'need-plans',
            element: (
              <SuspenseWrapper>
                <NeedSchedulePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'volunteers',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Volunteers"
                  description="Volunteer management coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'volunteers/:id',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Volunteer Details"
                  description="Volunteer detail view coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'nominations',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Nominations"
                  description="Nominations management coming in Phase 4."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'entities',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Entities"
                  description="Entity management coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'agencies',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Agencies"
                  description="Agency management coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'sessions',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Sessions"
                  description="Session details coming in Phase 4."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'settings',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Settings"
                  description="Settings page coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },

  // Protected volunteer routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/explore',
        element: <VolunteerLayout />,
        children: [
          { index: true, element: <Navigate to="needs" replace /> },
          {
            path: 'needs',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="Explore Needs"
                  description="Browse available needs coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'profile',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="My Profile"
                  description="Volunteer profile coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'nominations',
            element: (
              <SuspenseWrapper>
                <PlaceholderPage
                  title="My Nominations"
                  description="Track your nominations coming in Phase 5."
                />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
