import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Button,
  TextField,
  MenuItem,
  Alert,
  Skeleton,
  Link,
  Divider,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { StatusChip } from '@features/dashboard/components/StatusChip';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

interface Deliverable {
  id: string;
  needPlanId?: string;
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

interface SessionsPanelProps {
  needId: string;
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

export function SessionsPanel({ needId }: SessionsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [, setInputParams] = useState<InputParameter[]>([]);
  const [needPlanId, setNeedPlanId] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editComments, setEditComments] = useState('');
  const [editStudents, setEditStudents] = useState('');
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Session link state
  const [editingLink, setEditingLink] = useState(false);
  const [sessionLink, setSessionLink] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  // Fetch: need-plan → deliverables
  useEffect(() => {
    async function fetchData() {
      if (!needId) return;
      setLoading(true);
      setError('');
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const headers = getAuthHeaders();
        // Step 1: Get need plans for this need
        const planResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${needId}`, { headers });
        if (!planResp.ok) throw new Error('Failed to fetch need plans');
        const planData = await planResp.json();
        const plans = Array.isArray(planData) ? planData : (planData.content || []);

        if (plans.length === 0) {
          setLoading(false);
          return;
        }

        // Filter out Inactive plans, pick the active one
        const activePlans = plans.filter((p: Record<string, unknown>) => {
          const status = (p?.plan as Record<string, unknown>)?.status as string || p?.status as string || '';
          return status !== 'Inactive';
        });
        const planObj = activePlans.length > 0 ? activePlans[0] : plans[0];
        const planId = planObj?.plan?.id || planObj?.id || planObj?.osid || '';
        setNeedPlanId(planId);

        if (!planId) {
          setLoading(false);
          return;
        }

        // Step 2: Get deliverables for this plan
        const delivResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/${planId}`, { headers });
        if (delivResp.ok) {
          const delivData = await delivResp.json();
          setDeliverables(delivData.needDeliverable || delivData.content || []);
          setInputParams(delivData.inputParameters || []);
          // Initialize session link from existing input params
          const existingParams = delivData.inputParameters || [];
          if (existingParams.length > 0) {
            setSessionLink(existingParams[existingParams.length - 1]?.inputUrl || '');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [needId]);

  // Today's and upcoming sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = deliverables.filter((d) => d.deliverableDate?.startsWith(todayStr));
  const upcomingSessions = deliverables
    .filter((d) => d.deliverableDate && d.deliverableDate > todayStr && d.status === 'Planned')
    .sort((a, b) => a.deliverableDate.localeCompare(b.deliverableDate))
    .slice(0, 5);

  // Get session link — prioritize Planned deliverables sorted by date (nearest upcoming first)
  const effectiveLink = (() => {
    // First check Planned sessions sorted by date ascending (nearest future date first)
    const planned = deliverables
      .filter((d) => d.status === 'Planned' && d.inputParameters?.inputUrl)
      .sort((a, b) => (a.deliverableDate || '').localeCompare(b.deliverableDate || ''));
    if (planned.length > 0) return planned[0].inputParameters!.inputUrl!;

    // Fallback: PlannedPause sessions
    const plannedPause = deliverables
      .filter((d) => d.status === 'PlannedPause' && d.inputParameters?.inputUrl)
      .sort((a, b) => (a.deliverableDate || '').localeCompare(b.deliverableDate || ''));
    if (plannedPause.length > 0) return plannedPause[0].inputParameters!.inputUrl!;

    // Last resort: any deliverable with a link (but prefer most recent date)
    const withLink = deliverables
      .filter((d) => d.inputParameters?.inputUrl)
      .sort((a, b) => (b.deliverableDate || '').localeCompare(a.deliverableDate || ''));
    if (withLink.length > 0) return withLink[0].inputParameters!.inputUrl!;

    return '';
  })();

  // Get effective time — prioritize nearest Planned deliverable
  const effectiveTime = (() => {
    const planned = deliverables
      .filter((d) => d.status === 'Planned' && d.inputParameters?.startTime)
      .sort((a, b) => (a.deliverableDate || '').localeCompare(b.deliverableDate || ''));
    if (planned.length > 0) return { startTime: planned[0].inputParameters!.startTime!, endTime: planned[0].inputParameters?.endTime };

    const withTime = deliverables
      .filter((d) => d.inputParameters?.startTime)
      .sort((a, b) => (b.deliverableDate || '').localeCompare(a.deliverableDate || ''));
    if (withTime.length > 0) return { startTime: withTime[0].inputParameters!.startTime!, endTime: withTime[0].inputParameters?.endTime };

    return null;
  })();

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

  const saveEdit = async (d: Deliverable) => {
    if (!editStatus) { setError('Status is required.'); return; }
    if (!editStudents) { setError('Student count is required.'); return; }
    if (editStatus !== 'Planned' && !editComments) { setError('Remarks are required.'); return; }

    setSaving(true);
    setError('');
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${d.id}`, {
        method: 'PUT',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify({
          needPlanId: d.needPlanId || needPlanId,
          status: editStatus,
          comments: editComments,
          deliverableDate: editDate || d.deliverableDate?.split('T')[0] || '',
          outputParameters: {
            numberOfAttendees: parseInt(editStudents) || 0,
            submittedUrl: '',
            remarks: editComments,
          },
        }),
      });

      // Update local state
      setDeliverables((prev) =>
        prev.map((item) =>
          item.id === d.id
            ? { ...item, status: editStatus, comments: editComments, deliverableDate: editDate ? `${editDate}T00:00:00.000Z` : item.deliverableDate }
            : item,
        ),
      );
      setSuccess('Session updated successfully.');
      cancelEdit();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update session.');
    } finally {
      setSaving(false);
    }
  };

  // Save session link — updates JSONB inputParameters on each Planned deliverable
  const handleSaveLink = async () => {
    if (!sessionLink.trim()) { setError('Please enter a valid URL.'); return; }
    setSavingLink(true);
    setError('');
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();

      // Update each Planned deliverable with the session link in its JSONB inputParameters
      const plannedDeliverables = deliverables.filter((d) => d.status === 'Planned' || d.status === 'PlannedPause');
      for (const d of plannedDeliverables) {
        const existingParams = d.inputParameters || {};
        await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${d.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            needPlanId: d.needPlanId || needPlanId,
            status: d.status,
            deliverableDate: d.deliverableDate?.split('T')[0] || '',
            comments: d.comments || '',
            inputParameters: {
              ...existingParams,
              inputUrl: sessionLink.trim(),
            },
          }),
        });
      }

      // Update local state — set inputUrl on all planned deliverables
      setDeliverables((prev) =>
        prev.map((d) =>
          d.status === 'Planned' || d.status === 'PlannedPause'
            ? { ...d, inputParameters: { ...(d.inputParameters || {}), inputUrl: sessionLink.trim() } }
            : d,
        ),
      );

      setSuccess(`Session link saved for ${plannedDeliverables.length} sessions.`);
      setEditingLink(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save session link.');
    } finally {
      setSavingLink(false);
    }
  };

  const renderSession = (d: Deliverable, isToday: boolean) => {
    const isEditing = editingId === d.id;
    const dateStr = d.deliverableDate?.split('T')[0] || '—';
    const params = d.inputParameters || null;

    return (
      <Paper
        key={d.id}
        variant="outlined"
        sx={{
          p: 2,
          border: isToday ? '2px solid' : '1px solid',
          borderColor: isToday ? 'primary.main' : 'divider',
          bgcolor: isToday ? 'rgba(14, 116, 144, 0.03)' : 'background.paper',
        }}
      >
        {!isEditing ? (
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                {isToday && <Chip label="Today" size="small" color="primary" />}
                <Typography variant="body2" fontWeight={600}>{dateStr}</Typography>
                <StatusChip status={d.status} />
              </Stack>
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
            {editStatus === 'Completed' && (
              <TextField
                label="Remarks *" value={editComments}
                onChange={(e) => setEditComments(e.target.value)}
                size="small" fullWidth InputLabelProps={{ shrink: true }}
                placeholder="e.g. Session completed successfully"
              />
            )}
            {(editStatus === 'Cancelled' || editStatus === 'Offline') && (
              <>
                <TextField
                  select label="Remarks *" value={editComments}
                  onChange={(e) => setEditComments(e.target.value)}
                  size="small" fullWidth InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="">Select Reason</MenuItem>
                  <MenuItem value="Network Issue">Network Issue</MenuItem>
                  <MenuItem value="Power Cut">Power Cut</MenuItem>
                  <MenuItem value="Students Not Available">Students Not Available</MenuItem>
                  <MenuItem value="Volunteer Not Available">Volunteer Not Available</MenuItem>
                  <MenuItem value="Infra Related Issues">Infra Related Issues</MenuItem>
                </TextField>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(14, 116, 144, 0.03)' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Would you like to reschedule this session to another day?
                  </Typography>
                  <TextField
                    label="Reschedule to" type="date" value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    size="small" InputLabelProps={{ shrink: true }}
                    helperText="Leave empty if not rescheduling"
                  />
                </Paper>
              </>
            )}
            {editStatus === 'Planned' && (
              <TextField
                label="Remarks" value={editComments}
                onChange={(e) => setEditComments(e.target.value)}
                size="small" fullWidth InputLabelProps={{ shrink: true }}
                placeholder="Optional remarks"
              />
            )}
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={() => saveEdit(d)} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button size="small" variant="text" startIcon={<CancelIcon />} onClick={cancelEdit}>Cancel</Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={80} />
        <Skeleton height={80} />
      </Stack>
    );
  }

  if (deliverables.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
        No sessions found for this need.
      </Typography>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Session Link Management */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(14, 116, 144, 0.04)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="primary.main">Session Info</Typography>
          {!editingLink && (
            <Button
              size="small"
              startIcon={effectiveLink ? <EditIcon /> : <AddLinkIcon />}
              onClick={() => { setEditingLink(true); setSessionLink(effectiveLink || ''); }}
            >
              {effectiveLink ? 'Edit Link' : 'Add Session Link'}
            </Button>
          )}
        </Stack>

        {!editingLink ? (
          <Stack direction="row" spacing={3} flexWrap="wrap">
            {effectiveLink ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LinkIcon fontSize="small" color="action" />
                <Link href={effectiveLink} target="_blank" variant="body2" underline="hover">
                  {effectiveLink.length > 50 ? effectiveLink.slice(0, 50) + '...' : effectiveLink}
                </Link>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No session link set. Add one so volunteers can join.
              </Typography>
            )}
            {effectiveTime && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {formatTime(effectiveTime.startTime)} – {formatTime(effectiveTime.endTime)}
                </Typography>
              </Stack>
            )}
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <TextField
              size="small"
              fullWidth
              label="Session Link (Google Meet, Zoom, etc.)"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={sessionLink}
              onChange={(e) => setSessionLink(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveLink}
                disabled={savingLink || !sessionLink.trim()}
              >
                {savingLink ? 'Saving...' : 'Save Link'}
              </Button>
              <Button size="small" variant="text" onClick={() => setEditingLink(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>

      {/* Today's sessions */}
      {todaySessions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Today&apos;s Sessions</Typography>
          <Stack spacing={1.5}>
            {todaySessions.map((d) => renderSession(d, true))}
          </Stack>
        </Box>
      )}

      {todaySessions.length === 0 && (
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">No sessions scheduled for today.</Typography>
        </Paper>
      )}

      {/* Upcoming */}
      {upcomingSessions.length > 0 && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Upcoming Sessions</Typography>
          <Stack spacing={1.5}>
            {upcomingSessions.map((d) => renderSession(d, false))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
