import { useState, useEffect } from 'react';
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
import { useAppSelector } from '@app/store';
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
  inputUrl?: string;
  softwarePlatform?: string;
}

interface CoordinatorInfo {
  name: string;
  phone: string;
  email: string;
}

interface AssignedNeed {
  needName: string;
  needId: string;
  planId: string;
  entityName: string;
  startDate: string;
  endDate: string;
  days: string;
  deliverables: Deliverable[];
  inputParams: InputParameter[];
  coordinator: CoordinatorInfo;
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

function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return d > today;
}

const CANCEL_REASONS = [
  'Network Issue', 'Power Cut', 'Students Not Available',
  'Volunteer Not Available', 'Infra Related Issues',
];

export function MySessionsPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const [loading, setLoading] = useState(true);
  const [assignedNeeds, setAssignedNeeds] = useState<AssignedNeed[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<AssignedNeed | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Action state
  const [actionMenu, setActionMenu] = useState<{ anchor: HTMLElement; deliverable: Deliverable } | null>(null);
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

  // Fetch assigned needs
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      setLoading(true);
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const headers = getAuthHeaders();
        const fulfResp = await fetch(`${BASE_URL}/api/v1/serve-fulfill/fulfillment/volunteer-read/${userId}?page=0&size=20`, { headers });
        if (!fulfResp.ok) { setLoading(false); return; }
        const fulfData = await fulfResp.json();
        const fulfs = Array.isArray(fulfData) ? fulfData : (fulfData.content || []);

        const results: AssignedNeed[] = [];
        for (const fulf of fulfs) {
          try {
            // Get need plan info
            const planResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${fulf.needId}`, { headers });
            let needName = '', planId = fulf.needPlanId, startDate = '', endDate = '', days = '';
            let planStatus = '';
            if (planResp.ok) {
              const planData = await planResp.json();
              const plans = Array.isArray(planData) ? planData : (planData.content || []);
              if (plans.length > 0) {
                // Find matching plan for this fulfillment
                const matchingPlan = plans.find((p: Record<string, unknown>) => (p?.plan as Record<string, unknown>)?.id === fulf.needPlanId || p?.id === fulf.needPlanId) || plans[0];
                needName = (matchingPlan?.plan as Record<string, unknown>)?.name as string || '';
                planId = (matchingPlan?.plan as Record<string, unknown>)?.id as string || fulf.needPlanId;
                planStatus = (matchingPlan?.plan as Record<string, unknown>)?.status as string || matchingPlan?.status as string || '';
                startDate = matchingPlan?.occurrence?.startDate?.substring(0, 10) || '';
                endDate = matchingPlan?.occurrence?.endDate?.substring(0, 10) || '';
                days = matchingPlan?.occurrence?.days || '';
              }
            }

            // Skip inactive plans (backfilled)
            if (planStatus === 'Inactive') continue;

            // Get entity name from need
            let entityName = '';
            try {
              const needResp = await fetch(`${BASE_URL}/api/v1/serve-need/need/${fulf.needId}`, { headers });
              if (needResp.ok) {
                const needData = await needResp.json();
                const need = Array.isArray(needData) ? needData[0] : needData;
                entityName = need?.entity?.name || '';
                if (!needName) needName = need?.name || need?.need?.name || '';
              }
            } catch { /* skip */ }

            // Get coordinator info
            let coordinator: CoordinatorInfo = { name: '', phone: '', email: '' };
            if (fulf.coordUserId) {
              try {
                const coordResp = await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/${fulf.coordUserId}`, { headers });
                if (coordResp.ok) {
                  const coordData = await coordResp.json();
                  coordinator = {
                    name: coordData?.identityDetails?.fullname || '',
                    phone: coordData?.contactDetails?.mobile || '',
                    email: coordData?.contactDetails?.email || '',
                  };
                }
              } catch { /* skip */ }
            }

            // Get deliverables
            const delivResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/${planId}`, { headers });
            if (delivResp.ok) {
              const delivData = await delivResp.json();
              results.push({
                needName: needName || 'Session',
                needId: fulf.needId,
                planId,
                entityName,
                startDate, endDate, days,
                deliverables: delivData.needDeliverable || [],
                inputParams: delivData.inputParameters || [],
                coordinator,
              });
            }
          } catch { /* skip */ }
        }
        setAssignedNeeds(results);
        // Auto-select first need if only one
        if (results.length === 1) setSelectedNeed(results[0]);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchData();
  }, [userId]);

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
  const todoDelivs = selectedNeed?.deliverables
    .filter((d) => d.status === 'Planned' || d.status === 'NotStarted')
    .sort((a, b) => a.deliverableDate.localeCompare(b.deliverableDate)) || [];
  const completedDelivs = selectedNeed?.deliverables.filter((d) => d.status === 'Completed') || [];
  const cancelledDelivs = selectedNeed?.deliverables.filter((d) => d.status === 'Cancelled' || d.status === 'Rescheduled' || d.status === 'Offline') || [];

  const todayStr = new Date().toISOString().split('T')[0];

  // For today's "Join" button — use today's deliverable inputParameters directly
  const todayDeliv = todoDelivs.find((d) => d.deliverableDate?.startsWith(todayStr));
  const params = todayDeliv?.inputParameters || null;

  // Actions
  const handleComplete = async () => {
    if (!completeTarget || !selectedNeed || !studentCount) { setError('Student count is required.'); return; }
    setSaving(true);
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();
      await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${completeTarget.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          needPlanId: selectedNeed.planId, status: 'Completed',
          comments: notes || 'Session completed',
          deliverableDate: completeTarget.deliverableDate?.split('T')[0] || '',
          outputParameters: { numberOfAttendees: parseInt(studentCount), submittedUrl: '', remarks: notes },
        }),
      });
      // Log volunteer hours
      try {
        await fetch(`${BASE_URL}/api/v1/serve-volunteering/volunteer-hours/`, {
          method: 'POST', headers,
          body: JSON.stringify({ userId, needId: selectedNeed.needId, deliveryHours: 1, deliveryDate: new Date().toISOString(), needDeliverableId: completeTarget.id }),
        });
      } catch { /* best effort */ }

      setSelectedNeed((prev) => prev ? { ...prev, deliverables: prev.deliverables.map((d) => d.id === completeTarget.id ? { ...d, status: 'Completed', comments: notes } : d) } : null);
      setSuccess('Session marked as completed!');
      setCompleteTarget(null); setStudentCount(''); setNotes('');
    } catch { setError('Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleCancelSession = async () => {
    if (!cancelTarget || !selectedNeed || !cancelReason) { setError('Please select a reason.'); return; }
    setSaving(true);
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();
      await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${cancelTarget.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ needPlanId: selectedNeed.planId, status: 'Cancelled', comments: cancelReason, deliverableDate: cancelTarget.deliverableDate?.split('T')[0] || '' }),
      });
      setSelectedNeed((prev) => prev ? { ...prev, deliverables: prev.deliverables.map((d) => d.id === cancelTarget.id ? { ...d, status: 'Cancelled', comments: cancelReason } : d) } : null);
      setSuccess('Session cancelled.');
      setCancelTarget(null); setCancelReason('');
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
      await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/update/${rescheduleTarget.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ needPlanId: selectedNeed.planId, status: 'Rescheduled', comments: `Rescheduled to ${rescheduleDate}`, deliverableDate: rescheduleTarget.deliverableDate?.split('T')[0] || '' }),
      });
      await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/create`, {
        method: 'POST', headers,
        body: JSON.stringify({ needPlanId: selectedNeed.planId, status: 'Planned', comments: `Rescheduled from ${rescheduleTarget.deliverableDate?.split('T')[0]}`, deliverableDate: rescheduleDate }),
      });
      setSelectedNeed((prev) => prev ? { ...prev, deliverables: prev.deliverables.map((d) => d.id === rescheduleTarget.id ? { ...d, status: 'Rescheduled' } : d) } : null);
      setSuccess('Session rescheduled!');
      setRescheduleTarget(null); setRescheduleDate('');
    } catch { setError('Failed to reschedule.'); }
    finally { setSaving(false); }
  };

  // --- RENDER ---

  if (loading) {
    return <Stack spacing={2}><Skeleton height={120} variant="rounded" /><Skeleton height={120} variant="rounded" /></Stack>;
  }

  // Screen 1: Need cards (if multiple needs or none selected)
  if (!selectedNeed) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>My Sessions</Typography>
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

            {/* Previous Academic Years */}
            {previousNeeds.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                  Previous
                </Typography>
                <Grid container spacing={2}>
                  {previousNeeds.map((need) => (
                    <Grid item xs={12} sm={6} key={need.needId}>
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, cursor: 'pointer', opacity: 0.7, '&:hover': { opacity: 1 } }}
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
                  <Typography variant="body2"><strong>School:</strong> {selectedNeed.entityName}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2"><strong>Period:</strong> {selectedNeed.startDate} to {selectedNeed.endDate}</Typography>
              </Stack>
              {selectedNeed.days && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2"><strong>Days:</strong> {selectedNeed.days} · {formatTime(params?.startTime)} – {formatTime(params?.endTime)}</Typography>
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
              {params?.inputUrl && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Link href={params.inputUrl} target="_blank" variant="body2" underline="hover">Session Link</Link>
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Link href="https://drive.google.com/drive/folders/1Myhew2HIwPjtpr5ihD4jDY1HYZF_JgWG?usp=drive_link" target="_blank" variant="body2" underline="hover">Content Link</Link>
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
      </Paper>

      {/* Deliverables */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Sessions</Typography>
      <Tabs value={delivTab} onChange={(_, v) => setDelivTab(v)} sx={{ mb: 2 }}>
        <Tab label={`To-Do (${todoDelivs.length})`} />
        <Tab label={`Completed (${completedDelivs.length})`} />
        <Tab label={`Cancelled (${cancelledDelivs.length})`} />
      </Tabs>

      {/* To-Do */}
      {delivTab === 0 && (
        <Stack spacing={1}>
          {todoDelivs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>No pending sessions.</Typography>
          ) : todoDelivs.map((d, idx) => {
            const isToday = d.deliverableDate?.startsWith(todayStr);
            const future = isFutureDate(d.deliverableDate);
            return (
              <Paper key={d.id} variant="outlined" sx={{ p: 2, borderLeft: isToday ? '3px solid' : undefined, borderLeftColor: isToday ? 'primary.main' : undefined }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {isToday && <Chip label="Today" size="small" color="primary" />}
                    <Typography variant="body2" fontWeight={500}>
                      {selectedNeed.needName}: Session {idx + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {d.deliverableDate?.split('T')[0]}
                    </Typography>
                  </Stack>
                  {!future && (
                    <IconButton size="small" onClick={(e) => setActionMenu({ anchor: e.currentTarget, deliverable: d })}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                  {future && (
                    <Typography variant="caption" color="text.disabled">Upcoming</Typography>
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

      {/* Cancelled / Rescheduled */}
      {delivTab === 2 && (
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
        <MenuItem onClick={() => { setCompleteTarget(actionMenu!.deliverable); setActionMenu(null); }}>
          <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} /> Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => { setRescheduleTarget(actionMenu!.deliverable); setActionMenu(null); }}>
          <EventRepeatIcon fontSize="small" color="info" sx={{ mr: 1 }} /> Reschedule
        </MenuItem>
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
            <TextField label="New Date *" type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
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
