import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import SettingsIcon from '@mui/icons-material/Settings';
import { SidebarItem } from '@config/roles';

// Map icon string names to MUI icon components
const ICON_MAP: Record<string, React.ReactElement> = {
  Dashboard: <DashboardIcon />,
  Assignment: <AssignmentIcon />,
  CalendarMonth: <CalendarMonthIcon />,
  People: <PeopleIcon />,
  Business: <BusinessIcon />,
  CorporateFare: <CorporateFareIcon />,
  Settings: <SettingsIcon />,
};

interface SidebarProps {
  items: SidebarItem[];
  onItemClick?: () => void;
}

export function Sidebar({ items, onItemClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo / Brand */}
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          Sunbird Serve
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Management Portal
        </Typography>
      </Box>

      {/* Navigation items */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.id}
              selected={isActive}
              onClick={() => handleNavigation(item.path)}
              sx={{ mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                {ICON_MAP[item.icon] ?? <DashboardIcon />}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
