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

// Lazy-loaded pages
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
const VolunteersPage = lazy(() =>
  import('@features/volunteers/pages/VolunteersPage').then((m) => ({ default: m.VolunteersPage })),
);
const EntitiesPage = lazy(() =>
  import('@features/entities/pages/EntitiesPage').then((m) => ({ default: m.EntitiesPage })),
);
const AgenciesPage = lazy(() =>
  import('@features/entities/pages/AgenciesPage').then((m) => ({ default: m.AgenciesPage })),
);
const PlaceholderPage = lazy(() =>
  import('@shared/components/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })),
);

// Volunteer/Explore pages
const MySessionsPage = lazy(() =>
  import('@features/explore/pages/MySessionsPage').then((m) => ({ default: m.MySessionsPage })),
);
const ExploreNeedsPage = lazy(() =>
  import('@features/explore/pages/ExploreNeedsPage').then((m) => ({ default: m.ExploreNeedsPage })),
);
const MyNominationsPage = lazy(() =>
  import('@features/explore/pages/MyNominationsPage').then((m) => ({ default: m.MyNominationsPage })),
);
const VolunteerProfilePage = lazy(() =>
  import('@features/explore/pages/VolunteerProfilePage').then((m) => ({ default: m.VolunteerProfilePage })),
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
      { path: '/login', element: <HomePage /> },
      {
        path: '/register/:agencyId',
        element: (
          <SuspenseWrapper>
            <RegistrationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/explore-needs',
        element: (
          <SuspenseWrapper>
            <ExploreNeedsPage />
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
                <VolunteersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'volunteers/:id',
            element: (
              <SuspenseWrapper>
                <VolunteersPage />
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
                <EntitiesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'agencies',
            element: (
              <SuspenseWrapper>
                <AgenciesPage />
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
          { index: true, element: <Navigate to="sessions" replace /> },
          {
            path: 'sessions',
            element: (
              <SuspenseWrapper>
                <MySessionsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'needs',
            element: (
              <SuspenseWrapper>
                <ExploreNeedsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'nominations',
            element: (
              <SuspenseWrapper>
                <MyNominationsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'profile',
            element: (
              <SuspenseWrapper>
                <VolunteerProfilePage />
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
