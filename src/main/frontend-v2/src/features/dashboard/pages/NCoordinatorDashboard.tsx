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

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

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
          `${BASE_URL}/api/v1/serve-fulfill/fulfillment/coordinator-read/${userId}?page=0&size=10`,
          { headers },
        );
        if (!fulfResp.ok) {
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

        // For each fulfillment, get deliverables (some may 500 for old/stale plans — skip those)
        const sessionResults: SessionData[] = [];
        for (const fulf of fulfs) {
          try {
            // Get need plan info (for the need name)
            const planResp = await fetch(
              `${BASE_URL}/api/v1/serve-need/need-plan/${fulf.needId}`,
            );
            let needName = '';
            if (planResp.ok) {
              const planData = await planResp.json();
              const plans = Array.isArray(planData) ? planData : (planData.content || []);
              if (plans.length > 0) {
                needName = plans[0]?.plan?.name || '';
              }
            }

            // Get volunteer details
            let volunteerName = '';
            let volunteerPhone = '';
            if (fulf.assignedUserId) {
              try {
                const volResp = await fetch(
                  `${BASE_URL}/api/v1/serve-volunteering/user/${fulf.assignedUserId}`,
                );
                if (volResp.ok) {
                  const volData = await volResp.json();
                  volunteerName = volData?.identityDetails?.fullname || volData?.identityDetails?.name || '';
                  volunteerPhone = volData?.contactDetails?.mobile || '';
                }
              } catch {
                // Skip if volunteer fetch fails
              }
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
              if (deliverables.length > 0 || inputParams.length > 0) {
                sessionResults.push({
                  fulfillment: fulf,
                  deliverables: Array.isArray(deliverables) ? deliverables : [],
                  inputParams: Array.isArray(inputParams) ? inputParams : [],
                  needName,
                  volunteerName,
                  volunteerPhone,
                });
              }
            } else {
              // Skip failed plans (stale/deleted)
            }
          } catch {
            // Skip failed individual fetches
          }
        }
        setSessions(sessionResults);
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
    const params = session.inputParams.length > 0 ? session.inputParams[0] : null;
    for (const d of session.deliverables) {
      if (d.deliverableDate?.startsWith(todayStr)) {
        todayDeliverables.push({ deliverable: d, params, session, needName: session.needName || '', volunteerName: session.volunteerName || '', volunteerPhone: session.volunteerPhone || '' });
      }
    }
  }

  // Upcoming (next 30 days, excluding today)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 30);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  const upcomingDeliverables: { deliverable: Deliverable; params: InputParameter | null; session: SessionData; needName: string; volunteerName: string; volunteerPhone: string }[] = [];
  for (const session of sessions) {
    const params = session.inputParams.length > 0 ? session.inputParams[0] : null;
    for (const d of session.deliverables) {
      if (d.deliverableDate && d.deliverableDate > todayStr && d.deliverableDate <= nextWeekStr && d.status === 'Planned') {
        upcomingDeliverables.push({ deliverable: d, params, session, needName: session.needName || '', volunteerName: session.volunteerName || '', volunteerPhone: session.volunteerPhone || '' });
      }
    }
  }
  upcomingDeliverables.sort((a, b) => a.deliverable.deliverableDate.localeCompare(b.deliverable.deliverableDate));
  const upcomingSlice = upcomingDeliverables.slice(0, 10);

  // Total session count for debug info
  const totalDeliverables = sessions.reduce((sum, s) => sum + s.deliverables.length, 0);

  // Edit handlers
  const startEdit = (d: Deliverable) => {
    setEditingId(d.id);
    setEditStatus(d.status || 'Planned');
    setEditComments(d.comments || '');
    setEditStudents(d.numberOfAttendees?.toString() || '');
    setEditDate(d.deliverableDate?.split('T')[0] || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (d: Deliverable, planId: string) => {
    if (!editStatus) { setError('Status is required.'); return; }
    if (!editComments && editStatus !== 'Planned') { setError('Remarks are required.'); return; }
    if (!editStudents) { setError('Student count is required.'); return; }

    setSaving(true);
    setError('');
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();

      await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${d.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          needPlanId: planId,
          comments: editComments,
          status: editStatus,
          deliverableDate: editDate ? `${editDate}` : d.deliverableDate?.split('T')[0] || '',
          outputParameters: {
            numberOfAttendees: parseInt(editStudents) || 0,
            submittedUrl: '',
            remarks: editComments,
          },
        }),
      });

      // Update local state
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          deliverables: s.deliverables.map((item) =>
            item.id === d.id
              ? { ...item, status: editStatus, comments: editComments, deliverableDate: editDate ? `${editDate}T00:00:00.000Z` : item.deliverableDate }
              : item,
          ),
        })),
      );
      setSuccess('Session updated!');
      cancelEdit();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update.');
    } finally {
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
                  Would you like to reschedule this session to another day?
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
