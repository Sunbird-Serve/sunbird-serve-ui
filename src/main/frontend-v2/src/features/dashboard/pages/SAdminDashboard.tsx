import { useMemo, useState, useEffect } from 'react';
import {
  Grid,
  Stack,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppSelector } from '@app/store';
import {
  useGetAllEntitiesQuery,
  useGetAllUsersQuery,
  useGetAgenciesQuery,
  NeedItem,
} from '../api/dashboardApi';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { StatusChip } from '../components/StatusChip';
import { getAuthHeaders } from '@shared/utils/authHeaders';

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
}

interface SessionData {
  fulfillment: Fulfillment;
  deliverables: Deliverable[];
}

type TimePeriod = 'today' | 'thisWeek' | 'thisMonth' | 'allTime';

// --- Helpers ---
function getDateRange(period: TimePeriod): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  switch (period) {
    case 'today':
      return { start: today, end: today };
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

const NEED_STATUS_COLORS: Record<string, string> = {
  New: '#0369A1',
  Nominated: '#D97706',
  Approved: '#059669',
  Assigned: '#4F46E5',
  Fulfilled: '#065F46',
  Rejected: '#DC2626',
};

const SESSION_COLORS: Record<string, string> = {
  Planned: '#3B82F6',
  Completed: '#10B981',
  Cancelled: '#EF4444',
  Offline: '#F59E0B',
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

// --- Component ---
export function SAdminDashboard() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Admin';

  // Fetch global data
  const { data: allEntities = [], isLoading: entitiesLoading } = useGetAllEntitiesQuery();
  const { data: allUsers = [], isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: agencies = [], isLoading: agenciesLoading } = useGetAgenciesQuery();

  // Agency filter
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);

  // Year filter
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentAY = currentMonth >= 3 ? currentYear : currentYear - 1;
  const [selectedYear, setSelectedYear] = useState<string>(`${currentAY}-${currentAY + 1}`);
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentAY - i;
    return `${y}-${y + 1}`;
  });

  // Session time period
  const [sessionPeriod, setSessionPeriod] = useState<TimePeriod>('today');

  // Needs data
  const [allNeeds, setAllNeeds] = useState<NeedItem[]>([]);
  const [needsLoading, setNeedsLoading] = useState(true);

  useEffect(() => {
    async function fetchNeeds() {
      setNeedsLoading(true);
      try {
        const headers = getAuthHeaders();
        const statuses = ['New', 'Nominated', 'Approved', 'Rejected', 'Assigned', 'Fulfilled'];
        const results = await Promise.allSettled(
          statuses.map((status) =>
            fetch(`${BASE_URL}/api/v1/serve-need/need/?status=${status}&page=0&size=500`, { headers })
              .then((r) => (r.ok ? r.json() : null)),
          ),
        );
        const needs: NeedItem[] = [];
        for (const result of results) {
          if (result.status === 'rejected' || !result.value) continue;
          const data = result.value;
          const content = Array.isArray(data) ? data : (data.content || []);
          needs.push(...content);
        }
        setAllNeeds(needs);
      } catch { /* silent */ }
      finally { setNeedsLoading(false); }
    }
    fetchNeeds();
  }, []);

  // Session data
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!userId) return;
      setSessionsLoading(true);
      try {
        const headers = getAuthHeaders();
        // sAdmin: try admin endpoint, then fallback
        let fulfs: Fulfillment[] = [];
        const fulfResp = await fetch(
          `${BASE_URL}/api/v1/serve-fulfill/fulfillment/needadmin-read/${userId}?page=0&size=1000`,
          { headers },
        );
        if (fulfResp.ok) {
          const fulfData = await fulfResp.json();
          fulfs = Array.isArray(fulfData) ? fulfData : (fulfData?.content || []);
        }
        if (fulfs.length === 0) {
          const fallback = await fetch(
            `${BASE_URL}/api/v1/serve-fulfill/fulfillment/coordinator-read/${userId}?page=0&size=1000`,
            { headers },
          );
          if (fallback.ok) {
            const fbData = await fallback.json();
            fulfs = Array.isArray(fbData) ? fbData : (fbData?.content || []);
          }
        }

        const results: SessionData[] = [];
        for (const fulf of fulfs.slice(0, 80)) {
          try {
            const delivResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need-deliverable/${fulf.needPlanId}`,
              { headers },
            );
            if (delivResp.ok) {
              const delivData = await delivResp.json();
              const deliverables = delivData.needDeliverable || delivData.content || [];
              if (deliverables.length > 0) {
                results.push({ fulfillment: fulf, deliverables });
              }
            }
          } catch { /* skip */ }
        }
        setSessions(results);
      } catch { /* silent */ }
      finally { setSessionsLoading(false); }
    }
    fetchSessions();
  }, [userId]);

  // Derived data — volunteers
  const allVolunteers = useMemo(() => allUsers.filter((u) => u.role?.includes('Volunteer')), [allUsers]);

  // Filter volunteers by agency
  const filteredVolunteers = useMemo(() => {
    if (selectedAgencies.length === 0) return allVolunteers;
    return allVolunteers.filter((v) => selectedAgencies.includes(v.agencyId || ''));
  }, [allVolunteers, selectedAgencies]);

  // Filter needs by year
  const filteredNeeds = useMemo(() => {
    const [startYr] = selectedYear.split('-').map(Number);
    const yearStart = `${startYr}-04-01`;
    const yearEnd = `${startYr + 1}-03-31`;
    return allNeeds.filter((n) => {
      const date = n.startDate || n.createdAt || '';
      if (!date) return true;
      const d = date.split('T')[0];
      return d >= yearStart && d <= yearEnd;
    });
  }, [allNeeds, selectedYear]);

  // Needs stats
  const needStats = useMemo(() => {
    const total = filteredNeeds.length;
    const byStatus: Record<string, number> = {};
    for (const n of filteredNeeds) {
      byStatus[n.status] = (byStatus[n.status] || 0) + 1;
    }
    return { total, byStatus };
  }, [filteredNeeds]);

  // Session stats by period
  const sessionStats = useMemo(() => {
    const { start, end } = getDateRange(sessionPeriod);
    const allDeliverables = sessions.flatMap((s) => s.deliverables);
    const filtered = allDeliverables.filter((d) => {
      const date = d.deliverableDate?.split('T')[0] || '';
      return date >= start && date <= end;
    });
    const total = filtered.length;
    const planned = filtered.filter((d) => d.status === 'Planned').length;
    const completed = filtered.filter((d) => d.status === 'Completed').length;
    const cancelled = filtered.filter((d) => d.status === 'Cancelled').length;
    const offline = filtered.filter((d) => d.status === 'Offline').length;
    const cancelReasons: Record<string, number> = {};
    for (const d of filtered) {
      if (d.status === 'Cancelled' && d.comments) {
        cancelReasons[d.comments] = (cancelReasons[d.comments] || 0) + 1;
      }
    }
    return { total, planned, completed, cancelled, offline, cancelReasons };
  }, [sessions, sessionPeriod]);

  // Volunteer stats
  const volStats = useMemo(() => {
    const total = filteredVolunteers.length;
    const active = filteredVolunteers.filter((v) => v.status === 'Active').length;
    const registered = filteredVolunteers.filter((v) => v.status === 'Registered').length;
    return { total, active, registered };
  }, [filteredVolunteers]);

  // Volunteers by agency (bar chart)
  const volunteersByAgency = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of allVolunteers) {
      const agencyId = v.agencyId || 'Unassigned';
      const agency = agencies.find((a) => a.osid === agencyId);
      const name = agency?.name || (agencyId === 'Unassigned' ? 'Unassigned' : agencyId.slice(-8));
      map[name] = (map[name] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + '...' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [allVolunteers, agencies]);

  // Needs status pie
  const needsStatusData = useMemo(() => {
    return Object.entries(needStats.byStatus)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({ name: status, value: count }));
  }, [needStats.byStatus]);

  // Session bar data
  const sessionBarData = useMemo(() => [
    { name: 'Planned', count: sessionStats.planned, fill: SESSION_COLORS.Planned },
    { name: 'Completed', count: sessionStats.completed, fill: SESSION_COLORS.Completed },
    { name: 'Cancelled', count: sessionStats.cancelled, fill: SESSION_COLORS.Cancelled },
    { name: 'Offline', count: sessionStats.offline, fill: SESSION_COLORS.Offline },
  ], [sessionStats]);

  // Cancel reasons pie
  const cancelReasonsData = useMemo(() => {
    return Object.entries(sessionStats.cancelReasons)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sessionStats.cancelReasons]);

  const completionRate = sessionStats.total > 0
    ? ((sessionStats.completed / sessionStats.total) * 100).toFixed(1)
    : '0';

  return (
    <Stack spacing={3}>
      {/* Welcome */}
      <WelcomeBanner
        name={userName}
        subtitle={`${agencies.length} agencies · ${allEntities.length} entities · ${allVolunteers.length} volunteers`}
      />

      {/* Filters */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Autocomplete
            multiple
            size="small"
            options={agencies}
            getOptionLabel={(option) => option.name}
            value={agencies.filter((a) => selectedAgencies.includes(a.osid))}
            onChange={(_, value) => setSelectedAgencies(value.map((v) => v.osid))}
            renderTags={(value, getTagProps) =>
              value.slice(0, 3).map((option, index) => (
                <Chip label={option.name} size="small" {...getTagProps({ index })} key={option.osid} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Filter by Agency" placeholder="All agencies" size="small" />
            )}
            sx={{ minWidth: 300, flex: 1 }}
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
              <option key={y} value={y}>AY {y}</option>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Top Stats Row */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<CorporateFareIcon />}
            label="Agencies"
            value={agencies.length}
            color="secondary.main"
            loading={agenciesLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<BusinessIcon />}
            label="Entities"
            value={allEntities.length}
            color="#0E7490"
            loading={entitiesLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<PeopleIcon />}
            label="Volunteers"
            value={volStats.total}
            color="primary.main"
            loading={usersLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<AssignmentIcon />}
            label="Total Needs"
            value={needStats.total}
            color="info.main"
            loading={needsLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Fulfilled"
            value={needStats.byStatus['Fulfilled'] || 0}
            color="success.main"
            loading={needsLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon={<CalendarMonthIcon />}
            label="Sessions"
            value={sessionStats.total}
            color="warning.main"
            loading={sessionsLoading}
          />
        </Grid>
      </Grid>

      <Divider />

      {/* Sessions Section */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Session Status</Typography>
          <ToggleButtonGroup
            value={sessionPeriod}
            exclusive
            onChange={(_, v) => v && setSessionPeriod(v)}
            size="small"
          >
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="thisWeek">Week</ToggleButton>
            <ToggleButton value="thisMonth">Month</ToggleButton>
            <ToggleButton value="allTime">All Time</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {sessionsLoading ? (
          <Skeleton variant="rounded" height={120} />
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <EventAvailableIcon sx={{ fontSize: 28, color: '#3B82F6', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#3B82F6">{sessionStats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 28, color: '#10B981', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#10B981">{sessionStats.completed}</Typography>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CancelIcon sx={{ fontSize: 28, color: '#EF4444', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#EF4444">{sessionStats.cancelled}</Typography>
                <Typography variant="caption" color="text.secondary">Cancelled</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 28, color: '#0E7490', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#0E7490">{completionRate}%</Typography>
                <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
              </Paper>
            </Grid>

            {/* Session bar chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Sessions by Status</Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={sessionBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {sessionBarData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Cancellation reasons */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Cancellation Reasons</Typography>
                {cancelReasonsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={cancelReasonsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {cancelReasonsData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                    <Typography variant="body2" color="text.secondary">No cancellations</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      <Divider />

      {/* Needs + Volunteers Section */}
      <Grid container spacing={2.5}>
        {/* Needs by status */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Needs by Status</Typography>
            {needsStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={needsStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {needsStatusData.map((entry, index) => (
                      <Cell key={index} fill={NEED_STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body2" color="text.secondary">No needs data</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Volunteers by agency */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Volunteers by Agency</Typography>
            {volunteersByAgency.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={volunteersByAgency} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={140} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
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

      <Divider />

      {/* Recent Needs Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Recent Needs</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {needsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3].map((j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                ))
              ) : filteredNeeds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No needs</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNeeds.slice(0, 10).map((need) => (
                  <TableRow key={need.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 250 }}>
                        {need.name || `Need #${need.id?.slice(-6)}`}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusChip status={need.status} /></TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {need.createdAt?.split('T')[0] || need.startDate?.split('T')[0] || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
