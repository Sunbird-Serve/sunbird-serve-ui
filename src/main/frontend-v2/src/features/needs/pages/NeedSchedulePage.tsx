import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  MenuItem,
  Chip,
  Skeleton,
  Link,
  Divider,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useAppSelector } from '@app/store';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { getAuthHeaders } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

interface Deliverable {
  id: string;
  needPlanId?: string;
  deliverableDate: string;
  status: string;
  comments?: string;
  numberOfAttendees?: number;
}

interface InputParameter {
  startTime?: string;
  endTime?: string;
  softwarePlatform?: string;
  inputUrl?: string;
}

interface PlanSession {
  needName: string;
  needId: string;
  planId: string;
  deliverables: Deliverable[];
  inputParams: InputParameter[];
  volunteerName?: string;
  volunteerPhone?: string;
}

type DateRange = 'thisWeek' | 'next2Weeks' | 'thisMonth';

function formatTime(timeString?: string): string {
  if (!timeString) return '—';
  const match = timeString.match(/(\d{2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
  return timeString;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getDateRange(range: DateRange): { start: string; end: string } {
  const today = new Date();
  const start = today.toISOString().split('T')[0];
  const end = new Date(today);

  switch (range) {
    case 'thisWeek':
      end.setDate(today.getDate() + (7 - today.getDay()));
      break;
    case 'next2Weeks':
      end.setDate(today.getDate() + 14);
      break;
    case 'thisMonth':
      end.setMonth(today.getMonth() + 1, 0);
      break;
  }

  return { start, end: end.toISOString().split('T')[0] };
}

export function NeedSchedulePage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<PlanSession[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('next2Weeks');
  const [needFilter, setNeedFilter] = useState('all');

  // Fetch all need plans and their deliverables
  useEffect(() => {
    async function fetchSchedule() {
      if (!userId) return;
      setLoading(true);
      try {
        // Get fulfillments for this coordinator
        const fulfResp = await fetch(
          `${BASE_URL}/api/v1/serve-fulfill/fulfillment/coordinator-read/${userId}?page=0&size=50`,
          { headers: getAuthHeaders() },
        );
        if (!fulfResp.ok) { setLoading(false); return; }
        const fulfData = await fulfResp.json();
        const fulfs = Array.isArray(fulfData) ? fulfData : (fulfData.content || []);

        if (fulfs.length === 0) { setLoading(false); return; }

        // For each fulfillment, get need plan name + deliverables
        const results: PlanSession[] = [];
        for (const fulf of fulfs) {
          try {
            // Get need name from need-plan
            const planResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${fulf.needId}`, { headers: getAuthHeaders() });
            let needName = '';
            let planId = fulf.needPlanId;
            if (planResp.ok) {
              const planData = await planResp.json();
              const plans = Array.isArray(planData) ? planData : (planData.content || []);
              if (plans.length > 0) {
                needName = plans[0]?.plan?.name || '';
                planId = plans[0]?.plan?.id || fulf.needPlanId;
              }
            }

            // Get volunteer details
            let volunteerName = '';
            let volunteerPhone = '';
            if (fulf.assignedUserId) {
              try {
                const volResp = await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/${fulf.assignedUserId}`, { headers: getAuthHeaders() });
                if (volResp.ok) {
                  const volData = await volResp.json();
                  volunteerName = volData?.identityDetails?.fullname || volData?.identityDetails?.name || '';
                  volunteerPhone = volData?.contactDetails?.mobile || '';
                }
              } catch { /* skip */ }
            }

            // Get deliverables
            const delivResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/${planId}`, { headers: getAuthHeaders() });
            if (delivResp.ok) {
              const delivData = await delivResp.json();
              const deliverables = delivData.needDeliverable || delivData.content || [];
              const inputParams = delivData.inputParameters || [];
              if (deliverables.length > 0) {
                results.push({
                  needName: needName || `Need ${fulf.needId.slice(-6)}`,
                  needId: fulf.needId,
                  planId,
                  deliverables,
                  inputParams,
                  volunteerName,
                  volunteerPhone,
                });
              }
            }
          } catch {
            // Skip failed fetches
          }
        }
        setSessions(results);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [userId]);

  // Get unique need names for filter
  const needNames = useMemo(() => {
    const names = [...new Set(sessions.map((s) => s.needName))];
    return names.sort();
  }, [sessions]);

  // Filter and flatten deliverables by date range and need
  const { start, end } = getDateRange(dateRange);
  const filteredSessions = useMemo(() => {
    const items: { date: string; needName: string; deliverable: Deliverable; params: InputParameter | null; volunteerName: string; volunteerPhone: string }[] = [];

    for (const session of sessions) {
      if (needFilter !== 'all' && session.needName !== needFilter) continue;
      const params = session.inputParams.length > 0 ? session.inputParams[0] : null;

      for (const d of session.deliverables) {
        const dateStr = d.deliverableDate?.split('T')[0] || '';
        if (dateStr >= start && dateStr <= end) {
          items.push({ date: dateStr, needName: session.needName, deliverable: d, params, volunteerName: session.volunteerName || '', volunteerPhone: session.volunteerPhone || '' });
        }
      }
    }

    // Sort by date
    items.sort((a, b) => a.date.localeCompare(b.date));
    return items;
  }, [sessions, dateRange, needFilter, start, end]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filteredSessions> = {};
    for (const item of filteredSessions) {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    }
    return groups;
  }, [filteredSessions]);

  // Stats
  const totalSessions = filteredSessions.length;
  const completedSessions = filteredSessions.filter((s) => s.deliverable.status === 'Completed').length;
  const pendingSessions = filteredSessions.filter((s) => s.deliverable.status === 'Planned').length;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Need Schedule
      </Typography>

      {/* Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
        <ToggleButtonGroup
          value={dateRange}
          exclusive
          onChange={(_, v) => v && setDateRange(v)}
          size="small"
        >
          <ToggleButton value="thisWeek">This Week</ToggleButton>
          <ToggleButton value="next2Weeks">Next 2 Weeks</ToggleButton>
          <ToggleButton value="thisMonth">This Month</ToggleButton>
        </ToggleButtonGroup>

        {needNames.length > 1 && (
          <TextField
            select
            label="Filter by Need"
            value={needFilter}
            onChange={(e) => setNeedFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="all">All Needs</MenuItem>
            {needNames.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      {/* Summary stats */}
      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <AssignmentIcon fontSize="small" color="primary" />
          <Typography variant="body2"><strong>{totalSessions}</strong> sessions</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CheckCircleIcon fontSize="small" color="success" />
          <Typography variant="body2"><strong>{completedSessions}</strong> completed</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <PendingIcon fontSize="small" color="info" />
          <Typography variant="body2"><strong>{pendingSessions}</strong> pending</Typography>
        </Stack>
      </Stack>

      {/* Loading */}
      {loading && (
        <Stack spacing={2}>
          <Skeleton height={60} variant="rounded" />
          <Skeleton height={60} variant="rounded" />
          <Skeleton height={60} variant="rounded" />
          <Skeleton height={60} variant="rounded" />
        </Stack>
      )}

      {/* Empty state */}
      {!loading && filteredSessions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No sessions found for the selected period.
          </Typography>
        </Paper>
      )}

      {/* Sessions grouped by date */}
      {!loading && Object.entries(groupedByDate).map(([date, items]) => {
        const isToday = date === todayStr;
        return (
          <Box key={date} sx={{ mb: 2 }}>
            {/* Date header */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {formatDate(date)}
              </Typography>
              {isToday && <Chip label="Today" size="small" color="primary" />}
              <Typography variant="caption" color="text.secondary">
                ({items.length} session{items.length > 1 ? 's' : ''})
              </Typography>
            </Stack>

            {/* Session cards for this date */}
            <Stack spacing={1}>
              {items.map(({ needName, deliverable, params, volunteerName, volunteerPhone }) => (
                <Paper
                  key={deliverable.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    pl: 2,
                    borderLeft: isToday ? '3px solid' : '1px solid',
                    borderLeftColor: isToday ? 'primary.main' : 'divider',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {needName}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(params?.startTime)} – {formatTime(params?.endTime)}
                        </Typography>
                      </Stack>
                      {params?.inputUrl && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LinkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Link href={params.inputUrl} target="_blank" variant="caption" underline="hover">
                            Session Link
                          </Link>
                        </Stack>
                      )}
                      {volunteerName && (
                        <Typography variant="caption" color="text.secondary">
                          👤 {volunteerName}{volunteerPhone ? ` · ${volunteerPhone}` : ''}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip status={deliverable.status} />
                      {deliverable.numberOfAttendees && (
                        <Typography variant="caption" color="text.secondary">
                          {deliverable.numberOfAttendees} students
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ mt: 2 }} />
          </Box>
        );
      })}
    </Box>
  );
}
