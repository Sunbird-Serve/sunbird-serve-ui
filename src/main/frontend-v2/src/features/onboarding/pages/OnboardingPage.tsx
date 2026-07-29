import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Container,
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
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
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
  { value: 'Other', label: 'Other' },
];

const YES_NO_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
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
      hasInternet: undefined,
      hasComputer: undefined,
      hasProjector: undefined,
      hasSpeakers: undefined,
    },
  });

  const selectedDistrict = watch('district');
  const selectedBlock = watch('block');
  const selectedDesignation = watch('designation');

  // Fetch all entities initially (for district extraction), then filter as user drills down
  const { data: allEntitiesResponse, isLoading: loadingAllEntities, error: allEntitiesError } =
    useBrowseEntitiesQuery({ size: 5000 });

  // Fetch filtered entities when district+block are selected
  const { data: filteredResponse, isLoading: loadingFiltered } = useBrowseEntitiesQuery(
    { district: selectedDistrict, block: selectedBlock, name: entitySearch || undefined, size: 500 },
    { skip: !selectedDistrict || !selectedBlock },
  );

  const [submitRequest, { isLoading: submitting }] = useSubmitOnboardingRequestMutation();

  // Extract distinct districts from all entities (exclude Inactive)
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

  // Entities for the autocomplete (exclude Inactive)
  const entities: EntityOnboardEntity[] = useMemo(
    () => (filteredResponse?.content ?? []).filter((e) => e.status !== 'Inactive'),
    [filteredResponse],
  );

  // Get agencyId from selected entity
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

    // Resolve the agencyId from the selected entity
    const entity = entities.find((e) => e.id === data.entityId);
    if (!entity) {
      setServerError('Please select a valid institution.');
      return;
    }

    try {
      await submitRequest({
        agencyId: entity.agencyId,
        entityId: data.entityId,
        coordinatorName: data.coordinatorName,
        mobile: data.mobile,
        email: data.email,
        designation: data.designation === 'Other' ? (data.designationOther || 'Other') : data.designation,
        infraDetails: {
          hasInternet: data.hasInternet === 'true',
          hasComputer: data.hasComputer === 'true',
          hasProjector: data.hasProjector === 'true',
          hasSpeakers: data.hasSpeakers === 'true',
        },
      }).unwrap();
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string } };
      if (error?.status === 409) {
        setServerError(
          error.data?.message ||
            'A request already exists for this mobile number and institution. Please check your status instead.',
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
        <Paper sx={{ p: { xs: 4, sm: 6 }, maxWidth: 520, textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Request Submitted
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your request has been submitted. You'll receive confirmation once approved.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 6 }, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        {/* Header */}
        <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700} textAlign="center">
            Onboard Your School / College
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={520}>
            Activate your institution on SERVE and get access to skilled volunteers.
            This takes about 2 minutes — no login needed.
          </Typography>
        </Stack>

        <Paper sx={{ p: { xs: 3, sm: 4 } }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Section 1: Entity Selection */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              1. Select Your Institution
            </Typography>

            {allEntitiesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load institution data. Please refresh and try again.
              </Alert>
            )}

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {/* District */}
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
                      aria-required="true"
                    >
                      {districts.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Block */}
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
                      aria-required="true"
                    >
                      {blocks.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Entity (searchable autocomplete) */}
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
                          aria-required="true"
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

            <Divider sx={{ mb: 3 }} />

            {/* Section 2: Personal Details */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              2. Your Details
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {/* Full Name */}
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
                      aria-required="true"
                    />
                  )}
                />
              </Grid>

              {/* Designation */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Designation"
                      error={!!errors.designation}
                      helperText={errors.designation?.message}
                      aria-required="true"
                    >
                      {DESIGNATION_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Designation Other (conditional) */}
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
                        aria-required="true"
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Mobile */}
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
                      aria-required="true"
                    />
                  )}
                />
              </Grid>

              {/* Email */}
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
                      aria-required="true"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Section 3: Infrastructure Readiness */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              3. Infrastructure Readiness
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {/* Internet */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="hasInternet"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Internet Available"
                      error={!!errors.hasInternet}
                      helperText={errors.hasInternet?.message}
                      aria-required="true"
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Computer */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="hasComputer"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Computer Available"
                      error={!!errors.hasComputer}
                      helperText={errors.hasComputer?.message}
                      aria-required="true"
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Projector */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="hasProjector"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Projector / Smart Board"
                      error={!!errors.hasProjector}
                      helperText={errors.hasProjector?.message}
                      aria-required="true"
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Speakers */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="hasSpeakers"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Speakers Available"
                      error={!!errors.hasSpeakers}
                      helperText={errors.hasSpeakers?.message}
                      aria-required="true"
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

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
                'Submit Onboarding Request'
              )}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
