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
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Navigation happens via auth state change → App.tsx redirects based on role
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      // Clean up Firebase error messages for display
      const cleaned = message
        .replace('Firebase: ', '')
        .replace(/\(auth\/.*\)\.?/, '')
        .replace('Error ', '')
        .trim();
      setError(cleaned || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
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
      {/* Minimal top bar */}
      <Box sx={{ p: 2 }}>
        <Link component={RouterLink} to="/" underline="none">
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Sunbird Serve
          </Typography>
        </Link>
      </Box>

      {/* Login form centered */}
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
              <Stack spacing={3}>
                {/* Header */}
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to continue to your dashboard
                  </Typography>
                </Box>

                {/* Error alert */}
                {error && (
                  <Alert severity="error" onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {/* Login form */}
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
                      autoComplete="current-password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              aria-label={showPassword ? 'hide password' : 'show password'}
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box textAlign="right">
                      <Link
                        component={RouterLink}
                        to="/reset-password"
                        variant="body2"
                        underline="hover"
                      >
                        Forgot password?
                      </Link>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{ py: 1.5 }}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </Stack>
                </form>

                {/* Divider */}
                <Divider>
                  <Typography variant="caption" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Social login */}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  sx={{ py: 1.2 }}
                >
                  Continue with Google
                </Button>

                {/* Sign up links */}
                <Stack spacing={1} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Link
                      component={RouterLink}
                      to="/signup/volunteer"
                      variant="body2"
                      underline="hover"
                      fontWeight={600}
                    >
                      Volunteer Sign Up
                    </Link>
                    <Link
                      component={RouterLink}
                      to="/signup/coordinator"
                      variant="body2"
                      underline="hover"
                      fontWeight={600}
                    >
                      Coordinator Sign Up
                    </Link>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
