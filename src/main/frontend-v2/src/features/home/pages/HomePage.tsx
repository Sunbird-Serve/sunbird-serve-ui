import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Grid,
  Paper,
  Tab,
  Tabs,
  Alert,
  Divider,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '@features/auth';
import { getRoleConfig } from '@config/roles';

const impactItems = [
  {
    icon: <PublicIcon sx={{ fontSize: 36 }} />,
    title: 'Volunteering Beyond Boundaries',
    description:
      'Connect volunteers from diverse backgrounds with varied needs across geographical boundaries.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 36 }} />,
    title: 'Digital Public Good',
    description:
      'Adheres to DPG principles, ensuring open standards, privacy, and accessibility for all.',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 36 }} />,
    title: 'Community Empowerment',
    description:
      'Enables communities to self-organize and address their own service delivery challenges.',
  },
  {
    icon: <InsightsIcon sx={{ fontSize: 36 }} />,
    title: 'Data-Driven Insights',
    description:
      'Provides telemetry and analytics to optimize volunteer matching and service delivery.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { authenticated, roles, keycloakLogin } = useAuth();

  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');

  // If already authenticated, redirect based on role
  useEffect(() => {
    if (authenticated) {
      const role = roles.length > 0 ? roles[0] : undefined;
      const roleConfig = getRoleConfig(role);
      navigate(roleConfig?.defaultRoute || '/app/dashboard');
    }
  }, [authenticated, roles, navigate]);

  const handleLogin = () => {
    keycloakLogin();
  };

  const handleRegister = (type: 'volunteer' | 'coordinator') => {
    localStorage.setItem('pendingRegistrationType', type);
    import('@config/keycloak').then((mod) => {
      mod.default.register();
    });
  };

  const handleGoogleLogin = () => {
    import('@config/keycloak').then((mod) => {
      mod.default.login({ idpHint: 'google' });
    });
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 50%, #155E75 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          // Subtle pattern overlay
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left — Branding */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2.5}>
                <Typography
                  variant="overline"
                  sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}
                >
                  Sunbird Serve
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Translating Intent
                  <br />
                  to{' '}
                  <Box component="span" sx={{ color: '#FCD34D' }}>
                    Impact
                  </Box>
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 460, lineHeight: 1.7 }}
                >
                  An open-source platform that connects passionate volunteers to meaningful causes —
                  matching every verified need with the right skills, instantly and at scale.
                </Typography>
                <Button
                  variant="text"
                  sx={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline', alignSelf: 'flex-start', px: 0 }}
                  onClick={() => navigate('/explore-needs')}
                >
                  Explore Available Needs →
                </Button>
              </Stack>
            </Grid>

            {/* Right — Login/Signup Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  maxWidth: 420,
                  mx: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Tabs */}
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Login" />
                  <Tab label="Sign Up" />
                </Tabs>

                {/* Error */}
                {error && (
                  <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {/* Login Tab */}
                {tab === 0 && (
                  <Stack spacing={2.5}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Sign in to access your dashboard
                    </Typography>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleLogin}
                      sx={{ py: 1.5 }}
                    >
                      Sign In
                    </Button>

                    <Divider>
                      <Typography variant="caption" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<GoogleIcon />}
                      onClick={handleGoogleLogin}
                      sx={{ py: 1.2 }}
                    >
                      Continue with Google
                    </Button>
                  </Stack>
                )}

                {/* Sign Up Tab */}
                {tab === 1 && (
                  <Stack spacing={2.5}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Choose how you'd like to join
                    </Typography>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<VolunteerActivismIcon />}
                      onClick={() => handleRegister('volunteer')}
                      sx={{ py: 1.8, justifyContent: 'flex-start', px: 3 }}
                    >
                      <Stack alignItems="flex-start" sx={{ ml: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Volunteer
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                          Explore needs and contribute your skills
                        </Typography>
                      </Stack>
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<SchoolIcon />}
                      onClick={() => handleRegister('coordinator')}
                      sx={{ py: 1.8, justifyContent: 'flex-start', px: 3 }}
                    >
                      <Stack alignItems="flex-start" sx={{ ml: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Coordinator
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Manage needs and coordinate volunteers
                        </Typography>
                      </Stack>
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Intent to Impact Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="overline" color="primary.main" fontWeight={600}>
              Why Serve
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              Turning Intent into Impact
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              maxWidth={640}
              mx="auto"
              sx={{ mt: 1 }}
            >
              No community should wait while willing hands stand idle. SERVE channels untapped
              volunteer energy into real-world results — matching every verified need with the right
              skills, instantly and at scale.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {impactItems.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.title}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(14, 116, 144, 0.12)',
                    },
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{item.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          &copy; {new Date().getFullYear()} Sunbird Serve &middot; Open Source &middot; Digital
          Public Good
        </Typography>
      </Box>
    </Box>
  );
}
