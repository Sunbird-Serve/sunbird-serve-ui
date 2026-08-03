import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Autocomplete,
  Divider,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { onboardingSchema, OnboardingFormData } from '../schema/onboardingSchema';
import {
  useBrowseEntitiesQuery,
  useSubmitOnboardingRequestMutation,
} from '../api/onboardingApi';
import type { EntityOnboardEntity } from '../api/onboardingApi';

const DESIGNATION_OPTIONS = [
  { value: 'HM', label: 'Head Master' },
  { value: 'Principal', label: 'Principal' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Computer Instructor', label: 'Computer Instructor' },
  { value: 'Other', label: 'Other' },
];

const INFRA_OPTIONS = [
  { value: 'smartTv', label: 'Smart TV / Projector' },
  { value: 'computer', label: 'Computer or Laptop' },
  { value: 'speakers', label: 'Speakers' },
  { value: 'internet', label: 'Reliable Internet Connection' },
];

const ONLINE_EXPERIENCE_OPTIONS = [
  'Yes, we use it regularly',
  'Yes, but only occasionally',
  'No, but we can try independently',
  'No, we will need support',
];

export function OnboardingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [entitySearch, setEntitySearch] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onBlur',
    defaultValues: {
      district: '',
      block: '',
      entityId: '',
      coordinatorName: '',
      designation: undefined,
      designationOther: '',
      mobile: '',
      email: '',
      infraAvailable: [],
      onlineExperience: undefined,
      canJoinIndependently: undefined,
    },
  });

  const selectedDistrict = watch('district');
  const selectedBlock = watch('block');
  const selectedDesignation = watch('designation');

  // API queries
  const { data: allEntitiesResponse, isLoading: loadingAllEntities, error: allEntitiesError } =
    useBrowseEntitiesQuery({ size: 5000 });

  const { data: filteredResponse, isLoading: loadingFiltered } = useBrowseEntitiesQuery(
    { district: selectedDistrict, block: selectedBlock, name: entitySearch || undefined, size: 500 },
    { skip: !selectedDistrict || !selectedBlock },
  );

  const [submitRequest, { isLoading: submitting }] = useSubmitOnboardingRequestMutation();

  // Extract distinct districts (exclude Inactive)
  const districts = useMemo(() => {
    if (!allEntitiesResponse?.content) return [];
    const activeEntities = allEntitiesResponse.content.filter((e) => e.status !== 'Inactive');
    const unique = [...new Set(activeEntities.map((e) => e.district))].filter(Boolean);
    return unique.sort();
  }, [allEntitiesResponse]);

  // Extract distinct blocks for selected district (exclude Inactive)
  const blocks = useMemo(() => {
    if (!allEntitiesResponse?.content || !selectedDistrict) return [];
    const activeEntities = allEntitiesResponse.content.filter((e) => e.status !== 'Inactive');
    const unique = [
      ...new Set(
        activeEntities
          .filter((e) => e.district === selectedDistrict)
          .map((e) => e.block),
      ),
    ].filter(Boolean);
    return unique.sort();
  }, [allEntitiesResponse, selectedDistrict]);

  // Entities for autocomplete (exclude Inactive)
  const entities: EntityOnboardEntity[] = useMemo(
    () => (filteredResponse?.content ?? []).filter((e) => e.status !== 'Inactive'),
    [filteredResponse],
  );

  const selectedEntityId = watch('entityId');
  const selectedEntity = useMemo(
    () => entities.find((e) => e.id === selectedEntityId),
    [entities, selectedEntityId],
  );

  // Cascading reset handlers
  const handleDistrictChange = (value: string) => {
    setValue('district', value, { shouldValidate: true });
    setValue('block', '');
    setValue('entityId', '');
    setEntitySearch('');
  };

  const handleBlockChange = (value: string) => {
    setValue('block', value, { shouldValidate: true });
    setValue('entityId', '');
    setEntitySearch('');
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setServerError('');

    // Resolve entity
    const entity = entities.find((e) => e.id === data.entityId);
    if (!entity) {
      setServerError('Please select a valid institution.');
      return;
    }

    // Map UI fields to API payload
    const infraAvail = data.infraAvailable || [];
    try {
      await submitRequest({
        agencyId: entity?.agencyId || '',
        entityId: data.entityId || '',
        coordinatorName: data.coordinatorName,
        mobile: data.mobile,
        email: data.email || '',
        designation: data.designation === 'Other' ? (data.designationOther || 'Other') : data.designation,
        infraDetails: {
          hasSmartTvOrProjector: infraAvail.includes('smartTv'),
          hasComputerOrLaptop: infraAvail.includes('computer'),
          hasSpeakers: infraAvail.includes('speakers'),
          hasReliableInternet: infraAvail.includes('internet'),
          hasUsedForOnlineClass: data.onlineExperience,
          canIndependentlyConnect: data.canJoinIndependently,
        },
      }).unwrap();
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string } };
      if (error?.status === 409) {
        setServerError(
          error.data?.message ||
            'A request already exists for this mobile number and institution.',
        );
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  };

  // Success state
  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ p: { xs: 4, sm: 6 }, maxWidth: 560, textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Thank You for Expressing Interest
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Our team will review your school's readiness and contact you regarding authorisation and the next steps.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left Sidebar — Value Proposition */}
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
          {/* Logo + Program Name */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <img src="/icons/serve-logo.jpeg" alt="SERVE" style={{ height: 36, width: 36, borderRadius: 6 }} />
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Project SERVE
            </Typography>
          </Stack>

          {/* Headline */}
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            Bring new learning experiences to your classroom
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
            SERVE connects your school with passionate volunteer teachers who bring fresh perspectives
            and engaging online sessions — complementing your existing teaching team.
          </Typography>

          {/* Benefits */}
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Typography sx={{ fontSize: '1.2rem' }}>🎓</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Skilled volunteer teachers deliver live online sessions
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Typography sx={{ fontSize: '1.2rem' }}>📺</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Works with your existing smart TV / projector setup
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Typography sx={{ fontSize: '1.2rem' }}>⏱️</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Once authorised, you can easily request volunteer teachers whenever needed
              </Typography>
            </Stack>
          </Stack>

          {/* Social proof */}
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight={700}>140+</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Schools connected
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>15,000+</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Students reached
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* Right Side — Form */}
      <Box sx={{ flex: 1, py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3, md: 5 }, overflow: 'auto' }}>
        <Box sx={{ maxWidth: 680, mx: 'auto' }}>
          {/* Form header */}
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Connect Your School with Volunteer Teachers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share your institution's details and digital readiness. Our team will review your submission and guide you through the next steps.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This takes about 2–3 minutes. No login is required.
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Section 1: Institution */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              1. Select Your Institution
            </Typography>

            {allEntitiesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load institution data. Please refresh and try again.
              </Alert>
            )}

            <Grid container spacing={2.5} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="district"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="District"
                      error={!!errors.district}
                      helperText={errors.district?.message}
                      disabled={loadingAllEntities}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      InputProps={{
                        endAdornment: loadingAllEntities ? <CircularProgress size={20} /> : null,
                      }}
                    >
                      {districts.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="block"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Block"
                      error={!!errors.block}
                      helperText={errors.block?.message}
                      disabled={!selectedDistrict || loadingAllEntities}
                      onChange={(e) => handleBlockChange(e.target.value)}
                    >
                      {blocks.map((b) => (
                        <MenuItem key={b} value={b}>{b}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                  <Controller
                    name="entityId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        options={entities}
                        getOptionLabel={(option: EntityOnboardEntity) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={entities.find((e) => e.id === field.value) || null}
                        loading={loadingFiltered}
                        disabled={!selectedBlock}
                        noOptionsText="No institutions found"
                        onInputChange={(_, value, reason) => {
                          if (reason === 'input') setEntitySearch(value);
                          if (reason === 'clear') setEntitySearch('');
                        }}
                        onChange={(_, value) => {
                          field.onChange(value?.id || '');
                          if (!value) setEntitySearch('');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="School / College"
                            placeholder="Start typing to search..."
                            error={!!errors.entityId}
                            helperText={errors.entityId?.message}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingFiltered ? <CircularProgress size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            <Stack>
                              <Typography variant="body2">{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {[option.block, option.district, option.pincode].filter(Boolean).join(' · ')}
                              </Typography>
                            </Stack>
                          </li>
                        )}
                      />
                    )}
                  />
                  {selectedEntity && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {selectedEntity.category} · {selectedEntity.state} · {selectedEntity.registrationId || ''}
                    </Typography>
                  )}
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Section 2: Contact Person */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              2. School Coordinator Details
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="coordinatorName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      error={!!errors.coordinatorName}
                      helperText={errors.coordinatorName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="I am the..."
                      error={!!errors.designation}
                      helperText={errors.designation?.message}
                    >
                      {DESIGNATION_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {selectedDesignation === 'Other' && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="designationOther"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Specify Designation"
                        error={!!errors.designationOther}
                        helperText={errors.designationOther?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile Number"
                      placeholder="9876543210"
                      inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                      error={!!errors.mobile}
                      helperText={errors.mobile?.message}
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
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Section 3: Digital Classroom Readiness */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              3. Digital Classroom Readiness
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              This helps us understand how much setup support your school may require.
            </Typography>

            <Stack spacing={3} sx={{ mb: 3 }}>
              {/* Infrastructure checkboxes */}
              <Controller
                name="infraAvailable"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.infraAvailable} component="fieldset">
                    <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                      Which of the following are available and working in your school?
                    </FormLabel>
                    <FormGroup>
                      {INFRA_OPTIONS.map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          control={
                            <Checkbox
                              checked={field.value?.includes(opt.value) || false}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...current, opt.value]);
                                } else {
                                  field.onChange(current.filter((v) => v !== opt.value));
                                }
                              }}
                              size="small"
                            />
                          }
                          label={opt.label}
                        />
                      ))}
                    </FormGroup>
                    {errors.infraAvailable && (
                      <FormHelperText>{errors.infraAvailable.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* Online experience */}
              <Controller
                name="onlineExperience"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Has the school successfully used this setup for an online class or video meeting?"
                    error={!!errors.onlineExperience}
                    helperText={errors.onlineExperience?.message}
                  >
                    {ONLINE_EXPERIENCE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {/* Operational readiness */}
              <Controller
                name="canJoinIndependently"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Can someone in your school independently connect the TV/projector, speakers and join an online meeting?"
                    error={!!errors.canJoinIndependently}
                    helperText={errors.canJoinIndependently?.message}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="With some guidance">With some guidance</MenuItem>
                    <MenuItem value="No, we'll need assistance">No, we'll need assistance</MenuItem>
                  </TextField>
                )}
              />
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Server error */}
            {serverError && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setServerError('')}>
                {serverError}
              </Alert>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              sx={{ py: 1.5 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                  Submitting...
                </>
              ) : (
                'Submit Interest'
              )}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
