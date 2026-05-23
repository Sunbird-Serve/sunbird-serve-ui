import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import {
  VolunteerUser,
  Agency,
  useUpdateVolunteerStatusMutation,
  useAssignAgencyMutation,
} from '../api/volunteersApi';

const STATUS_OPTIONS = ['Registered', 'Recommended', 'OnHold', 'Active'];

interface VolunteerDetailDialogProps {
  volunteer: VolunteerUser | null;
  agencies: Agency[];
  isAdmin: boolean;
  onClose: () => void;
}

export function VolunteerDetailDialog({ volunteer, agencies, isAdmin, onClose }: VolunteerDetailDialogProps) {
  const [updateStatus, { isLoading: statusSaving }] = useUpdateVolunteerStatusMutation();
  const [assignAgency, { isLoading: agencySaving }] = useAssignAgencyMutation();

  const [newStatus, setNewStatus] = useState(volunteer?.status || '');
  const [newAgencyId, setNewAgencyId] = useState(volunteer?.agencyId || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!volunteer) return null;

  const name = volunteer.identityDetails?.fullname || volunteer.identityDetails?.name || '—';
  const email = volunteer.contactDetails?.email || '—';
  const phone = volunteer.contactDetails?.mobile || '—';
  const city = volunteer.contactDetails?.address?.city || '—';
  const gender = volunteer.identityDetails?.gender || '—';
  const dob = volunteer.identityDetails?.dob || '—';
  const currentAgency = agencies.find((a) => a.osid === volunteer.agencyId);

  const handleStatusSave = async () => {
    if (!newStatus || newStatus === volunteer.status) return;
    setError('');
    try {
      await updateStatus({ userId: volunteer.osid, status: newStatus }).unwrap();
      setSuccess('Status updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleAgencySave = async () => {
    if (!newAgencyId) return;
    setError('');
    try {
      await assignAgency({ userId: volunteer.osid, agencyId: newAgencyId }).unwrap();
      setSuccess('Agency assigned.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to assign agency.');
    }
  };

  return (
    <Dialog open={Boolean(volunteer)} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ px: 3, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>{name}</Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, mb: 1 }}>
          <StatusChip status={volunteer.status || 'Registered'} />
          {currentAgency && <Chip label={currentAgency.name} size="small" variant="outlined" />}
        </Stack>
      </Box>

      <DialogContent>
        <Stack spacing={3}>
          {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

          {/* Profile Info */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Profile</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2">{email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body2">{phone}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">City</Typography>
                <Typography variant="body2">{city}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Gender</Typography>
                <Typography variant="body2">{gender}</Typography>
              </Grid>
              {dob && dob !== '—' && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body2">{dob}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          {/* Change Status */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Change Status</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
                InputLabelProps={{ shrink: true }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                size="small"
                onClick={handleStatusSave}
                disabled={statusSaving || newStatus === volunteer.status}
              >
                {statusSaving ? 'Saving...' : 'Update'}
              </Button>
            </Stack>
          </Box>

          {/* Assign Agency (admin only) */}
          {isAdmin && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Assign Agency
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    select
                    value={newAgencyId}
                    onChange={(e) => setNewAgencyId(e.target.value)}
                    size="small"
                    sx={{ minWidth: 220 }}
                    InputLabelProps={{ shrink: true }}
                    label="Agency"
                  >
                    <MenuItem value="">Select Agency</MenuItem>
                    {agencies.map((a) => (
                      <MenuItem key={a.osid} value={a.osid}>{a.name}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAgencySave}
                    disabled={agencySaving || !newAgencyId}
                  >
                    {agencySaving ? 'Saving...' : 'Assign'}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
