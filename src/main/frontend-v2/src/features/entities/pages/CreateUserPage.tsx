import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useGetAgenciesQuery } from '@features/volunteers/api/volunteersApi';
import { getAuthHeadersWithJson } from '@shared/utils/authHeaders';

const VOLUNTEERING_BASE = import.meta.env.VITE_API_BASE_URL_VOLUNTEERING;

const ROLE_OPTIONS = [
  { value: 'nAdmin', label: 'Need Admin' },
  { value: 'vAdmin', label: 'Volunteer Admin' },
  { value: 'nCoordinator', label: 'Need Coordinator' },
  { value: 'vCoordinator', label: 'Volunteer Coordinator' },
  { value: 'Volunteer', label: 'Volunteer' },
];

export function CreateUserPage() {
  const { data: agencies = [] } = useGetAgenciesQuery();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !email.trim() || !mobile.trim() || !role || !agencyId) {
      setError('All fields are required.');
      return;
    }

    setSaving(true);
    try {
      const resp = await fetch(`${VOLUNTEERING_BASE}/api/v1/serve-volunteering/user/onboard`, {
        method: 'POST',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify({
          role: [role],
          agencyId,
          contactDetails: {
            email,
            mobile,
            address: { city: '', state: '', country: 'India' },
          },
          identityDetails: {
            fullname: fullName,
            name: fullName,
            gender: 'Others',
            dob: '2000-01-01',
            Nationality: 'India',
          },
          status: 'Active',
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error(data?.message || `Failed to create user (${resp.status})`);
      }

      setSuccess(`User "${fullName}" created successfully with role ${role}. Login credentials sent to their mobile.`);
      // Reset form
      setFullName('');
      setEmail('');
      setMobile('');
      setRole('');
      setAgencyId('');
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <PersonAddIcon color="primary" />
        <Typography variant="h4" fontWeight={600}>Create User</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
        Create a new user with a specific role and agency. A Keycloak account will be created
        with the mobile number as the default password.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                fullWidth
                required
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Role"
                select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                fullWidth
                required
              >
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Agency"
                select
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
                fullWidth
                required
              >
                {agencies.map((a) => (
                  <MenuItem key={a.osid} value={a.osid}>{a.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
                startIcon={<PersonAddIcon />}
                sx={{ px: 4 }}
              >
                {saving ? 'Creating...' : 'Create User'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
