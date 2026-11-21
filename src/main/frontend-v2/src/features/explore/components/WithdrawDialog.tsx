import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { getApiErrorMessage, useDropVolunteerMutation } from '@features/needs/api/needsApi';

const REASONS = [
  'Schedule conflict',
  'Work or study commitments',
  'Health or personal reasons',
  'Relocating',
  'Technical or connectivity issues',
  'Other',
];

export interface WithdrawTarget {
  nominationId: string;
  needName: string;
  schoolName?: string;
}

interface WithdrawDialogProps {
  target: WithdrawTarget | null;
  onClose: () => void;
  // Called after the volunteer has been dropped (or the nomination no longer exists)
  onDone: (message: string) => void;
}

// A volunteer leaving a school they are assigned to. This uses the same drop-volunteer call
// coordinators use, so the server pauses the upcoming sessions and resets the need.
export function WithdrawDialog({ target, onClose, onDone }: WithdrawDialogProps) {
  const [dropVolunteer, { isLoading }] = useDropVolunteerMutation();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setReason('');
    setDetails('');
    setError('');
  }, [target?.nominationId]);

  if (!target) return null;

  // A reason is required; "Other" also needs details
  const canSubmit = !isLoading && reason !== '' && (reason !== 'Other' || details.trim() !== '');

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    // The prefix tells coordinators this was the volunteer's own decision
    const comments = `Withdrawn by volunteer: ${[reason, details.trim()].filter(Boolean).join(': ')}`;
    try {
      await dropVolunteer({ nominationId: target.nominationId, comments }).unwrap();
      onDone(`You have withdrawn from ${target.needName}. Your upcoming sessions are paused.`);
    } catch (err) {
      const { status, message } = getApiErrorMessage(err);
      if (status === 403) setError('You are not allowed to withdraw from this school.');
      else if (status === 404) onDone('That assignment no longer exists.');
      else setError(message);
    }
  };

  return (
    <Dialog open onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Withdraw from this school?</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" fontWeight={600}>{target.needName}</Typography>
        {target.schoolName && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {target.schoolName}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 1.5, mb: 2 }}>
          Your upcoming sessions will be paused so your coordinator can find a replacement. Sessions you have
          already completed stay in your history. This cannot be undone.
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          label="Reason *"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        >
          {REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>
        <TextField
          fullWidth
          size="small"
          multiline
          rows={2}
          label={reason === 'Other' ? 'Details *' : 'Details (optional)'}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>Keep my place</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit} color="error" variant="contained">
          {isLoading ? 'Withdrawing...' : 'Withdraw'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
