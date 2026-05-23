import { useMemo, useState, useEffect } from 'react';
import { Grid, Stack, Autocomplete, TextField, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BusinessIcon from '@mui/icons-material/Business';
import { useAppSelector } from '@app/store';
import {
  useGetNeedsByUserIdQuery,
  useGetEntitiesByUserQuery,
  useGetAllEntitiesQuery,
  useGetNeedsByEntitiesMutation,
  NeedItem,
} from '../api/dashboardApi';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { RecentNeedsTable } from '../components/RecentNeedsTable';
import { StatusBreakdown } from '../components/StatusBreakdown';

export function NAdminDashboard() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Admin';
  const isSAdmin = user?.role?.includes('sAdmin');

  // Fetch entities based on role
  const { data: userEntities = [] } = useGetEntitiesByUserQuery(userId, {
    skip: !userId || !!isSAdmin,
  });
  const { data: allEntities = [] } = useGetAllEntitiesQuery(undefined, {
    skip: !isSAdmin,
  });

  const entities = isSAdmin ? allEntities : userEntities;

  // Entity filter state
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

  // Auto-select all entities on load
  useEffect(() => {
    if (entities.length > 0 && selectedEntities.length === 0) {
      setSelectedEntities(entities.map((e) => e.id));
    }
  }, [entities, selectedEntities.length]);

  // Fetch needs for user (all needs)
  const { data: allNeeds = [], isLoading: needsLoading } = useGetNeedsByUserIdQuery(userId, {
    skip: !userId,
  });

  // Fetch needs by selected entities
  const [fetchEntityNeeds, { data: entityNeeds, isLoading: entityNeedsLoading }] =
    useGetNeedsByEntitiesMutation();

  useEffect(() => {
    if (selectedEntities.length > 0) {
      fetchEntityNeeds(selectedEntities);
    }
  }, [selectedEntities, fetchEntityNeeds]);

  // Use entity-filtered needs if available, otherwise all needs
  const needs: NeedItem[] = entityNeeds || allNeeds;
  const isLoading = needsLoading || entityNeedsLoading;

  // Filter needs by selected entities
  const filteredNeeds = useMemo(() => {
    if (selectedEntities.length === 0) return needs;
    return needs.filter((n) => selectedEntities.includes(n.entityId || ''));
  }, [needs, selectedEntities]);

  const stats = useMemo(() => {
    const total = filteredNeeds.length;
    const inProgress = filteredNeeds.filter((n) => n.status === 'Assigned').length;
    const nominated = filteredNeeds.filter((n) => n.status === 'Nominated').length;
    const approved = filteredNeeds.filter((n) => n.status === 'Approved').length;
    const newNeeds = filteredNeeds.filter((n) => n.status === 'New').length;
    const fulfilled = filteredNeeds.filter((n) => n.status === 'Fulfilled').length;
    const rejected = filteredNeeds.filter((n) => n.status === 'Rejected').length;
    return { total, inProgress, nominated, approved, newNeeds, fulfilled, rejected };
  }, [filteredNeeds]);

  const breakdownItems = [
    { label: 'New', count: stats.newNeeds, color: '#0369A1' },
    { label: 'Nominated', count: stats.nominated, color: '#D97706' },
    { label: 'Approved', count: stats.approved, color: '#059669' },
    { label: 'In Progress', count: stats.inProgress, color: '#4F46E5' },
    { label: 'Fulfilled', count: stats.fulfilled, color: '#065F46' },
    { label: 'Rejected', count: stats.rejected, color: '#DC2626' },
  ];

  return (
    <Stack spacing={3}>
      <WelcomeBanner
        name={userName}
        subtitle={`Managing ${entities.length} active entities`}
      />

      {/* Entity filter */}
      <Autocomplete
        multiple
        options={entities}
        getOptionLabel={(option) => option.name}
        value={entities.filter((e) => selectedEntities.includes(e.id))}
        onChange={(_, value) => setSelectedEntities(value.map((v) => v.id))}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option.name} size="small" {...getTagProps({ index })} key={option.id} />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="Filter by Entity" placeholder="Select entities" size="small" />
        )}
        sx={{ maxWidth: 600 }}
      />

      {/* Stat cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<AssignmentIcon />}
            label="Total Needs"
            value={stats.total}
            color="primary.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<PlayCircleIcon />}
            label="In Progress"
            value={stats.inProgress}
            color="info.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<ThumbUpIcon />}
            label="Nominated"
            value={stats.nominated}
            color="warning.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<BusinessIcon />}
            label="Entities"
            value={entities.length}
            color="secondary.main"
            loading={false}
          />
        </Grid>
      </Grid>

      {/* Bottom section */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <RecentNeedsTable needs={filteredNeeds} loading={isLoading} title="Needs Overview" maxRows={8} />
        </Grid>
        <Grid item xs={12} md={5}>
          <StatusBreakdown title="Needs by Status" items={breakdownItems} loading={isLoading} />
        </Grid>
      </Grid>
    </Stack>
  );
}
