import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  Alert,
  Skeleton,
  Grid,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useAppSelector } from '@app/store';
import { useSelfNominateMutation, useGetVolunteerProfileQuery, AvailableNeed } from '../api/exploreApi';
import { availabilityOf, hasAvailability, type Availability } from '../utils/availability';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAuthHeaders } from '@shared/utils/authHeaders';
import { apiUrl } from '@shared/utils/apiUrls';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

function formatDays(need: AvailableNeed): string {
  const schedule = need.requirement?.schedule || need.occurrence;
  if (!schedule?.days) return '';
  return schedule.days;
}

function formatTimeSlots(need: AvailableNeed): string {
  const schedule = need.requirement?.schedule || need.occurrence;
  const slots = schedule?.timeSlots || need.timeSlots;
  if (!slots || slots.length === 0) return '';
  return slots.map((s) => {
    const startMatch = s.startTime?.match(/(\d{2}):(\d{2})/);
    const endMatch = s.endTime?.match(/(\d{2}):(\d{2})/);
    const start = startMatch ? `${parseInt(startMatch[1]) % 12 || 12}:${startMatch[2]} ${parseInt(startMatch[1]) >= 12 ? 'PM' : 'AM'}` : '';
    const end = endMatch ? `${parseInt(endMatch[1]) % 12 || 12}:${endMatch[2]} ${parseInt(endMatch[1]) >= 12 ? 'PM' : 'AM'}` : '';
    return `${start}–${end}`;
  }).join(', ');
}

function getStartDate(need: AvailableNeed): string {
  const schedule = (need.requirement?.schedule || need.occurrence) as Record<string, unknown> | undefined;
  return (schedule?.startDate as string)?.substring(0, 10) || '';
}

function getEndDate(need: AvailableNeed): string {
  const schedule = (need.requirement?.schedule || need.occurrence) as Record<string, unknown> | undefined;
  return (schedule?.endDate as string)?.substring(0, 10) || '';
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Days (Mon..Sun) a need runs on, read from its days text such as "Monday,Wednesday".
function needDays(need: AvailableNeed): string[] {
  const text = formatDays(need).toLowerCase();
  return WEEK_DAYS.filter((d) => text.includes(d.toLowerCase()));
}

function firstSlotMinutes(need: AvailableNeed): { start: number; end: number | null } | null {
  const schedule = need.requirement?.schedule || need.occurrence;
  const slot = (schedule?.timeSlots || need.timeSlots)?.[0];
  const s = slot?.startTime?.match(/(\d{2}):(\d{2})/);
  if (!s) return null;
  const e = slot?.endTime?.match(/(\d{2}):(\d{2})/);
  return {
    start: parseInt(s[1]) * 60 + parseInt(s[2]),
    end: e ? parseInt(e[1]) * 60 + parseInt(e[2]) : null,
  };
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';
function timeOfDay(startMinutes: number): TimeOfDay {
  if (startMinutes < 12 * 60) return 'morning';
  if (startMinutes < 16 * 60) return 'afternoon';
  return 'evening';
}

// True when the need fits the volunteer's saved availability: every day the need runs is a day
// they can volunteer, and the session time falls in a time of day they chose. Needs with no
// day or time information to compare are not marked as matching.
function matchesAvailability(need: AvailableNeed, a: Availability): boolean {
  if (!hasAvailability(a)) return false;
  const nd = needDays(need);
  const slot = firstSlotMinutes(need);
  const compareDays = a.days.length > 0 && nd.length > 0;
  const compareTime = a.times.length > 0 && slot !== null;
  if (!compareDays && !compareTime) return false;
  const dayOk = !compareDays || nd.every((d) => a.days.includes(d));
  const timeOk = !compareTime || a.times.includes(timeOfDay(slot!.start));
  return dayOk && timeOk;
}

// e.g. "2 days/week · 1 hr per session · till 28 Feb 2026"
function commitmentLine(need: AvailableNeed): string {
  const parts: string[] = [];
  const days = needDays(need).length;
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}/week`);
  const slot = firstSlotMinutes(need);
  if (slot?.end != null && slot.end > slot.start) {
    const mins = slot.end - slot.start;
    parts.push(mins < 60 ? `${mins} min per session` : `${mins / 60} hr${mins / 60 === 1 ? '' : 's'} per session`);
  }
  const end = getEndDate(need);
  if (end) {
    const d = new Date(end + 'T00:00:00');
    if (!Number.isNaN(d.getTime())) {
      parts.push(`till ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`);
    }
  }
  return parts.join(' · ');
}
// Indian academic year (Apr–Mar): starting calendar year for a given ISO date.
function academicYearOf(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

function academicYearLabel(startYear: number): string {
  return `AY ${startYear}–${startYear + 1}`;
}

function currentAcademicYear(): number {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

// Deterministic soft accent color per need, for a bit of visual variety.
const ACCENT_COLORS = ['#0E7490', '#7C3AED', '#DB2777', '#EA580C', '#059669', '#2563EB'];
function accentFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

export function ExploreNeedsPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  // The volunteer's saved availability, used to highlight matching needs
  const { data: volunteerProfile } = useGetVolunteerProfileQuery(userId, { skip: !userId });
  const availability = useMemo(() => availabilityOf(volunteerProfile), [volunteerProfile]);
  const hasAvail = hasAvailability(availability);

  const [needs, setNeeds] = useState<AvailableNeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const headers = getAuthHeaders();
    fetch(`${BASE_URL}/api/v1/serve-need/need/?status=Approved&page=0&size=100`, {
      ...(headers.Authorization ? { headers } : {}),
    })
      .then((r) => {
        if (r.status === 401) {
          // Backend requires auth — try with auth headers if available
          if (headers.Authorization) return null;
          // No token available — needs will remain empty, user sees login prompt
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (data) {
          const content = Array.isArray(data) ? data : (data.content || []);
          setNeeds(content);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);
  const [selfNominate, { isLoading: nominating }] = useSelfNominateMutation();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [nominatedIds, setNominatedIds] = useState<string[]>([]);
  const [hasPendingNomination, setHasPendingNomination] = useState(false);
  const [pendingNeedIds, setPendingNeedIds] = useState<string[]>([]);

  // Check if volunteer already has a pending nomination
  useEffect(() => {
    if (!userId) return;
    async function checkExistingNominations() {
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const resp = await fetch(
          apiUrl(`/api/v1/serve-fulfill/nomination/${userId}?page=0&size=50`),
          { headers: getAuthHeaders() },
        );
        if (resp.ok) {
          const data = await resp.json();
          const noms = Array.isArray(data) ? data : (data.content || []);
          const pending = noms.filter((n: { nominationStatus: string }) => n.nominationStatus === 'Nominated');
          const alreadyNominated = noms.map((n: { needId: string }) => n.needId);
          setHasPendingNomination(pending.length > 0);
          setPendingNeedIds(pending.map((n: { needId: string }) => n.needId));
          setNominatedIds(alreadyNominated);
        }
      } catch { /* silent */ }
    }
    checkExistingNominations();
  }, [userId]);
  const [search, setSearch] = useState('');
  const [selectedNeed, setSelectedNeed] = useState<AvailableNeed | null>(null);
  // Academic-year filter: 'all' or a starting year number as string.
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Availability filters: days the volunteer is free, and time of day
  const [dayFilter, setDayFilter] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'any' | TimeOfDay>('any');
  const [matchOnly, setMatchOnly] = useState(false);
  const filtersActive = dayFilter.length > 0 || timeFilter !== 'any' || matchOnly;

  // Filter needs by search, free days and time of day
  const filteredNeeds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return needs.filter((need) => {
      if (q) {
        const name = (need.need?.name || need.name || '').toLowerCase();
        const entity = (need.entity?.name || '').toLowerCase();
        const district = (need.entity?.district || '').toLowerCase();
        const days = formatDays(need).toLowerCase();
        const skills = (need.requirement?.skillDetails || '').toLowerCase();
        const timeSlots = formatTimeSlots(need).toLowerCase();
        const match = name.includes(q) || entity.includes(q) || district.includes(q) || days.includes(q) || skills.includes(q) || timeSlots.includes(q);
        if (!match) return false;
      }
      if (dayFilter.length > 0) {
        // Show needs that run on at least one of the selected days
        const nd = needDays(need);
        if (nd.length > 0 && !nd.some((d) => dayFilter.includes(d))) return false;
      }
      if (timeFilter !== 'any') {
        const slot = firstSlotMinutes(need);
        if (!slot || timeOfDay(slot.start) !== timeFilter) return false;
      }
      if (matchOnly && !matchesAvailability(need, availability)) return false;
      return true;
    });
  }, [needs, search, dayFilter, timeFilter, matchOnly, availability]);

  const pendingNeedName = useMemo(() => {
    const n = needs.find((x) => pendingNeedIds.includes(x.need?.id || x.id));
    return n ? n.need?.name || n.name : '';
  }, [needs, pendingNeedIds]);
  // Group filtered needs by academic year (current year first, then desc).
  const curAY = currentAcademicYear();
  const groupedByYear = useMemo(() => {
    const groups = new Map<number, AvailableNeed[]>();
    const undated: AvailableNeed[] = [];
    for (const need of filteredNeeds) {
      const year = academicYearOf(getStartDate(need) || getEndDate(need));
      if (year == null) { undated.push(need); continue; }
      const list = groups.get(year) || [];
      list.push(need);
      groups.set(year, list);
    }
    const sorted = Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === curAY) return -1;
      if (b[0] === curAY) return 1;
      return b[0] - a[0];
    });
    return { sorted, undated };
  }, [filteredNeeds, curAY]);

  // Year options for the filter chips (years present in the data).
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const need of needs) {
      const y = academicYearOf(getStartDate(need) || getEndDate(need));
      if (y != null) years.add(y);
    }
    return Array.from(years).sort((a, b) => {
      if (a === curAY) return -1;
      if (b === curAY) return 1;
      return b - a;
    });
  }, [needs, curAY]);

  // Apply year filter to the grouped structure.
  const visibleGroups = useMemo(() => {
    if (yearFilter === 'all') return groupedByYear.sorted;
    const y = Number(yearFilter);
    return groupedByYear.sorted.filter(([year]) => year === y);
  }, [groupedByYear.sorted, yearFilter]);

  const handleNominate = async (need: AvailableNeed) => {
    const needId = need.need?.id || need.id;
    if (!userId) {
      setError('Please login or sign up to express interest.');
      setSelectedNeed(null);
      return;
    }
    if (hasPendingNomination) {
      setError('You can have one pending nomination at a time. Once your coordinator reviews it, you can express interest in another need.');
      setSelectedNeed(null);
      return;
    }
    if (!needId) return;
    setError('');
    try {
      await selfNominate({ needId, userId }).unwrap();
      setSuccess(`You've expressed interest in "${need.need?.name || need.name}". The coordinator will review your nomination.`);
      setNominatedIds((prev) => [...prev, needId]);
      setHasPendingNomination(true);
      setSelectedNeed(null);
      setTimeout(() => setSuccess(''), 5000);
    } catch {
      setError('Failed to submit. Please try again.');
    }
  };

  if (isLoading) {
    return <Stack spacing={2}><Skeleton height={120} variant="rounded" /><Skeleton height={120} variant="rounded" /><Skeleton height={120} variant="rounded" /></Stack>;
  }

  return (
    <Box>
      {/* Header with login/signup for non-logged-in users */}
      {!userId && (
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mb: 2 }}>
          <Button variant="outlined" size="small" href="/login">Login</Button>
          <Button variant="contained" size="small" href="/signup/volunteer">Sign Up</Button>
        </Stack>
      )}

      {/* Hero header */}
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          borderRadius: 3,
          color: 'white',
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 55%, #155E75 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 85% 15%, rgba(252, 211, 77, 0.18) 0%, transparent 45%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <VolunteerActivismIcon />
            <Typography variant="h5" fontWeight={700}>Explore Needs</Typography>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 2.5, maxWidth: 560 }}>
            Find opportunities that match your skills and interests, and express your interest with a single tap.
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by school, subject, days, time, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
              sx: { bgcolor: 'white', borderRadius: 2 },
            }}
            sx={{ maxWidth: 560 }}
          />
        </Box>
      </Paper>

      {/* Availability filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2 }}>
        <Stack spacing={1.5}>
          {userId && (
            <Box>
              {hasAvail ? (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Matches my availability"
                  onClick={() => setMatchOnly((v) => !v)}
                  color={matchOnly ? 'success' : 'default'}
                  variant={matchOnly ? 'filled' : 'outlined'}
                />
              ) : (
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary">
                    Set your available days and times to see needs that match.
                  </Typography>
                  <Button size="small" onClick={() => navigate('/explore/profile')}>Set my availability</Button>
                </Stack>
              )}
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>NEEDS RUNNING ON ANY OF THESE DAYS</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
              {WEEK_DAYS.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  size="small"
                  onClick={() => setDayFilter((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
                  color={dayFilter.includes(d) ? 'primary' : 'default'}
                  variant={dayFilter.includes(d) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>TIME OF DAY</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
              {([['any', 'Any time'], ['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']] as const).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  size="small"
                  onClick={() => setTimeFilter(value)}
                  color={timeFilter === value ? 'primary' : 'default'}
                  variant={timeFilter === value ? 'filled' : 'outlined'}
                />
              ))}
              {filtersActive && (
                <Button size="small" onClick={() => { setDayFilter([]); setTimeFilter('any'); setMatchOnly(false); }}>
                  Clear filters
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Academic-year filter chips */}
      {availableYears.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="All Years"
            onClick={() => setYearFilter('all')}
            color={yearFilter === 'all' ? 'primary' : 'default'}
            variant={yearFilter === 'all' ? 'filled' : 'outlined'}
          />
          {availableYears.map((y) => (
            <Chip
              key={y}
              label={y === curAY ? `${academicYearLabel(y)} · Current` : academicYearLabel(y)}
              onClick={() => setYearFilter(String(y))}
              color={yearFilter === String(y) ? 'primary' : 'default'}
              variant={yearFilter === String(y) ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      )}

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {hasPendingNomination && !success && !error && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={() => navigate('/explore/nominations')}>View</Button>}
        >
          You can have one pending nomination at a time{pendingNeedName ? ` (${pendingNeedName})` : ''}. Once your coordinator reviews it, you can express interest in another need.
        </Alert>
      )}

      {filteredNeeds.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <VolunteerActivismIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {search || filtersActive ? 'No needs match your search or filters.' : userId ? 'No needs available right now. Check back later.' : 'Please login to explore available needs.'}
          </Typography>
          {!userId && (
            <Button variant="contained" href="/login" sx={{ mt: 2 }}>
              Login to Explore
            </Button>
          )}
        </Paper>
      ) : (
        <Stack spacing={3.5}>
          {visibleGroups.map(([year, yearNeeds]) => {
            const isCurrent = year === curAY;
            return (
              <Box key={year}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Typography variant={isCurrent ? 'h6' : 'subtitle1'} fontWeight={700} color={isCurrent ? 'text.primary' : 'text.secondary'}>
                    {academicYearLabel(year)}
                  </Typography>
                  {isCurrent && <Chip label="Current Year" size="small" color="primary" />}
                  <Chip label={`${yearNeeds.length} ${yearNeeds.length === 1 ? 'need' : 'needs'}`} size="small" variant="outlined" />
                </Stack>
                <Grid container spacing={2} sx={{ opacity: isCurrent ? 1 : 0.85 }}>
                  {yearNeeds.map((need) => (
                    <Grid item xs={12} sm={6} md={4} key={need.need?.id || need.id}>
                      <NeedCard
                        need={need}
                        alreadyNominated={nominatedIds.includes(need.need?.id || need.id)}
                        matches={matchesAvailability(need, availability)}
                        onOpen={() => setSelectedNeed(need)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}

          {/* Needs without a schedule date */}
          {yearFilter === 'all' && groupedByYear.undated.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
                Other Opportunities
              </Typography>
              <Grid container spacing={2}>
                {groupedByYear.undated.map((need) => (
                  <Grid item xs={12} sm={6} md={4} key={need.need?.id || need.id}>
                    <NeedCard
                      need={need}
                      alreadyNominated={nominatedIds.includes(need.need?.id || need.id)}
                      matches={matchesAvailability(need, availability)}
                      onOpen={() => setSelectedNeed(need)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Stack>
      )}

      {/* Need Detail Dialog */}
      <Dialog open={Boolean(selectedNeed)} onClose={() => setSelectedNeed(null)} maxWidth="sm" fullWidth>
        {selectedNeed && (
          <>
            <Box sx={{ p: 3, pb: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" fontWeight={600}>
                  {selectedNeed.need?.name || selectedNeed.name}
                </Typography>
                <IconButton size="small" onClick={() => setSelectedNeed(null)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>
            <DialogContent>
              <Stack spacing={2}>
                {/* Entity / School */}
                {selectedNeed.entity?.name && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusinessIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{selectedNeed.entity.name}</Typography>
                      {selectedNeed.entity.district && (
                        <Typography variant="caption" color="text.secondary">{selectedNeed.entity.district}</Typography>
                      )}
                    </Box>
                  </Stack>
                )}

                <Divider />

                {/* Schedule */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Schedule</Typography>
                  <Stack spacing={1}>
                    {formatDays(selectedNeed) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">{formatDays(selectedNeed)}</Typography>
                      </Stack>
                    )}
                    {formatTimeSlots(selectedNeed) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">{formatTimeSlots(selectedNeed)}</Typography>
                      </Stack>
                    )}
                    {commitmentLine(selectedNeed) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>{commitmentLine(selectedNeed)}</Typography>
                      </Stack>
                    )}
                    {getStartDate(selectedNeed) && (
                      <Typography variant="caption" color="text.secondary">
                        Period: {getStartDate(selectedNeed)} to {getEndDate(selectedNeed)}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Skills */}
                {selectedNeed.requirement?.skillDetails && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Skills Needed</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {selectedNeed.requirement.skillDetails.split(',').map((skill) => (
                        <Chip key={skill.trim()} label={skill.trim()} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Description */}
                {(selectedNeed.description || selectedNeed.needPurpose) && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>About</Typography>
                    <Typography variant="body2">{selectedNeed.description || selectedNeed.needPurpose}</Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="text" onClick={() => setSelectedNeed(null)}>Close</Button>
              {userId ? (
                <Button
                  variant="contained"
                  startIcon={<VolunteerActivismIcon />}
                  onClick={() => handleNominate(selectedNeed)}
                  disabled={nominating || hasPendingNomination || nominatedIds.includes(selectedNeed.need?.id || selectedNeed.id)}
                >
                  {nominatedIds.includes(selectedNeed.need?.id || selectedNeed.id) ? 'Interest Submitted' : hasPendingNomination ? 'Another Nomination Pending' : "I'm Interested"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  href="/login"
                >
                  Login to Express Interest
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// Revamped need card with a colored accent, skill preview, and hover lift.
function NeedCard({
  need,
  alreadyNominated,
  matches,
  onOpen,
}: {
  need: AvailableNeed;
  alreadyNominated: boolean;
  matches: boolean;
  onOpen: () => void;
}) {
  const needId = need.need?.id || need.id;
  const needName = need.need?.name || need.name;
  const entityName = need.entity?.name || '';
  const district = need.entity?.district || '';
  const days = formatDays(need);
  const timeSlots = formatTimeSlots(need);
  const commitment = commitmentLine(need);
  const skills = (need.requirement?.skillDetails || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const accent = accentFor(needId || needName || '');

  return (
    <Paper
      onClick={onOpen}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: 2.5,
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        borderTop: `4px solid ${accent}`,
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(0,0,0,0.12)' },
      }}
    >
      <Box sx={{ p: 2.5, flexGrow: 1 }}>
        {matches && (
          <Chip
            icon={<CheckCircleIcon />}
            label="Matches your availability"
            size="small"
            color="success"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        )}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3 }}>
          {needName}
        </Typography>
        <Stack spacing={0.75}>
          {entityName && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <BusinessIcon sx={{ fontSize: 16, color: accent }} />
              <Typography variant="body2" color="text.secondary" noWrap>{entityName}</Typography>
            </Stack>
          )}
          {district && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">{district}</Typography>
            </Stack>
          )}
          {days && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{days}</Typography>
            </Stack>
          )}
          {timeSlots && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{timeSlots}</Typography>
            </Stack>
          )}
          {commitment && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 16, color: accent }} />
              <Typography variant="caption" fontWeight={600}>{commitment}</Typography>
            </Stack>
          )}
        </Stack>

        {skills.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1.5 }}>
            {skills.slice(0, 3).map((skill) => (
              <Chip key={skill} label={skill} size="small" variant="outlined" sx={{ borderColor: accent, color: accent }} />
            ))}
            {skills.length > 3 && (
              <Chip label={`+${skills.length - 3}`} size="small" variant="outlined" />
            )}
          </Stack>
        )}
      </Box>

      <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {alreadyNominated ? (
          <Chip label="Interest Submitted" size="small" color="success" variant="outlined" />
        ) : (
          <Typography variant="caption" color="text.secondary">Tap to view details</Typography>
        )}
        <Typography variant="caption" fontWeight={600} sx={{ color: accent }}>View →</Typography>
      </Box>
    </Paper>
  );
}
