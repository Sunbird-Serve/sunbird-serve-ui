import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  Chip,
  Skeleton,
  Button,
  Divider,
  Alert,
  TextField,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimelineIcon from '@mui/icons-material/Timeline';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { StatCard } from '@features/dashboard/components/StatCard';
import { useAppSelector } from '@app/store';
import {
  useGetAllVolunteersQuery,
  useGetAgenciesQuery,
  useUpdateVolunteerStatusMutation,
  useAssignAgencyMutation,
  VolunteerUser,
} from '../api/volunteersApi';
import { getAuthHeaders } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;
const STATUS_OPTIONS = ['Registered', 'Recommended', 'OnHold', 'Active'];

// --- Types ---
interface Assignment {
  needId: string;
  needPlanId: string;
  needName: string;
  entityName: string;
  entityDistrict: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  plannedSessions: number;
}

interface SessionRecord {
  id: string;
  date: string;
  status: string;
  comments?: string;
  needName: string;
}

// --- Component ---
export function VolunteerJourneyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const role = Array.isArray(user?.role) ? user?.role[0] : user?.role;
  const isAdmin = role === 'vAdmin' || role === 'sAdmin';

  const { data: allUsers = [], isLoading: usersLoading } = useGetAllVolunteersQuery();
  const { data: agencies = [] } = useGetAgenciesQuery();
  const [updateStatus, { isLoading: statusSaving }] = useUpdateVolunteerStatusMutation();
  const [assignAgency, { isLoading: agencySaving }] = useAssignAgencyMutation();

  // Find the volunteer
  const volunteer: VolunteerUser | undefined = useMemo(
    () => allUsers.find((u) => u.osid === id),
    [allUsers, id],
  );

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [newAgencyId, setNewAgencyId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Set initial status when volunteer loads
  useEffect(() => {
    if (volunteer) {
      setNewStatus(volunteer.status || '');
      setNewAgencyId(volunteer.agencyId || '');
    }
  }, [volunteer]);

  // Fetch volunteer's journey data
  useEffect(() => {
    async function fetchJourney() {
      if (!id) return;
      setLoadingJourney(true);
      try {
        const headers = getAuthHeaders();

        // Get fulfillments (assignments)
        const fulfResp = await fetch(
          `${BASE_URL}/api/v1/serve-fulfill/fulfillment/volunteer-read/${id}?page=0&size=100`,
          { headers },
        );
        let fulfs: { needId: string; needPlanId: string }[] = [];
        if (fulfResp.ok) {
          const fulfData = await fulfResp.json();
          fulfs = Array.isArray(fulfData) ? fulfData : (fulfData.content || []);
        }

        const assignmentResults: Assignment[] = [];
        const sessionResults: SessionRecord[] = [];

        for (const fulf of fulfs) {
          let needName = '';
          let entityName = '';
          let entityDistrict = '';
          let startDate = '';
          let endDate = '';

          // Get need info
          try {
            const needResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need/${fulf.needId}`,
              { headers },
            );
            if (needResp.ok) {
              const needData = await needResp.json();
              const need = Array.isArray(needData) ? needData[0] : needData;
              needName = need?.name || need?.need?.name || '';
              const entityId = need?.entityId || need?.need?.entityId || '';

              if (entityId) {
                try {
                  const entityResp = await fetch(
                    `${BASE_URL}/api/v1/serve-need/entity/${entityId}`,
                    { headers },
                  );
                  if (entityResp.ok) {
                    const entityData = await entityResp.json();
                    const entity = Array.isArray(entityData) ? entityData[0] : entityData;
                    entityName = entity?.name || '';
                    entityDistrict = entity?.district || '';
                  }
                } catch { /* skip */ }
              }
            }
          } catch { /* skip */ }

          // Get deliverables (sessions)
          let totalSessions = 0;
          let completedSessions = 0;
          let cancelledSessions = 0;
          let plannedSessions = 0;

          try {
            const delivResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need-deliverable/${fulf.needPlanId}`,
              { headers },
            );
            if (delivResp.ok) {
              const delivData = await delivResp.json();
              const deliverables = delivData.needDeliverable || delivData.content || [];
              const plans = Array.isArray(deliverables) ? deliverables : [];

              totalSessions = plans.length;
              completedSessions = plans.filter((d: { status: string }) => d.status === 'Completed').length;
              cancelledSessions = plans.filter((d: { status: string }) => d.status === 'Cancelled').length;
              plannedSessions = plans.filter((d: { status: string }) => d.status === 'Planned').length;

              // Get dates from deliverables
              if (plans.length > 0) {
                const dates = plans
                  .map((d: { deliverableDate: string }) => d.deliverableDate?.split('T')[0])
                  .filter(Boolean)
                  .sort();
                if (dates.length > 0) {
                  startDate = dates[0];
                  endDate = dates[dates.length - 1];
                }
              }

              // Collect recent sessions
              for (const d of plans.slice(-20)) {
                sessionResults.push({
                  id: d.id,
                  date: d.deliverableDate?.split('T')[0] || '',
                  status: d.status,
                  comments: d.comments,
                  needName: needName || `Need ${fulf.needId.slice(-6)}`,
                });
              }
            }
          } catch { /* skip */ }

          assignmentResults.push({
            needId: fulf.needId,
            needPlanId: fulf.needPlanId,
            needName: needName || `Need ${fulf.needId.slice(-6)}`,
            entityName,
            entityDistrict,
            startDate,
            endDate,
            totalSessions,
            completedSessions,
            cancelledSessions,
            plannedSessions,
          });
        }

        setAssignments(assignmentResults);
        setRecentSessions(sessionResults.sort((a, b) => b.date.localeCompare(a.date)));
      } catch { /* silent */ }
      finally { setLoadingJourney(false); }
    }
    fetchJourney();
  }, [id]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalSessions = assignments.reduce((sum, a) => sum + a.totalSessions, 0);
    const completed = assignments.reduce((sum, a) => sum + a.completedSessions, 0);
    const cancelled = assignments.reduce((sum, a) => sum + a.cancelledSessions, 0);
    const planned = assignments.reduce((sum, a) => sum + a.plannedSessions, 0);
    const completionRate = totalSessions > 0 ? ((completed / totalSessions) * 100).toFixed(1) : '0';
    return { totalSessions, completed, cancelled, planned, completionRate, assignments: assignments.length };
  }, [assignments]);

  // Handlers
  const handleStatusSave = async () => {
    if (!volunteer || !newStatus || newStatus === volunteer.status) return;
    setError('');
    try {
      await updateStatus({ userId: volunteer.osid, status: newStatus }).unwrap();
      setSuccess('Status updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update status.'); }
  };

  const handleAgencySave = async () => {
    if (!volunteer || !newAgencyId) return;
    setError('');
    try {
      await assignAgency({ userId: volunteer.osid, agencyId: newAgencyId }).unwrap();
      setSuccess('Agency assigned.');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to assign agency.'); }
  };

  // Loading state
  if (usersLoading) {
    return (
      <Box>
        <Skeleton height={60} />
        <Skeleton height={200} variant="rounded" sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!volunteer) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/volunteers')}>
          Back to Volunteers
        </Button>
        <Typography variant="h6" sx={{ mt: 3 }}>Volunteer not found</Typography>
      </Box>
    );
  }

  const name = volunteer.identityDetails?.fullname || volunteer.identityDetails?.name || '—';
  const email = volunteer.contactDetails?.email || '';
  const phone = volunteer.contactDetails?.mobile || '';
  const city = volunteer.contactDetails?.address?.city || '';
  const state = volunteer.contactDetails?.address?.state || '';
  const agency = agencies.find((a) => a.osid === volunteer.agencyId);

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/app/volunteers')}
        sx={{ mb: 2 }}
      >
        Back to Volunteers
      </Button>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight={700}>{name}</Typography>
              <StatusChip status={volunteer.status || 'Registered'} />
              {agency && <Chip label={agency.name} size="small" variant="outlined" />}
            </Stack>
            <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mt: 1 }}>
              {email && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{email}</Typography>
                </Stack>
              )}
              {phone && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{phone}</Typography>
                </Stack>
              )}
              {(city || state) && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {[city, state].filter(Boolean).join(', ')}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Quick Actions */}
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              select
              size="small"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{ minWidth: 140 }}
              label="Status"
              InputLabelProps={{ shrink: true }}
            >
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <Button
              variant="contained"
              size="small"
              onClick={handleStatusSave}
              disabled={statusSaving || newStatus === volunteer.status}
            >
              {statusSaving ? 'Saving...' : 'Update'}
            </Button>
            {isAdmin && (
              <>
                <TextField
                  select
                  size="small"
                  value={newAgencyId}
                  onChange={(e) => setNewAgencyId(e.target.value)}
                  sx={{ minWidth: 160 }}
                  label="Agency"
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {agencies.map((a) => <MenuItem key={a.osid} value={a.osid}>{a.name}</MenuItem>)}
                </TextField>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAgencySave}
                  disabled={agencySaving || !newAgencyId}
                >
                  {agencySaving ? '...' : 'Assign'}
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Stats Cards */}
      {loadingJourney ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={6} sm={4} md={2.4} key={i}>
              <Skeleton variant="rounded" height={90} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<AssignmentIcon />}
              label="Assignments"
              value={stats.assignments}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<CalendarTodayIcon />}
              label="Total Sessions"
              value={stats.totalSessions}
              color="info.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<CheckCircleIcon />}
              label="Completed"
              value={stats.completed}
              color="success.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<CancelIcon />}
              label="Cancelled"
              value={stats.cancelled}
              color="error.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<TimelineIcon />}
              label="Completion Rate"
              value={`${stats.completionRate}%`}
              color="#0E7490"
            />
          </Grid>
        </Grid>
      )}

      {/* Assignments Section */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Assignments
      </Typography>
      {loadingJourney ? (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      ) : assignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No assignments found for this volunteer.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {assignments.map((assignment) => {
            const rate = assignment.totalSessions > 0
              ? (assignment.completedSessions / assignment.totalSessions) * 100
              : 0;
            return (
              <Paper key={assignment.needPlanId} variant="outlined" sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {assignment.needName}
                    </Typography>
                    {assignment.entityName && (
                      <Typography variant="body2" color="text.secondary">
                        🏫 {assignment.entityName}
                        {assignment.entityDistrict ? ` · ${assignment.entityDistrict}` : ''}
                      </Typography>
                    )}
                    {assignment.startDate && (
                      <Typography variant="caption" color="text.secondary">
                        📅 {assignment.startDate} to {assignment.endDate}
                      </Typography>
                    )}

                    {/* Progress bar */}
                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress: {assignment.completedSessions}/{assignment.totalSessions} sessions
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {rate.toFixed(0)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={rate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#F1F5F9',
                          '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: rate > 70 ? '#10B981' : rate > 40 ? '#F59E0B' : '#EF4444' },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Session counts */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        {assignment.completedSessions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Done</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} color="error.main">
                        {assignment.cancelledSessions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Cancelled</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} color="info.main">
                        {assignment.plannedSessions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Remaining</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Recent Sessions */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Recent Sessions
      </Typography>
      {loadingJourney ? (
        <Skeleton variant="rounded" height={200} />
      ) : recentSessions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No session history available.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <Stack divider={<Divider />}>
            {recentSessions.slice(0, 20).map((session) => (
              <Stack
                key={session.id}
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ px: 2, py: 1.5 }}
              >
                <Box sx={{ minWidth: 90 }}>
                  <Typography variant="body2" fontWeight={500}>{session.date}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" noWrap>{session.needName}</Typography>
                </Box>
                <StatusChip status={session.status} />
                {session.comments && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                    {session.comments}
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
