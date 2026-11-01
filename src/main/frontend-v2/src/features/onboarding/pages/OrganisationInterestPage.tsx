import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Stack,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  organisationInterestSchema,
  OrganisationInterestFormData,
  ORGANISATION_TYPES,
  PARTICIPATION_INTENTS,
} from '../schema/organisationInterestSchema';

// --- Deployment-configurable delivery --------------------------------------
// The form adapts to whatever delivery mechanism is configured, in priority
// order:
//   1. VITE_SAMUDAYA_INTEREST_ENDPOINT — POST the submission as JSON (works
//      with Formspree, a Google Apps Script web app, or a future real API).
//   2. VITE_SAMUDAYA_CONTACT_EMAIL — compose a prefilled mailto: as a fallback.
//   3. Neither — the form is shown in a clearly disabled state explaining that
//      submissions are not yet configured, rather than silently dropping data.
const INTEREST_ENDPOINT = (import.meta.env.VITE_SAMUDAYA_INTEREST_ENDPOINT || '').trim();
const CONTACT_EMAIL = (import.meta.env.VITE_SAMUDAYA_CONTACT_EMAIL || '').trim();

type DeliveryMode = 'endpoint' | 'mailto' | 'disabled';
const DELIVERY_MODE: DeliveryMode = INTEREST_ENDPOINT
  ? 'endpoint'
  : CONTACT_EMAIL
    ? 'mailto'
    : 'disabled';

function resolveOrganisationType(data: OrganisationInterestFormData): string {
  return data.organisationType === 'Other'
    ? data.organisationTypeOther?.trim() || 'Other'
    : data.organisationType;
}

function buildMailto(data: OrganisationInterestFormData): string {
  const orgType = resolveOrganisationType(data);
  const subject = `SERVE Samudaya — interest from ${data.organisationName}`;
  const bodyLines = [
    `Organisation: ${data.organisationName}`,
    `Type: ${orgType}`,
    `Contact person: ${data.contactName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || '—'}`,
    `How they'd like to participate: ${data.intent}`,
    '',
    'Message:',
    data.message?.trim() || '—',
  ];
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    bodyLines.join('\n'),
  )}`;
}

export function OrganisationInterestPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrganisationInterestFormData>({
    resolver: zodResolver(organisationInterestSchema),
    mode: 'onBlur',
    defaultValues: {
      organisationName: '',
      organisationType: undefined,
      organisationTypeOther: '',
      contactName: '',
      email: '',
      phone: '',
      intent: undefined,
      message: '',
    },
  });

  const selectedType = watch('organisationType');

  const onSubmit = async (data: OrganisationInterestFormData) => {
    setServerError('');

    if (DELIVERY_MODE === 'mailto') {
      window.location.href = buildMailto(data);
      setSubmitted(true);
      return;
    }

    if (DELIVERY_MODE === 'endpoint') {
      setSubmitting(true);
      try {
        const res = await fetch(INTEREST_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            organisationName: data.organisationName,
            organisationType: resolveOrganisationType(data),
            contactName: data.contactName,
            email: data.email,
            phone: data.phone || '',
            intent: data.intent,
            message: data.message || '',
            source: 'serve-samudaya-home',
            // Formspree-recognised field: sets the notification email subject.
            // Harmless to endpoints that ignore it.
            _subject: `SERVE Samudaya interest — ${data.organisationName}`,
          }),
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        setSubmitted(true);
      } catch {
        setServerError(
          'We could not submit your interest just now. Please try again in a moment' +
            (CONTACT_EMAIL ? `, or email us at ${CONTACT_EMAIL}.` : '.'),
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // DELIVERY_MODE === 'disabled' — should not reach here (submit is blocked).
    setServerError('Interest submissions are not configured for this deployment yet.');
  };

  // Success state
  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ p: { xs: 4, sm: 6 }, maxWidth: 560, textAlign: 'center', borderRadius: 3 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Thank you for your interest
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
            {DELIVERY_MODE === 'mailto'
              ? 'Your email client should have opened with your details. Send the email and we will get back to you to find a practical starting point.'
              : 'We have received your details and will get back to you to discuss your programme and find a practical starting point.'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Back to home
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left panel — context / value proposition */}
      <Box
        sx={{
          width: { xs: '100%', md: 360 },
          flexShrink: 0,
          background: 'linear-gradient(180deg, #0C4A6E 0%, #0E7490 100%)',
          color: 'white',
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: { md: 'sticky' },
          top: { md: 0 },
          height: { md: '100vh' },
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <img src="/icons/serve-logo.jpeg" alt="SERVE Samudaya" width={36} height={36} style={{ borderRadius: 6 }} />
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                SERVE Samudaya
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Community Edition
              </Typography>
            </Box>
          </Stack>

          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            Bring your programme. Let&rsquo;s find a starting point.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
            Tell us a little about your organisation and how you&rsquo;d like to participate. We&rsquo;ll
            get in touch to discuss your programme and a practical first activity.
          </Typography>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <Stack spacing={1.5}>
            {[
              'Bring volunteering needs, mobilise volunteers, or both',
              'Coordinate your own programme on shared infrastructure',
              'Start small with a practical activity and build from there',
            ].map((line) => (
              <Stack key={line} direction="row" spacing={1.5} alignItems="flex-start">
                <Box aria-hidden="true" sx={{ color: '#FCD34D', fontWeight: 700 }}>
                  ✓
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {line}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Right — form */}
      <Box sx={{ flex: 1, py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 }, overflow: 'auto' }}>
        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Back to home
          </Button>

          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Express interest in joining
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This takes about a minute. No login is required.
            </Typography>
          </Stack>

          {DELIVERY_MODE === 'disabled' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Online submission isn&rsquo;t configured for this deployment yet, so the form below is
              disabled. Please check back soon.
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Controller
                  name="organisationName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Organisation name"
                      disabled={DELIVERY_MODE === 'disabled'}
                      error={!!errors.organisationName}
                      helperText={errors.organisationName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="organisationType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Organisation type"
                      disabled={DELIVERY_MODE === 'disabled'}
                      error={!!errors.organisationType}
                      helperText={errors.organisationType?.message}
                    >
                      {ORGANISATION_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {selectedType === 'Other' && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="organisationTypeOther"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Specify organisation type"
                        disabled={DELIVERY_MODE === 'disabled'}
                        error={!!errors.organisationTypeOther}
                        helperText={errors.organisationTypeOther?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Controller
                  name="contactName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Contact person"
                      disabled={DELIVERY_MODE === 'disabled'}
                      error={!!errors.contactName}
                      helperText={errors.contactName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="email"
                      label="Email"
                      disabled={DELIVERY_MODE === 'disabled'}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone (optional)"
                      disabled={DELIVERY_MODE === 'disabled'}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="intent"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="How would you like to participate?"
                      disabled={DELIVERY_MODE === 'disabled'}
                      error={!!errors.intent}
                      helperText={errors.intent?.message}
                    >
                      {PARTICIPATION_INTENTS.map((i) => (
                        <MenuItem key={i} value={i}>{i}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={3}
                      label="Anything you'd like to share? (optional)"
                      placeholder="A little about your programme or what you'd like to do."
                      disabled={DELIVERY_MODE === 'disabled'}
                      error={!!errors.message}
                      helperText={errors.message?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {serverError && (
              <Alert severity="error" sx={{ mt: 3 }} onClose={() => setServerError('')}>
                {serverError}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={DELIVERY_MODE === 'disabled' || submitting}
              sx={{ mt: 3, py: 1.5, textTransform: 'none', fontWeight: 700 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                  Submitting...
                </>
              ) : (
                'Submit interest'
              )}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Expressing interest doesn&rsquo;t create an account or confirm participation. We&rsquo;ll
              follow up to discuss next steps.
            </Typography>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
