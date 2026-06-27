import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Stack,
  Autocomplete,
  TextField,
  Chip,
  Paper,
  Typography,
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '@app/store';
import { useGetAllUsersQuery, useGetAgenciesQuery } from '../api/dashboardApi';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { StatusBreakdown } from '../components/StatusBreakdown';

export function VAdminDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Admin';

  const { data: allUsers = [], isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: agencies = [], isLoading: agenciesLoading } = useGetAgenciesQuery();

  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);

  // All volunteers
  const allVolunteers = useMemo(() => {
    return allUsers.filter((u) => u.role?.includes('Volunteer'));
  }, [allUsers]);

  // Filtered by selected agencies
  const volunteers = useMemo(() => {
    if (selectedAgencies.length === 0) return allVolunteers;
    return allVolunteers.filter((v) => selectedAgencies.includes(v.agencyId || ''));
  }, [allVolunteers, selectedAgencies]);

  const isLoading = usersLoading || agenciesLoading;

  const stats = useMemo(() => {
    const total = volunteers.length;
    const registered = volunteers.filter((v) => v.status === 'Registered').length;
    const active = volunteers.filter((v) => v.status === 'Active').length;
    const recommended = volunteers.filter((v) => v.status === 'Recommended').length;
    const onHold = volunteers.filter((v) => v.status === 'OnHold').length;
    const unassigned = volunteers.filter((v) => !v.agencyId).length;
    return { total, registered, active, recommended, onHold, unassigned };
  }, [volunteers]);

  const breakdownItems = [
    { label: 'Registered', count: stats.registered, color: '#0369A1' },
    { label: 'Recommended', count: stats.recommended, color: '#D97706' },
    { label: 'On Hold', count: stats.onHold, color: '#DC2626' },
    { label: 'Active', count: stats.active, color: '#059669' },
    { label: 'Unassigned', count: stats.unassigned, color: '#6B7280' },
  ];

  // Volunteers by agency (bar chart)
  const volunteersByAgency = useMemo(() => {
    const map: Record<string, { total: number; active: number }> = {};
    for (const v of allVolunteers) {
      const agencyId = v.agencyId || 'Unassigned';
      const agency = agencies.find((a) => a.osid === agencyId);
      const name = agency?.name || (agencyId === 'Unassigned' ? 'Unassigned' : agencyId.slice(-8));
      if (!map[name]) map[name] = { total: 0, active: 0 };
      map[name].total += 1;
      if (v.status === 'Active') map[name].active += 1;
    }
    return Object.entries(map)
      .map(([name, data]) => ({
        name: name.length > 16 ? name.slice(0, 16) + '...' : name,
        total: data.total,
        active: data.active,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [allVolunteers, agencies]);

  // Action items — new unassigned or pending review
  const newVolunteers = useMemo(() => {
    return volunteers.filter((v) => v.status === 'Registered').slice(0, 5);
  }, [volunteers]);

  // Conversion funnel
  const funnel = useMemo(() => {
    const total = allVolunteers.length;
    const recommended = allVolunteers.filter((v) => v.status === 'Recommended' || v.status === 'Active').length;
    const active = allVolunteers.filter((v) => v.status === 'Active').length;
    return {
      total,
      recommended,
      active,
      recommendRate: total > 0 ? ((recommended / total) * 100).toFixed(0) : '0',
      activeRate: total > 0 ? ((active / total) * 100).toFixed(0) : '0',
    };
  }, [allVolunteers]);

  return (
    <Stack spacing={3}>
      <WelcomeBanner
        name={userName}
        subtitle={`${agencies.length} agencies · ${allVolunteers.length} total volunteers`}
        actionLabel="View All"
        actionIcon={<GroupsIcon />}
        onAction={() => navigate('/app/volunteers')}
      />

      {/* Agency filter */}
      <Autocomplete
        multiple
        options={agencies}
        getOptionLabel={(option) => option.name}
        value={agencies.filter((a) => selectedAgencies.includes(a.osid))}
        onChange={(_, value) => setSelectedAgencies(value.map((v) => v.osid))}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option.name} size="small" {...getTagProps({ index })} key={option.osid} />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="Filter by Agency" placeholder="All agencies" size="small" />
        )}
        sx={{ maxWidth: 600 }}
      />

      {/* Stat cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<PeopleIcon />}
            label="Total Volunteers"
            value={stats.total}
            color="primary.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<PersonAddIcon />}
            label="Registered"
            value={stats.registered}
            color="info.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Active"
            value={stats.active}
            color="success.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<BusinessIcon />}
            label="Agencies"
            value={agencies.length}
            color="secondary.main"
            loading={agenciesLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<PauseCircleIcon />}
            label="On Hold"
            value={stats.onHold}
            color="error.main"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Funnel + Agency Chart */}
      <Grid container spacing={2.5}>
        {/* Conversion Funnel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Conversion Funnel
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Total Registered</Typography>
                  <Typography variant="body2" fontWeight={600}>{funnel.total}</Typography>
                </Stack>
                <Box sx={{ height: 12, bgcolor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: '100%', bgcolor: '#0369A1', borderRadius: 2 }} />
                </Box>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Recommended+</Typography>
                  <Typography variant="body2" fontWeight={600}>{funnel.recommended} ({funnel.recommendRate}%)</Typography>
                </Stack>
                <Box sx={{ height: 12, bgcolor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${funnel.recommendRate}%`, bgcolor: '#D97706', borderRadius: 2 }} />
                </Box>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Active</Typography>
                  <Typography variant="body2" fontWeight={600}>{funnel.active} ({funnel.activeRate}%)</Typography>
                </Stack>
                <Box sx={{ height: 12, bgcolor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${funnel.activeRate}%`, bgcolor: '#059669', borderRadius: 2 }} />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Volunteers by Agency bar chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, height: 300 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Volunteers by Agency
            </Typography>
            {volunteersByAgency.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={volunteersByAgency} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={130} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#94A3B8" name="Total" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="active" fill="#10B981" name="Active" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body2" color="text.secondary">No data</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Items + Pipeline */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Action Required</Typography>
              {stats.registered > 0 && (
                <Chip label={`${stats.registered} pending`} size="small" color="info" variant="outlined" />
              )}
            </Stack>

            {newVolunteers.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  New volunteers needing review:
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
                  <Button size="small" onClick={() => navigate('/app/volunteers')} sx={{ mt: 1 }}>
                    View all {stats.registered}
                  </Button>
                )}
              </>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 36, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">All caught up!</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

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
