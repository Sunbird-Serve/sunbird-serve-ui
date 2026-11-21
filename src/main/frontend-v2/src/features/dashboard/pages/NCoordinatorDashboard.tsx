import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  Link,
  Alert,
  Skeleton,
  Divider,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppSelector } from '@app/store';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatusChip } from '../components/StatusChip';
import {
  fetchPlanDeliverables,
  pickDefaultParams,
  saveSessionUpdate,
  todayLocalISO,
} from '@features/needs/utils/sessionActions';
import { apiUrl } from '@shared/utils/apiUrls';


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
  softwarePlatform?: string;
  inputUrl?: string;
}

interface SessionData {
  fulfillment: Fulfillment;
  deliverables: Deliverable[];
  inputParams: InputParameter[];
  needName?: string;
  volunteerName?: string;
  volunteerPhone?: string;
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

export function NCoordinatorDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const userName = user?.identityDetails?.fullname || user?.identityDetails?.name || 'Coordinator';

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editComments, setEditComments] = useState('');
  const [editStudents, setEditStudents] = useState('');
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch today's sessions on mount
  useEffect(() => {
    async function fetchSessions() {
      if (!userId) return;
      setLoading(true);
      try {
        // Build headers from Keycloak
        const { getAuthHeaders: getHeaders } = await import('@shared/utils/authHeaders');
        const headers = getHeaders();

        // Get fulfillments for this coordinator
        const fulfResp = await fetch(
          apiUrl(`/api/v1/serve-fulfill/fulfillment/coordinator-read/${userId}?page=0&size=100`),
          { headers },
        );
        if (!fulfResp.ok) {
          setError('Could not load your sessions. Please refresh the page.');
          setLoading(false);
          return;
        }
        const fulfData = await fulfResp.json();
        
        // Response could be an array or { content: [...] }
        const fulfs: Fulfillment[] = Array.isArray(fulfData)
          ? fulfData
          : Array.isArray(fulfData?.content)
            ? fulfData.content
            : [];

        if (fulfs.length === 0) {
          setLoading(false);
          return;
        }

        // Load every fulfillment in parallel (some may 500 for old/stale plans, skip those)
        const loadSession = async (fulf: Fulfillment): Promise<SessionData | null> => {
          try {
            const [planResp, volResp, delivResp] = await Promise.all([
              fetch(apiUrl(`/api/v1/serve-need/need-plan/${fulf.needId}`), { headers }),
              fulf.assignedUserId
                ? fetch(apiUrl(`/api/v1/serve-volunteering/user/${fulf.assignedUserId}`), { headers }).catch(() => null)
                : Promise.resolve(null),
              fetch(apiUrl(`/api/v1/serve-need/need-deliverable/${fulf.needPlanId}`), { headers }),
            ]);

            // Need name and plan status
            let needName = '';
            let planStatus = '';
            if (planResp.ok) {
              const planData = await planResp.json();
              const plans = Array.isArray(planData) ? planData : (planData.content || []);
              if (plans.length > 0) {
                const matchingPlan = plans.find((p: Record<string, unknown>) => (p?.plan as Record<string, unknown>)?.id === fulf.needPlanId || p?.id === fulf.needPlanId) || plans[0];
                needName = (matchingPlan?.plan as Record<string, unknown>)?.name as string || '';
                planStatus = (matchingPlan?.plan as Record<string, unknown>)?.status as string || matchingPlan?.status as string || '';
              }
            }

            // Skip inactive plans (backfilled volunteers)
            if (planStatus === 'Inactive') return null;

            // Volunteer details
            let volunteerName = '';
            let volunteerPhone = '';
            if (volResp && volResp.ok) {
              try {
                const volData = await volResp.json();
                volunteerName = volData?.identityDetails?.fullname || volData?.identityDetails?.name || '';
                volunteerPhone = volData?.contactDetails?.mobile || '';
              } catch {
                // Skip if volunteer data is unreadable
              }
            }

            // Deliverables (skip failed plans, stale or deleted)
            if (!delivResp.ok) return null;
            const delivData = await delivResp.json();
            const deliverables = delivData.needDeliverable || delivData.content || [];
            const inputParams = delivData.inputParameters || [];
            if (deliverables.length === 0 && inputParams.length === 0) return null;
            return {
              fulfillment: fulf,
              deliverables: Array.isArray(deliverables) ? deliverables : [],
              inputParams: Array.isArray(inputParams) ? inputParams : [],
              needName,
              volunteerName,
              volunteerPhone,
            };
          } catch {
            return null;
          }
        };
        const loaded = await Promise.all(fulfs.map(loadSession));
        const sessionResults = loaded.filter((s): s is SessionData => s !== null);        setSessions(sessionResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [userId]);

  // Get today's deliverables across all sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDeliverables: { deliverable: Deliverable; params: InputParameter | null; session: SessionData; needName: string; volunteerName: string; volunteerPhone: string }[] = [];
  for (const session of sessions) {
    for (const d of session.deliverables) {
      if (d.deliverableDate?.startsWith(todayStr) && d.status !== 'PlannedPause' && d.status !== 'Cancelled' && d.status !== 'Rescheduled') {
        const effectiveParams = d.inputParameters || null;
        todayDeliverables.push({ deliverable: d, params: effectiveParams, session, needName: session.needName || '', volunteerName: session.volunteerName || '', volunteerPhone: session.volunteerPhone || '' });
      }
    }
  }

  // Upcoming (next 30 days, excluding today)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 30);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  const upcomingDeliverables: { deliverable: Deliverable; params: InputParameter | null; session: SessionData; needName: string; volunteerName: string; volunteerPhone: string }[] = [];
  for (const session of sessions) {
    for (const d of session.deliverables) {
      if (d.deliverableDate && d.deliverableDate > todayStr && d.deliverableDate <= nextWeekStr && d.status === 'Planned') {
        const effectiveParams = d.inputParameters || null;
        upcomingDeliverables.push({ deliverable: d, params: effectiveParams, session, needName: session.needName || '', volunteerName: session.volunteerName || '', volunteerPhone: session.volunteerPhone || '' });
      }
    }
  }
  upcomingDeliverables.sort((a, b) => a.deliverable.deliverableDate.localeCompare(b.deliverable.deliverableDate));
  const upcomingSlice = upcomingDeliverables.slice(0, 10);

  // Session counts per need (the grade is part of the need name, e.g. "English Grade 7 ...")
  const summaryMap = new Map<string, { completed: number; cancelled: number; planned: number }>();
  for (const session of sessions) {
    const key = session.needName || 'Unnamed need';
    const row = summaryMap.get(key) || { completed: 0, cancelled: 0, planned: 0 };
    for (const d of session.deliverables) {
      if (d.status === 'Completed') row.completed++;
      else if (d.status === 'Cancelled') row.cancelled++;
      else if (d.status === 'Planned') row.planned++;
    }
    summaryMap.set(key, row);
  }
  const sessionSummary = Array.from(summaryMap.entries())
    .map(([name, counts]) => ({ name, ...counts }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  // Total session count for debug info
  const totalDeliverables = sessions.reduce((sum, s) => sum + s.deliverables.length, 0);

  // Edit handlers
  const startEdit = (d: Deliverable) => {
    setEditingId(d.id);
    setEditStatus(d.status || 'Planned');
    setEditComments(d.comments || '');
    setEditStudents(d.numberOfAttendees?.toString() || '');
    setEditDate(''); // reschedule date: empty = do not reschedule
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (d: Deliverable, planId: string) => {
    if (!editStatus) { setError('Status is required.'); return; }
    if (!editComments && editStatus !== 'Planned') { setError('Remarks are required.'); return; }
    if (!editStudents) { setError('Student count is required.'); return; }

    const isCancel = editStatus === 'Cancelled' || editStatus === 'Offline';
    const originalDate = d.deliverableDate?.split('T')[0] || '';
    const rescheduleTo = isCancel && editDate && editDate !== originalDate ? editDate : undefined;
    if (rescheduleTo && rescheduleTo <= todayLocalISO()) {
      setError('Please select a future date to reschedule.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const session = sessions.find((s) => s.fulfillment.needPlanId === planId);
      await saveSessionUpdate({
        planId,
        deliverable: d,
        status: editStatus,
        comments: editComments,
        students: parseInt(editStudents) || 0,
        rescheduleTo,
        params: rescheduleTo ? d.inputParameters || pickDefaultParams(session?.deliverables || []) : undefined,
      });
      setSuccess(rescheduleTo ? `Session updated and rescheduled to ${rescheduleTo}.` : 'Session updated!');
      cancelEdit();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update.');
    } finally {
      // Reload this plan's sessions so the new Planned session shows up
      try {
        const fresh = await fetchPlanDeliverables(planId);
        setSessions((prev) =>
          prev.map((s) =>
            s.fulfillment.needPlanId === planId
              ? { ...s, deliverables: fresh.deliverables as Deliverable[], inputParams: fresh.inputParams }
              : s,
          ),
        );
      } catch {
        // Keep the current list if the refresh fails
      }
      setSaving(false);
    }
  };
  const renderDeliverable = (
    d: Deliverable,
    params: InputParameter | null,
    planId: string,
    highlight: boolean,
    needName?: string,
    volunteerName?: string,
    volunteerPhone?: string,
  ) => {
    const isEditing = editingId === d.id;
    const dateStr = d.deliverableDate?.split('T')[0] || '—';

    return (
      <Paper
        key={d.id}
        variant="outlined"
        sx={{
          p: 2,
          border: highlight ? '2px solid' : '1px solid',
          borderColor: highlight ? 'primary.main' : 'divider',
          bgcolor: highlight ? 'rgba(14, 116, 144, 0.03)' : 'background.paper',
        }}
      >
        {!isEditing ? (
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                {highlight && <Chip label="Today" size="small" color="primary" />}
                <Typography variant="body2" fontWeight={600}>{dateStr}</Typography>
                <StatusChip status={d.status} />
              </Stack>
              {needName && (
                <Typography variant="body2" color="primary.main" fontWeight={500}>
                  {needName}
                </Typography>
              )}
              <Button size="small" startIcon={<EditIcon />} onClick={() => startEdit(d)}>
                Update
              </Button>
            </Stack>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="caption">
                  {formatTime(params?.startTime)} – {formatTime(params?.endTime)}
                </Typography>
              </Stack>
              {params?.inputUrl && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LinkIcon fontSize="small" color="action" />
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
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={600}>Update Session — {dateStr}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select label="Status *" value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                size="small" sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="Planned">Planned</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Offline">Offline</MenuItem>
              </TextField>
              <TextField
                label="Student Count *" type="number" value={editStudents}
                onChange={(e) => setEditStudents(e.target.value)}
                size="small" sx={{ width: 120 }} InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0 }}
              />
            </Stack>
            {/* Remarks — free text for Completed, dropdown for Cancelled/Offline */}
            {editStatus === 'Completed' && (
              <TextField
                label="Remarks *"
                value={editComments}
                onChange={(e) => setEditComments(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                placeholder="e.g. Session completed successfully"
              />
            )}
            {(editStatus === 'Cancelled' || editStatus === 'Offline') && (
              <TextField
                select
                label="Remarks *"
                value={editComments}
                onChange={(e) => setEditComments(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Select Reason</MenuItem>
                <MenuItem value="Network Issue">Network Issue</MenuItem>
                <MenuItem value="Power Cut">Power Cut</MenuItem>
                <MenuItem value="Students Not Available">Students Not Available</MenuItem>
                <MenuItem value="Volunteer Not Available">Volunteer Not Available</MenuItem>
                <MenuItem value="Infra Related Issues">Infra Related Issues</MenuItem>
              </TextField>
            )}
            {editStatus === 'Planned' && (
              <TextField
                label="Remarks"
                value={editComments}
                onChange={(e) => setEditComments(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                placeholder="Optional remarks"
              />
            )}
            {/* Reschedule — only shows after Cancelled status is selected */}
            {(editStatus === 'Cancelled' || editStatus === 'Offline') && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(14, 116, 144, 0.03)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  A new Planned session will be created on this date with the same time and link.
                </Typography>
                <TextField
                  label="Reschedule to"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty if not rescheduling"
                />
              </Paper>
            )}
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={() => saveEdit(d, planId)} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button size="small" variant="text" startIcon={<CancelIcon />} onClick={cancelEdit}>Cancel</Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    );
  };

  return (
    <Stack spacing={3}>
      <WelcomeBanner
        name={userName}
        subtitle="Here are your sessions for today"
        actionLabel="Raise Need"
        actionIcon={<AddIcon />}
        onAction={() => navigate('/app/needs/raise')}
      />

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Stack spacing={2}>
          <Skeleton height={100} variant="rounded" />
          <Skeleton height={100} variant="rounded" />
          <Skeleton height={80} variant="rounded" />
        </Stack>
      ) : (
        <>
          {/* Session summary per grade / need */}
          {sessionSummary.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                Session Summary
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Grade / Need</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Completed</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Cancelled</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Planned</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessionSummary.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.completed}</TableCell>
                        <TableCell align="right">{row.cancelled}</TableCell>
                        <TableCell align="right">{row.planned}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Today's Sessions — Primary focus */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
              Today&apos;s Sessions
            </Typography>
            {todayDeliverables.length > 0 ? (
              <Stack spacing={1.5}>
                {todayDeliverables.map(({ deliverable, params, session, needName, volunteerName, volunteerPhone }) =>
                  renderDeliverable(deliverable, params, session.fulfillment.needPlanId, true, needName, volunteerName, volunteerPhone),
                )}
              </Stack>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No sessions scheduled for today.
                </Typography>
                {totalDeliverables > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    ({totalDeliverables} total sessions found across {sessions.length} need plans)
                  </Typography>
                )}
                {sessions.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    No assigned volunteers found for your needs.
                  </Typography>
                )}
              </Paper>
            )}
          </Box>

          {/* Upcoming sessions */}
          {upcomingSlice.length > 0 && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Upcoming Sessions
              </Typography>
              <Stack spacing={1}>
                {upcomingSlice.map(({ deliverable, params, session, needName, volunteerName, volunteerPhone }) =>
                  renderDeliverable(deliverable, params, session.fulfillment.needPlanId, false, needName, volunteerName, volunteerPhone),
                )}
              </Stack>
            </Box>
          )}

          {/* Quick link to full needs */}
          <Divider />
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/app/needs')}
            >
              View All Needs
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}
