import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { getApiErrorMessage } from '@features/needs/api/needsApi';
import {
  VolunteerUser,
  useDeleteUserMutation,
  useDeleteUserProfileMutation,
  useUpdateVolunteerStatusMutation,
} from '../api/volunteersApi';

interface DeleteUserDialogProps {
  user: VolunteerUser | null;
  onClose: () => void;
  // Called after the user is gone (or set Inactive) so the caller can refresh and show a message
  onDone: (message: string) => void;
}

// Super-admin only. Deletes the user together with all of their profiles.
export function DeleteUserDialog({ user, onClose, onDone }: DeleteUserDialogProps) {
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [updateStatus, { isLoading: inactivating }] = useUpdateVolunteerStatusMutation();
  const [error, setError] = useState('');
  const [offerInactive, setOfferInactive] = useState(false);
  const busy = deleting || inactivating;

  useEffect(() => {
    setError('');
    setOfferInactive(false);
  }, [user?.osid]);

  if (!user) return null;

  const name = user.identityDetails?.fullname || user.identityDetails?.name || 'this user';
  const email = user.contactDetails?.email || '';

  const handleDelete = async () => {
    setError('');
    setOfferInactive(false);
    try {
      await deleteUser({ userId: user.osid }).unwrap();
      onDone(`${name} was deleted.`);
    } catch (err) {
      const { status, message } = getApiErrorMessage(err);
      if (status === 404) {
        // Already gone: treat as deleted
        onDone(`${name} no longer exists.`);
      } else if (status === 409) {
        setError(message);
        setOfferInactive(true);
      } else if (status === 401 || status === 403) {
        setError('You are not allowed to delete this user.');
      } else {
        setError(message);
      }
    }
  };

  const handleInactive = async () => {
    setError('');
    try {
      await updateStatus({ user, status: 'Inactive' }).unwrap();
      onDone(`${name} was set to Inactive.`);
    } catch (err) {
      setError(getApiErrorMessage(err).message);
    }
  };

  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete user</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          Delete <strong>{name}</strong>{email ? ` (${email})` : ''}? This also deletes their profile and cannot be undone.
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          The person&apos;s login account is not deleted. Needs, nominations and fulfillments linked to this user are
          not checked or removed.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        {offerInactive && (
          <Button onClick={handleInactive} disabled={busy} variant="outlined">
            {inactivating ? 'Saving...' : 'Set to Inactive'}
          </Button>
        )}
        <Button onClick={handleDelete} disabled={busy} color="error" variant="contained">
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface DeleteProfileDialogProps {
  open: boolean;
  name: string;
  profileId: string;
  onClose: () => void;
  onDone: (message: string) => void;
}

// Super-admin only. Deletes one volunteer profile (the user stays).
export function DeleteProfileDialog({ open, name, profileId, onClose, onDone }: DeleteProfileDialogProps) {
  const [deleteProfile, { isLoading }] = useDeleteUserProfileMutation();
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) setError('');
  }, [open, profileId]);

  const handleDelete = async () => {
    setError('');
    try {
      await deleteProfile({ profileId }).unwrap();
      onDone(`The profile of ${name} was deleted.`);
    } catch (err) {
      const { status, message } = getApiErrorMessage(err);
      if (status === 404) onDone('That profile no longer exists.');
      else if (status === 401 || status === 403) setError('You are not allowed to delete this profile.');
      else setError(message);
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete profile</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2">
          Delete the volunteer profile of <strong>{name}</strong>? Their account stays, but their qualification,
          languages, interests and availability are removed. This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleDelete} disabled={isLoading} color="error" variant="contained">
          {isLoading ? 'Deleting...' : 'Delete profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
