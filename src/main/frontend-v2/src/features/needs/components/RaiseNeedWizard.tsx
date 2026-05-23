import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Stack,
  MenuItem,
  Typography,
  Alert,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { NeedTypeItem, EntityItem, TimeSlot, RaiseNeedPayload } from '../api/needsApi';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const steps = ['Need Info', 'Session Schedule', 'Review & Submit'];

interface RaiseNeedWizardProps {
  needTypes: NeedTypeItem[];
  entities: EntityItem[];
  userId: string;
  loading?: boolean;
  onSubmit: (payload: RaiseNeedPayload) => void;
  onCancel: () => void;
}

export function RaiseNeedWizard({
  needTypes,
  entities,
  userId,
  loading = false,
  onSubmit,
  onCancel,
}: RaiseNeedWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');

  // Step 1: Need Info
  const [needName, setNeedName] = useState('');
  const [needTypeId, setNeedTypeId] = useState('');
  const [entityId, setEntityId] = useState('');

  // Auto-select "Online Teaching" when needTypes load
  useEffect(() => {
    if (!needTypeId && needTypes.length > 0) {
      const onlineType = needTypes.find((nt) => nt.name === 'Online Teaching');
      if (onlineType) {
        setNeedTypeId(onlineType.id);
      }
    }
  }, [needTypes, needTypeId]);

  // Step 2: Session Schedule
  const today = dayjs().format('YYYY-MM-DD');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(dayjs().add(6, 'month').format('YYYY-MM-DD'));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { day: 'Monday', startTime: '10:00', endTime: '11:00' },
    { day: 'Tuesday', startTime: '10:00', endTime: '11:00' },
  ]);

  const handleNext = () => {
    setError('');
    if (activeStep === 0) {
      if (!needName.trim() || !needTypeId || !entityId) {
        setError('Please fill in all required fields.');
        return;
      }
    }
    if (activeStep === 1) {
      if (!startDate || !endDate) {
        setError('Please select start and end dates.');
        return;
      }
      if (timeSlots.length === 0) {
        setError('Please add at least one time slot.');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { day: 'Tuesday', startTime: '10:00', endTime: '11:00' }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleSubmit = () => {
    // Build entity name for purpose/description
    const entityObj = entities.find((e) => e.id === entityId);
    const entityName = entityObj?.name || '';
    const purposeText = `${needName} ${entityName}`;

    // Convert time slots to ISO format
    const formattedSlots = timeSlots.map((slot) => ({
      day: slot.day,
      startTime: `${startDate}T${slot.startTime}:00.000Z`,
      endTime: `${startDate}T${slot.endTime}:00.000Z`,
    }));

    const payload: RaiseNeedPayload = {
      needRequest: {
        needTypeId,
        name: needName,
        needPurpose: purposeText,
        description: purposeText,
        status: 'New',
        userId,
        entityId,
      },
      needRequirementRequest: {
        skillDetails: '',
        volunteersRequired: '',
        occurrence: {
          startDate: `${startDate}T09:00:00.000Z`,
          endDate: `${endDate}T17:00:00.000Z`,
          days: formattedSlots.map((s) => s.day).join(','),
          frequency: 'off',
          timeSlots: formattedSlots,
        },
        priority: '',
      },
    };

    onSubmit(payload);
  };

  const selectedNeedType = needTypes.find((nt) => nt.id === needTypeId);
  const selectedEntity = entities.find((e) => e.id === entityId);

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Step 1: Need Info */}
      {activeStep === 0 && (
        <Stack spacing={3}>
          <TextField
            label="Need Name"
            value={needName}
            onChange={(e) => setNeedName(e.target.value)}
            required
            fullWidth
            placeholder="e.g. Grade 5 Science"
            helperText="Format: Grade Subject"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Need Type"
            select
            value={needTypeId}
            onChange={(e) => setNeedTypeId(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="" disabled>Select Need Type</MenuItem>
            {needTypes.map((nt) => (
              <MenuItem key={nt.id} value={nt.id}>{nt.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Entity"
            select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText={entities.length === 0 ? 'No entities found. Please onboard an entity first.' : ''}
          >
            <MenuItem value="" disabled>Select Entity</MenuItem>
            {entities.map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
            ))}
          </TextField>
        </Stack>
      )}

      {/* Step 2: Session Schedule */}
      {activeStep === 1 && (
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Session Time Slots</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addTimeSlot}>
                Add Slot
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {timeSlots.map((slot, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                      select
                      label="Day"
                      value={slot.day}
                      onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                      size="small"
                      sx={{ minWidth: 140 }}
                      InputLabelProps={{ shrink: true }}
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="End Time"
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    {timeSlots.length > 1 && (
                      <IconButton size="small" color="error" onClick={() => removeTimeSlot(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      )}

      {/* Step 3: Review */}
      {activeStep === 2 && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Need Info</Typography>
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Name:</strong> {needName}</Typography>
              <Typography variant="body2"><strong>Type:</strong> {selectedNeedType?.name || '—'}</Typography>
              <Typography variant="body2"><strong>Entity:</strong> {selectedEntity?.name || '—'}</Typography>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Session Schedule</Typography>
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Period:</strong> {startDate} → {endDate}</Typography>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Time Slots:</strong></Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {timeSlots.map((slot, i) => (
                    <Chip
                      key={i}
                      label={`${slot.day} ${slot.startTime}–${slot.endTime}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* Navigation */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button variant="text" onClick={activeStep === 0 ? onCancel : handleBack}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Raise Need'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
