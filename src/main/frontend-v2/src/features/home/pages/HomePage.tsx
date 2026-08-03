import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Grid,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '@features/auth';
import { getRoleConfig } from '@config/roles';
import { useAppSelector } from '@app/store';

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
  const backendUser = useAppSelector((state) => state.user.data);

  const handleLogin = () => {
    keycloakLogin();
  };

  const [signUpAnchor, setSignUpAnchor] = useState<null | HTMLElement>(null);

  const handleRegister = (type: 'volunteer' | 'coordinator') => {
    setSignUpAnchor(null);
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

  // If already authenticated AND has roles, redirect based on role
  useEffect(() => {
    if (!authenticated) return;
    const effectiveRoles = roles.length > 0 ? roles : (backendUser?.role || []);
    if (effectiveRoles.length > 0) {
      const role = effectiveRoles[0];
      const roleConfig = getRoleConfig(role);
      navigate(roleConfig?.defaultRoute || '/app/dashboard');
    }
  }, [authenticated, roles, backendUser?.role, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 50%, #155E75 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        {/* Top bar with login */}
        <Box sx={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <img src="/icons/serve-logo.jpeg" alt="SERVE" style={{ height: 28, width: 28, borderRadius: 4 }} />
                <Typography variant="subtitle1" fontWeight={700}>SERVE</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'none', sm: 'block' } }}>
                  Already using SERVE?
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleLogin}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none', fontWeight: 600 }}
                >
                  Sign In
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => setSignUpAnchor(e.currentTarget)}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }, textTransform: 'none' }}
                >
                  Sign Up
                </Button>
                <Menu
                  anchorEl={signUpAnchor}
                  open={Boolean(signUpAnchor)}
                  onClose={() => setSignUpAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => handleRegister('volunteer')}>
                    <Stack>
                      <Typography variant="body2" fontWeight={600}>Volunteer</Typography>
                      <Typography variant="caption" color="text.secondary">Explore needs & contribute</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem onClick={() => handleRegister('coordinator')}>
                    <Stack>
                      <Typography variant="body2" fontWeight={600}>Coordinator</Typography>
                      <Typography variant="caption" color="text.secondary">Manage needs & volunteers</Typography>
                    </Stack>
                  </MenuItem>
                </Menu>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }, textTransform: 'none', display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Google
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Main hero content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 5 } }}>
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' }, lineHeight: 1.2 }}
            >
              Transforming Intent to{' '}
              <Box component="span" sx={{ color: '#FCD34D' }}>Impact</Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 560, lineHeight: 1.7 }}
            >
              Whether you're ready to volunteer or looking for volunteer teachers,
              SERVE connects people with purpose.
            </Typography>
          </Stack>

          {/* Two cards side by side */}
          <Grid container spacing={3} justifyContent="center">
            {/* Volunteer Card */}
            <Grid item xs={12} sm={6} md={5}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  🤝 I Want to Volunteer
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
                  Help students learn online.
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Find where you can help</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Get matched with students</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Start teaching online</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none', fontWeight: 600 }}
                    href={import.meta.env.VITE_VOLUNTEER_AGENT_WEB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start on Web
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#1DA851' }, textTransform: 'none', fontWeight: 600 }}
                    href={import.meta.env.VITE_VOLUNTEER_AGENT_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start on WhatsApp
                  </Button>
                </Stack>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                  No sign-up required to explore.
                </Typography>
              </Paper>
            </Grid>

            {/* School Card */}
            <Grid item xs={12} sm={6} md={5}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  🏫 I Need Volunteer Teachers
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
                  Bring volunteer teachers to your students.
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Register your school/college</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Assess digital readiness</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Start requesting volunteer teachers</Typography>
                </Stack>
                <Button
                  size="small"
                  variant="contained"
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none', fontWeight: 600 }}
                  onClick={() => navigate('/onboard')}
                >
                  Get Started
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Trust signal */}
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', mt: 4 }}
          >
            140+ schools · 250+ volunteers · 15,000+ students reached
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 1.5, cursor: 'pointer' }}
            onClick={() => navigate('/explore-needs')}
          >
            Already know what you'd like to do? Browse opportunities →
          </Typography>
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
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <img src="/icons/serve-logo.jpeg" alt="Sunbird Serve" style={{ height: 20, width: 20, opacity: 0.7, borderRadius: 2 }} />
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} Sunbird Serve &middot; Open Source &middot; Digital
            Public Good
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
