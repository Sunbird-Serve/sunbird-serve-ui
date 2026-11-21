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
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExploreIcon from '@mui/icons-material/Explore';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAppSelector } from '@app/store';
import { useGetMyNominationsQuery } from '../api/exploreApi';
import { StatCard } from '@features/dashboard/components/StatCard';
import { getAuthHeaders } from '@shared/utils/authHeaders';
import { apiUrl } from '@shared/utils/apiUrls';
import {
  fetchPlanDeliverables,
  pickDefaultParams,
  todayLocalISO,
  type SessionDeliverable,
  type SessionParams,
} from '@features/needs/utils/sessionActions';
import { durationHours, minutesOf, resolveEntityName, resolveTimes } from '../api/assignedNeeds';
import { googleCalendarUrl } from '../utils/calendar';
import { VOLUNTEER_STATUS_INFO } from '@shared/constants/profileOptions';
import { COMMUNITY_URL, COMMUNITY_LABEL } from '@config/community';
import ForumIcon from '@mui/icons-material/Forum';

const PAGE_SIZE = 100;

// --- Types ---
interface Fulfillment {
  needId: string;
  needPlanId: string;
}

interface Assignment {
  needId: string;
  planId: string;
  needName: string;
  entityName: string;
  startDate: string;
  endDate: string;
  days: string;
  deliverables: SessionDeliverable[];
  planParams: SessionParams[];
  // Only sessions that count towards progress: Completed + Planned.
  // Cancelled, Rescheduled and Paused sessions are left out so they don't lower the rate.
  totalSessions: number;
  completedSessions: number;
  plannedSessions: number;
  hours: number;
  students: number;
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

type SessionTimes = { startTime?: string; endTime?: string };

function startsInLabel(times: SessionTimes, now: Date): string {
  const s = minutesOf(times.startTime);
  if (s == null) return '';
  const e = minutesOf(times.endTime);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < s) {
    const diff = s - nowMin;
    if (diff < 60) return `Starts in ${diff} min`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m ? `Starts in ${h}h ${m}m` : `Starts in ${h}h`;
  }
  if (e != null && nowMin <= e) return 'In progress';
  return 'Ended';
}

// Time and link for a session. A session without its own details falls back to the
// nearest planned session's details, then to the plan-level details, so the Join
// button shows whenever a link exists anywhere for the assignment.
function sessionInfo(a: Assignment, d: SessionDeliverable): SessionTimes & { url?: string } {
  const own = d.inputParameters;
  const plan = a.planParams.length ? a.planParams[a.planParams.length - 1] : undefined;
  let times = resolveTimes(own);
  if (!times.startTime) times = resolveTimes(plan);
  const url = own?.inputUrl || pickDefaultParams(a.deliverables)?.inputUrl || plan?.inputUrl;
  return { ...times, url };
}

function calendarLink(a: Assignment, d: SessionDeliverable, info: SessionTimes & { url?: string }): string {
  return googleCalendarUrl({
    title: `${a.needName} (Sunbird Serve)`,
    date: d.deliverableDate?.split('T')[0] || '',
    startTime: info.startTime,
    endTime: info.endTime,
    details: a.entityName ? `Volunteering session at ${a.entityName}` : undefined,
    location: info.url,
  });
}
// Indian academic year (Apr–Mar): starting calendar year for a given ISO date.
function academicYearOf(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

function academicYearLabel(startYear: number): string {
  return `${startYear}–${startYear + 1}`;
}

const STATUS_INFO = VOLUNTEER_STATUS_INFO;

async function readJson(resp: Response): Promise<unknown> {
  return resp.ok ? resp.json() : null;
}

// Load one assignment. Need, plan and deliverables are fetched in parallel.
async function loadAssignment(
  fulf: Fulfillment,
  headers: Record<string, string>,
): Promise<Assignment | null> {
  const [needRes, planRes, delivRes] = await Promise.allSettled([
    fetch(apiUrl(`/api/v1/serve-need/need/${fulf.needId}`), { headers }).then(readJson),
    fetch(apiUrl(`/api/v1/serve-need/need-plan/${fulf.needId}`), { headers }).then(readJson),
    fetchPlanDeliverables(fulf.needPlanId),
  ]);
  if (delivRes.status === 'rejected') throw delivRes.reason;

  let needName = '';
  let entityName = '';
  if (needRes.status === 'fulfilled' && needRes.value) {
    const raw = needRes.value as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    const need = Array.isArray(raw) ? raw[0] : raw;
    needName = need?.name || need?.need?.name || '';
    entityName = await resolveEntityName(need, headers);
  }

  let planStatus = '';
  let days = '';
  let startDate = '';
  let endDate = '';
  if (planRes.status === 'fulfilled' && planRes.value) {
    const raw = planRes.value as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    const plans: Record<string, any>[] = Array.isArray(raw) ? raw : raw.content || []; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (plans.length > 0) {
      const match =
        plans.find((p) => p?.plan?.id === fulf.needPlanId || p?.id === fulf.needPlanId) || plans[0];
      if (!needName) needName = match?.plan?.name || '';
      planStatus = match?.plan?.status || match?.status || '';
      days = match?.occurrence?.days || '';
      startDate = match?.occurrence?.startDate?.substring(0, 10) || '';
      endDate = match?.occurrence?.endDate?.substring(0, 10) || '';
    }
  }

  // Skip inactive plans (backfilled / dropped)
  if (planStatus === 'Inactive') return null;

  const deliverables = delivRes.value.deliverables;
  const completed = deliverables.filter((d) => d.status === 'Completed');
  const planned = deliverables.filter((d) => d.status === 'Planned');

  return {
    needId: fulf.needId,
    planId: fulf.needPlanId,
    needName: needName || 'Session',
    entityName,
    startDate,
    endDate,
    days,
    deliverables,
    planParams: delivRes.value.inputParams,
    totalSessions: completed.length + planned.length,
    completedSessions: completed.length,
    plannedSessions: planned.length,
    hours: completed.reduce((sum, d) => {
      const planLatest = delivRes.value.inputParams[delivRes.value.inputParams.length - 1];
      const own = d.inputParameters && resolveTimes(d.inputParameters).startTime ? d.inputParameters : planLatest;
      return sum + durationHours(own);
    }, 0),
    // Children in the class: the largest attendance recorded for this assignment
    // (the same children attend every session, so attendances are not added up).
    students: Math.max(0, ...completed.map((d) => d.numberOfAttendees ?? d.outputParameters?.numberOfAttendees ?? 0)),
  };
}

// --- Component ---
export function VolunteerHomePage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Volunteer';
  const volunteerStatus = ((user as unknown as Record<string, unknown>)?.status as string) || 'Registered';
  const statusInfo = STATUS_INFO[volunteerStatus] || { label: volunteerStatus, hint: '' };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [now, setNow] = useState(() => new Date());

  // Keep "starts in" labels fresh
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Nominations
  const { data: nominations = [] } = useGetMyNominationsQuery(userId, { skip: !userId });

  // Fetch assignments
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const headers = getAuthHeaders();
        const fulfResp = await fetch(
          apiUrl(`/api/v1/serve-fulfill/fulfillment/volunteer-read/${userId}?page=0&size=${PAGE_SIZE}`),
          { headers },
        );
        if (!fulfResp.ok) throw new Error('fulfillments');
        const fulfData = await fulfResp.json();
        const fulfs: Fulfillment[] = Array.isArray(fulfData) ? fulfData : fulfData.content || [];

        const results = await Promise.allSettled(fulfs.map((f) => loadAssignment(f, headers)));
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<Assignment | null> => r.status === 'fulfilled')
          .map((r) => r.value)
          .filter((a): a is Assignment => a !== null);
        // Some old plans may fail to load; only treat it as an error when nothing loaded at all.
        if (fulfs.length > 0 && results.every((r) => r.status === 'rejected')) {
          throw new Error('assignments');
        }
        if (!cancelled) setAssignments(loaded);
      } catch {
        if (!cancelled) setError('We could not load your sessions. Please check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  // Computed stats
  const stats = useMemo(() => {
    const totalSessions = assignments.reduce((sum, a) => sum + a.totalSessions, 0);
    const completed = assignments.reduce((sum, a) => sum + a.completedSessions, 0);
    const planned = assignments.reduce((sum, a) => sum + a.plannedSessions, 0);
    const hours = assignments.reduce((sum, a) => sum + a.hours, 0);
    const students = assignments.reduce((sum, a) => sum + a.students, 0);
    const completionRate = totalSessions > 0 ? Math.round((completed / totalSessions) * 100) : 0;
    const schools = new Set(assignments.map((a) => a.entityName).filter(Boolean)).size;
    return { totalSessions, completed, planned, hours, students, completionRate, schools, assignments: assignments.length };
  }, [assignments]);

  // Split assignments into current academic year (prominent) vs previous years,
  // with previous grouped by year (newest first).
  const { currentAssignments, previousByYear } = useMemo(() => {
    const today = new Date();
    const currentYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const academicYearStart = `${currentYear}-04-01`;

    const current: Assignment[] = [];
    const previous: Assignment[] = [];
    for (const a of assignments) {
      const end = a.endDate || '';
      if (end && end < academicYearStart) previous.push(a);
      else current.push(a);
    }

    const groups = new Map<number, Assignment[]>();
    for (const a of previous) {
      const year = academicYearOf(a.endDate || a.startDate || '');
      if (year == null) continue;
      const list = groups.get(year) || [];
      list.push(a);
      groups.set(year, list);
    }
    return {
      currentAssignments: current,
      previousByYear: Array.from(groups.entries()).sort((x, y) => y[0] - x[0]),
    };
  }, [assignments]);

  // Today's sessions (local date, not UTC)
  const todayStr = todayLocalISO();
  const todaySessions = useMemo(() => {
    const sessions: { assignment: Assignment; deliverable: SessionDeliverable }[] = [];
    for (const a of assignments) {
      for (const d of a.deliverables) {
        const date = d.deliverableDate?.split('T')[0] || '';
        if (date === todayStr && (d.status === 'Planned' || d.status === 'Completed')) {
          sessions.push({ assignment: a, deliverable: d });
        }
      }
    }
    return sessions.sort((x, y) =>
      (resolveTimes(x.deliverable.inputParameters).startTime || '').localeCompare(resolveTimes(y.deliverable.inputParameters).startTime || ''),
    );
  }, [assignments, todayStr]);

  // Upcoming sessions (next 7 days, excluding today)
  const upcomingSessions = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const mm = String(nextWeek.getMonth() + 1).padStart(2, '0');
    const dd = String(nextWeek.getDate()).padStart(2, '0');
    const nextWeekStr = `${nextWeek.getFullYear()}-${mm}-${dd}`;

    const sessions: { assignment: Assignment; deliverable: SessionDeliverable }[] = [];
    for (const a of assignments) {
      for (const d of a.deliverables) {
        const date = d.deliverableDate?.split('T')[0] || '';
        if (date > todayStr && date <= nextWeekStr && d.status === 'Planned') {
          sessions.push({ assignment: a, deliverable: d });
        }
      }
    }
    return sessions
      .sort((a, b) => a.deliverable.deliverableDate.localeCompare(b.deliverable.deliverableDate))
      .slice(0, 7);
  }, [assignments, todayStr]);

  // Nearest planned session after today, used when there is no session today
  const nextSession = useMemo(() => {
    let best: { assignment: Assignment; deliverable: SessionDeliverable } | null = null;
    for (const a of assignments) {
      for (const d of a.deliverables) {
        const date = d.deliverableDate?.split('T')[0] || '';
        if (date > todayStr && d.status === 'Planned') {
          const bestDate = best?.deliverable.deliverableDate?.split('T')[0] || '';
          if (!best || date < bestDate) best = { assignment: a, deliverable: d };
        }
      }
    }
    return best;
  }, [assignments, todayStr]);
  const isTodayFeatured = todaySessions.length > 0;
  const featuredSessions = isTodayFeatured ? todaySessions : nextSession ? [nextSession] : [];
  // The featured next session is not repeated in the upcoming list
  const upcomingRest = isTodayFeatured
    ? upcomingSessions
    : upcomingSessions.filter((s) => s.deliverable.id !== nextSession?.deliverable.id);

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

  const hoursLabel = Number.isInteger(stats.hours) ? String(stats.hours) : stats.hours.toFixed(1);

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
              {statusInfo.hint ||
                (stats.assignments > 0
                  ? `You have ${stats.planned} sessions remaining across ${stats.assignments} assignment${stats.assignments > 1 ? 's' : ''}`
                  : 'Explore needs to get started with your volunteering journey')}
            </Typography>
          </Box>
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      {/* Today's Session — Prominent CTA */}
      {featuredSessions.length > 0 && (
        <Paper sx={{ p: 2.5, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <EventIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {isTodayFeatured ? (todaySessions.length > 1 ? "Today's Sessions" : "Today's Session") : 'Next Session'}
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {featuredSessions.map(({ assignment, deliverable }) => {
              const info = sessionInfo(assignment, deliverable);
              const done = deliverable.status === 'Completed';
              const dateOnly = deliverable.deliverableDate?.split('T')[0] || '';
              const isToday = dateOnly === todayStr;
              const when = done || !isToday ? '' : startsInLabel(info, now);
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {assignment.needName}
                      </Typography>
                      {done && <Chip label="Completed" size="small" color="success" />}
                      {!isToday && <Chip label={formatDate(dateOnly)} size="small" color="primary" />}
                      {when && <Chip label={when} size="small" color={when === 'In progress' ? 'success' : 'primary'} variant="outlined" />}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
                      {assignment.entityName && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <SchoolIcon sx={{ fontSize: 16 }} color="action" />
                          <Typography variant="caption" color="text.secondary">{assignment.entityName}</Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(info.startTime)} – {formatTime(info.endTime)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                  {!done && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {info.url ? (
                        <Button
                          variant={isToday ? 'contained' : 'outlined'}
                          startIcon={<LinkIcon />}
                          href={info.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {isToday ? 'Join Now' : 'Session Link'}
                        </Button>
                      ) : (
                        <Typography variant="body2" color="warning.main" fontWeight={500}>
                          Link yet to be added
                        </Typography>
                      )}
                      <Tooltip title="Add to calendar">
                        <IconButton size="small" href={calendarLink(assignment, deliverable, info)} target="_blank" rel="noopener noreferrer" aria-label="Add to calendar">
                          <EventAvailableIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Stack>
              );
            })}
          </Stack>
          <Button size="small" sx={{ mt: 1.5 }} onClick={() => navigate('/explore/sessions')}>
            View all sessions →
          </Button>
        </Paper>
      )}

      {/* Your Impact (shown for every volunteer with an assignment, even before the first session) */}
      {assignments.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            Your Impact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<GroupsIcon />} label="Children Taught" value={stats.students} color="secondary.main" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<ScheduleIcon />} label="Volunteer Hours" value={hoursLabel} color="primary.main" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<CheckCircleIcon />} label="Sessions Completed" value={stats.completed} color="success.main" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<TrendingUpIcon />} label="Sessions Remaining" value={stats.planned} color="#0E7490" />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Community forum (each deployment sets its own link; hidden when not configured) */}
      {COMMUNITY_URL && (
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ForumIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>Join the {COMMUNITY_LABEL}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Meet other volunteers, ask questions and share what works in your sessions.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ flexShrink: 0 }}
            >
              Open {COMMUNITY_LABEL}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* No assignments state (not shown when loading failed) */}
      {!error && assignments.length === 0 && (
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

      {/* My Assignments — current academic year (prominent) */}
      {currentAssignments.length > 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={600}>My Assignments</Typography>
            <Button size="small" onClick={() => navigate('/explore/sessions')}>
              Manage Sessions →
            </Button>
          </Stack>
          <Stack spacing={2}>
            {currentAssignments.map((assignment) => (
              <AssignmentCard key={assignment.planId} assignment={assignment} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Upcoming Sessions */}
      {upcomingRest.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            Upcoming Sessions
          </Typography>
          <Paper variant="outlined">
            <Stack divider={<Divider />}>
              {upcomingRest.map(({ assignment, deliverable }) => {
                const info = sessionInfo(assignment, deliverable);
                return (
                  <Stack
                    key={deliverable.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ px: 2, py: 1.5 }}
                  >
                    <Box sx={{ minWidth: 90 }}>
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
                      {formatTime(info.startTime)} – {formatTime(info.endTime)}
                    </Typography>
                    <Tooltip title="Add to calendar">
                      <IconButton size="small" href={calendarLink(assignment, deliverable, info)} target="_blank" rel="noopener noreferrer" aria-label="Add to calendar">
                        <EventAvailableIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {info.url ? (
                      <Tooltip title="Open session link">
                        <IconButton size="small" href={info.url} target="_blank" rel="noopener noreferrer" aria-label="Open session link">
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="warning.main" sx={{ whiteSpace: 'nowrap' }}>
                        Link yet to be added
                      </Typography>
                    )}
                  </Stack>
                );
              })}
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
              <Typography variant="caption" color="text.secondary">Awaiting coordinator</Typography>
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

      {/* Previous academic years — grouped by year, de-emphasized */}
      {previousByYear.length > 0 && (
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Previous Academic Years
          </Typography>
          <Stack spacing={2.5}>
            {previousByYear.map(([year, list]) => (
              <Box key={year}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                  {academicYearLabel(year)}
                </Typography>
                <Stack spacing={2}>
                  {list.map((assignment) => (
                    <AssignmentCard key={assignment.planId} assignment={assignment} dimmed />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

// Reusable assignment card with progress. `dimmed` de-emphasizes past years.
function AssignmentCard({ assignment, dimmed = false }: { assignment: Assignment; dimmed?: boolean }) {
  const rate = assignment.totalSessions > 0
    ? (assignment.completedSessions / assignment.totalSessions) * 100
    : 0;
  return (
    <Paper variant="outlined" sx={{ p: 2, opacity: dimmed ? 0.65 : 1, transition: 'opacity 0.2s', '&:hover': dimmed ? { opacity: 1 } : undefined }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {assignment.needName}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
            {assignment.entityName && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <SchoolIcon sx={{ fontSize: 16 }} color="action" />
                <Typography variant="caption" color="text.secondary">{assignment.entityName}</Typography>
              </Stack>
            )}
            {assignment.days && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EventIcon sx={{ fontSize: 16 }} color="action" />
                <Typography variant="caption" color="text.secondary">{assignment.days}</Typography>
              </Stack>
            )}
          </Stack>
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
}
