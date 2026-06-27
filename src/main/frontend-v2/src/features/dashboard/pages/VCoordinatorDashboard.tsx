import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Stack,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppSelector } from '@app/store';
import { useGetAllUsersQuery } from '../api/dashboardApi';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { StatusBreakdown } from '../components/StatusBreakdown';

export function VCoordinatorDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Coordinator';
  const agencyId = user?.agencyId;

  const { data: allUsers = [], isLoading } = useGetAllUsersQuery();

  // Filter to volunteers in this coordinator's agency
  const volunteers = useMemo(() => {
    return allUsers.filter(
      (u) => u.role?.includes('Volunteer') && u.agencyId === agencyId,
    );
  }, [allUsers, agencyId]);

  const stats = useMemo(() => {
    const total = volunteers.length;
    const registered = volunteers.filter((v) => v.status === 'Registered').length;
    const recommended = volunteers.filter((v) => v.status === 'Recommended').length;
    const onHold = volunteers.filter((v) => v.status === 'OnHold').length;
    const active = volunteers.filter((v) => v.status === 'Active').length;
    return { total, registered, recommended, onHold, active };
  }, [volunteers]);

  const breakdownItems = [
    { label: 'Registered', count: stats.registered, color: '#0369A1' },
    { label: 'Recommended', count: stats.recommended, color: '#D97706' },
    { label: 'On Hold', count: stats.onHold, color: '#DC2626' },
    { label: 'Active', count: stats.active, color: '#059669' },
  ];

  // Action items — new volunteers needing attention
  const newVolunteers = useMemo(() => {
    return volunteers
      .filter((v) => v.status === 'Registered')
      .slice(0, 5);
  }, [volunteers]);

  // Recently recommended
  const recentlyRecommended = useMemo(() => {
    return volunteers
      .filter((v) => v.status === 'Recommended')
      .slice(0, 5);
  }, [volunteers]);

  return (
    <Stack spacing={3}>
      <WelcomeBanner
        name={userName}
        subtitle={`Managing ${stats.total} volunteers`}
        actionLabel="View All"
        actionIcon={<GroupsIcon />}
        onAction={() => navigate('/app/volunteers')}
      />

      {/* Stat cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<PeopleIcon />}
            label="Total Volunteers"
            value={stats.total}
            color="primary.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<PersonAddIcon />}
            label="New (Registered)"
            value={stats.registered}
            color="info.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<HowToRegIcon />}
            label="Recommended"
            value={stats.recommended}
            color="warning.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Active"
            value={stats.active}
            color="success.main"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Action Items + Pipeline */}
      <Grid container spacing={2.5}>
        {/* Action Items */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Action Required
              </Typography>
              {stats.registered > 0 && (
                <Chip
                  label={`${stats.registered} pending`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Stack>

            {newVolunteers.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  New volunteers awaiting recommendation:
                </Typography>
                <List disablePadding>
                  {newVolunteers.map((vol) => (
                    <ListItemButton
                      key={vol.osid}
                      onClick={() => navigate(`/app/volunteers/${vol.osid}`)}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <FiberNewIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={vol.identityDetails?.fullname || vol.identityDetails?.name || '—'}
                        secondary={vol.contactDetails?.address?.city || vol.contactDetails?.email || ''}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <ArrowForwardIcon fontSize="small" color="action" />
                    </ListItemButton>
                  ))}
                </List>
                {stats.registered > 5 && (
                  <Button
                    size="small"
                    onClick={() => navigate('/app/volunteers')}
                    sx={{ mt: 1 }}
                  >
                    View all {stats.registered} new volunteers
                  </Button>
                )}
              </>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  All caught up! No volunteers pending review.
                </Typography>
              </Box>
            )}

            {/* Recently Recommended */}
            {recentlyRecommended.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Recently recommended (awaiting activation):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {recentlyRecommended.map((vol) => (
                    <Chip
                      key={vol.osid}
                      label={vol.identityDetails?.fullname || vol.identityDetails?.name || '—'}
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => navigate(`/app/volunteers/${vol.osid}`)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        </Grid>

        {/* Pipeline */}
        <Grid item xs={12} md={5}>
          <StatusBreakdown
            title="Volunteer Pipeline"
            items={breakdownItems}
            loading={isLoading}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
