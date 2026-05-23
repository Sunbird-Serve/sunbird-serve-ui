import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAppSelector } from '@app/store';
import { useGetAllUsersQuery } from '../api/dashboardApi';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { RecentVolunteersTable } from '../components/RecentVolunteersTable';
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

  return (
    <Stack spacing={3}>
      <WelcomeBanner
        name={userName}
        subtitle="Manage and monitor your volunteers"
        actionLabel="View All"
        actionIcon={<GroupsIcon />}
        onAction={() => navigate('/app/volunteers')}
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

      {/* Bottom section */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <RecentVolunteersTable
            volunteers={volunteers}
            loading={isLoading}
            title="Recent Volunteers"
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
