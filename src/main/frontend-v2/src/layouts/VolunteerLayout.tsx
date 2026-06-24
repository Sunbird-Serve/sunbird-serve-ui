import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@features/auth';
import TodayIcon from '@mui/icons-material/Today';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExploreIcon from '@mui/icons-material/Explore';
import PersonIcon from '@mui/icons-material/Person';

const NAV_ITEMS = [
  { label: 'My Sessions', path: '/explore/sessions', icon: <TodayIcon /> },
  { label: 'My Needs', path: '/explore/nominations', icon: <AssignmentIcon /> },
  { label: 'Explore', path: '/explore/needs', icon: <ExploreIcon /> },
  { label: 'Profile', path: '/explore/profile', icon: <PersonIcon /> },
];

export function VolunteerLayout() {
  const { firebaseUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentTab = NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));
  const activeTab = currentTab >= 0 ? currentTab : 0;

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
  };

  const userInitial = firebaseUser?.email?.charAt(0).toUpperCase() || 'V';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <img src="/icons/serve-logo.jpeg" alt="Sunbird Serve" style={{ height: 28, width: 28, borderRadius: 4 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Sunbird Serve
            </Typography>
          </Box>

          <IconButton onClick={handleProfileMenuOpen} aria-label="open profile menu">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              {userInitial}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2">{firebaseUser?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>

        {/* Desktop tabs */}
        {!isMobile && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => navigate(NAV_ITEMS[v].path)}
            sx={{ px: 2, borderTop: 1, borderColor: 'divider' }}
          >
            {NAV_ITEMS.map((item) => (
              <Tab key={item.path} label={item.label} icon={item.icon} iconPosition="start" />
            ))}
          </Tabs>
        )}
      </AppBar>

      {/* Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, pb: isMobile ? 9 : 3 }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
          elevation={3}
        >
          <BottomNavigation
            value={activeTab}
            onChange={(_, v) => navigate(NAV_ITEMS[v].path)}
            showLabels
          >
            {NAV_ITEMS.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
