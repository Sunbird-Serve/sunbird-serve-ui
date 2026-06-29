import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Grid,
  TextField,
  Autocomplete,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { useAppSelector } from '@app/store';
import { NeedListItem, useUpdateNeedStatusMutation } from '../api/needsApi';
import { NeedsTable } from '../components/NeedsTable';
import { NeedDetailDialog } from '../components/NeedDetailDialog';
import { ModifyScheduleDialog } from '../components/ModifyScheduleDialog';
import { StatCard } from '@features/dashboard/components/StatCard';
import { getAuthHeaders } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

interface EntityOption {
  id: string;
  name: string;
}

interface AgencyOption {
  osid: string;
  name: string;
}

function normalizeItem(item: Record<string, unknown>): NeedListItem | null {
  if (!item) return null;
  if (item.need && typeof item.need === 'object') {
    return item as unknown as NeedListItem;
  }
  if (item.id) {
    const requirement = item.requirement as Record<string, unknown> | undefined;
    const schedule = requirement?.schedule as Record<string, unknown> | undefined;
    return {
      need: {
        id: (item.id as string) || '',
        name: (item.name as string) || '',
        status: (item.status as string) || '',
        userId: (item.userId as string) || '',
        entityId: (item.entityId as string) || '',
        needTypeId: (item.needTypeId as string) || '',
        needPurpose: (item.needPurpose as string) || '',
        description: (item.description as string) || '',
      },
      needType: item.needType as NeedListItem['needType'],
      entity: item.entity as NeedListItem['entity'],
      occurrence: schedule
        ? {
            startDate: (schedule.startDate as string) || '',
            endDate: (schedule.endDate as string) || '',
            days: (schedule.days as string) || '',
            frequency: (schedule.frequency as string) || '',
            timeSlots: (schedule.timeSlots as NeedListItem['occurrence'] extends undefined ? never : NonNullable<NeedListItem['occurrence']>['timeSlots']) || [],
          }
        : (item.occurrence as NeedListItem['occurrence']),
      needRequirement: item.needRequirement as NeedListItem['needRequirement'],
      timeSlots: item.timeSlots as NeedListItem['timeSlots'],
    };
  }
  return null;
}

export function NeedsPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const role = Array.isArray(user?.role) ? user?.role[0] : user?.role;
  const isAdmin = role === 'nAdmin' || role === 'sAdmin';
  const isSAdmin = role === 'sAdmin';

  const [allNeeds, setAllNeeds] = useState<NeedListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin filters
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentAY = currentMonth >= 3 ? currentYear : currentYear - 1;
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const yearOptions = [
    { value: 'all', label: 'All Years' },
    ...Array.from({ length: 5 }, (_, i) => {
      const y = currentAY - i;
      return { value: `${y}-${y + 1}`, label: `AY ${y}-${y + 1}` };
    }),
  ];

  // Fetch entities for filter
  useEffect(() => {
    if (!isAdmin) return;
    async function fetchEntities() {
      try {
        const headers = getAuthHeaders();
        let url = `${BASE_URL}/api/v1/serve-need/entity/all?page=0&size=1000`;
        if (!isSAdmin && userId) {
          url = `${BASE_URL}/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`;
        }
        const resp = await fetch(url, { headers });
        if (resp.ok) {
          const data = await resp.json();
          const content = Array.isArray(data) ? data : (data.content || []);
          const opts = content
            .filter((e: EntityOption & { status?: string }) => e.status !== 'Inactive')
            .map((e: EntityOption) => ({ id: e.id, name: e.name }));
          setEntities(opts);
        }
      } catch { /* silent */ }
    }
    fetchEntities();
  }, [isAdmin, isSAdmin, userId]);

  // Fetch agencies for sAdmin filter
  useEffect(() => {
    if (!isSAdmin) return;
    async function fetchAgencies() {
      try {
        const headers = getAuthHeaders();
        const resp = await fetch(`${BASE_URL}/api/v1/serve-volunteering/agency/list`, { headers });
        if (resp.ok) {
          const data = await resp.json();
          const list = Array.isArray(data) ? data : (data.content || []);
          setAgencies(list.map((a: AgencyOption & Record<string, unknown>) => ({ osid: a.osid, name: a.name })));
        }
      } catch { /* silent */ }
    }
    fetchAgencies();
  }, [isSAdmin]);

  // Fetch needs
  useEffect(() => {
    async function fetchNeeds() {
      setLoading(true);
      const statuses = ['New', 'Nominated', 'Approved', 'Rejected', 'Assigned', 'Fulfilled'];
      const headers = getAuthHeaders();

      try {
        const results = await Promise.allSettled(
          statuses.map((status) =>
            fetch(`${BASE_URL}/api/v1/serve-need/need/?status=${status}&page=0&size=200`, { headers })
              .then((r) => (r.ok ? r.json() : null)),
          ),
        );

        const needs: NeedListItem[] = [];
        for (const result of results) {
          if (result.status === 'rejected' || !result.value) continue;
          const data = result.value;
          const content = Array.isArray(data) ? data : (data.content || []);
          for (const item of content) {
            const normalized = normalizeItem(item);
            if (normalized) needs.push(normalized);
          }
        }
        setAllNeeds(needs);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchNeeds();
  }, [user?.agencyId]);

  // Apply filters
  const filteredNeeds = useMemo(() => {
    let result = isAdmin ? allNeeds : allNeeds.filter((n) => n.need?.userId === userId);

    // Entity filter
    if (selectedEntities.length > 0) {
      result = result.filter((n) => selectedEntities.includes(n.need?.entityId || ''));
    }

    // Year filter
    if (selectedYear !== 'all') {
      const [startYr] = selectedYear.split('-').map(Number);
      const yearStart = `${startYr}-04-01`;
      const yearEnd = `${startYr + 1}-03-31`;
      result = result.filter((n) => {
        const date = n.occurrence?.startDate || '';
        if (!date) return true;
        const d = date.split('T')[0];
        return d >= yearStart && d <= yearEnd;
      });
    }

    return result;
  }, [allNeeds, isAdmin, userId, selectedEntities, selectedYear]);

  // Metrics
  const metrics = useMemo(() => {
    const total = filteredNeeds.length;
    const newCount = filteredNeeds.filter((n) => n.need?.status === 'New').length;
    const approved = filteredNeeds.filter((n) => n.need?.status === 'Approved').length;
    const inProgress = filteredNeeds.filter((n) => n.need?.status === 'Assigned').length;
    const fulfilled = filteredNeeds.filter((n) => n.need?.status === 'Fulfilled').length;
    const rejected = filteredNeeds.filter((n) => n.need?.status === 'Rejected').length;
    return { total, newCount, approved, inProgress, fulfilled, rejected };
  }, [filteredNeeds]);

  // Status update
  const [updateStatus] = useUpdateNeedStatusMutation();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialogs
  const [selectedNeed, setSelectedNeed] = useState<NeedListItem | null>(null);
  const [scheduleNeed, setScheduleNeed] = useState<NeedListItem | null>(null);

  const handleApprove = async (needId: string) => {
    try {
      await updateStatus({ needId, status: 'Approved' }).unwrap();
      // Update local state
      setAllNeeds((prev) =>
        prev.map((n) => n.need?.id === needId ? { ...n, need: { ...n.need, status: 'Approved' } } : n),
      );
      setSnackbar({ open: true, message: 'Need approved successfully.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to approve need.', severity: 'error' });
    }
  };

  const handleReject = async (needId: string) => {
    try {
      await updateStatus({ needId, status: 'Rejected' }).unwrap();
      setAllNeeds((prev) =>
        prev.map((n) => n.need?.id === needId ? { ...n, need: { ...n.need, status: 'Rejected' } } : n),
      );
      setSnackbar({ open: true, message: 'Need rejected.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to reject need.', severity: 'error' });
    }
  };

  const handleRowClick = (need: NeedListItem) => {
    if (!need?.need) return;
    setSelectedNeed(need);
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Needs
        </Typography>
        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/app/needs/raise')}
          >
            Raise Need
          </Button>
        )}
      </Stack>

      {/* Admin Filters */}
      {isAdmin && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} flexWrap="wrap">
            {/* Agency filter (sAdmin only) */}
            {isSAdmin && (
              <Autocomplete
                multiple
                size="small"
                options={agencies}
                getOptionLabel={(option) => option.name}
                value={agencies.filter((a) => selectedAgencies.includes(a.osid))}
                onChange={(_, value) => setSelectedAgencies(value.map((v) => v.osid))}
                renderTags={(value, getTagProps) =>
                  value.slice(0, 2).map((option, index) => (
                    <Chip label={option.name} size="small" {...getTagProps({ index })} key={option.osid} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Agency" placeholder="All agencies" size="small" />
                )}
                sx={{ minWidth: 240 }}
              />
            )}
            <Autocomplete
              multiple
              size="small"
              options={entities}
              getOptionLabel={(option) => option.name}
              value={entities.filter((e) => selectedEntities.includes(e.id))}
              onChange={(_, value) => setSelectedEntities(value.map((v) => v.id))}
              renderTags={(value, getTagProps) =>
                value.slice(0, 3).map((option, index) => (
                  <Chip label={option.name} size="small" {...getTagProps({ index })} key={option.id} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Filter by Entity" placeholder="All entities" size="small" />
              )}
              sx={{ minWidth: 280, flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Academic Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ minWidth: 160 }}
              SelectProps={{ native: true }}
            >
              {yearOptions.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </TextField>
            {(selectedEntities.length > 0 || selectedAgencies.length > 0) && (
              <Button
                size="small"
                variant="text"
                onClick={() => { setSelectedEntities([]); setSelectedAgencies([]); }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {/* Metrics Cards (Admin only) */}
      {isAdmin && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<AssignmentIcon />}
              label="Total Needs"
              value={metrics.total}
              color="primary.main"
              loading={loading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<NewReleasesIcon />}
              label="New"
              value={metrics.newCount}
              color="#0369A1"
              loading={loading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<ThumbUpIcon />}
              label="Approved"
              value={metrics.approved}
              color="success.main"
              loading={loading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<PlayCircleIcon />}
              label="In Progress"
              value={metrics.inProgress}
              color="info.main"
              loading={loading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<CheckCircleIcon />}
              label="Fulfilled"
              value={metrics.fulfilled}
              color="#065F46"
              loading={loading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<CancelIcon />}
              label="Rejected"
              value={metrics.rejected}
              color="error.main"
              loading={loading}
            />
          </Grid>
        </Grid>
      )}

      {/* Needs Table */}
      <NeedsTable
        needs={filteredNeeds}
        loading={loading}
        isAdmin={isAdmin}
        onRowClick={handleRowClick}
        onApprove={handleApprove}
        onReject={handleReject}
        onModifySchedule={(need) => setScheduleNeed(need)}
      />

      {/* Need Detail Dialog */}
      <NeedDetailDialog need={selectedNeed} onClose={() => setSelectedNeed(null)} />

      {/* Modify Schedule Dialog */}
      <ModifyScheduleDialog need={scheduleNeed} onClose={() => setScheduleNeed(null)} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
