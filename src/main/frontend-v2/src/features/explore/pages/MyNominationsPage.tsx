import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Skeleton,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useAppSelector } from '@app/store';
import { useGetMyNominationsQuery } from '../api/exploreApi';
import { resolveEntityName } from '../api/assignedNeeds';
import { WithdrawDialog, type WithdrawTarget } from '../components/WithdrawDialog';
import { getAuthHeaders } from '@shared/utils/authHeaders';
import { PageHeader } from '@shared/components';
import { apiUrl } from '@shared/utils/apiUrls';

interface NeedInfo {
  id: string;
  name: string;
  entityName?: string;
  days?: string;
  startDate?: string;
  endDate?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  timeSlots?: { day: string; startTime: string; endTime: string }[];
}

interface StatusConfig {
  label: string;
  color: 'success' | 'warning' | 'error' | 'default';
  icon: React.ReactNode;
  help: string;
  action?: { label: string; path: string };
}

// Plain-language status and what the volunteer can do next.
const STATUS_CONFIG: Record<string, StatusConfig> = {
  Nominated: {
    label: 'Waiting for coordinator',
    color: 'warning',
    icon: <HourglassEmptyIcon fontSize="small" />,
    help: 'Your coordinator will review your interest. You can express interest in another need once this one is reviewed.',
  },
  Approved: {
    label: 'Approved',
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />,
    help: 'You are confirmed for this need. Your sessions are listed under Sessions.',
    action: { label: 'Go to Sessions', path: '/explore/sessions' },
  },
  Rejected: {
    label: 'Not selected',
    color: 'error',
    icon: <CancelIcon fontSize="small" />,
    help: 'The coordinator chose another volunteer for this need. You can explore other needs.',
    action: { label: 'Explore needs', path: '/explore/needs' },
  },
  Backfill: {
    label: 'No longer assigned',
    color: 'default',
    icon: <CancelIcon fontSize="small" />,
    help: 'You are no longer assigned to this need. Please contact your coordinator if you have questions.',
  },
};

function formatTime(timeString?: string): string {
  if (!timeString) return '';
  const match = timeString.match(/(\d{2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
  return timeString;
}

async function getJson(url: string): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const resp = await fetch(url, { headers: getAuthHeaders() });
    return resp.ok ? await resp.json() : null;
  } catch {
    return null;
  }
}

async function loadNeedInfo(needId: string): Promise<NeedInfo | null> {
  const [data, planData] = await Promise.all([
    getJson(apiUrl(`/api/v1/serve-need/need/${needId}`)),
    getJson(apiUrl(`/api/v1/serve-need/need-plan/${needId}`)),
  ]);
  if (!data) return null;

  const need = Array.isArray(data) ? data[0] : data;
  const entityName = await resolveEntityName(need);
  const name = need?.name || need?.need?.name || `Need ${needId.slice(-6)}`;

  let days = '', startDate = '', endDate = '';
  let timeSlots: { day: string; startTime: string; endTime: string }[] = [];
  if (planData) {
    const plans = Array.isArray(planData) ? planData : (planData.content || []);
    if (plans.length > 0) {
      days = plans[0]?.occurrence?.days || '';
      startDate = plans[0]?.occurrence?.startDate?.substring(0, 10) || '';
      endDate = plans[0]?.occurrence?.endDate?.substring(0, 10) || '';
      timeSlots = plans[0]?.timeSlots || [];
    }
  }

  // Coordinator info from the need's owner
  let coordinatorName = '', coordinatorPhone = '';
  const coordUserId = need?.userId || need?.need?.userId;
  if (coordUserId) {
    const coordData = await getJson(apiUrl(`/api/v1/serve-volunteering/user/${coordUserId}`));
    coordinatorName = coordData?.identityDetails?.fullname || '';
    coordinatorPhone = coordData?.contactDetails?.mobile || '';
  }

  return { id: needId, name, entityName, days, startDate, endDate, coordinatorName, coordinatorPhone, timeSlots };
}

export function MyNominationsPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const { data: nominations = [], isLoading, isError, refetch } = useGetMyNominationsQuery(userId, { skip: !userId });
  const [needInfoMap, setNeedInfoMap] = useState<Record<string, NeedInfo>>({});
  const [withdrawTarget, setWithdrawTarget] = useState<WithdrawTarget | null>(null);
  const [notice, setNotice] = useState('');

  // Fetch need details for each nomination, all needs in parallel
  useEffect(() => {
    if (nominations.length === 0) return;
    let cancelled = false;
    const uniqueNeedIds = [...new Set(nominations.map((n) => n.needId))];
    Promise.all(uniqueNeedIds.map((id) => loadNeedInfo(id))).then((infos) => {
      if (cancelled) return;
      const infoMap: Record<string, NeedInfo> = {};
      for (const info of infos) if (info) infoMap[info.id] = info;
      setNeedInfoMap(infoMap);
    });
    return () => {
      cancelled = true;
    };
  }, [nominations]);

  if (isLoading) {
    return <Stack spacing={2}><Skeleton height={100} variant="rounded" /><Skeleton height={100} variant="rounded" /></Stack>;
  }

  if (isError) {
    return (
      <Box>
        <PageHeader title="My Needs" subtitle="Needs you've expressed interest in." icon={<VolunteerActivismIcon />} />
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
          We could not load your needs. Please try again.
        </Alert>
      </Box>
    );
  }

  // Sort: Approved first, then Nominated, then Rejected
  const sortedNominations = [...nominations].sort((a, b) => {
    const order: Record<string, number> = { Approved: 0, Nominated: 1, Rejected: 2, Backfill: 3 };
    return (order[a.nominationStatus] ?? 4) - (order[b.nominationStatus] ?? 4);
  });

  return (
    <Box>
      <PageHeader
        title="My Needs"
        subtitle="Needs you've expressed interest in."
        icon={<VolunteerActivismIcon />}
      />

      {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')}>{notice}</Alert>}

      <WithdrawDialog
        target={withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onDone={(message) => { setWithdrawTarget(null); setNotice(message); }}
      />

      {sortedNominations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">You haven't expressed interest in any needs yet.</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/explore/needs')}>
            Explore needs
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {sortedNominations.map((nom) => {
            const needInfo = needInfoMap[nom.needId];
            const statusConfig = STATUS_CONFIG[nom.nominationStatus] || STATUS_CONFIG.Nominated;

            return (
              <Paper key={nom.id} variant="outlined" sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {needInfo?.name || `Need ${nom.needId.slice(-6)}`}
                  </Typography>
                  <Chip
                    icon={statusConfig.icon as React.ReactElement}
                    label={statusConfig.label}
                    color={statusConfig.color}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {/* What this status means and what to do next */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'center' }}
                  spacing={1}
                  sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(14, 116, 144, 0.04)', borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">{statusConfig.help}</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }} flexWrap="wrap" useFlexGap>
                    {statusConfig.action && (
                      <Button size="small" variant="outlined" onClick={() => navigate(statusConfig.action!.path)}>
                        {statusConfig.action.label}
                      </Button>
                    )}
                    {nom.nominationStatus === 'Approved' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() =>
                          setWithdrawTarget({
                            nominationId: nom.id,
                            needName: needInfo?.name || `Need ${nom.needId.slice(-6)}`,
                            schoolName: needInfo?.entityName,
                          })
                        }
                      >
                        Withdraw from this school
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <Grid container spacing={1.5}>
                  {needInfo?.entityName && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          <strong>School/College:</strong> {needInfo.entityName}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                  {needInfo?.coordinatorName && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{needInfo.coordinatorName}</Typography>
                      </Stack>
                    </Grid>
                  )}
                  {needInfo?.coordinatorPhone && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{needInfo.coordinatorPhone}</Typography>
                      </Stack>
                    </Grid>
                  )}
                  {needInfo?.days && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{needInfo.days}</Typography>
                      </Stack>
                    </Grid>
                  )}
                  {needInfo?.timeSlots && needInfo.timeSlots.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {needInfo.timeSlots.map((s) => `${s.day} ${formatTime(s.startTime)}–${formatTime(s.endTime)}`).join(', ')}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                  {needInfo?.startDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Period: {needInfo.startDate} to {needInfo.endDate}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
