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
import { getAdopterConfig } from '@config/adopter';
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

const VOLUNTEER_WEB_ENABLED = import.meta.env.VITE_VOLUNTEER_WEB_ENABLED === 'true';
const VOLUNTEER_WHATSAPP_ENABLED = import.meta.env.VITE_VOLUNTEER_WHATSAPP_ENABLED === 'true';

// Per-adopter (Telangana / UP / …) home page content.
const adopter = getAdopterConfig();

// Icons reused for program highlight cards (positional), keeping existing look.
const HIGHLIGHT_ICONS = [
  <PublicIcon sx={{ fontSize: 36 }} />,
  <VerifiedIcon sx={{ fontSize: 36 }} />,
  <GroupsIcon sx={{ fontSize: 36 }} />,
  <InsightsIcon sx={{ fontSize: 36 }} />,
];

// Section cards: use adopter highlights when provided, else the generic items.
const sectionCards = adopter.highlights
  ? adopter.highlights.map((h, i) => ({
      icon: HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
      title: h.title,
      description: h.description,
    }))
  : impactItems;

const sectionOverline = adopter.aboutOverline || 'Why Serve';
const sectionHeading = adopter.aboutHeading || 'Turning Intent into Impact';
const sectionIntro =
  adopter.aboutContent ||
  'No community should wait while willing hands stand idle. SERVE channels untapped volunteer energy into real-world results — matching every verified need with the right skills, instantly and at scale.';

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

  // After authentication, route the user:
  // 1. If they have a known app role -> role-based default route.
  // 2. If they just completed Keycloak signup (no role yet) -> the profile
  //    completion form matching the sign-up type they chose.
  useEffect(() => {
    if (!authenticated) return;

    const effectiveRoles = roles.length > 0 ? roles : (backendUser?.role || []);
    if (effectiveRoles.length > 0) {
      const role = effectiveRoles[0];
      const roleConfig = getRoleConfig(role);
      navigate(roleConfig?.defaultRoute || '/app/dashboard');
      return;
    }

    // No role yet — this is a new user returning from Keycloak registration.
    // Send them to the profile form for the type they signed up as.
    const pendingType = localStorage.getItem('pendingRegistrationType');
    if (pendingType === 'coordinator') {
      navigate('/register/coordinator-profile');
    } else if (pendingType === 'volunteer') {
      navigate('/register/volunteer-profile');
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
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ py: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <img src="/icons/serve-logo.jpeg" alt={adopter.brandName} style={{ height: 40, width: 40, borderRadius: 6, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    lineHeight={1.1}
                    noWrap
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    {adopter.brandPrefix ? `${adopter.brandPrefix} · ${adopter.brandName}` : adopter.brandName}
                  </Typography>
                  {adopter.brandTagline && (
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'none', sm: 'block' } }}
                    >
                      {adopter.brandTagline}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'none', md: 'block' } }}>
                  New here?
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={(e) => setSignUpAnchor(e.currentTarget)}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Sign Up
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleLogin}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }, textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  Sign In
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
              {adopter.heroTitle}
              {adopter.heroHighlight && (
                <>
                  {' '}
                  <Box component="span" sx={{ color: '#FCD34D' }}>{adopter.heroHighlight}</Box>
                </>
              )}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 600, lineHeight: 1.6, fontWeight: 500 }}
            >
              {adopter.heroSubtitle}
            </Typography>
            {adopter.heroDescription && (
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 560, lineHeight: 1.7 }}
              >
                {adopter.heroDescription}
              </Typography>
            )}
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
                  {adopter.volunteerCardTitle}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
                  {adopter.volunteerCardSubtitle}
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Find where you can help</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Get matched with students</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>✓ Start teaching online</Typography>
                </Stack>
                {(VOLUNTEER_WEB_ENABLED || VOLUNTEER_WHATSAPP_ENABLED) ? (
                  <>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      {VOLUNTEER_WEB_ENABLED && (
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
                      )}
                      {VOLUNTEER_WHATSAPP_ENABLED && (
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
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                      No sign-up required to explore.
                    </Typography>
                  </>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none', fontWeight: 600 }}
                    onClick={() => handleRegister('volunteer')}
                  >
                    {adopter.volunteerCardCta || 'Sign Up to Volunteer'}
                  </Button>
                )}
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
                  {adopter.schoolCardTitle}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
                  {adopter.schoolCardSubtitle}
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
          {adopter.trustSignal && (
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', mt: 4 }}
            >
              {adopter.trustSignal}
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: adopter.trustSignal ? 1.5 : 4, cursor: 'pointer' }}
            onClick={() => navigate('/explore-needs')}
          >
            {adopter.exploreCtaLabel || "Already know what you'd like to do? Browse opportunities →"}
          </Typography>
        </Container>
      </Box>

      {/* Intent to Impact Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="overline" color="primary.main" fontWeight={600}>
              {sectionOverline}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {sectionHeading}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              maxWidth={640}
              mx="auto"
              sx={{ mt: 1 }}
            >
              {sectionIntro}
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {sectionCards.map((item) => (
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

      {/* How It Works (adopter-provided) */}
      {adopter.howItWorksSteps && adopter.howItWorksSteps.length > 0 && (
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Stack spacing={1} textAlign="center" sx={{ mb: 6 }}>
              <Typography variant="overline" color="primary.main" fontWeight={600}>
                How It Works
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {adopter.howItWorksHeading}
              </Typography>
            </Stack>
            <Grid container spacing={3}>
              {adopter.howItWorksSteps.map((s) => (
                <Grid item xs={12} sm={6} md={3} key={s.step}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(14, 116, 144, 0.12)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, mb: 2,
                      }}
                    >
                      {s.step}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {s.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Volunteer call-to-action (adopter-provided) */}
      {adopter.volunteerSectionHeading && (
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}>
          <Container maxWidth="md">
            <Paper
              sx={{
                p: { xs: 3, md: 5 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 100%)',
                color: 'white',
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {adopter.volunteerSectionHeading}
              </Typography>
              {adopter.volunteerSectionContent && (
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 640, mx: 'auto', mb: 3, lineHeight: 1.7 }}>
                  {adopter.volunteerSectionContent}
                </Typography>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none', fontWeight: 600 }}
                  onClick={() => handleRegister('volunteer')}
                >
                  {adopter.volunteerSectionCta || 'Become a Volunteer'}
                </Button>
                {adopter.volunteerSectionSecondaryCta && (
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: 'rgba(255,255,255,0.6)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }, textTransform: 'none', fontWeight: 600 }}
                    onClick={() => handleRegister('volunteer')}
                  >
                    {adopter.volunteerSectionSecondaryCta}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Container>
        </Box>
      )}

      {/* Footer / platform attribution */}
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
          <Box textAlign="left">
            <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
              {adopter.attributionTitle || 'Sunbird Serve'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {adopter.attributionSubtitle
                || `\u00A9 ${new Date().getFullYear()} Sunbird Serve · Open Source · Digital Public Good`}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
