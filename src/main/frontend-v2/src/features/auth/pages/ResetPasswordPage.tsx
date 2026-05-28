import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Link,
  Container,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/AuthContext';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      const cleaned = message
        .replace('Firebase: ', '')
        .replace(/\(auth\/.*\)\.?/, '')
        .trim();
      setError(cleaned || 'Could not send reset email. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <Box sx={{ p: 2 }}>
        <Link component={RouterLink} to="/" underline="none">
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Sunbird Serve
          </Typography>
        </Link>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ maxWidth: 440, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {!sent ? (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Reset Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enter your email address and we&apos;ll send you a link to reset your
                      password.
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                      <TextField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                        autoComplete="email"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        sx={{ py: 1.5 }}
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </Stack>
                  </form>

                  <Box textAlign="center">
                    <Link
                      component={RouterLink}
                      to="/login"
                      variant="body2"
                      underline="hover"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <ArrowBackIcon fontSize="small" />
                      Back to Login
                    </Link>
                  </Box>
                </Stack>
              ) : (
                // Success state
                <Stack spacing={3} alignItems="center" textAlign="center">
                  <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Check Your Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We&apos;ve sent a password reset link to{' '}
                      <strong>{email}</strong>. Please check your inbox and follow the instructions.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSent(false);
                      setEmail('');
                    }}
                  >
                    Send Again
                  </Button>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    underline="hover"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <ArrowBackIcon fontSize="small" />
                    Back to Login
                  </Link>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
