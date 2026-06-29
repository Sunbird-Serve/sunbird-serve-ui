import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Grid,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { useAppSelector } from '@app/store';
import { StatusChip } from '@features/dashboard/components/StatusChip';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

// --- Types ---
interface Fulfillment {
  needId: string;
  needPlanId: string;
  assignedUserId: string;
}

interface Deliverable {
  id: string;
  needPlanId: string;
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

interface SessionPlan {
  fulfillment: Fulfillment;
  deliverables: Deliverable[];
  inputParams: InputParameter[];
  needName?: string;
  volunteerName?: string;
  volunteerPhone?: string;
  entityName?: string;
}

interface FlatSession {
  id: string;
  date: string;
  status: string;
  startTime?: string;
  endTime?: string;
  sessionLink?: string;
  needName: string;
  volunteerName: string;
  volunteerPhone: string;
  entityName: string;
  comments?: string;
  numberOfAttendees?: number;
  needPlanId: string;
}

type TimePeriod = 'today' | 'yesterday' | 'tomorrow' | 'thisWeek' | 'thisMonth' | 'allTime';

// --- Helpers ---
function getDateRange(period: TimePeriod): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (period) {
    case 'today':
      return { start: today, end: today };
    case 'yesterday': {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      const s = d.toISOString().split('T')[0];
      return { start: s, end: s };
    }
    case 'tomorrow': {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      const s = d.toISOString().split('T')[0];
      return { start: s, end: s };
    }
    case 'thisWeek': {
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
    }
    case 'thisMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: firstDay.toISOString().split('T')[0], end: lastDay.toISOString().split('T')[0] };
    }
    case 'allTime':
      return { start: '2000-01-01', end: '2099-12-31' };
  }
}

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
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const SESSION_COLORS: Record<string, string> = {
  Planned: '#3B82F6',
  Completed: '#10B981',
  Cancelled: '#EF4444',
  Offline: '#F59E0B',
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const PERIOD_LABELS: Record<TimePeriod, string> = {
  today: "Today's Sessions",
  yesterday: "Yesterday's Sessions",
  tomorrow: "Tomorrow's Sessions",
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  allTime: 'All Sessions',
};

// --- Component ---
export function SessionsPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const [loading, setLoading] = useState(true);
  const [sessionPlans, setSessionPlans] = useState<SessionPlan[]>([]);
  const [period, setPeriod] = useState<TimePeriod>('today');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [error, setError] = useState('');

  // Fetch all session data
  useEffect(() => {
    async function fetchSessions() {
      if (!userId) return;
      setLoading(true);
      setError('');
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const headers = getAuthHeaders();

        // Step 1: Get all needs for this admin that are Assigned/Fulfilled (have active fulfillments)
        const needsResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/need/?status=Assigned&page=0&size=200`,
          { headers },
        );
        let assignedNeeds: { id: string }[] = [];
        if (needsResp.ok) {
          const needsData = await needsResp.json();
          const content = Array.isArray(needsData) ? needsData : (needsData.content || []);
          assignedNeeds = content.map((n: Record<string, unknown>) => ({ id: (n.id as string) || (n.need as Record<string, unknown>)?.id as string || '' })).filter((n: { id: string }) => n.id);
        }

        // Also fetch Fulfilled needs
        const fulfilledResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/need/?status=Fulfilled&page=0&size=200`,
          { headers },
        );
        if (fulfilledResp.ok) {
          const fulfilledData = await fulfilledResp.json();
          const content = Array.isArray(fulfilledData) ? fulfilledData : (fulfilledData.content || []);
          const more = content.map((n: Record<string, unknown>) => ({ id: (n.id as string) || (n.need as Record<string, unknown>)?.id as string || '' })).filter((n: { id: string }) => n.id);
          assignedNeeds = [...assignedNeeds, ...more];
        }

        if (assignedNeeds.length === 0) {
          setLoading(false);
          return;
        }

        // Step 2: For each need, get fulfillments via /fulfillment/need-read/{needId}
        let fulfs: Fulfillment[] = [];
        for (const need of assignedNeeds.slice(0, 50)) {
          try {
            const fulfResp = await fetch(
              `${BASE_URL}/api/v1/serve-fulfill/fulfillment/need-read/${need.id}`,
              { headers },
            );
            if (fulfResp.ok) {
              const fulfData = await fulfResp.json();
              const items = Array.isArray(fulfData) ? fulfData : (fulfData.content || []);
              fulfs.push(...items);
            }
          } catch { /* skip individual failures */ }
        }

        // Fallback: also try coordinator-read in case admin is also a coordinator
        if (fulfs.length === 0) {
          try {
            const coordResp = await fetch(
              `${BASE_URL}/api/v1/serve-fulfill/fulfillment/coordinator-read/${userId}?page=0&size=1000`,
              { headers },
            );
            if (coordResp.ok) {
              const coordData = await coordResp.json();
              const items = Array.isArray(coordData) ? coordData : (coordData.content || []);
              fulfs.push(...items);
            }
          } catch { /* skip */ }
        }

        if (fulfs.length === 0) {
          setLoading(false);
          return;
        }

        const results: SessionPlan[] = [];
        for (const fulf of fulfs.slice(0, 100)) {
          try {
            // Get need name
            let needName = '';
            try {
              const planResp = await fetch(
                `${BASE_URL}/api/v1/serve-need/need-plan/${fulf.needId}`,
                { headers },
              );
              if (planResp.ok) {
                const planData = await planResp.json();
                const plans = Array.isArray(planData) ? planData : (planData.content || []);
                if (plans.length > 0) {
                  needName = plans[0]?.plan?.name || '';
                }
              }
            } catch { /* skip */ }

            // Get volunteer details
            let volunteerName = '';
            let volunteerPhone = '';
            if (fulf.assignedUserId) {
              try {
                const volResp = await fetch(
                  `${BASE_URL}/api/v1/serve-volunteering/user/${fulf.assignedUserId}`,
                  { headers },
                );
                if (volResp.ok) {
                  const volData = await volResp.json();
                  volunteerName = volData?.identityDetails?.fullname || volData?.identityDetails?.name || '';
                  volunteerPhone = volData?.contactDetails?.mobile || '';
                }
              } catch { /* skip */ }
            }

            // Get deliverables
            const delivResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need-deliverable/${fulf.needPlanId}`,
              { headers },
            );
            if (delivResp.ok) {
              const delivData = await delivResp.json();
              const deliverables = delivData.needDeliverable || delivData.content || [];
              const inputParams = delivData.inputParameters || [];
              if (deliverables.length > 0) {
                results.push({
                  fulfillment: fulf,
                  deliverables: Array.isArray(deliverables) ? deliverables : [],
                  inputParams: Array.isArray(inputParams) ? inputParams : [],
                  needName,
                  volunteerName,
                  volunteerPhone,
                });
              }
            }
          } catch { /* skip individual failures */ }
        }
        setSessionPlans(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [userId]);

  // Flatten into individual session rows
  const allSessions: FlatSession[] = useMemo(() => {
    const flat: FlatSession[] = [];
    for (const plan of sessionPlans) {
      const params = plan.inputParams.length > 0 ? plan.inputParams[0] : null;
      for (const d of plan.deliverables) {
        flat.push({
          id: d.id,
          date: d.deliverableDate?.split('T')[0] || '',
          status: d.status,
          startTime: params?.startTime,
          endTime: params?.endTime,
          sessionLink: params?.inputUrl,
          needName: plan.needName || '',
          volunteerName: plan.volunteerName || '',
          volunteerPhone: plan.volunteerPhone || '',
          entityName: plan.entityName || '',
          comments: d.comments,
          numberOfAttendees: d.numberOfAttendees,
          needPlanId: d.needPlanId,
        });
      }
    }
    return flat.sort((a, b) => b.date.localeCompare(a.date));
  }, [sessionPlans]);

  // Filter by period
  const filteredSessions = useMemo(() => {
    const { start, end } = getDateRange(period);
    let result = allSessions.filter((s) => s.date >= start && s.date <= end);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.needName.toLowerCase().includes(q) ||
          s.volunteerName.toLowerCase().includes(q) ||
          s.entityName.toLowerCase().includes(q) ||
          s.status.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allSessions, period, search]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredSessions.length;
    const planned = filteredSessions.filter((s) => s.status === 'Planned').length;
    const completed = filteredSessions.filter((s) => s.status === 'Completed').length;
    const cancelled = filteredSessions.filter((s) => s.status === 'Cancelled').length;
    const offline = filteredSessions.filter((s) => s.status === 'Offline').length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
    return { total, planned, completed, cancelled, offline, completionRate };
  }, [filteredSessions]);

  // Bar chart data
  const barData = useMemo(() => [
    { name: 'Planned', count: stats.planned, fill: SESSION_COLORS.Planned },
    { name: 'Completed', count: stats.completed, fill: SESSION_COLORS.Completed },
    { name: 'Cancelled', count: stats.cancelled, fill: SESSION_COLORS.Cancelled },
    { name: 'Offline', count: stats.offline, fill: SESSION_COLORS.Offline },
  ], [stats]);

  // Cancellation reasons
  const cancelReasons = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of filteredSessions) {
      if (s.status === 'Cancelled' && s.comments) {
        map[s.comments] = (map[s.comments] || 0) + 1;
      }
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSessions]);

  // Paginated rows
  const paginatedSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Sessions
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Period Toggle */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, v) => { if (v) { setPeriod(v); setPage(0); } }}
            size="small"
          >
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="yesterday">Yesterday</ToggleButton>
            <ToggleButton value="tomorrow">Tomorrow</ToggleButton>
            <ToggleButton value="thisWeek">This Week</ToggleButton>
            <ToggleButton value="thisMonth">This Month</ToggleButton>
            <ToggleButton value="allTime">All Time</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small"
            placeholder="Search by need, volunteer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Stack>
      </Paper>

      {loading ? (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Grid item xs={6} sm={4} md={2.4} key={i}>
                <Skeleton variant="rounded" height={100} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={300} />
        </Stack>
      ) : (
        <>
          {/* Summary Header */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            {PERIOD_LABELS[period]}
          </Typography>

          {/* Stat Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <EventAvailableIcon sx={{ fontSize: 28, color: '#3B82F6', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#3B82F6">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 28, color: SESSION_COLORS.Planned, mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color={SESSION_COLORS.Planned}>
                  {stats.planned}
                </Typography>
                <Typography variant="caption" color="text.secondary">Planned</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 28, color: SESSION_COLORS.Completed, mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color={SESSION_COLORS.Completed}>
                  {stats.completed}
                </Typography>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CancelIcon sx={{ fontSize: 28, color: SESSION_COLORS.Cancelled, mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color={SESSION_COLORS.Cancelled}>
                  {stats.cancelled}
                </Typography>
                <Typography variant="caption" color="text.secondary">Cancelled</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stats.completionRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Session Status Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Cancellation Reasons
                </Typography>
                {cancelReasons.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={cancelReasons}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {cancelReasons.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                    <Typography variant="body2" color="text.secondary">
                      No cancellations in this period
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Sessions Table */}
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Need</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Volunteer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          No sessions found for this period
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSessions.map((session) => (
                      <TableRow key={session.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(session.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                            {session.needName || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {session.volunteerName || '—'}
                            </Typography>
                            {session.volunteerPhone && (
                              <Typography variant="caption" color="text.secondary">
                                {session.volunteerPhone}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatTime(session.startTime)} – {formatTime(session.endTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={session.status} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                            {session.comments || '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredSessions.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 15, 25, 50]}
            />
          </Paper>
        </>
      )}
    </Box>
  );
}
