import { useState, useMemo, useEffect } from 'react';
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
import { useAppSelector } from '@app/store';
import { useSelfNominateMutation, AvailableNeed } from '../api/exploreApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

function formatDays(need: AvailableNeed): string {
  const schedule = need.requirement?.schedule || need.occurrence;
  if (!schedule?.days) return '';
  return schedule.days;
}

function formatTimeSlots(need: AvailableNeed): string {
  const schedule = need.requirement?.schedule || need.occurrence;
  const slots = schedule?.timeSlots;
  if (!slots || slots.length === 0) return '';
  return slots.map((s) => {
    const startMatch = s.startTime?.match(/(\d{2}):(\d{2})/);
    const endMatch = s.endTime?.match(/(\d{2}):(\d{2})/);
    const start = startMatch ? `${parseInt(startMatch[1]) % 12 || 12}:${startMatch[2]} ${parseInt(startMatch[1]) >= 12 ? 'PM' : 'AM'}` : '';
    const end = endMatch ? `${parseInt(endMatch[1]) % 12 || 12}:${endMatch[2]} ${parseInt(endMatch[1]) >= 12 ? 'PM' : 'AM'}` : '';
    return `${s.day} ${start}–${end}`;
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

export function ExploreNeedsPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const [needs, setNeeds] = useState<AvailableNeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/serve-need/need/?status=Approved&page=0&size=100`)
      .then((r) => r.ok ? r.json() : null)
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
  const [search, setSearch] = useState('');
  const [selectedNeed, setSelectedNeed] = useState<AvailableNeed | null>(null);

  // Filter needs by search
  const filteredNeeds = useMemo(() => {
    if (!search.trim()) return needs;
    const q = search.toLowerCase();
    return needs.filter((need) => {
      const name = (need.need?.name || need.name || '').toLowerCase();
      const entity = (need.entity?.name || '').toLowerCase();
      const district = (need.entity?.district || '').toLowerCase();
      const days = formatDays(need).toLowerCase();
      const skills = (need.requirement?.skillDetails || '').toLowerCase();
      return name.includes(q) || entity.includes(q) || district.includes(q) || days.includes(q) || skills.includes(q);
    });
  }, [needs, search]);

  const handleNominate = async (need: AvailableNeed) => {
    const needId = need.need?.id || need.id;
    if (!userId) {
      setError('Please login or sign up to express interest.');
      setSelectedNeed(null);
      return;
    }
    if (!needId) return;
    setError('');
    try {
      await selfNominate({ needId, userId }).unwrap();
      setSuccess(`You've expressed interest in "${need.need?.name || need.name}". The coordinator will review your nomination.`);
      setNominatedIds((prev) => [...prev, needId]);
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

      <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>Explore Needs</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Find opportunities that match your skills and interests.
      </Typography>

      {/* Search Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by school, subject, days, location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
        }}
        sx={{ mb: 3, maxWidth: 500 }}
        InputLabelProps={{ shrink: true }}
      />

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {filteredNeeds.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {search ? 'No needs match your search.' : 'No needs available right now. Check back later.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredNeeds.map((need) => {
            const needId = need.need?.id || need.id;
            const needName = need.need?.name || need.name;
            const entityName = need.entity?.name || '';
            const district = need.entity?.district || '';
            const days = formatDays(need);
            const alreadyNominated = nominatedIds.includes(needId);

            return (
              <Grid item xs={12} sm={6} md={4} key={needId}>
                <Paper
                  sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' } }}
                  onClick={() => setSelectedNeed(need)}
                >
                  <Stack spacing={1} sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{needName}</Typography>
                    {entityName && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{entityName}</Typography>
                      </Stack>
                    )}
                    {district && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{district}</Typography>
                      </Stack>
                    )}
                    {days && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">{days}</Typography>
                      </Stack>
                    )}
                  </Stack>
                  {alreadyNominated && (
                    <Chip label="Interest Submitted" size="small" color="success" variant="outlined" sx={{ mt: 1.5, alignSelf: 'flex-start' }} />
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
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
                  disabled={nominating || nominatedIds.includes(selectedNeed.need?.id || selectedNeed.id)}
                >
                  {nominatedIds.includes(selectedNeed.need?.id || selectedNeed.id) ? 'Interest Submitted' : "I'm Interested"}
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
