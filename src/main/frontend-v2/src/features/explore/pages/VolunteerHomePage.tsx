import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  Button,
  Chip,
  Skeleton,
  LinearProgress,
  Divider,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExploreIcon from '@mui/icons-material/Explore';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useAppSelector } from '@app/store';
import { useGetMyNominationsQuery } from '../api/exploreApi';
import { StatCard } from '@features/dashboard/components/StatCard';
import { getAuthHeaders } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

// --- Types ---
interface Deliverable {
  id: string;
  deliverableDate: string;
  status: string;
  comments?: string;
  inputParameters?: {
    startTime?: string;
    endTime?: string;
    inputUrl?: string;
    softwarePlatform?: string;
  };
}

interface InputParameter {
  startTime?: string;
  endTime?: string;
  inputUrl?: string;
}

interface Assignment {
  needId: string;
  planId: string;
  needName: string;
  entityName: string;
  startDate: string;
  endDate: string;
  days: string;
  deliverables: Deliverable[];
  inputParams: InputParameter[];
  totalSessions: number;
  completedSessions: number;
  plannedSessions: number;
}

// --- Helpers ---
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
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// --- Component ---
export function VolunteerHomePage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Volunteer';
  const volunteerStatus = (user as unknown as Record<string, unknown>)?.status as string || 'Registered';

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Nominations
  const { data: nominations = [] } = useGetMyNominationsQuery(userId, { skip: !userId });

  // Fetch assignments
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        const fulfResp = await fetch(
          `${BASE_URL}/api/v1/serve-fulfill/fulfillment/volunteer-read/${userId}?page=0&size=20`,
          { headers },
        );
        if (!fulfResp.ok) { setLoading(false); return; }
        const fulfData = await fulfResp.json();
        const fulfs = Array.isArray(fulfData) ? fulfData : (fulfData.content || []);

        const results: Assignment[] = [];
        for (const fulf of fulfs) {
          try {
            // Get need name + entity
            let needName = '';
            let entityName = '';
            let days = '';
            let startDate = '';
            let endDate = '';

            try {
              const needResp = await fetch(`${BASE_URL}/api/v1/serve-need/need/${fulf.needId}`, { headers });
              if (needResp.ok) {
                const needData = await needResp.json();
                const need = Array.isArray(needData) ? needData[0] : needData;
                needName = need?.name || need?.need?.name || '';
                entityName = need?.entity?.name || '';
              }
            } catch { /* skip */ }

            // Get need plan for schedule
            try {
              const planResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${fulf.needId}`, { headers });
              if (planResp.ok) {
                const planData = await planResp.json();
                const plans = Array.isArray(planData) ? planData : (planData.content || []);
                if (plans.length > 0) {
                  if (!needName) needName = plans[0]?.plan?.name || '';
                  days = plans[0]?.occurrence?.days || '';
                  startDate = plans[0]?.occurrence?.startDate?.substring(0, 10) || '';
                  endDate = plans[0]?.occurrence?.endDate?.substring(0, 10) || '';
                }
              }
            } catch { /* skip */ }

            // Get deliverables
            const delivResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need-deliverable/${fulf.needPlanId}`,
              { headers },
            );
            if (delivResp.ok) {
              const delivData = await delivResp.json();
              const deliverables: Deliverable[] = delivData.needDeliverable || [];
              const inputParams: InputParameter[] = delivData.inputParameters || [];

              const totalSessions = deliverables.length;
              const completedSessions = deliverables.filter((d) => d.status === 'Completed').length;
              const plannedSessions = deliverables.filter((d) => d.status === 'Planned').length;

              results.push({
                needId: fulf.needId,
                planId: fulf.needPlanId,
                needName: needName || 'Session',
                entityName,
                startDate,
                endDate,
                days,
                deliverables,
                inputParams,
                totalSessions,
                completedSessions,
                plannedSessions,
              });
            }
          } catch { /* skip */ }
        }
        setAssignments(results);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchData();
  }, [userId]);

  // Computed stats
  const stats = useMemo(() => {
    const totalSessions = assignments.reduce((sum, a) => sum + a.totalSessions, 0);
    const completed = assignments.reduce((sum, a) => sum + a.completedSessions, 0);
    const planned = assignments.reduce((sum, a) => sum + a.plannedSessions, 0);
    const completionRate = totalSessions > 0 ? ((completed / totalSessions) * 100).toFixed(0) : '0';
    const schools = new Set(assignments.map((a) => a.entityName).filter(Boolean)).size;
    return { totalSessions, completed, planned, completionRate, schools, assignments: assignments.length };
  }, [assignments]);

  // Today's sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = useMemo(() => {
    const sessions: { assignment: Assignment; deliverable: Deliverable }[] = [];
    for (const a of assignments) {
      for (const d of a.deliverables) {
        if (d.deliverableDate?.startsWith(todayStr) && d.status === 'Planned') {
          sessions.push({ assignment: a, deliverable: d });
        }
      }
    }
    return sessions;
  }, [assignments, todayStr]);

  // Upcoming sessions (next 7 days, excluding today)
  const upcomingSessions = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const sessions: { assignment: Assignment; deliverable: Deliverable }[] = [];
    for (const a of assignments) {
      for (const d of a.deliverables) {
        const date = d.deliverableDate?.split('T')[0] || '';
        if (date > todayStr && date <= nextWeekStr && d.status === 'Planned') {
          sessions.push({ assignment: a, deliverable: d });
        }
      }
    }
    return sessions.sort((a, b) =>
      a.deliverable.deliverableDate.localeCompare(b.deliverable.deliverableDate),
    ).slice(0, 7);
  }, [assignments, todayStr]);

  // Nominations summary
  const nomStats = useMemo(() => {
    const approved = nominations.filter((n) => n.nominationStatus === 'Approved').length;
    const waiting = nominations.filter((n) => n.nominationStatus === 'Nominated').length;
    const rejected = nominations.filter((n) => n.nominationStatus === 'Rejected').length;
    return { approved, waiting, rejected, total: nominations.length };
  }, [nominations]);

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={80} variant="rounded" />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => <Grid item xs={6} sm={3} key={i}><Skeleton height={90} variant="rounded" /></Grid>)}
        </Grid>
        <Skeleton height={150} variant="rounded" />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Welcome Header */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 100%)',
          color: 'white',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Welcome back, {userName}!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              {stats.assignments > 0
                ? `You have ${stats.planned} sessions remaining across ${stats.assignments} assignments`
                : 'Explore needs to get started with your volunteering journey'}
            </Typography>
          </Box>
          <Chip
            label={volunteerStatus}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {/* Impact Stats */}
      {stats.totalSessions > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<CalendarTodayIcon />}
              label="Total Sessions"
              value={stats.totalSessions}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<CheckCircleIcon />}
              label="Completed"
              value={stats.completed}
              color="success.main"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<TrendingUpIcon />}
              label="Completion Rate"
              value={`${stats.completionRate}%`}
              color="#0E7490"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<SchoolIcon />}
              label="Schools"
              value={stats.schools}
              color="secondary.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Today's Session — Prominent CTA */}
      {todaySessions.length > 0 && (
        <Paper sx={{ p: 2.5, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            📅 Today&apos;s Session{todaySessions.length > 1 ? 's' : ''}
          </Typography>
          <Stack spacing={1.5}>
            {todaySessions.map(({ assignment, deliverable }) => {
              const params = deliverable.inputParameters || null;
              return (
                <Stack
                  key={deliverable.id}
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'center' }}
                  spacing={1}
                  sx={{ p: 1.5, bgcolor: 'rgba(14,116,144,0.04)', borderRadius: 1 }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {assignment.needName}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      {assignment.entityName && (
                        <Typography variant="caption" color="text.secondary">
                          🏫 {assignment.entityName}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        🕐 {formatTime(params?.startTime)} – {formatTime(params?.endTime)}
                      </Typography>
                    </Stack>
                  </Box>
                  {params?.inputUrl && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LinkIcon />}
                      href={params.inputUrl}
                      target="_blank"
                    >
                      Join Session
                    </Button>
                  )}
                </Stack>
              );
            })}
          </Stack>
          <Button
            size="small"
            sx={{ mt: 1.5 }}
            onClick={() => navigate('/explore/sessions')}
          >
            View all sessions →
          </Button>
        </Paper>
      )}

      {/* No assignments state */}
      {assignments.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ExploreIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Start Your Journey
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You don&apos;t have any assignments yet. Explore available needs and express your interest.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/explore/needs')}>
            Explore Needs
          </Button>
        </Paper>
      )}

      {/* My Assignments */}
      {assignments.length > 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={600}>My Assignments</Typography>
            <Button size="small" onClick={() => navigate('/explore/sessions')}>
              Manage Sessions →
            </Button>
          </Stack>
          <Stack spacing={2}>
            {assignments.map((assignment) => {
              const rate = assignment.totalSessions > 0
                ? (assignment.completedSessions / assignment.totalSessions) * 100
                : 0;
              return (
                <Paper key={assignment.planId} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {assignment.needName}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        {assignment.entityName && (
                          <Typography variant="caption" color="text.secondary">
                            🏫 {assignment.entityName}
                          </Typography>
                        )}
                        {assignment.days && (
                          <Typography variant="caption" color="text.secondary">
                            📅 {assignment.days}
                          </Typography>
                        )}
                      </Stack>
                      {/* Progress */}
                      <Box sx={{ mt: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {assignment.completedSessions}/{assignment.totalSessions} sessions
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>{rate.toFixed(0)}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={rate}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#F1F5F9',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: rate > 70 ? '#10B981' : rate > 40 ? '#F59E0B' : '#3B82F6',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                    <Stack alignItems="center" justifyContent="center" sx={{ minWidth: 70 }}>
                      <Typography variant="h5" fontWeight={700} color="info.main">
                        {assignment.plannedSessions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">remaining</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            Upcoming Sessions
          </Typography>
          <Paper variant="outlined">
            <Stack divider={<Divider />}>
              {upcomingSessions.map(({ assignment, deliverable }) => (
                <Stack
                  key={deliverable.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ px: 2, py: 1.5 }}
                >
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(deliverable.deliverableDate?.split('T')[0] || '')}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{assignment.needName}</Typography>
                    {assignment.entityName && (
                      <Typography variant="caption" color="text.secondary">{assignment.entityName}</Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(deliverable.inputParameters?.startTime)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Nominations Status */}
      {nomStats.total > 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={600}>Nominations</Typography>
            <Button size="small" onClick={() => navigate('/explore/nominations')}>
              View all →
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ color: 'success.main', mb: 0.5 }} />
              <Typography variant="h5" fontWeight={700} color="success.main">{nomStats.approved}</Typography>
              <Typography variant="caption" color="text.secondary">Approved</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
              <HourglassEmptyIcon sx={{ color: 'warning.main', mb: 0.5 }} />
              <Typography variant="h5" fontWeight={700} color="warning.main">{nomStats.waiting}</Typography>
              <Typography variant="caption" color="text.secondary">Waiting</Typography>
            </Paper>
            {nomStats.rejected > 0 && (
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="error.main">{nomStats.rejected}</Typography>
                <Typography variant="caption" color="text.secondary">Not Selected</Typography>
              </Paper>
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
