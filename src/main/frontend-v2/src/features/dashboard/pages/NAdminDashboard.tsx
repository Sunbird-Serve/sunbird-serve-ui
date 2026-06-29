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
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
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
  useGetNeedsByUserIdQuery,
  useGetEntitiesByUserQuery,
  useGetAllEntitiesQuery,
  useGetNeedsByEntitiesMutation,
  NeedItem,
} from '../api/dashboardApi';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { StatusChip } from '../components/StatusChip';

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
  needName?: string;
  entityName?: string;
}

type TimePeriod = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'allTime';

// --- Helpers ---
function getDateRange(period: TimePeriod): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (period) {
    case 'today':
      return { start: today, end: today };
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      return { start: yStr, end: yStr };
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

const STATUS_COLORS: Record<string, string> = {
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

const PIE_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

// --- Component ---
export function NAdminDashboard() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Admin';
  const isSAdmin = user?.role?.includes('sAdmin');

  // Entity data
  const { data: userEntities = [] } = useGetEntitiesByUserQuery(userId, {
    skip: !userId || !!isSAdmin,
  });
  const { data: allEntities = [] } = useGetAllEntitiesQuery(undefined, {
    skip: !isSAdmin,
  });
  const entities = isSAdmin ? allEntities : userEntities;

  // Entity filter
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  useEffect(() => {
    if (entities.length > 0 && selectedEntities.length === 0) {
      setSelectedEntities(entities.map((e) => e.id));
    }
  }, [entities, selectedEntities.length]);

  // Year filter
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  // Academic year: April to March
  const currentAY = currentMonth >= 3 ? currentYear : currentYear - 1;
  const [selectedYear, setSelectedYear] = useState<string>(`${currentAY}-${currentAY + 1}`);
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentAY - i;
    return `${y}-${y + 1}`;
  });

  // Needs data
  const { data: allNeeds = [], isLoading: needsLoading } = useGetNeedsByUserIdQuery(userId, {
    skip: !userId,
  });
  const [fetchEntityNeeds, { data: entityNeeds, isLoading: entityNeedsLoading }] =
    useGetNeedsByEntitiesMutation();

  useEffect(() => {
    if (selectedEntities.length > 0) {
      fetchEntityNeeds(selectedEntities);
    }
  }, [selectedEntities, fetchEntityNeeds]);

  const needs: NeedItem[] = entityNeeds || allNeeds;
  const needsLoaded = !needsLoading && !entityNeedsLoading;

  // Filter needs by year
  const filteredNeeds = useMemo(() => {
    let result = needs;
    if (selectedEntities.length > 0) {
      result = result.filter((n) => selectedEntities.includes(n.entityId || ''));
    }
    // Filter by academic year (April start to March end)
    const [startYr] = selectedYear.split('-').map(Number);
    const yearStart = `${startYr}-04-01`;
    const yearEnd = `${startYr + 1}-03-31`;
    result = result.filter((n) => {
      const date = n.startDate || n.createdAt || '';
      if (!date) return true; // include if no date
      const d = date.split('T')[0];
      return d >= yearStart && d <= yearEnd;
    });
    return result;
  }, [needs, selectedEntities, selectedYear]);

  // Needs stats
  const needStats = useMemo(() => {
    const total = filteredNeeds.length;
    const byStatus: Record<string, number> = {};
    for (const n of filteredNeeds) {
      byStatus[n.status] = (byStatus[n.status] || 0) + 1;
    }
    return { total, byStatus };
  }, [filteredNeeds]);

  // Session data
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [sessionPeriod, setSessionPeriod] = useState<TimePeriod>('today');

  useEffect(() => {
    async function fetchSessions() {
      if (!userId) return;
      setSessionsLoading(true);
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const headers = getAuthHeaders();

        // Get assigned needs, then fetch fulfillments per need
        const needsResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/need/?status=Assigned&page=0&size=200`,
          { headers },
        );
        let assignedNeeds: { id: string }[] = [];
        if (needsResp.ok) {
          const needsData = await needsResp.json();
          const content = Array.isArray(needsData) ? needsData : (needsData.content || []);
          assignedNeeds = content.map((n: Record<string, unknown>) => ({
            id: (n.id as string) || ((n.need as Record<string, unknown>)?.id as string) || '',
          })).filter((n: { id: string }) => n.id);
        }

        // Fetch fulfillments per need via /fulfillment/need-read/{needId}
        let fulfs: { needId: string; needPlanId: string; assignedUserId: string }[] = [];
        for (const need of assignedNeeds.slice(0, 30)) {
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
          } catch { /* skip */ }
        }

        // Fallback: try coordinator-read
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

        const sessionResults: SessionData[] = [];
        for (const fulf of fulfs.slice(0, 50)) {
          try {
            const delivResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need-deliverable/${fulf.needPlanId}`,
              { headers },
            );
            if (delivResp.ok) {
              const delivData = await delivResp.json();
              const deliverables = delivData.needDeliverable || delivData.content || [];
              if (deliverables.length > 0) {
                sessionResults.push({
                  fulfillment: fulf,
                  deliverables: Array.isArray(deliverables) ? deliverables : [],
                });
              }
            }
          } catch {
            // skip
          }
        }
        setSessions(sessionResults);
      } catch {
        // silent
      } finally {
        setSessionsLoading(false);
      }
    }
    fetchSessions();
  }, [userId]);

  // Filter deliverables by period
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

    // Cancellation reasons
    const cancelReasons: Record<string, number> = {};
    for (const d of filtered) {
      if (d.status === 'Cancelled' && d.comments) {
        cancelReasons[d.comments] = (cancelReasons[d.comments] || 0) + 1;
      }
    }

    return { total, planned, completed, cancelled, offline, cancelReasons, deliverables: filtered };
  }, [sessions, sessionPeriod]);

  // Needs by entity (for bar chart)
  const needsByEntity = useMemo(() => {
    const map: Record<string, number> = {};
    for (const n of filteredNeeds) {
      const entityId = n.entityId || 'Unknown';
      const entity = entities.find((e) => e.id === entityId);
      const name = entity?.name || entityId.slice(-8);
      map[name] = (map[name] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredNeeds, entities]);

  // Needs status for pie chart
  const needsStatusData = useMemo(() => {
    return Object.entries(needStats.byStatus)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({ name: status, value: count }));
  }, [needStats.byStatus]);

  // Session status bar chart data
  const sessionBarData = useMemo(() => {
    return [
      { name: 'Planned', count: sessionStats.planned, fill: SESSION_COLORS.Planned },
      { name: 'Completed', count: sessionStats.completed, fill: SESSION_COLORS.Completed },
      { name: 'Cancelled', count: sessionStats.cancelled, fill: SESSION_COLORS.Cancelled },
      { name: 'Offline', count: sessionStats.offline, fill: SESSION_COLORS.Offline },
    ];
  }, [sessionStats]);

  // Cancellation reasons for pie chart
  const cancelReasonsData = useMemo(() => {
    return Object.entries(sessionStats.cancelReasons)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sessionStats.cancelReasons]);

  const completionRate =
    sessionStats.total > 0
      ? ((sessionStats.completed / sessionStats.total) * 100).toFixed(1)
      : '0';

  return (
    <Stack spacing={3}>
      {/* Welcome Banner */}
      <WelcomeBanner
        name={userName}
        subtitle={`Managing ${entities.length} entities · AY ${selectedYear}`}
      />

      {/* Filters Row */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
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
              <TextField {...params} label="Filter by Entity" placeholder="Select entities" size="small" />
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
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<BusinessIcon />}
            label="Active Entities"
            value={entities.length}
            color="secondary.main"
            loading={false}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<AssignmentIcon />}
            label="Total Needs"
            value={needStats.total}
            color="primary.main"
            loading={!needsLoaded}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<PlayCircleIcon />}
            label="In Progress"
            value={needStats.byStatus['Assigned'] || 0}
            color="info.main"
            loading={!needsLoaded}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<ThumbUpIcon />}
            label="Fulfilled"
            value={needStats.byStatus['Fulfilled'] || 0}
            color="success.main"
            loading={!needsLoaded}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            icon={<CalendarMonthIcon />}
            label="Total Sessions"
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
          <Typography variant="h6" fontWeight={600}>
            Session Status
          </Typography>
          <ToggleButtonGroup
            value={sessionPeriod}
            exclusive
            onChange={(_, v) => v && setSessionPeriod(v)}
            size="small"
          >
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="yesterday">Yesterday</ToggleButton>
            <ToggleButton value="thisWeek">This Week</ToggleButton>
            <ToggleButton value="thisMonth">This Month</ToggleButton>
            <ToggleButton value="allTime">All Time</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {sessionsLoading ? (
          <Stack direction="row" spacing={2}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" width="25%" height={100} />)}
          </Stack>
        ) : (
          <Grid container spacing={2}>
            {/* Session stat cards */}
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <EventAvailableIcon sx={{ fontSize: 32, color: '#3B82F6', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#3B82F6">
                  {sessionStats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">Total Sessions</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#10B981">
                  {sessionStats.completed}
                </Typography>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CancelIcon sx={{ fontSize: 32, color: '#EF4444', mb: 0.5 }} />
                <Typography variant="h4" fontWeight={700} color="#EF4444">
                  {sessionStats.cancelled}
                </Typography>
                <Typography variant="caption" color="text.secondary">Cancelled</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
                <Typography variant="overline" color="text.secondary">Completion Rate</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {completionRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sessionStats.planned} remaining
                </Typography>
              </Paper>
            </Grid>

            {/* Session bar chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Sessions by Status
                </Typography>
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

            {/* Cancellation reasons donut */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Cancellation Reasons
                </Typography>
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
                    <Typography variant="body2" color="text.secondary">
                      No cancellations in this period
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      <Divider />

      {/* Needs Section */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Needs Overview
        </Typography>
        <Grid container spacing={2}>
          {/* Needs by status donut */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Needs by Status
              </Typography>
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
                        <Cell key={index} fill={STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
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

          {/* Needs by entity bar chart */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Needs by Entity
              </Typography>
              {needsByEntity.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={needsByEntity} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="name" fontSize={11} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0E7490" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                  <Typography variant="body2" color="text.secondary">No data to display</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Recent Needs Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
          Recent Needs
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!needsLoaded ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4].map((j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredNeeds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No needs found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNeeds.slice(0, 10).map((need) => {
                  const entity = entities.find((e) => e.id === need.entityId);
                  return (
                    <TableRow key={need.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                          {need.name || `Need #${need.id?.slice(-6)}`}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusChip status={need.status} /></TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {entity?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {need.createdAt?.split('T')[0] || need.startDate?.split('T')[0] || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
