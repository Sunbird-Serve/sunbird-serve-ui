import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Container,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '@app/store';
import { fetchUserByEmail } from '../state/userSlice';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;
const GENDER_OPTIONS = ['Male', 'Female', 'Transgender', 'Others'];

export function CoordinatorRegistrationPage() {
  const { user, agencyId } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const email = user?.email || '';
  // This is the coordinator registration page — always use nCoordinator role
  // (Keycloak token may only have default realm roles at this point)
  const role = 'nCoordinator';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !gender || !mobile.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();

      const payload = {
        identityDetails: {
          fullname: firstName,
          name: lastName,
          gender,
          dob: '2000-01-01',
          Nationality: 'India',
        },
        contactDetails: {
          email,
          mobile,
          address: { city: '', state: '', country: 'India' },
        },
        agencyId: agencyId || '9270607102',
        status: 'Active',
        role: [role],
      };

      const resp = await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error('Failed to create account. Please try again.');
      }

      // Re-fetch user to update Redux state
      const encodedEmail = email.replace(/@/g, '%40');
      await dispatch(fetchUserByEmail(encodedEmail)).unwrap();

      // Force token refresh to pick up the newly assigned nCoordinator role
      try {
        const keycloak = (await import('@config/keycloak')).default;
        await keycloak.updateToken(-1);
      } catch {
        // If refresh fails, navigate anyway — role will be available on next login
      }

      // Navigate to coordinator dashboard
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary.main">Sunbird Serve</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Container maxWidth="sm">
          <Card sx={{ maxWidth: 480, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={700} gutterBottom>Complete Your Profile</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please fill in your basic details to get started as a Need Coordinator.
                  </Typography>
                </Box>

                {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        placeholder="Enter first name"
                      />
                      <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        placeholder="Enter last name"
                      />
                    </Stack>
                    <TextField
                      label="Gender"
                      select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <MenuItem key={g} value={g}>{g}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Mobile Number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      placeholder="+91 9876543210"
                    />
                    <TextField
                      label="Email"
                      value={email}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled
                      helperText="From your login account"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{ py: 1.5 }}
                    >
                      {loading ? 'Creating...' : 'Complete Registration'}
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
