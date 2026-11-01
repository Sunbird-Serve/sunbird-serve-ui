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
  Link as MuiLink,
  Drawer,
  IconButton,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CampaignIcon from '@mui/icons-material/Campaign';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAuth } from '@features/auth';
import { getRoleConfig } from '@config/roles';
import { useAppSelector } from '@app/store';
import { RailsDiagram } from '../components/RailsDiagram';
import { SmartImage } from '../components/SmartImage';

// --- Image assets -----------------------------------------------------------
// Drop the files below into `public/images/samudaya/`. Until a file exists the
// SmartImage gracefully shows a branded fallback instead of a broken image, so
// the page is safe to ship before the photography/screenshots arrive.
//   Hero collage (authentic volunteering / mentoring / community photos):
const HERO_IMAGES = [
  { src: '/images/samudaya/hero-1.png', alt: 'A volunteer supporting a learner during a session' },
  { src: '/images/samudaya/hero-2.jpg', alt: 'A mentor and mentee in conversation' },
  { src: '/images/samudaya/hero-3.png', alt: 'Community members collaborating together' },
];
//   Product screenshots (real SERVE UI):
const PRODUCT_SHOTS = [
  {
    src: '/images/samudaya/product-discover.png',
    alt: 'SERVE screen showing volunteers discovering opportunities',
    title: 'Discover opportunities',
    caption: 'Volunteers browse and find needs that fit their skills and time.',
  },
  {
    src: '/images/samudaya/product-coordinate.png',
    alt: 'SERVE screen showing coordination of participation',
    title: 'Coordinate participation',
    caption: 'Organisations review interest and confirm who takes part.',
  },
  {
    src: '/images/samudaya/product-contributions.png',
    alt: 'SERVE screen showing recorded contributions',
    title: 'View contributions',
    caption: 'Follow delivery and completed contributions over time.',
  },
];

// --- Deployment-configurable values -----------------------------------------
// Organisation "Express interest" CTAs route to the dedicated interest form.
const CONTACT_EMAIL = (import.meta.env.VITE_SAMUDAYA_CONTACT_EMAIL || '').trim();
const PRIVACY_URL = (import.meta.env.VITE_SAMUDAYA_PRIVACY_URL || '').trim();
const TERMS_URL = (import.meta.env.VITE_SAMUDAYA_TERMS_URL || '').trim();
const SUNBIRD_SERVE_URL = (import.meta.env.VITE_SUNBIRD_SERVE_URL || '').trim();

const NAV_LINKS = [
  { label: 'How it works', target: 'how-it-works' },
  { label: 'For organisations', target: 'for-organisations' },
  { label: 'The product', target: 'product' },
  { label: 'Why shared infrastructure', target: 'why-dpi' },
];

// Branded placeholder shown inside hero collage tiles until real photos are
// added. Decorative; the SmartImage's alt text carries the meaning.
function HeroImageFallback({ label }: { label: string }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 700,
        fontSize: '0.85rem',
        letterSpacing: 0.5,
        background: 'linear-gradient(135deg, rgba(14,116,144,0.9) 0%, rgba(12,74,110,0.9) 100%)',
      }}
    >
      {label}
    </Box>
  );
}

export function SamudayaHomePage() {
  const navigate = useNavigate();
  const { authenticated, roles, keycloakLogin } = useAuth();
  const backendUser = useAppSelector((state) => state.user.data);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogin = () => keycloakLogin();

  const exploreOpportunities = () => navigate('/explore-needs');

  // Organisation CTAs route to the dedicated interest form page.
  const expressInterest = () => navigate('/organisation-interest');

  const scrollToId = (id: string) => {
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Post-auth routing: mirror the generic HomePage behaviour so that returning
  // authenticated users land on their role home or finish profile completion.
  useEffect(() => {
    if (!authenticated) return;
    const effectiveRoles = roles.length > 0 ? roles : backendUser?.role || [];
    if (effectiveRoles.length > 0) {
      const role = effectiveRoles[0];
      const roleConfig = getRoleConfig(role);
      navigate(roleConfig?.defaultRoute || '/app/dashboard');
      return;
    }
    const pendingType = localStorage.getItem('pendingRegistrationType');
    if (pendingType === 'coordinator') navigate('/register/coordinator-profile');
    else if (pendingType === 'volunteer') navigate('/register/volunteer-profile');
  }, [authenticated, roles, backendUser?.role, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ============================= HEADER ============================= */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ py: 1.25 }}>
            {/* Brand — never shrinks or truncates */}
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexShrink: 0 }}>
              <img
                src="/icons/serve-logo.jpeg"
                alt="SERVE Samudaya"
                width={40}
                height={40}
                style={{ borderRadius: 8, flexShrink: 0 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1} sx={{ whiteSpace: 'nowrap' }}>
                  SERVE Samudaya
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  Community Edition
                </Typography>
              </Box>
            </Stack>

            {/* Full nav — only on xl screens where everything fits on one line */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ display: { xs: 'none', xl: 'flex' }, flexShrink: 0 }}
            >
              {NAV_LINKS.map((l) => (
                <MuiLink
                  key={l.target}
                  component="button"
                  type="button"
                  onClick={() => scrollToId(l.target)}
                  underline="hover"
                  color="text.primary"
                  sx={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  {l.label}
                </MuiLink>
              ))}
              <Button
                size="small"
                variant="text"
                onClick={handleLogin}
                sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Sign in
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={expressInterest}
                sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', px: 1.5 }}
              >
                Join as an organisation
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={exploreOpportunities}
                sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', px: 1.5 }}
              >
                Explore opportunities
              </Button>
            </Stack>

            {/* Compact nav — md to xl: one primary CTA + hamburger (keeps the
                brand fully visible without crowding) */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ display: { xs: 'none', md: 'flex', xl: 'none' }, flexShrink: 0 }}
            >
              <Button
                size="small"
                variant="contained"
                onClick={exploreOpportunities}
                sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', px: 1.5 }}
              >
                Explore opportunities
              </Button>
              <IconButton aria-label="Open navigation menu" onClick={() => setMobileNavOpen(true)}>
                <MenuIcon />
              </IconButton>
            </Stack>

            {/* Mobile menu button */}
            <IconButton
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Container>
      </Box>

      {/* Mobile nav drawer */}
      <Drawer
        anchor="right"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography fontWeight={700}>Menu</Typography>
          <IconButton aria-label="Close navigation menu" onClick={() => setMobileNavOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <Stack sx={{ p: 2 }} spacing={1}>
          {NAV_LINKS.map((l) => (
            <Button
              key={l.target}
              onClick={() => scrollToId(l.target)}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 500 }}
            >
              {l.label}
            </Button>
          ))}
          <Divider sx={{ my: 1 }} />
          <Button
            onClick={() => {
              setMobileNavOpen(false);
              handleLogin();
            }}
            sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600 }}
          >
            Sign in
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setMobileNavOpen(false);
              expressInterest();
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Join as an organisation
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setMobileNavOpen(false);
              exploreOpportunities();
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Explore opportunities
          </Button>
        </Stack>
      </Drawer>

      {/* ============================== HERO ============================== */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 55%, #155E75 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 15% 85%, rgba(34,211,238,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(245,158,11,0.12) 0%, transparent 45%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 9 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="overline"
                sx={{ color: '#FCD34D', fontWeight: 700, letterSpacing: 1 }}
              >
                Shared digital infrastructure for volunteering
              </Typography>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={800}
                sx={{
                  mt: 1.5,
                  fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' },
                  lineHeight: 1.12,
                }}
              >
                <Box component="span" sx={{ display: 'block' }}>
                  Many organisations.
                </Box>
                <Box component="span" sx={{ display: 'block' }}>
                  Shared rails.
                </Box>
                <Box component="span" sx={{ display: 'block', color: '#FCD34D' }}>
                  Collective impact.
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 2.5,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.92)',
                  maxWidth: 620,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.15rem' },
                }}
              >
                SERVE Samudaya brings people, organisations and volunteering opportunities together.
                Contribute your time and skills, bring forward a need, or run your organisation&rsquo;s
                volunteering programme on shared infrastructure.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                <Button
                  size="large"
                  variant="contained"
                  onClick={exploreOpportunities}
                  sx={{
                    bgcolor: '#FCD34D',
                    color: '#0C4A6E',
                    '&:hover': { bgcolor: '#FBBF24' },
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                  }}
                >
                  Explore opportunities
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  onClick={expressInterest}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Join as an organisation
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ mt: 3, color: 'rgba(255,255,255,0.75)' }}>
                For individuals, NGOs, institutions, companies and community groups.
              </Typography>
            </Grid>

            {/* Hero visual: a collage of authentic volunteering / mentoring /
                community photos. SmartImage reserves space (no layout shift)
                and degrades gracefully until the assets are added. */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: 'repeat(2, 1fr)',
                  gap: 1.5,
                }}
              >
                <Box sx={{ gridColumn: '1 / 2', gridRow: '1 / 3' }}>
                  <SmartImage
                    src={HERO_IMAGES[0].src}
                    alt={HERO_IMAGES[0].alt}
                    eager
                    ratio="3 / 4"
                    sx={{ height: '100%' }}
                    fallback={<HeroImageFallback label="Volunteering" />}
                  />
                </Box>
                <SmartImage
                  src={HERO_IMAGES[1].src}
                  alt={HERO_IMAGES[1].alt}
                  eager
                  ratio="4 / 3"
                  fallback={<HeroImageFallback label="Mentoring" />}
                />
                <SmartImage
                  src={HERO_IMAGES[2].src}
                  alt={HERO_IMAGES[2].alt}
                  eager
                  ratio="4 / 3"
                  fallback={<HeroImageFallback label="Community" />}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ============ ORGANISATION BENEFIT (direct, near hero) ========== */}
      <Box component="section" sx={{ bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.25 }}>
                Run your volunteering programme without building a platform from scratch.
              </Typography>
              <Typography variant="body1" sx={{ mt: 1.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.7 }}>
                Connect needs and volunteers, coordinate participation and follow contributions
                using shared digital infrastructure.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
              <Button
                size="large"
                variant="contained"
                onClick={expressInterest}
                sx={{
                  bgcolor: '#FCD34D',
                  color: '#0C4A6E',
                  '&:hover': { bgcolor: '#FBBF24' },
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Join as an organisation
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================ A PLACE FOR EVERYONE TO PARTICIPATE ============ */}
      <Box component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              A place for everyone to participate
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              Three ways in
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={680} mx="auto" sx={{ mt: 1, textAlign: 'center' }}>
              Whether you are ready to help, or bringing people together around a need, there is a
              way in for you.
            </Typography>
          </Stack>

          <Grid container spacing={2.5}>
            {[
              {
                icon: <VolunteerActivismIcon sx={{ fontSize: 34 }} />,
                title: 'I want to volunteer',
                body: 'Discover opportunities that connect with your interests, skills and availability. Join an activity or contribute to an ongoing programme.',
                cta: 'Explore opportunities',
                onClick: exploreOpportunities,
              },
              {
                icon: <CampaignIcon sx={{ fontSize: 34 }} />,
                title: 'We have volunteering needs',
                body: 'Bring forward the support your programme or community needs. Connect with interested volunteers, confirm participation and coordinate delivery.',
                cta: 'Bring a need',
                onClick: expressInterest,
              },
              {
                icon: <Diversity3Icon sx={{ fontSize: 34 }} />,
                title: 'We mobilise volunteers',
                body: 'Help your volunteer community find opportunities to contribute. Coordinate participation and follow contributions across activities.',
                cta: 'Bring your volunteer community',
                onClick: expressInterest,
              },
            ].map((card) => (
              <Grid item xs={12} md={4} key={card.title}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 28px rgba(14,116,144,0.14)',
                    },
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 1 }}>{card.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.6 }}>
                    {card.body}
                  </Typography>
                  <Button
                    onClick={card.onClick}
                    variant="text"
                    sx={{ mt: 1.5, alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700 }}
                  >
                    {card.cta} →
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 3 }}>
            Organisations can bring needs, mobilise volunteers or both — joining as a Need Agency,
            a Volunteer Agency, or both.
          </Typography>
        </Container>
      </Box>

      {/* ==================== MANY WAYS TO CONTRIBUTE ==================== */}
      <Box component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="overline" color="primary.main" fontWeight={700}>
                Many ways to contribute
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 2 }}>
                Different contributions, a shared purpose
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                A regular learning session. A career conversation. A few hours of professional
                expertise. The coordination that helps an activity happen.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                Illustrative examples — opportunities you can actually discover are listed on the
                Explore opportunities page.
              </Typography>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                {[
                  { icon: <SchoolIcon sx={{ fontSize: 28 }} />, label: 'Teaching and learning support' },
                  { icon: <PsychologyIcon sx={{ fontSize: 28 }} />, label: 'Mentoring and career guidance' },
                  { icon: <LaptopMacIcon sx={{ fontSize: 28 }} />, label: 'Digital skills and professional expertise' },
                  { icon: <EventAvailableIcon sx={{ fontSize: 28 }} />, label: 'Programme coordination and community activities' },
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 2,
                        height: '100%',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                      }}
                    >
                      <Box sx={{ color: 'primary.main', display: 'flex' }}>{item.icon}</Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.label}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ======================= SEE THE PRODUCT ======================= */}
      <Box id="product" component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              See the product
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              What coordinating on Samudaya looks like
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={680} mx="auto" sx={{ mt: 1, lineHeight: 1.7, textAlign: 'center' }}>
              The same shared capabilities, shown in the actual SERVE interface — from discovering
              opportunities to recording what gets delivered.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {PRODUCT_SHOTS.map((shot) => (
              <Grid item xs={12} md={4} key={shot.title}>
                <Paper sx={{ p: 1.5, borderRadius: 3, height: '100%' }}>
                  <SmartImage
                    src={shot.src}
                    alt={shot.alt}
                    ratio="16 / 10"
                    radius={8}
                    fallback={<HeroImageFallback label="Screenshot coming soon" />}
                  />
                  <Box sx={{ px: 1, pt: 1.5, pb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {shot.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {shot.caption}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===================== THE VOLUNTEERING RAILS ==================== */}
      <Box component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              The volunteering rails
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              Shared rails. Programmes shaped by you.
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={720} mx="auto" sx={{ mt: 1, lineHeight: 1.7, textAlign: 'center' }}>
              You bring your purpose, relationships and local knowledge. Samudaya provides the common
              stages below, so coordination follows a clear path from a need to a recorded
              contribution.
            </Typography>
          </Stack>

          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
            <RailsDiagram />
          </Paper>
        </Container>
      </Box>

      {/* =============== WHY DIGITAL PUBLIC INFRASTRUCTURE ============== */}
      <Box id="why-dpi" component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Why shared infrastructure
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              Build on something shared.
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={740} mx="auto" sx={{ mt: 1, lineHeight: 1.7, textAlign: 'center' }}>
              Many organisations face the same coordination challenges. Using a common foundation
              means you bring your programme and ways of working, not a platform to build.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {[
              {
                title: 'Less duplicated effort',
                body: 'Use shared capabilities for recurring coordination tasks, so your team can spend more time on the programme itself.',
              },
              {
                title: 'Your organisation and programme',
                body: "Manage your organisation's needs, coordinators and volunteering activities within a shared platform.",
              },
              {
                title: 'A common foundation',
                body: 'Powered by open-source Sunbird SERVE, with shared building blocks that can evolve through use and contribution.',
              },
              {
                title: 'Room for collective learning',
                body: 'Bring practical experience and feedback that can help improve shared capabilities for other participating organisations.',
              },
            ].map((b, i) => (
              <Grid item xs={12} sm={6} key={b.title}>
                <Paper
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: 3,
                    borderLeft: '4px solid',
                    borderColor: 'secondary.main',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="baseline">
                    <Typography variant="h5" fontWeight={800} color="secondary.main" aria-hidden="true">
                      0{i + 1}
                    </Typography>
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {b.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {b.body}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ==================== HOW PARTICIPATION WORKS =================== */}
      <Box id="how-it-works" component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              How participation works
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              Two simple journeys
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {[
              {
                heading: 'Volunteer journey',
                steps: [
                  'Explore opportunities',
                  'Express interest',
                  'Confirm participation',
                  'Contribute and record completion',
                ],
              },
              {
                heading: 'Organisation journey',
                steps: [
                  'Express interest',
                  'Discuss your programme',
                  'Complete onboarding',
                  'Coordinate activities',
                ],
              },
            ].map((journey) => (
              <Grid item xs={12} md={6} key={journey.heading}>
                <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%', borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                    {journey.heading}
                  </Typography>
                  <Stack component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }} spacing={2}>
                    {journey.steps.map((step, i) => (
                      <Stack
                        key={step}
                        component="li"
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >
                        <Box
                          aria-hidden="true"
                          sx={{
                            flexShrink: 0,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {i + 1}
                        </Box>
                        <Typography variant="body1" fontWeight={500}>
                          {step}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="body2"
            color="text.secondary"
            maxWidth={760}
            mx="auto"
            sx={{ mt: 4, lineHeight: 1.7, textAlign: 'center' }}
          >
            Participation depends on the requirements of each opportunity and confirmation by its
            coordinating organisation. For organisations, onboarding follows a short conversation
            after you express interest — it isn&rsquo;t automatic.
          </Typography>
        </Container>
      </Box>

      {/* ====================== FOR ORGANISATIONS ====================== */}
      <Box id="for-organisations" component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="primary.main" fontWeight={700}>
                For organisations
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 2 }}>
                Start with one practical activity.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                Coordinating a small volunteer group or a growing programme? Express interest, have a
                short conversation with us, complete onboarding, and begin — no platform to build.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={expressInterest}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Join as an organisation
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25}>
                {[
                  'NGOs and community organisations',
                  'Schools, colleges and other institutions',
                  'Companies and employee volunteering groups',
                  'Volunteer networks',
                ].map((t) => (
                  <Stack
                    key={t}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box aria-hidden="true" sx={{ color: 'secondary.main', fontSize: '1.2rem' }}>
                      •
                    </Box>
                    <Typography variant="body1" fontWeight={600}>
                      {t}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==================== TRUST AND RESPONSIBILITY ================= */}
      <Box component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Trust and responsibility
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              Open participation. Clear responsibilities.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Everyone is welcome to explore and express interest. Participating organisations
              coordinate their programmes and confirm volunteers according to the requirements of
              each opportunity. Samudaya provides the shared digital tools that support this work.
            </Typography>
            {(PRIVACY_URL || TERMS_URL) && (
              <Stack
                direction="row"
                spacing={3}
                justifyContent="center"
                sx={{ pt: 1 }}
              >
                {PRIVACY_URL && (
                  <MuiLink href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" underline="hover">
                    Privacy
                  </MuiLink>
                )}
                {TERMS_URL && (
                  <MuiLink href={TERMS_URL} target="_blank" rel="noopener noreferrer" underline="hover">
                    Terms
                  </MuiLink>
                )}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      {/* ========================== FINAL CTA ========================= */}
      <Box component="section" sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              borderRadius: 4,
              color: 'white',
              background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 100%)',
            }}
          >
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Your willingness can become someone&rsquo;s support.
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 620, mx: 'auto', mb: 4, lineHeight: 1.7, textAlign: 'center' }}>
              Find an opportunity to contribute, or bring your organisation&rsquo;s volunteering
              programme to Samudaya.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button
                size="large"
                variant="contained"
                onClick={exploreOpportunities}
                sx={{
                  bgcolor: '#FCD34D',
                  color: '#0C4A6E',
                  '&:hover': { bgcolor: '#FBBF24' },
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Explore opportunities
              </Button>
              <Button
                size="large"
                variant="outlined"
                onClick={expressInterest}
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Join as an organisation
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* ===================== CONTACT (support only) ================= */}
      {/* The organisation funnel is the dedicated /organisation-interest form.
          This section is a light general-contact touchpoint, shown only when a
          support email is configured. */}
      {CONTACT_EMAIL && (
        <Box
          id="contact"
          component="section"
          sx={{ py: { xs: 5, md: 7 }, bgcolor: 'background.paper', scrollMarginTop: 80 }}
        >
          <Container maxWidth="md">
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Have a question?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                To join as an organisation, use the interest form. For anything else, reach out and
                we&rsquo;ll be glad to help.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={expressInterest}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Express interest
                </Button>
                <Button
                  variant="outlined"
                  href={`mailto:${CONTACT_EMAIL}`}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {CONTACT_EMAIL}
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>
      )}

      {/* =========================== FOOTER =========================== */}
      <Box
        component="footer"
        sx={{ py: 5, bgcolor: '#0C4A6E', color: 'rgba(255,255,255,0.85)' }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <img
                  src="/icons/serve-logo.jpeg"
                  alt="SERVE Samudaya"
                  width={32}
                  height={32}
                  style={{ borderRadius: 6 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="white">
                    SERVE Samudaya
                  </Typography>
                  <Typography variant="body2">A shared space for volunteering.</Typography>
                </Box>
              </Stack>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.65)' }}>
                Hosted by eVidyaloka · Powered by Sunbird SERVE
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack
                direction="row"
                spacing={3}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                flexWrap="wrap"
                useFlexGap
              >
                <MuiLink
                  component="button"
                  type="button"
                  onClick={expressInterest}
                  color="inherit"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Express interest
                </MuiLink>
                {CONTACT_EMAIL && (
                  <MuiLink
                    href={`mailto:${CONTACT_EMAIL}`}
                    color="inherit"
                    underline="hover"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    Contact
                  </MuiLink>
                )}
                {PRIVACY_URL && (
                  <MuiLink href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Privacy
                  </MuiLink>
                )}
                {TERMS_URL && (
                  <MuiLink href={TERMS_URL} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Terms
                  </MuiLink>
                )}
                {SUNBIRD_SERVE_URL && (
                  <MuiLink href={SUNBIRD_SERVE_URL} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Sunbird SERVE
                  </MuiLink>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
