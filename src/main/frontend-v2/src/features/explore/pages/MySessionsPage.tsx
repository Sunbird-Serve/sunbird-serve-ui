import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  Link,
  Skeleton,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Menu,
  Grid,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAppSelector } from '@app/store';
import { useAuth } from '@features/auth/hooks/useAuth';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { PageHeader } from '@shared/components';
import { apiUrl } from '@shared/utils/apiUrls';
import { todayLocalISO } from '@features/needs/utils/sessionActions';
import { durationHours, loadAssignedNeeds, resolveTimes, type AssignedNeed, type Deliverable } from '../api/assignedNeeds';
import { googleCalendarUrl } from '../utils/calendar';
import { useGetMyNominationsQuery } from '../api/exploreApi';
import { WithdrawDialog, type WithdrawTarget } from '../components/WithdrawDialog';

// Roles permitted to call the create endpoint (two-row reschedule).
// Volunteers can only update existing deliverables, so they reschedule in-place.
const CREATE_CAPABLE_ROLES = ['sAdmin', 'nAdmin', 'nCoordinator'];

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

// Shared learning-content folder. Override per deployment with VITE_VOLUNTEER_CONTENT_URL.
const CONTENT_URL =
  import.meta.env.VITE_VOLUNTEER_CONTENT_URL ||
  'https://drive.google.com/drive/folders/1Myhew2HIwPjtpr5ihD4jDY1HYZF_JgWG?usp=drive_link';
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

// Indian academic year (Apr–Mar) for a given ISO date. Returns the starting
// calendar year, e.g. 2025 for any date between 2025-04-01 and 2026-03-31.
function academicYearOf(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

function academicYearLabel(startYear: number): string {
  return `${startYear}–${startYear + 1}`;
}

function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr.split('T')[0] > todayLocalISO();
}

function formatLongDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
const CANCEL_REASONS = [
  'Network Issue', 'Power Cut', 'Students Not Available',
  'Volunteer Not Available', 'Infra Related Issues',
];

export function MySessionsPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const { roles } = useAuth();
  const canCreateDeliverable = roles.some((r) => CREATE_CAPABLE_ROLES.includes(r));

  const [loading, setLoading] = useState(true);
  const [assignedNeeds, setAssignedNeeds] = useState<AssignedNeed[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<AssignedNeed | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  // Withdrawing from an assigned school needs the volunteer's approved nomination for it
  const { data: myNominations = [] } = useGetMyNominationsQuery(userId, { skip: !userId });
  const [withdrawTarget, setWithdrawTarget] = useState<WithdrawTarget | null>(null);

  // Action state
  const [actionMenu, setActionMenu] = useState<{ anchor: HTMLElement; deliverable: Deliverable; allowReschedule: boolean } | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Deliverable | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Deliverable | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Deliverable | null>(null);

  // Form state
  const [studentCount, setStudentCount] = useState('');
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Deliverable tab
  const [delivTab, setDelivTab] = useState(0); // 0=To-Do, 1=Completed, 2=Cancelled

  // Fetch assigned needs (reusable so mutations can reconcile with the server)
  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!userId) return;
    if (!opts?.silent) {
      setLoading(true);
      setLoadError('');
    }
    try {
      const results = await loadAssignedNeeds(userId);
      setAssignedNeeds(results);
      // Keep the currently-selected need in sync with refreshed data,
      // or auto-select the first need if there's only one.
      setSelectedNeed((prev) => {
        if (prev) return results.find((n) => n.planId === prev.planId) || null;
        return results.length === 1 ? results[0] : null;
      });
    } catch {
      if (!opts?.silent) setLoadError('We could not load your sessions. Please check your connection and try again.');
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Split into current academic year vs previous
  // Indian academic year: April to March
  const now = new Date();
  const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // April onwards = current year
  const academicYearStart = `${currentYear}-04-01`;

  const currentNeeds = assignedNeeds.filter((n) => {
    const end = n.endDate || '';
    return end >= academicYearStart;
  });
  const previousNeeds = assignedNeeds.filter((n) => {
    const end = n.endDate || '';
    return end < academicYearStart;
  });

  // Group previous needs by academic year (newest year first).
  const previousNeedsByYear = (() => {
    const groups = new Map<number, AssignedNeed[]>();
    for (const n of previousNeeds) {
      const year = academicYearOf(n.endDate || n.startDate || '');
      if (year == null) continue;
      const list = groups.get(year) || [];
      list.push(n);
      groups.set(year, list);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  })();
  const todoDelivs = selectedNeed?.deliverables
    .filter((d) => d.status === 'Planned' || d.status === 'NotStarted')
    .sort((a, b) => a.deliverableDate.localeCompare(b.deliverableDate)) || [];
  const completedDelivs = selectedNeed?.deliverables.filter((d) => d.status === 'Completed').sort((a, b) => b.deliverableDate.localeCompare(a.deliverableDate)) || [];
  const cancelledDelivs = selectedNeed?.deliverables.filter((d) => d.status === 'Cancelled' || d.status === 'Offline').sort((a, b) => b.deliverableDate.localeCompare(a.deliverableDate)) || [];
  const rescheduledDelivs = selectedNeed?.deliverables
    .filter((d) => d.status === 'Rescheduled')
    .sort((a, b) => a.deliverableDate.localeCompare(b.deliverableDate)) || [];

  const todayStr = todayLocalISO();
  const approvedNomination = selectedNeed
    ? myNominations.find((n) => n.needId === selectedNeed.needId && n.nominationStatus === 'Approved')
    : undefined;

  // Get effective params — from nearest planned deliverable that has inputParameters
  const effectiveParams = (() => {
    // First try today's deliverable
    const todayDeliv = todoDelivs.find((d) => d.deliverableDate?.startsWith(todayStr) && d.inputParameters);
    if (todayDeliv?.inputParameters) return todayDeliv.inputParameters;
    // Then any planned deliverable with inputParameters
    const anyPlanned = todoDelivs.find((d) => d.inputParameters?.startTime || d.inputParameters?.inputUrl);
    if (anyPlanned?.inputParameters) return anyPlanned.inputParameters;
    // Fallback to plan-level inputParams (old table, transitional)
    const planParams = selectedNeed?.inputParams?.length ? selectedNeed.inputParams[selectedNeed.inputParams.length - 1] : null;
    return planParams;
  })();
  const params = effectiveParams;

  // Actions
  // Open the complete sheet with the last recorded student count pre-filled.
  const openComplete = (d: Deliverable) => {
    const last = completedDelivs.find((c) => c.numberOfAttendees);
    setStudentCount(last?.numberOfAttendees ? String(last.numberOfAttendees) : '');
    setNotes('');
    setCompleteTarget(d);
  };

  const handleComplete = async () => {
    if (!completeTarget || !selectedNeed || !studentCount) { setError('Student count is required.'); return; }
    setSaving(true);
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();
      const updateResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${completeTarget.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          needPlanId: selectedNeed.planId, status: 'Completed',
          comments: notes || 'Session completed',
          deliverableDate: completeTarget.deliverableDate?.split('T')[0] || '',
          outputParameters: { numberOfAttendees: parseInt(studentCount), submittedUrl: '', remarks: notes },
        }),
      });
      if (!updateResp.ok) throw new Error('update failed');
      // Log volunteer hours (no id is sent; the server assigns it)
      try {
        const hoursBody = JSON.stringify({
          userId,
          needId: selectedNeed.needId,
          deliveryHours: Number(durationHours(completeTarget.inputParameters && resolveTimes(completeTarget.inputParameters).startTime ? completeTarget.inputParameters : params).toFixed(2)),
          deliveryDate: new Date().toISOString(),
          needDeliverableId: completeTarget.id,
        });
        const hoursResp = await fetch(apiUrl(`/api/v1/serve-volunteering/volunteer-hours/`), {
          method: 'POST', headers, body: hoursBody,
        });
        // 409: hours for this session were already logged, so update them instead
        if (hoursResp.status === 409) {
          await fetch(
            apiUrl(`/api/v1/serve-volunteering/volunteer-hours/${encodeURIComponent(userId)}/needDeliverableId/${encodeURIComponent(completeTarget.id)}`),
            { method: 'PUT', headers, body: hoursBody },
          );
        }
      } catch { /* best effort */ }

      setSelectedNeed((prev) => prev ? { ...prev, deliverables: prev.deliverables.map((d) => d.id === completeTarget.id ? { ...d, status: 'Completed', comments: notes, numberOfAttendees: parseInt(studentCount) } : d) } : null);
      setSuccess('Session marked as completed!');
      setCompleteTarget(null); setStudentCount(''); setNotes('');
      fetchData({ silent: true });
    } catch { setError('Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleCancelSession = async () => {
    if (!cancelTarget || !selectedNeed || !cancelReason) { setError('Please select a reason.'); return; }
    setSaving(true);
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();
      const cancelResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${cancelTarget.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ needPlanId: selectedNeed.planId, status: 'Cancelled', comments: cancelReason, deliverableDate: cancelTarget.deliverableDate?.split('T')[0] || '' }),
      });
      if (!cancelResp.ok) throw new Error('cancel failed');
      setSelectedNeed((prev) => prev ? { ...prev, deliverables: prev.deliverables.map((d) => d.id === cancelTarget.id ? { ...d, status: 'Cancelled', comments: cancelReason } : d) } : null);
      setSuccess('Session cancelled.');
      setCancelTarget(null); setCancelReason('');
      fetchData({ silent: true });
    } catch { setError('Failed to cancel.'); }
    finally { setSaving(false); }
  };

  const handleRescheduleSession = async () => {
    if (!rescheduleTarget || !selectedNeed || !rescheduleDate) { setError('Please select a date.'); return; }
    if (!isFutureDate(rescheduleDate)) { setError('Please select a future date.'); return; }
    setSaving(true);
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();
      const originalDate = rescheduleTarget.deliverableDate?.split('T')[0] || '';

      // Carry over session details (link/time/platform) so the rescheduled
      // session isn't left without a join link.
      const carriedParams =
        rescheduleTarget.inputParameters ||
        (selectedNeed.inputParams?.length ? selectedNeed.inputParams[selectedNeed.inputParams.length - 1] : undefined);

      if (canCreateDeliverable) {
        // --- Two-row model (coordinators / admins can call create) ---
        // 1. Mark the original deliverable as Rescheduled (keeps history).
        const updateResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${rescheduleTarget.id}`, {
          method: 'PUT', headers,
          body: JSON.stringify({
            needPlanId: selectedNeed.planId,
            status: 'Rescheduled',
            comments: `Rescheduled to ${rescheduleDate}`,
            deliverableDate: originalDate,
          }),
        });
        if (!updateResp.ok) throw new Error('update failed');

        // 2. Create the new Planned deliverable on the chosen date.
        const createResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/create`, {
          method: 'POST', headers,
          body: JSON.stringify({
            needPlanId: selectedNeed.planId,
            status: 'Planned',
            comments: `Rescheduled from ${originalDate}`,
            deliverableDate: rescheduleDate,
            ...(carriedParams ? { inputParameters: carriedParams } : {}),
          }),
        });
        if (!createResp.ok) throw new Error('create failed');

        let newId = '';
        try {
          const created = await createResp.json();
          newId = created?.id || created?.needDeliverable?.id || created?.result?.id || '';
        } catch { /* refetch will fill it in */ }

        // Optimistic: flip original to Rescheduled and insert the new Planned row.
        setSelectedNeed((prev) => {
          if (!prev) return null;
          const deliverables = prev.deliverables.map((d) =>
            d.id === rescheduleTarget.id
              ? { ...d, status: 'Rescheduled', comments: `Rescheduled to ${rescheduleDate}` }
              : d,
          );
          deliverables.push({
            id: newId || `temp-${Date.now()}`,
            needPlanId: selectedNeed.planId,
            deliverableDate: rescheduleDate,
            status: 'Planned',
            comments: `Rescheduled from ${originalDate}`,
            inputParameters: carriedParams,
          });
          return { ...prev, deliverables };
        });
        setSuccess('Session rescheduled. The new session is now in your To-Do list.');
      } else {
        // --- In-place model (volunteers can only update) ---
        // Volunteers can't create a new row, so the single deliverable is
        // updated to Rescheduled and moved to the new date. It leaves To-Do
        // and appears under the Rescheduled tab.
        const updateResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${rescheduleTarget.id}`, {
          method: 'PUT', headers,
          body: JSON.stringify({
            needPlanId: selectedNeed.planId,
            status: 'Rescheduled',
            comments: `Rescheduled from ${originalDate} to ${rescheduleDate}`,
            deliverableDate: rescheduleDate,
            ...(carriedParams ? { inputParameters: carriedParams } : {}),
          }),
        });
        if (!updateResp.ok) throw new Error('update failed');

        // Optimistic: mark the same row Rescheduled on the new date.
        setSelectedNeed((prev) => prev ? {
          ...prev,
          deliverables: prev.deliverables.map((d) =>
            d.id === rescheduleTarget.id
              ? { ...d, deliverableDate: rescheduleDate, status: 'Rescheduled', comments: `Rescheduled from ${originalDate} to ${rescheduleDate}` }
              : d,
          ),
        } : null);
        setSuccess('Session rescheduled. See the Rescheduled tab.');
      }

      setRescheduleTarget(null); setRescheduleDate('');

      // Reconcile with the server as the source of truth.
      fetchData({ silent: true });
    } catch { setError('Failed to reschedule.'); }
    finally { setSaving(false); }
  };

  // --- RENDER ---

  if (loading) {
    return <Stack spacing={2}><Skeleton height={120} variant="rounded" /><Skeleton height={120} variant="rounded" /></Stack>;
  }

  if (loadError && assignedNeeds.length === 0) {
    return (
      <Box>
        <PageHeader
          title="My Sessions"
          subtitle="Track your assigned needs and manage each session."
          icon={<CalendarTodayIcon />}
        />
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => fetchData()}>Retry</Button>}>
          {loadError}
        </Alert>
      </Box>
    );
  }

  // Screen 1: Need cards (if multiple needs or none selected)
  if (!selectedNeed) {
    return (
      <Box>
        <PageHeader
          title="My Sessions"
          subtitle="Track your assigned needs and manage each session."
          icon={<CalendarTodayIcon />}
        />
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
        {assignedNeeds.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">You don't have any assigned sessions yet.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Go to "Explore" to find opportunities.</Typography>
          </Paper>
        ) : (
          <>
            {/* Current Academic Year */}
            {currentNeeds.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  Current Academic Year ({currentYear}–{currentYear + 1})
                </Typography>
                <Grid container spacing={2}>
                  {currentNeeds.map((need) => (
                    <Grid item xs={12} sm={6} key={need.needId}>
                      <Paper
                        sx={{ p: 2.5, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' } }}
                        onClick={() => setSelectedNeed(need)}
                      >
                        <Typography variant="subtitle1" fontWeight={600} color="primary.main">{need.needName}</Typography>
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          {need.entityName && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">{need.entityName}</Typography>
                            </Stack>
                          )}
                          {need.days && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">{need.days}</Typography>
                            </Stack>
                          )}
                          {need.coordinator.name && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">{need.coordinator.name}</Typography>
                            </Stack>
                          )}
                        </Stack>
                        <Chip label={`${need.deliverables.filter((d) => d.status === 'Planned').length} sessions pending`} size="small" sx={{ mt: 1.5 }} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Previous Academic Years — grouped by year, de-emphasized */}
            {previousNeedsByYear.length > 0 && (
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Previous Academic Years
                </Typography>
                <Stack spacing={2.5}>
                  {previousNeedsByYear.map(([year, needs]) => (
                    <Box key={year}>
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                        {academicYearLabel(year)}
                      </Typography>
                      <Grid container spacing={2}>
                        {needs.map((need) => (
                          <Grid item xs={12} sm={6} key={need.needId}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 2, cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}
                              onClick={() => setSelectedNeed(need)}
                            >
                              <Typography variant="body1" fontWeight={500}>{need.needName}</Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                {need.entityName && <Typography variant="caption" color="text.secondary">{need.entityName}</Typography>}
                                <Typography variant="caption" color="text.secondary">{need.startDate} – {need.endDate}</Typography>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  }

  // Screen 2: Need detail with sessions
  return (
    <Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Back button (if multiple needs) */}
      {assignedNeeds.length > 1 && (
        <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedNeed(null)} sx={{ mb: 2 }}>
          Back to My Needs
        </Button>
      )}

      {/* Need Info Header */}
      <Paper sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(14, 116, 144, 0.03)' }}>
        <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
          {selectedNeed.needName}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              {selectedNeed.entityName && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <SchoolIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2"><strong>School/College:</strong> {selectedNeed.entityName}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2"><strong>Period:</strong> {selectedNeed.startDate} to {selectedNeed.endDate}</Typography>
              </Stack>
              {selectedNeed.days && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2"><strong>Days:</strong> {selectedNeed.days} · {formatTime(resolveTimes(params).startTime)} – {formatTime(resolveTimes(params).endTime)}</Typography>
                </Stack>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              {selectedNeed.coordinator.name && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2"><strong>Coordinator:</strong> {selectedNeed.coordinator.name}</Typography>
                </Stack>
              )}
              {selectedNeed.coordinator.phone && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedNeed.coordinator.phone}</Typography>
                </Stack>
              )}
              {params?.inputUrl ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Link href={params.inputUrl} target="_blank" variant="body2" underline="hover">Session Link</Link>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">Link yet to be added</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Link href={CONTENT_URL} target="_blank" variant="body2" underline="hover">Content Link</Link>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
        {/* Join button for today */}
        {params?.inputUrl && todoDelivs.some((d) => d.deliverableDate?.startsWith(todayStr)) && (
          <Button variant="contained" size="large" startIcon={<LinkIcon />} href={params.inputUrl} target="_blank" sx={{ mt: 2 }}>
            Join Today's Session
          </Button>
        )}
        {approvedNomination && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              color="error"
              onClick={() =>
                setWithdrawTarget({
                  nominationId: approvedNomination.id,
                  needName: selectedNeed.needName,
                  schoolName: selectedNeed.entityName,
                })
              }
            >
              Withdraw from this school
            </Button>
          </Box>
        )}
      </Paper>

      <WithdrawDialog
        target={withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onDone={(message) => {
          setWithdrawTarget(null);
          setSelectedNeed(null);
          setSuccess(message);
          fetchData({ silent: true });
          setTimeout(() => setSuccess(''), 6000);
        }}
      />

      {/* Deliverables */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Sessions</Typography>
      <Tabs value={delivTab} onChange={(_, v) => setDelivTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label={`To-Do (${todoDelivs.length})`} />
        <Tab label={`Completed (${completedDelivs.length})`} />
        <Tab label={`Rescheduled (${rescheduledDelivs.length})`} />
        <Tab label={`Cancelled (${cancelledDelivs.length})`} />
      </Tabs>

      {/* To-Do */}
      {delivTab === 0 && (
        <Stack spacing={1}>
          {todoDelivs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No pending sessions.</Typography>
          ) : todoDelivs.map((d) => {
            const dateOnly = d.deliverableDate?.split('T')[0] || '';
            const isToday = dateOnly === todayStr;
            const future = isFutureDate(d.deliverableDate);
            const times = resolveTimes(d.inputParameters || params);
            const link = d.inputParameters?.inputUrl || params?.inputUrl;
            const calendarButton = (
              <Tooltip title="Add to calendar">
                <IconButton
                  size="small"
                  aria-label="Add to calendar"
                  href={googleCalendarUrl({
                    title: `${selectedNeed.needName} (Sunbird Serve)`,
                    date: dateOnly,
                    startTime: times.startTime,
                    endTime: times.endTime,
                    details: selectedNeed.entityName ? `Volunteering session at ${selectedNeed.entityName}` : undefined,
                    location: link,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <EventAvailableIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            );
            return (
              <Paper key={d.id} variant="outlined" sx={{ p: 2, borderLeft: isToday ? '3px solid' : undefined, borderLeftColor: isToday ? 'primary.main' : undefined }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {isToday && <Chip label="Today" size="small" color="primary" />}
                      <Typography variant="body2" fontWeight={600}>{formatLongDate(dateOnly)}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(times.startTime)} – {formatTime(times.endTime)}
                    </Typography>
                    {!link && (
                      <Typography variant="caption" color="warning.main" display="block">
                        Link yet to be added
                      </Typography>
                    )}
                  </Box>
                  {future ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.disabled">Upcoming</Typography>
                      {calendarButton}
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      {isToday && link && (
                        <Button size="small" variant="outlined" startIcon={<LinkIcon />} href={link} target="_blank" rel="noopener noreferrer">
                          Join
                        </Button>
                      )}
                      <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => openComplete(d)}>
                        Mark Complete
                      </Button>
                      {calendarButton}
                      <IconButton size="small" aria-label="More actions" onClick={(e) => setActionMenu({ anchor: e.currentTarget, deliverable: d, allowReschedule: true })}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
      {/* Completed */}
      {delivTab === 1 && (
        <Stack spacing={1}>
          {completedDelivs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No completed sessions yet.</Typography>
          ) : completedDelivs.map((d) => (
            <Paper key={d.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <StatusChip status="Completed" />
                  <Typography variant="body2">{d.deliverableDate?.split('T')[0]}</Typography>
                </Stack>
                {d.numberOfAttendees && (
                  <Typography variant="caption" color="text.secondary">{d.numberOfAttendees} students</Typography>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Rescheduled */}
      {delivTab === 2 && (
        <Stack spacing={1}>
          {rescheduledDelivs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No rescheduled sessions.</Typography>
          ) : rescheduledDelivs.map((d) => {
            const future = isFutureDate(d.deliverableDate);
            return (
            <Paper key={d.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <StatusChip status="Rescheduled" />
                  <Typography variant="body2">{d.deliverableDate?.split('T')[0]}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {d.comments && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <EventRepeatIcon sx={{ fontSize: 15, color: 'info.main' }} />
                      <Typography variant="caption" color="text.secondary">{d.comments}</Typography>
                    </Stack>
                  )}
                  {/* Once the rescheduled date arrives, allow completing/cancelling it. */}
                  {!future && (
                    <IconButton size="small" onClick={(e) => setActionMenu({ anchor: e.currentTarget, deliverable: d, allowReschedule: false })}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            </Paper>
            );
          })}
        </Stack>
      )}

      {/* Cancelled */}
      {delivTab === 3 && (
        <Stack spacing={1}>
          {cancelledDelivs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No cancelled sessions.</Typography>
          ) : cancelledDelivs.map((d) => (
            <Paper key={d.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <StatusChip status={d.status} />
                  <Typography variant="body2">{d.deliverableDate?.split('T')[0]}</Typography>
                </Stack>
                {d.comments && <Typography variant="caption" color="text.secondary">{d.comments}</Typography>}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Action Menu */}
      <Menu anchorEl={actionMenu?.anchor} open={Boolean(actionMenu)} onClose={() => setActionMenu(null)}>
        <MenuItem onClick={() => { openComplete(actionMenu!.deliverable); setActionMenu(null); }}>
          <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} /> Mark as Completed
        </MenuItem>
        {actionMenu?.allowReschedule && (
          <MenuItem onClick={() => { setRescheduleTarget(actionMenu!.deliverable); setActionMenu(null); }}>
            <EventRepeatIcon fontSize="small" color="info" sx={{ mr: 1 }} /> Reschedule
          </MenuItem>
        )}
        <MenuItem onClick={() => { setCancelTarget(actionMenu!.deliverable); setActionMenu(null); }}>
          <CancelIcon fontSize="small" color="error" sx={{ mr: 1 }} /> Cancel Session
        </MenuItem>
      </Menu>

      {/* Complete Bottom Sheet */}
      {completeTarget && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, zIndex: 1200, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', borderRadius: '16px 16px 0 0' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Mark as Completed</Typography>
          <Stack spacing={2}>
            <TextField label="Student Count *" type="number" value={studentCount} onChange={(e) => setStudentCount(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: 1 }} />
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} placeholder="How did the session go?" />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="success" onClick={handleComplete} disabled={saving || !studentCount} fullWidth>{saving ? 'Saving...' : 'Complete'}</Button>
              <Button variant="text" onClick={() => { setCompleteTarget(null); setStudentCount(''); setNotes(''); }} fullWidth>Cancel</Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Cancel Bottom Sheet */}
      {cancelTarget && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, zIndex: 1200, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', borderRadius: '16px 16px 0 0' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Cancel Session</Typography>
          <Stack spacing={2}>
            <TextField select label="Reason *" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }}>
              <MenuItem value="">Select Reason</MenuItem>
              {CANCEL_REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="error" onClick={handleCancelSession} disabled={saving || !cancelReason} fullWidth>{saving ? 'Saving...' : 'Cancel Session'}</Button>
              <Button variant="text" onClick={() => { setCancelTarget(null); setCancelReason(''); }} fullWidth>Back</Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Reschedule Bottom Sheet */}
      {rescheduleTarget && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, zIndex: 1200, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', borderRadius: '16px 16px 0 0' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Reschedule Session</Typography>
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">
              {canCreateDeliverable
                ? 'The original session will be marked as rescheduled and a new session created on the chosen date.'
                : 'This session will be moved to the new date and marked as rescheduled. You can find it under the Rescheduled tab.'}
            </Typography>
            <TextField label="New Date *" type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: todayStr }} />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleRescheduleSession} disabled={saving || !rescheduleDate} fullWidth>{saving ? 'Saving...' : 'Reschedule'}</Button>
              <Button variant="text" onClick={() => { setRescheduleTarget(null); setRescheduleDate(''); }} fullWidth>Back</Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
