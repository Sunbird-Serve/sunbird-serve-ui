import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Button,
  Chip,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useAppSelector } from '@app/store';
import { useGetVolunteerProfileQuery, useUpdateVolunteerProfileMutation } from '../api/exploreApi';

export function VolunteerProfilePage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const { data: profile, isLoading } = useGetVolunteerProfileQuery(userId, { skip: !userId });
  const [updateProfile, { isLoading: saving }] = useUpdateVolunteerProfileMutation();

  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Editable fields from user state
  const [phone, setPhone] = useState(user?.contactDetails?.mobile || '');
  const [city, setCity] = useState(user?.contactDetails?.address?.city || '');

  const fullName = user?.identityDetails?.fullname || user?.identityDetails?.name || '—';
  const email = user?.contactDetails?.email || '—';

  const handleSave = async () => {
    setError('');
    try {
      // Update profile preferences if needed
      await updateProfile({
        userId,
        body: {
          ...profile,
          userId,
        },
      }).unwrap();
      setSuccess('Profile updated.');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update profile.');
    }
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={60} variant="rounded" />
        <Skeleton height={200} variant="rounded" />
      </Stack>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          My Profile
        </Typography>
        {!editing ? (
          <Button size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : (
          <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Personal Info */}
      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Personal Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Name</Typography>
            <Typography variant="body1" fontWeight={500}>{fullName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body1">{email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            {editing ? (
              <TextField
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <Typography variant="body1">{user?.contactDetails?.mobile || '—'}</Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">City</Typography>
            {editing ? (
              <TextField
                value={city}
                onChange={(e) => setCity(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <Typography variant="body1">{user?.contactDetails?.address?.city || '—'}</Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Skills & Preferences */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Skills & Preferences
        </Typography>
        <Stack spacing={2}>
          {profile?.genericDetails?.qualification && (
            <Box>
              <Typography variant="caption" color="text.secondary">Qualification</Typography>
              <Typography variant="body2">{profile.genericDetails.qualification}</Typography>
            </Box>
          )}
          {profile?.genericDetails?.employmentStatus && (
            <Box>
              <Typography variant="caption" color="text.secondary">Employment</Typography>
              <Typography variant="body2">{profile.genericDetails.employmentStatus}</Typography>
            </Box>
          )}
          {profile?.userPreference?.language && profile.userPreference.language.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Languages</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                {profile.userPreference.language.map((lang) => (
                  <Chip key={lang} label={lang} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
          {profile?.userPreference?.interestArea && profile.userPreference.interestArea.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Interests</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                {profile.userPreference.interestArea.map((area) => (
                  <Chip key={area} label={area} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
          {profile?.userPreference?.dayPreferred && profile.userPreference.dayPreferred.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Preferred Days</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                {profile.userPreference.dayPreferred.map((day) => (
                  <Chip key={day} label={day} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
          {profile?.skills && profile.skills.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Skills</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                {profile.skills.map((skill, i) => (
                  <Chip key={i} label={`${skill.skillName} (${skill.skillLevel})`} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
          {!profile && (
            <Typography variant="body2" color="text.secondary">
              No profile details available yet.
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
