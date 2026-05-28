import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@config/firebase';

export function SignUpPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const isCoordinator = type === 'coordinator';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Store email for the registration form
      localStorage.setItem('regEmail', email);
      setSuccess(true);

      // Redirect to profile completion after a brief pause
      setTimeout(() => {
        if (isCoordinator) {
          navigate('/register/coordinator-profile');
        } else {
          navigate('/register/volunteer-profile');
        }
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      if (message.includes('email-already-in-use')) {
        setError('This email is already registered. Please log in or use a different email.');
      } else if (message.includes('weak-password')) {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        const cleaned = message
          .replace('Firebase: ', '')
          .replace(/\(auth\/.*\)\.?/, '')
          .trim();
        setError(cleaned || 'Sign up failed. Please try again.');
      }
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

      {/* Form */}
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
          <Card sx={{ maxWidth: 480, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                {/* Header */}
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Create Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isCoordinator
                      ? 'Sign up as a Coordinator to manage needs and volunteers'
                      : 'Sign up as a Volunteer to explore and fulfill needs'}
                  </Typography>
                </Box>

                {/* Success state */}
                {success && (
                  <Alert severity="success">
                    Account created successfully! Redirecting to complete your profile...
                  </Alert>
                )}

                {/* Error */}
                {error && (
                  <Alert severity="error" onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {/* Form */}
                {!success && (
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
                      <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                        autoComplete="new-password"
                        helperText="At least 6 characters"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                                aria-label={showPassword ? 'hide password' : 'show password'}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        fullWidth
                        autoComplete="new-password"
                        error={confirmPassword.length > 0 && password !== confirmPassword}
                        helperText={
                          confirmPassword.length > 0 && password !== confirmPassword
                            ? 'Passwords do not match'
                            : ''
                        }
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        sx={{ py: 1.5 }}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Stack>
                  </form>
                )}

                {/* Footer links */}
                <Stack spacing={1} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
                      Sign In
                    </Link>
                  </Typography>
                  {!isCoordinator && (
                    <Typography variant="body2" color="text.secondary">
                      Want to coordinate?{' '}
                      <Link
                        component={RouterLink}
                        to="/signup/coordinator"
                        underline="hover"
                        fontWeight={600}
                      >
                        Coordinator Sign Up
                      </Link>
                    </Typography>
                  )}
                  {isCoordinator && (
                    <Typography variant="body2" color="text.secondary">
                      Want to volunteer?{' '}
                      <Link
                        component={RouterLink}
                        to="/signup/volunteer"
                        underline="hover"
                        fontWeight={600}
                      >
                        Volunteer Sign Up
                      </Link>
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
