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
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Chip,
  Autocomplete,
} from '@mui/material';
import { API } from '@config/api';
import { useAuth } from '../hooks/useAuth';

const GENDER_OPTIONS = ['Male', 'Female', 'Transgender', 'Others'];

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
  'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Spanish', 'French', 'German',
  'Mandarin Chinese', 'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian',
];

const INTERESTS = [
  'Teaching', 'Mentoring', 'Guest Lecture', 'Content Writing', 'Data Science',
  'Software Development', 'Graphic Design', 'Public Speaking', 'Social Work',
  'Healthcare', 'Environmental Science', 'Digital Marketing', 'Music Production',
  'Career Guidance', 'Financial Planning', 'Project Management', 'UX/UI Design',
];

const QUALIFICATIONS = [
  'High School', 'Pre University', 'Graduate', 'Post Graduate', 'Professional Degree',
];

const EMPLOYMENT_STATUS = [
  'Full Time', 'Part Time', 'Self-Employed', 'Homemaker', 'Student', 'Retired', 'Not Employed',
];

const steps = ['Personal Details', 'Contact Info', 'Preferences'];

interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  country: string;
  languages: string[];
  interests: string[];
  qualification: string;
  employmentStatus: string;
}

export function RegistrationPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();
  const { user: keycloakUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: keycloakUser?.firstName || '',
    lastName: keycloakUser?.lastName || '',
    gender: '',
    dob: '',
    nationality: '',
    mobile: '',
    email: keycloakUser?.email || localStorage.getItem('regEmail') || '',
    city: '',
    state: '',
    country: '',
    languages: [],
    interests: [],
    qualification: '',
    employmentStatus: '',
  });

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNext = () => {
    // Basic validation per step
    if (activeStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.gender || !formData.dob) {
        setError('Please fill in all required fields.');
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.mobile || !formData.email) {
        setError('Please provide your mobile number and email.');
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userPayload = {
      identityDetails: {
        fullname: formData.firstName,
        name: formData.lastName,
        gender: formData.gender,
        dob: formData.dob,
        Nationality: formData.nationality,
      },
      contactDetails: {
        email: formData.email,
        mobile: formData.mobile,
        address: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
      },
      agencyId: agencyId || '',
      status: 'Registered',
      role: ['Volunteer'],
    };

    try {
      // Step 1: Create user
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();

      const userResponse = await fetch(`${API.USER}/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userPayload),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create user profile.');
      }

      const userData = await userResponse.json();
      const userId = userData.result?.Users?.osid;

      if (!userId) {
        throw new Error('User created but no ID returned.');
      }

      // Step 2: Create user profile
      const profilePayload = {
        skills: [],
        genericDetails: {
          qualification: formData.qualification,
          affiliation: '',
          yearsOfExperience: '',
          employmentStatus: formData.employmentStatus,
        },
        userPreference: {
          timePreferred: [],
          dayPreferred: [],
          interestArea: formData.interests,
          language: formData.languages,
        },
        agencyId: agencyId || '',
        userId,
        onboardDetails: {
          onboardStatus: [{ onboardStep: 'Discussion', status: 'completed' }],
          refreshPeriod: '2 years',
          profileCompletion: '50',
        },
        consentDetails: {
          consentGiven: true,
          consentDate: new Date().toISOString().split('T')[0],
          consentDescription:
            'Consent given for sharing preference to other volunteer agency through secure network',
        },
        referenceChannelId: '',
        volunteeringHours: { totalHours: 0, hoursPerWeek: 0 },
      };

      const profileResponse = await fetch(`${API.USER_PROFILE}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profilePayload),
      });

      if (!profileResponse.ok) {
        // Profile creation failed but user was created — still consider it a partial success
        console.warn('Profile creation failed, but user was created.');
      }

      // Force token refresh to pick up the newly assigned Keycloak role
      try {
        const keycloak = (await import('@config/keycloak')).default;
        await keycloak.updateToken(-1); // Force refresh by setting minValidity to -1
      } catch {
        // If token refresh fails, user will get the new role on next login
        console.warn('Token refresh failed — role will be available on next login.');
      }

      // Navigate directly to volunteer explore page
      navigate('/explore/sessions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
        bgcolor: 'background.default',
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

      {/* Registration form */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', p: 2, pt: 4 }}>
        <Container maxWidth="md">
          <Card>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={4}>
                {/* Title */}
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Complete Your Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fill in your details to complete the registration process.
                  </Typography>
                </Box>

                {/* Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Error */}
                {error && (
                  <Alert severity="error" onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {/* Form steps */}
                <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                  {/* Step 1: Personal Details */}
                  {activeStep === 0 && (
                    <Stack spacing={2.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="First Name"
                          value={formData.firstName}
                          onChange={handleChange('firstName')}
                          required
                          fullWidth
                        />
                        <TextField
                          label="Last Name"
                          value={formData.lastName}
                          onChange={handleChange('lastName')}
                          required
                          fullWidth
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Gender"
                          select
                          value={formData.gender}
                          onChange={handleChange('gender')}
                          required
                          fullWidth
                        >
                          {GENDER_OPTIONS.map((g) => (
                            <MenuItem key={g} value={g}>{g}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label="Date of Birth"
                          type="date"
                          value={formData.dob}
                          onChange={handleChange('dob')}
                          required
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Stack>
                      <TextField
                        label="Nationality"
                        value={formData.nationality}
                        onChange={handleChange('nationality')}
                        fullWidth
                        placeholder="e.g. India"
                      />
                    </Stack>
                  )}

                  {/* Step 2: Contact Info */}
                  {activeStep === 1 && (
                    <Stack spacing={2.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Mobile Number"
                          value={formData.mobile}
                          onChange={handleChange('mobile')}
                          required
                          fullWidth
                          placeholder="+91 9876543210"
                        />
                        <TextField
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange('email')}
                          required
                          fullWidth
                          disabled={!!keycloakUser?.email}
                          helperText={keycloakUser?.email ? 'Email from your account' : undefined}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="City"
                          value={formData.city}
                          onChange={handleChange('city')}
                          fullWidth
                        />
                        <TextField
                          label="State"
                          value={formData.state}
                          onChange={handleChange('state')}
                          fullWidth
                        />
                      </Stack>
                      <TextField
                        label="Country"
                        value={formData.country}
                        onChange={handleChange('country')}
                        fullWidth
                        placeholder="e.g. India"
                      />
                    </Stack>
                  )}

                  {/* Step 3: Preferences */}
                  {activeStep === 2 && (
                    <Stack spacing={2.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Qualification"
                          select
                          value={formData.qualification}
                          onChange={handleChange('qualification')}
                          fullWidth
                        >
                          {QUALIFICATIONS.map((q) => (
                            <MenuItem key={q} value={q}>{q}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label="Employment Status"
                          select
                          value={formData.employmentStatus}
                          onChange={handleChange('employmentStatus')}
                          fullWidth
                        >
                          {EMPLOYMENT_STATUS.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                      <Autocomplete
                        multiple
                        options={LANGUAGES}
                        value={formData.languages}
                        onChange={(_, value) => setFormData((prev) => ({ ...prev, languages: value }))}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip label={option} size="small" {...getTagProps({ index })} key={option} />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField {...params} label="Languages" placeholder="Select languages" />
                        )}
                      />
                      <Autocomplete
                        multiple
                        options={INTERESTS}
                        value={formData.interests}
                        onChange={(_, value) => setFormData((prev) => ({ ...prev, interests: value }))}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip label={option} size="small" {...getTagProps({ index })} key={option} />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField {...params} label="Areas of Interest" placeholder="Select interests" />
                        )}
                      />
                    </Stack>
                  )}

                  {/* Navigation buttons */}
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
                    <Button
                      variant="text"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ px: 4 }}
                    >
                      {activeStep === steps.length - 1
                        ? loading
                          ? 'Submitting...'
                          : 'Complete Registration'
                        : 'Next'}
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
