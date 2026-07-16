import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NeedListItem, TimeSlot, useUpdateNeedMutation } from '../api/needsApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ModifyScheduleDialogProps {
  need: NeedListItem | null;
  onClose: () => void;
}

export function ModifyScheduleDialog({ need, onClose }: ModifyScheduleDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [timeSlots, setTimeSlots] = useState<{ day: string; startTime: string; endTime: string }[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [updateNeed] = useUpdateNeedMutation();

  // Initialize from need data
  useEffect(() => {
    if (!need) return;
    const occ = need.occurrence;
    const slots = occ?.timeSlots || need.timeSlots || [];
    setStartDate(occ?.startDate?.substring(0, 10) || '');
    setEndDate(occ?.endDate?.substring(0, 10) || '');
    setTimeSlots(
      slots.length > 0
        ? slots.map((s) => ({
            day: s.day,
            startTime: s.startTime?.substring(11, 16) || '10:00',
            endTime: s.endTime?.substring(11, 16) || '11:00',
          }))
        : [{ day: 'Monday', startTime: '10:00', endTime: '11:00' }],
    );
  }, [need]);

  if (!need) return null;

  const addSlot = () => {
    setTimeSlots([...timeSlots, { day: 'Monday', startTime: '10:00', endTime: '11:00' }]);
  };

  const removeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleSave = async () => {
    if (timeSlots.length === 0) {
      setError('Add at least one time slot.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Build formatted time slots
      const formattedSlots: TimeSlot[] = timeSlots.map((s) => ({
        day: s.day,
        startTime: `${startDate}T${s.startTime}:00.000Z`,
        endTime: `${startDate}T${s.endTime}:00.000Z`,
      }));

      // Update need
      await updateNeed({
        needId: need.need.id,
        body: {
          needRequest: {
            needTypeId: need.need.needTypeId || '',
            name: need.need.name,
            needPurpose: need.need.needPurpose || '',
            description: need.need.description || '',
            status: need.need.status,
            userId: need.need.userId,
            entityId: need.need.entityId || '',
          },
          needRequirementRequest: {
            skillDetails: need.needRequirement?.skillDetails || '',
            volunteersRequired: need.needRequirement?.volunteersRequired || '',
            occurrence: {
              startDate: `${startDate}T09:00:00.000Z`,
              endDate: `${endDate}T17:00:00.000Z`,
              days: formattedSlots.map((s) => s.day).join(','),
              frequency: 'off',
              timeSlots: formattedSlots,
            },
            priority: need.needRequirement?.priority || '',
          },
        },
      }).unwrap();

      // Also reschedule deliverables with new days/times
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();
      try {
        const planResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${need.need.id}`, { headers });
        if (planResp.ok) {
          const planData = await planResp.json();
          const plans = Array.isArray(planData) ? planData : (planData.content || []);
          if (plans.length > 0) {
            // Filter out Inactive plans, pick the active one
            const activePlans = plans.filter((p: Record<string, unknown>) => {
              const status = (p?.plan as Record<string, unknown>)?.status as string || p?.status as string || '';
              return status !== 'Inactive';
            });
            const activePlan = activePlans.length > 0 ? activePlans[0] : plans[0];
            const planId = activePlan?.plan?.id || activePlan?.id || '';
            if (planId) {
              // Call reschedule API
              const formattedSlotsForReschedule = timeSlots.map((s) => ({
                day: s.day,
                startTime: `${startDate}T${s.startTime}:00.000Z`,
                endTime: `${startDate}T${s.endTime}:00.000Z`,
              }));

              await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${planId}/reschedule`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                  days: timeSlots.map((s) => s.day).join(','),
                  timeSlots: formattedSlotsForReschedule,
                }),
              });
            }
          }
        }
      } catch {
        // Best-effort for reschedule
      }

      setSuccess('Schedule updated for all sessions.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setError('Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(need)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Modify Schedule — {need.need.name}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {/* Dates */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* Time slots */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Session Days & Times</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addSlot}>Add</Button>
          </Stack>

          {timeSlots.map((slot, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  value={slot.day}
                  onChange={(e) => updateSlot(index, 'day', e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                {timeSlots.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => removeSlot(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Paper>
          ))}

          <Alert severity="info" variant="outlined">
            This will update timings for all remaining sessions.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Update All'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
