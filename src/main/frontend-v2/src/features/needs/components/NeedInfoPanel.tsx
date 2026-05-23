import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  MenuItem,
  Button,
  Chip,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { NeedListItem, TimeSlot, useUpdateNeedMutation } from '../api/needsApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface NeedInfoPanelProps {
  need: NeedListItem;
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

export function NeedInfoPanel({ need }: NeedInfoPanelProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [startDate, setStartDate] = useState(need.occurrence?.startDate?.substring(0, 10) || '');
  const [endDate, setEndDate] = useState(need.occurrence?.endDate?.substring(0, 10) || '');
  const [timeSlots, setTimeSlots] = useState<{ day: string; startTime: string; endTime: string }[]>(
    need.occurrence?.timeSlots?.map((s) => ({
      day: s.day,
      startTime: s.startTime?.substring(11, 16) || '10:00',
      endTime: s.endTime?.substring(11, 16) || '11:00',
    })) ||
      need.timeSlots?.map((s) => ({
        day: s.day,
        startTime: s.startTime?.substring(11, 16) || '10:00',
        endTime: s.endTime?.substring(11, 16) || '11:00',
      })) ||
      [],
  );

  const [updateNeed] = useUpdateNeedMutation();

  const canEdit = need.need.status === 'New' || need.need.status === 'Approved' || need.need.status === 'Assigned';

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
    setError('');
    setSaving(true);
    try {
      // Build the update payload
      const formattedSlots: TimeSlot[] = timeSlots.map((s) => ({
        day: s.day,
        startTime: `${startDate}T${s.startTime}:00.000Z`,
        endTime: `${startDate}T${s.endTime}:00.000Z`,
      }));

      const payload = {
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
      };

      await updateNeed({ needId: need.need.id, body: payload }).unwrap();

      // Also update all deliverable timings and days
      // Get needPlanId from need-plan endpoint, then reschedule
      if (timeSlots.length > 0) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        try {
          const planResp = await fetch(
            `${BASE_URL}/api/v1/serve-need/need-plan/${need.need.id}`,
          );
          if (planResp.ok) {
            const planData = await planResp.json();
            const plans = Array.isArray(planData) ? planData : (planData.content || []);
            if (plans.length > 0) {
              const planId = plans[0]?.plan?.id || plans[0]?.id || '';
              if (planId) {
                // Call reschedule API to update days and times
                const formattedSlotsForReschedule = timeSlots.map((s) => ({
                  day: s.day,
                  startTime: s.startTime,
                  endTime: s.endTime,
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
          // Non-critical — need update succeeded, reschedule is best-effort
        }
      }

      setSuccess('Need schedule updated. All remaining sessions will use the new timings.');
      setEditing(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to update need schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Need Info (read-only) */}
      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Need Details
        </Typography>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography variant="body2" fontWeight={500}>{need.need.name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Type</Typography>
              <Typography variant="body2">{need.needType?.name || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Entity</Typography>
              <Typography variant="body2">{need.entity?.name || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <StatusChip status={need.need.status} />
            </Box>
          </Stack>
          {need.need.description && (
            <Box>
              <Typography variant="caption" color="text.secondary">Description</Typography>
              <Typography variant="body2">{need.need.description}</Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Schedule Section */}
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Session Schedule
          </Typography>
          {canEdit && !editing && (
            <Button size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
              Modify Schedule
            </Button>
          )}
        </Stack>

        {!editing ? (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="caption" color="text.secondary">Start Date</Typography>
                <Typography variant="body2">{startDate || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">End Date</Typography>
                <Typography variant="body2">{endDate || '—'}</Typography>
              </Box>
            </Stack>
            <Box>
              <Typography variant="caption" color="text.secondary">Time Slots</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot, i) => (
                    <Chip
                      key={i}
                      label={`${slot.day} ${formatTime(`${slot.startTime}:00`)}–${formatTime(`${slot.endTime}:00`)}`}
                      size="small"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No schedule set</Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>Time Slots</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addSlot}>Add</Button>
            </Stack>

            {timeSlots.map((slot, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  value={slot.day}
                  onChange={(e) => updateSlot(index, 'day', e.target.value)}
                  size="small"
                  sx={{ minWidth: 130 }}
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
            ))}

            <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
              Changing the schedule will update timings for all remaining sessions.
            </Alert>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save & Update All Sessions'}
              </Button>
              <Button variant="text" size="small" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
