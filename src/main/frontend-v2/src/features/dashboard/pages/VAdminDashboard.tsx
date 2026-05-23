import { useMemo, useState } from 'react';
import { Grid, Stack, Autocomplete, TextField, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import { useAppSelector } from '@app/store';
import { useGetAllUsersQuery, useGetAgenciesQuery } from '../api/dashboardApi';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { RecentVolunteersTable } from '../components/RecentVolunteersTable';
import { StatusBreakdown } from '../components/StatusBreakdown';

export function VAdminDashboard() {
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

  return (
    <Stack spacing={3}>
      <WelcomeBanner
        name={userName}
        subtitle={`${agencies.length} agencies · ${allVolunteers.length} total volunteers`}
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
          <TextField {...params} label="Filter by Agency" placeholder="Select agencies" size="small" />
        )}
        sx={{ maxWidth: 600 }}
      />

      {/* Stat cards */}
      <Grid container spacing={2.5}>
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
            label="Registered"
            value={stats.registered}
            color="info.main"
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
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<BusinessIcon />}
            label="Agencies"
            value={agencies.length}
            color="secondary.main"
            loading={agenciesLoading}
          />
        </Grid>
      </Grid>

      {/* Bottom section */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <RecentVolunteersTable
            volunteers={volunteers}
            loading={isLoading}
            title="Volunteer Overview"
            maxRows={8}
          />
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
