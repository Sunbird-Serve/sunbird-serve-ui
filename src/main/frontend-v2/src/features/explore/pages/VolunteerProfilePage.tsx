import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Button,
  Chip,
  Alert,
  Skeleton,
  Grid,
  MenuItem,
  Autocomplete,
  Avatar,
  LinearProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import { useAppDispatch, useAppSelector } from '@app/store';
import { PageHeader } from '@shared/components';
import {
  GENDER_OPTIONS,
  LANGUAGES,
  INTERESTS,
  QUALIFICATIONS,
  EMPLOYMENT_STATUS,
  WEEK_DAY_NAMES,
  TIME_OF_DAY_OPTIONS,
  VOLUNTEER_STATUS_INFO,
} from '@shared/constants/profileOptions';
import { fetchUserByEmail } from '@features/auth/state/userSlice';
import { getApiErrorMessage } from '@features/needs/api/needsApi';
import { useGetAgenciesQuery } from '@features/volunteers/api/volunteersApi';
import { todayLocalISO } from '@features/needs/utils/sessionActions';
import {
  useGetVolunteerProfileQuery,
  useUpdateVolunteerProfileMutation,
  useCreateVolunteerProfileMutation,
  useUpdateVolunteerUserMutation,
  type VolunteerProfile,
} from '../api/exploreApi';
import { availabilityOf, dayCode, timeBucket } from '../utils/availability';
import type { User } from '@shared/types';

interface Draft {
  gender: string;
  dob: string;
  nationality: string;
  mobile: string;
  city: string;
  state: string;
  country: string;
  qualification: string;
  employmentStatus: string;
  affiliation: string;
  yearsOfExperience: string;
  languages: string[];
  interests: string[];
  dayPreferred: string[];
  timePreferred: string[];
}

// Fields saved to the user record; the rest are saved to the volunteer profile.
const USER_KEYS: (keyof Draft)[] = ['gender', 'dob', 'nationality', 'mobile', 'city', 'state', 'country'];
const PROFILE_KEYS: (keyof Draft)[] = [
  'qualification', 'employmentStatus', 'affiliation', 'yearsOfExperience',
  'languages', 'interests', 'dayPreferred', 'timePreferred',
];

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Show days and times the way they are offered in the form, whatever the stored spelling is.
function fullDayNames(list?: string[]): string[] {
  const codes = (list ?? []).map(dayCode).filter((c): c is string => c !== null);
  return WEEK_DAY_NAMES.filter((d) => codes.includes(d.slice(0, 3)));
}

function timeOptionNames(list?: string[]): string[] {
  const buckets: (string | null)[] = (list ?? []).map(timeBucket);
  return TIME_OF_DAY_OPTIONS.filter((t) => buckets.includes(timeBucket(t)));
}

function draftFrom(user: User | null, profile?: VolunteerProfile): Draft {
  const identity = (user?.identityDetails ?? {}) as Record<string, unknown>;
  const contact = user?.contactDetails;
  return {
    gender: (identity.gender as string) || '',
    dob: ((identity.dob as string) || '').substring(0, 10),
    nationality: (identity.Nationality as string) || (identity.nationality as string) || '',
    mobile: contact?.mobile || '',
    city: contact?.address?.city || '',
    state: contact?.address?.state || '',
    country: contact?.address?.country || '',
    qualification: profile?.genericDetails?.qualification || '',
    employmentStatus: profile?.genericDetails?.employmentStatus || '',
    affiliation: profile?.genericDetails?.affiliation || '',
    yearsOfExperience: profile?.genericDetails?.yearsOfExperience || '',
    languages: profile?.userPreference?.language ?? [],
    interests: profile?.userPreference?.interestArea ?? [],
    dayPreferred: fullDayNames(profile?.userPreference?.dayPreferred),
    timePreferred: timeOptionNames(profile?.userPreference?.timePreferred),
  };
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ mt: subtitle ? 0 : 1.5 }}>{children}</Box>
    </Paper>
  );
}

function ViewField({ label, value }: { label: string; value?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" color={value ? 'text.primary' : 'text.disabled'}>
        {value || 'Not added yet'}
      </Typography>
    </Box>
  );
}

function ChipField({ label, items }: { label: string; items: string[] }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {items.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.5 }}>
          {items.map((item) => <Chip key={item} label={item} size="small" variant="outlined" />)}
        </Stack>
      ) : (
        <Typography variant="body1" color="text.disabled">Not added yet</Typography>
      )}
    </Box>
  );
}

function ToggleChips({
  label,
  options,
  value,
  onChange,
  display,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  display?: (option: string) => string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
        {options.map((opt) => {
          const on = value.includes(opt);
          return (
            <Chip
              key={opt}
              label={display ? display(opt) : opt}
              onClick={() => onChange(on ? value.filter((v) => v !== opt) : [...value, opt])}
              color={on ? 'primary' : 'default'}
              variant={on ? 'filled' : 'outlined'}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

export function VolunteerProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const { data: profile, isLoading, isError, error: profileError, refetch } = useGetVolunteerProfileQuery(userId, { skip: !userId });
  const { data: agencies = [] } = useGetAgenciesQuery();
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateVolunteerProfileMutation();
  const [createProfile, { isLoading: creatingProfile }] = useCreateVolunteerProfileMutation();
  const [updateUser, { isLoading: updatingUser }] = useUpdateVolunteerUserMutation();
  const saving = updatingProfile || creatingProfile || updatingUser;

  // Only a 404 means "no profile yet" (it is then created on first save). Any other failure (500, 401, network) might hide an
  // existing profile, so editing is blocked rather than risk creating a duplicate record.
  const profileStatus = (profileError as { status?: number } | undefined)?.status;
  const profileMissing = isError && profileStatus === 404;
  const profileFailed = isError && !profileMissing;

  const saved = useMemo(() => draftFrom(user, profile), [user, profile]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(saved);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fullName = [user?.identityDetails?.fullname, user?.identityDetails?.name].filter(Boolean).join(' ') || '—';
  const email = user?.contactDetails?.email || '—';
  const status = user?.status || 'Registered';
  const statusInfo = VOLUNTEER_STATUS_INFO[status] || { label: status, hint: '' };
  const agencyName = agencies.find((a) => a.osid === user?.agencyId)?.name || '';

  const availability = availabilityOf(profile);
  const hasAvailability = availability.days.length > 0 || availability.times.length > 0;

  // Profile completeness, based on what is saved
  const completeness = useMemo(() => {
    const items = [
      { label: 'gender', done: !!saved.gender },
      { label: 'date of birth', done: !!saved.dob },
      { label: 'phone number', done: !!saved.mobile },
      { label: 'city', done: !!saved.city },
      { label: 'qualification', done: !!saved.qualification },
      { label: 'employment status', done: !!saved.employmentStatus },
      { label: 'languages', done: saved.languages.length > 0 },
      { label: 'areas of interest', done: saved.interests.length > 0 },
      { label: 'available days', done: saved.dayPreferred.length > 0 },
      { label: 'available time of day', done: saved.timePreferred.length > 0 },
    ];
    const done = items.filter((i) => i.done).length;
    return {
      percent: Math.round((done / items.length) * 100),
      missing: items.filter((i) => !i.done).map((i) => i.label),
    };
  }, [saved]);

  const startEdit = () => {
    setDraft(saved);
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user) return;
    setError('');

    const phone = draft.mobile.replace(/[\s-]/g, '');
    if (phone && !/^\+?\d{10,15}$/.test(phone)) {
      setError('Please enter a valid phone number (10 to 15 digits).');
      return;
    }
    if (draft.dob && draft.dob > todayLocalISO()) {
      setError('Date of birth cannot be in the future.');
      return;
    }
    const years = draft.yearsOfExperience.trim();
    if (years && (Number.isNaN(Number(years)) || Number(years) < 0 || Number(years) > 70)) {
      setError('Years of experience must be a number between 0 and 70.');
      return;
    }

    const next: Draft = { ...draft, mobile: phone, yearsOfExperience: years };
    const userChanged = USER_KEYS.some((k) => !sameValue(next[k], saved[k]));
    // With no profile yet, saving always creates it (even if every field is left empty)
    const profileChanged = profileMissing || PROFILE_KEYS.some((k) => !sameValue(next[k], saved[k]));
    if (!userChanged && !profileChanged) {
      setEditing(false);
      return;
    }

    try {
      // 1. Personal and contact details (the backend needs the full user record)
      if (userChanged) {
        await updateUser({
          osid: user.osid,
          body: {
            identityDetails: {
              ...(user.identityDetails as unknown as Record<string, unknown>),
              gender: next.gender,
              dob: next.dob,
              Nationality: next.nationality,
            },
            contactDetails: {
              ...user.contactDetails,
              mobile: next.mobile,
              address: {
                ...user.contactDetails?.address,
                city: next.city,
                state: next.state,
                country: next.country,
              },
            },
            role: user.role,
            agencyId: user.agencyId,
            status: user.status,
          },
        }).unwrap();
      }

      // 2. Qualification, languages, interests and availability
      if (profileChanged) {
        // No profile loaded: look once more right before creating one
        let current = profile;
        if (!current) {
          try {
            current = await refetch().unwrap();
          } catch {
            current = undefined;
          }
        }
        const base: Partial<VolunteerProfile> = current ?? {
          skills: [],
          referenceChannelId: '',
          volunteeringHours: { totalHours: 0, hoursPerWeek: 0 },
        };
        const body: Partial<VolunteerProfile> = {
          ...base,
          userId,
          agencyId: base.agencyId || user.agencyId,
          genericDetails: {
            ...base.genericDetails,
            qualification: next.qualification,
            employmentStatus: next.employmentStatus,
            affiliation: next.affiliation,
            yearsOfExperience: next.yearsOfExperience,
          },
          userPreference: {
            ...base.userPreference,
            dayPreferred: next.dayPreferred,
            timePreferred: next.timePreferred,
            interestArea: next.interests,
            language: next.languages,
          },
        };
        if (current) {
          if (!current.osid) throw new Error('Could not find your profile record to update. Please contact support.');
          await updateProfile({ profileId: current.osid, body }).unwrap();
        } else {
          await createProfile(body).unwrap();
        }
      }

      // Reload the signed-in user so the rest of the app shows the new details
      if (userChanged && user.contactDetails?.email) {
        await dispatch(fetchUserByEmail(user.contactDetails.email.replace(/@/g, '%40')));
      }

      setSuccess(profileMissing ? 'Profile created.' : 'Profile updated.');
      setEditing(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        const { status, message } = getApiErrorMessage(err);
        setError(message);
        // 409 on create: this volunteer already has a profile, so load it instead of creating another
        if (status === 409) refetch();
      }
    }
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={60} variant="rounded" />
        <Skeleton height={200} variant="rounded" />
      </Stack>
    );
  }

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="View and update your details, availability and preferences."
        icon={<PersonIcon />}
        actions={!editing ? (
          <Button
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={startEdit}
            disabled={profileFailed}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            {profileMissing ? 'Create Profile' : 'Edit'}
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={cancelEdit}
              disabled={saving}
              sx={{ bgcolor: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              {saving ? 'Saving...' : profileMissing ? 'Create Profile' : 'Save'}
            </Button>
          </Stack>
        )}
      />

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {profileFailed && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
          We could not load your preferences. Please try again before editing.
        </Alert>
      )}

      {/* Summary */}
      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.4rem' }}>
              {fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>{fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{email}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                <Chip label={statusInfo.label} size="small" color={status === 'Active' ? 'success' : 'default'} />
                {agencyName && <Chip label={agencyName} size="small" variant="outlined" />}
              </Stack>
            </Box>
          </Stack>
          <Button variant="outlined" size="small" onClick={() => navigate('/explore/home')}>
            View my impact
          </Button>
        </Stack>

        {completeness.percent < 100 ? (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Profile completeness</Typography>
              <Typography variant="caption" fontWeight={600}>{completeness.percent}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={completeness.percent} sx={{ height: 6, borderRadius: 3 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
              Add: {completeness.missing.slice(0, 4).join(', ')}
              {completeness.missing.length > 4 ? ` and ${completeness.missing.length - 4} more` : ''}
            </Typography>
          </Box>
        ) : (
          <Chip label="Profile complete" size="small" color="success" variant="outlined" sx={{ mt: 2 }} />
        )}
      </Paper>

      {/* Volunteer has an account but no profile record yet */}
      {!editing && profileMissing && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={startEdit}>Create profile</Button>}
        >
          Your volunteer profile isn&apos;t set up yet. Create it to add your availability, languages and interests,
          so matching needs can be highlighted for you.
        </Alert>
      )}
      {editing && profileMissing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Fill in your details below, then press Create Profile.
        </Alert>
      )}

      {!editing && !hasAvailability && !profileFailed && !profileMissing && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={startEdit}>Set now</Button>}
        >
          Tell us the days and times you can volunteer. Matching needs will be highlighted in Explore.
        </Alert>
      )}

      {/* Personal details */}
      <Section title="Personal Details">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Name" value={fullName} size="small" fullWidth disabled helperText="Name can't be changed" InputLabelProps={{ shrink: true }} />
            ) : (
              <ViewField label="Name" value={fullName} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Email" value={email} size="small" fullWidth disabled helperText="Email comes from your login account" InputLabelProps={{ shrink: true }} />
            ) : (
              <ViewField label="Email" value={email} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField select label="Gender" value={draft.gender} onChange={(e) => set('gender', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }}>
                <MenuItem value="">Not specified</MenuItem>
                {GENDER_OPTIONS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            ) : (
              <ViewField label="Gender" value={saved.gender} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Date of Birth" type="date" value={draft.dob} onChange={(e) => set('dob', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ max: todayLocalISO() }} />
            ) : (
              <ViewField label="Date of Birth" value={saved.dob} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Nationality" value={draft.nationality} onChange={(e) => set('nationality', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <ViewField label="Nationality" value={saved.nationality} />
            )}
          </Grid>
        </Grid>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Phone" value={draft.mobile} onChange={(e) => set('mobile', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ inputMode: 'tel' }} />
            ) : (
              <ViewField label="Phone" value={saved.mobile} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="City" value={draft.city} onChange={(e) => set('city', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <ViewField label="City" value={saved.city} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="State" value={draft.state} onChange={(e) => set('state', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <ViewField label="State" value={saved.state} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Country" value={draft.country} onChange={(e) => set('country', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <ViewField label="Country" value={saved.country} />
            )}
          </Grid>
        </Grid>
      </Section>

      {/* Availability and preferences */}
      <Section title="Availability & Preferences" subtitle="Used to highlight needs that match when you explore.">
        <Stack spacing={2.5}>
          {editing ? (
            <>
              <ToggleChips label="Days I can volunteer" options={WEEK_DAY_NAMES} value={draft.dayPreferred} onChange={(v) => set('dayPreferred', v)} display={(d) => d.slice(0, 3)} />
              <ToggleChips label="Time of day" options={TIME_OF_DAY_OPTIONS} value={draft.timePreferred} onChange={(v) => set('timePreferred', v)} />
              <Autocomplete
                multiple
                options={LANGUAGES}
                value={draft.languages}
                onChange={(_, v) => set('languages', v)}
                renderInput={(params) => <TextField {...params} label="Languages" size="small" InputLabelProps={{ shrink: true }} />}
              />
              <Autocomplete
                multiple
                options={INTERESTS}
                value={draft.interests}
                onChange={(_, v) => set('interests', v)}
                renderInput={(params) => <TextField {...params} label="Areas of Interest" size="small" InputLabelProps={{ shrink: true }} />}
              />
            </>
          ) : (
            <>
              <ChipField label="Days I can volunteer" items={saved.dayPreferred} />
              <ChipField label="Time of day" items={saved.timePreferred} />
              <ChipField label="Languages" items={saved.languages} />
              <ChipField label="Areas of Interest" items={saved.interests} />
            </>
          )}
        </Stack>
      </Section>

      {/* Background */}
      <Section title="Background">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField select label="Qualification" value={draft.qualification} onChange={(e) => set('qualification', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }}>
                <MenuItem value="">Not specified</MenuItem>
                {QUALIFICATIONS.map((q) => <MenuItem key={q} value={q}>{q}</MenuItem>)}
              </TextField>
            ) : (
              <ViewField label="Qualification" value={saved.qualification} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField select label="Employment Status" value={draft.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }}>
                <MenuItem value="">Not specified</MenuItem>
                {EMPLOYMENT_STATUS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            ) : (
              <ViewField label="Employment Status" value={saved.employmentStatus} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Organisation / College" value={draft.affiliation} onChange={(e) => set('affiliation', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <ViewField label="Organisation / College" value={saved.affiliation} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <TextField label="Years of Experience" type="number" value={draft.yearsOfExperience} onChange={(e) => set('yearsOfExperience', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: 0, max: 70 }} />
            ) : (
              <ViewField label="Years of Experience" value={saved.yearsOfExperience} />
            )}
          </Grid>
          {!editing && profile?.skills && profile.skills.length > 0 && (
            <Grid item xs={12}>
              <ChipField label="Skills" items={profile.skills.map((s) => `${s.skillName} (${s.skillLevel})`)} />
            </Grid>
          )}
        </Grid>
      </Section>
    </Box>
  );
}
