import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Skeleton,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAppSelector } from '@app/store';
import { useGetMyNominationsQuery } from '../api/exploreApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

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

const STATUS_CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
  Nominated: { label: 'Waiting for Approval', color: 'warning', icon: <HourglassEmptyIcon fontSize="small" /> },
  Approved: { label: 'Approved', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  Rejected: { label: 'Not Selected', color: 'error', icon: <CancelIcon fontSize="small" /> },
  Backfill: { label: 'Replaced', color: 'default', icon: <CancelIcon fontSize="small" /> },
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

export function MyNominationsPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const { data: nominations = [], isLoading } = useGetMyNominationsQuery(userId, { skip: !userId });
  const [needInfoMap, setNeedInfoMap] = useState<Record<string, NeedInfo>>({});

  // Fetch need details for each nomination
  useEffect(() => {
    async function fetchNeedDetails() {
      const uniqueNeedIds = [...new Set(nominations.map((n) => n.needId))];
      const infoMap: Record<string, NeedInfo> = {};

      for (const needId of uniqueNeedIds) {
        try {
          // Get need details
          const needResp = await fetch(`${BASE_URL}/api/v1/serve-need/need/${needId}`);
          if (needResp.ok) {
            const data = await needResp.json();
            const need = Array.isArray(data) ? data[0] : data;
            const entityName = need?.entity?.name || '';
            const needName = need?.name || need?.need?.name || `Need ${needId.slice(-6)}`;

            // Get need plan for schedule info
            let days = '', startDate = '', endDate = '', coordinatorName = '', coordinatorPhone = '';
            let timeSlots: { day: string; startTime: string; endTime: string }[] = [];
            try {
              const planResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${needId}`);
              if (planResp.ok) {
                const planData = await planResp.json();
                const plans = Array.isArray(planData) ? planData : (planData.content || []);
                if (plans.length > 0) {
                  days = plans[0]?.occurrence?.days || '';
                  startDate = plans[0]?.occurrence?.startDate?.substring(0, 10) || '';
                  endDate = plans[0]?.occurrence?.endDate?.substring(0, 10) || '';
                  timeSlots = plans[0]?.timeSlots || [];
                }
              }
            } catch { /* skip */ }

            // Get coordinator info from need userId
            const coordUserId = need?.userId || need?.need?.userId;
            if (coordUserId) {
              try {
                const coordResp = await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/${coordUserId}`);
                if (coordResp.ok) {
                  const coordData = await coordResp.json();
                  coordinatorName = coordData?.identityDetails?.fullname || '';
                  coordinatorPhone = coordData?.contactDetails?.mobile || '';
                }
              } catch { /* skip */ }
            }

            infoMap[needId] = { id: needId, name: needName, entityName, days, startDate, endDate, coordinatorName, coordinatorPhone, timeSlots };
          }
        } catch { /* skip */ }
      }
      setNeedInfoMap(infoMap);
    }
    if (nominations.length > 0) fetchNeedDetails();
  }, [nominations]);

  if (isLoading) {
    return <Stack spacing={2}><Skeleton height={100} variant="rounded" /><Skeleton height={100} variant="rounded" /></Stack>;
  }

  // Sort: Approved first, then Nominated, then Rejected
  const sortedNominations = [...nominations].sort((a, b) => {
    const order: Record<string, number> = { Approved: 0, Nominated: 1, Rejected: 2, Backfill: 3 };
    return (order[a.nominationStatus] ?? 4) - (order[b.nominationStatus] ?? 4);
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>My Needs</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Needs you've expressed interest in.
      </Typography>

      {sortedNominations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">You haven't expressed interest in any needs yet.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Go to "Explore" to find opportunities.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {sortedNominations.map((nom) => {
            const needInfo = needInfoMap[nom.needId];
            const statusConfig = STATUS_CONFIG[nom.nominationStatus] || STATUS_CONFIG.Nominated;

            return (
              <Paper key={nom.id} variant="outlined" sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
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

                <Grid container spacing={1.5}>
                  {needInfo?.entityName && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{needInfo.entityName}</Typography>
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
