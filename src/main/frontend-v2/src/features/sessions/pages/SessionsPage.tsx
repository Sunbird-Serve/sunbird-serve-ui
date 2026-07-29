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
} from 'recharts';
import { useAppSelector } from '@app/store';
import { StatusChip } from '@features/dashboard/components/StatusChip';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

// --- Types ---
interface NeedItem {
  id: string;
  name: string;
  status: string;
  entityId?: string;
}

interface NeedPlan {
  id: string;
  needId: string;
  name?: string;
  status?: string;
}

interface Deliverable {
  id: string;
  needPlanId: string;
  deliverableDate: string;
  status: string;
  comments?: string;
  numberOfAttendees?: number;
  inputParameters?: {
    startTime?: string;
    endTime?: string;
    inputUrl?: string;
    softwarePlatform?: string;
  };
}

interface FlatSession {
  id: string;
  date: string;
  status: string;
  startTime?: string;
  endTime?: string;
  sessionLink?: string;
  needName: string;
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
  const [allSessions, setAllSessions] = useState<FlatSession[]>([]);
  const [period, setPeriod] = useState<TimePeriod>('thisMonth');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [error, setError] = useState('');

  // Fetch sessions via need-plan → deliverables
  useEffect(() => {
    async function fetchSessions() {
      if (!userId) return;
      setLoading(true);
      setError('');
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const headers = getAuthHeaders();

        // Step 1: Get nAdmin's entities
        const entityResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`,
          { headers },
        );
        let entityIds: string[] = [];
        if (entityResp.ok) {
          const entityData = await entityResp.json();
          const entities = Array.isArray(entityData) ? entityData : (entityData.content || []);
          entityIds = entities.map((e: { id: string }) => e.id);
        }

        if (entityIds.length === 0) {
          setLoading(false);
          return;
        }

        // Step 2: Get needs for those entities (using status-based fetch, same as NeedsPage)
        const statuses = ['Assigned', 'Fulfilled', 'Approved'];
        const needsResults = await Promise.allSettled(
          statuses.map((status) =>
            fetch(`${BASE_URL}/api/v1/serve-need/need/?status=${status}&page=0&size=200`, { headers })
              .then((r) => (r.ok ? r.json() : null)),
          ),
        );

        let needs: NeedItem[] = [];
        for (const result of needsResults) {
          if (result.status === 'fulfilled' && result.value) {
            const content = Array.isArray(result.value) ? result.value : (result.value.content || []);
            const parsed = content.map((n: Record<string, unknown>) => {
              if (n.need && typeof n.need === 'object') {
                const need = n.need as Record<string, unknown>;
                return { id: need.id as string, name: need.name as string, status: need.status as string, entityId: need.entityId as string };
              }
              return { id: n.id as string, name: n.name as string, status: n.status as string, entityId: n.entityId as string };
            }).filter((n: NeedItem) => n.id);
            needs.push(...parsed);
          }
        }

        // Filter to only needs belonging to nAdmin's entities
        needs = needs.filter((n) => entityIds.includes(n.entityId || ''));

        if (needs.length === 0) {
          setLoading(false);
          return;
        }

        // Step 3: Get plans for each need
        const sessions: FlatSession[] = [];
        // Limit to avoid too many requests
        const needsToProcess = needs.slice(0, 100);

        for (const need of needsToProcess) {
          try {
            const planResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need-plan/${need.id}`,
              { headers },
            );
            if (!planResp.ok) continue;

            const planData = await planResp.json();
            const plans: NeedPlan[] = Array.isArray(planData) ? planData : (planData.content || []);

            // Normalize plan format
            const normalizedPlans = (plans as unknown as Record<string, unknown>[]).map((p) => {
              if (p.plan && typeof p.plan === 'object') {
                const plan = p.plan as Record<string, unknown>;
                return { id: plan.id as string, needId: need.id, name: plan.name as string, status: plan.status as string };
              }
              return { id: p.id as string, needId: need.id, name: p.name as string, status: p.status as string };
            }).filter((p) => p.id && p.status !== 'Inactive');

            // Step 4: Get deliverables for each plan
            for (const plan of normalizedPlans) {
              try {
                const delivResp = await fetch(
                  `${BASE_URL}/api/v1/serve-need/need-deliverable/${plan.id}`,
                  { headers },
                );
                if (!delivResp.ok) continue;

                const delivData = await delivResp.json();
                const deliverables: Deliverable[] = delivData.needDeliverable || delivData.content || (Array.isArray(delivData) ? delivData : []);

                for (const d of deliverables) {
                  const params = d.inputParameters || null;
                  sessions.push({
                    id: d.id,
                    date: d.deliverableDate?.split('T')[0] || '',
                    status: d.status,
                    startTime: params?.startTime,
                    endTime: params?.endTime,
                    sessionLink: params?.inputUrl,
                    needName: need.name || plan.name || '',
                    comments: d.comments,
                    numberOfAttendees: d.numberOfAttendees,
                    needPlanId: plan.id,
                  });
                }
              } catch { /* skip individual deliverable failures */ }
            }
          } catch { /* skip individual plan failures */ }
        }

        // Sort by date descending
        sessions.sort((a, b) => b.date.localeCompare(a.date));
        setAllSessions(sessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [userId]);

  // Filter by period
  const filteredSessions = useMemo(() => {
    const { start, end } = getDateRange(period);
    let result = allSessions.filter((s) => s.date >= start && s.date <= end);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.needName.toLowerCase().includes(q) ||
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
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
    return { total, planned, completed, cancelled, completionRate };
  }, [filteredSessions]);

  // Bar chart data
  const barData = useMemo(() => [
    { name: 'Planned', count: stats.planned, fill: SESSION_COLORS.Planned },
    { name: 'Completed', count: stats.completed, fill: SESSION_COLORS.Completed },
    { name: 'Cancelled', count: stats.cancelled, fill: SESSION_COLORS.Cancelled },
  ], [stats]);

  // Paginated rows
  const paginatedSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>Sessions</Typography>
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
            placeholder="Search by need name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
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
                <Typography variant="h4" fontWeight={700} color="#3B82F6">{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 28, color: SESSION_COLORS.Planned, mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color={SESSION_COLORS.Planned}>{stats.planned}</Typography>
                <Typography variant="caption" color="text.secondary">Planned</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 28, color: SESSION_COLORS.Completed, mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color={SESSION_COLORS.Completed}>{stats.completed}</Typography>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CancelIcon sx={{ fontSize: 28, color: SESSION_COLORS.Cancelled, mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color={SESSION_COLORS.Cancelled}>{stats.cancelled}</Typography>
                <Typography variant="caption" color="text.secondary">Cancelled</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="primary.main">{stats.completionRate}%</Typography>
                <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Chart */}
          <Paper sx={{ p: 2, mb: 3, height: 250 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Sessions by Status
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

          {/* Sessions Table */}
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Need</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Attendees</TableCell>
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
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {session.needName || '—'}
                          </Typography>
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
                          <Typography variant="body2">
                            {session.numberOfAttendees ?? '—'}
                          </Typography>
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
