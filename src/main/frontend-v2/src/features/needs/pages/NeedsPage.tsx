import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppSelector } from '@app/store';
import { NeedListItem, useUpdateNeedStatusMutation } from '../api/needsApi';
import { NeedsTable } from '../components/NeedsTable';
import { NeedDetailDialog } from '../components/NeedDetailDialog';
import { ModifyScheduleDialog } from '../components/ModifyScheduleDialog';
import { getAuthHeaders } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function normalizeItem(item: Record<string, unknown>): NeedListItem | null {
  if (!item) return null;
  if (item.need && typeof item.need === 'object') {
    return item as unknown as NeedListItem;
  }
  if (item.id) {
    const requirement = item.requirement as Record<string, unknown> | undefined;
    const schedule = requirement?.schedule as Record<string, unknown> | undefined;
    return {
      need: {
        id: (item.id as string) || '',
        name: (item.name as string) || '',
        status: (item.status as string) || '',
        userId: (item.userId as string) || '',
        entityId: (item.entityId as string) || '',
        needTypeId: (item.needTypeId as string) || '',
        needPurpose: (item.needPurpose as string) || '',
        description: (item.description as string) || '',
      },
      needType: item.needType as NeedListItem['needType'],
      entity: item.entity as NeedListItem['entity'],
      occurrence: schedule
        ? {
            startDate: (schedule.startDate as string) || '',
            endDate: (schedule.endDate as string) || '',
            days: (schedule.days as string) || '',
            frequency: (schedule.frequency as string) || '',
            timeSlots: (schedule.timeSlots as NeedListItem['occurrence'] extends undefined ? never : NonNullable<NeedListItem['occurrence']>['timeSlots']) || [],
          }
        : (item.occurrence as NeedListItem['occurrence']),
      needRequirement: item.needRequirement as NeedListItem['needRequirement'],
      timeSlots: item.timeSlots as NeedListItem['timeSlots'],
    };
  }
  return null;
}

export function NeedsPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const role = Array.isArray(user?.role) ? user?.role[0] : user?.role;
  const isAdmin = role === 'nAdmin' || role === 'sAdmin';

  const [allNeeds, setAllNeeds] = useState<NeedListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch needs directly with fetch()
  useEffect(() => {
    async function fetchNeeds() {
      setLoading(true);
      const statuses = ['New', 'Nominated', 'Approved', 'Rejected', 'Assigned', 'Fulfilled'];
      const headers = getAuthHeaders();

      console.log('NeedsPage: user agencyId =', headers['X-Agency-Id'] || 'NOT SET');

      try {
        const results = await Promise.allSettled(
          statuses.map((status) =>
            fetch(`${BASE_URL}/api/v1/serve-need/need/?status=${status}&page=0&size=200`, { headers })
              .then((r) => (r.ok ? r.json() : null)),
          ),
        );

        const needs: NeedListItem[] = [];
        for (const result of results) {
          if (result.status === 'rejected' || !result.value) continue;
          const data = result.value;
          const content = Array.isArray(data) ? data : (data.content || []);
          for (const item of content) {
            const normalized = normalizeItem(item);
            if (normalized) needs.push(normalized);
          }
        }
        setAllNeeds(needs);
      } catch {
        // Silent fail — show empty
      } finally {
        setLoading(false);
      }
    }

    fetchNeeds();
  }, [user?.agencyId]);

  // For coordinator: filter to only their own needs
  const needs = isAdmin ? allNeeds : allNeeds.filter((n) => n.need?.userId === userId);

  // Status update
  const [updateStatus] = useUpdateNeedStatusMutation();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Need detail dialog
  const [selectedNeed, setSelectedNeed] = useState<NeedListItem | null>(null);

  // Modify schedule dialog
  const [scheduleNeed, setScheduleNeed] = useState<NeedListItem | null>(null);

  const handleApprove = async (needId: string) => {
    try {
      await updateStatus({ needId, status: 'Approved' }).unwrap();
      setSnackbar({ open: true, message: 'Need approved successfully.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to approve need.', severity: 'error' });
    }
  };

  const handleReject = async (needId: string) => {
    try {
      await updateStatus({ needId, status: 'Rejected' }).unwrap();
      setSnackbar({ open: true, message: 'Need rejected.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to reject need.', severity: 'error' });
    }
  };

  const handleRowClick = (need: NeedListItem) => {
    if (!need?.need) return;
    if (need.need.status === 'Fulfilled') {
      setSnackbar({ open: true, message: 'This need is already fulfilled.', severity: 'success' });
      return;
    }
    setSelectedNeed(need);
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Needs
        </Typography>
        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/app/needs/raise')}
          >
            Raise Need
          </Button>
        )}
      </Stack>

      {/* Needs Table */}
      <NeedsTable
        needs={needs}
        loading={loading}
        isAdmin={isAdmin}
        onRowClick={handleRowClick}
        onApprove={handleApprove}
        onReject={handleReject}
        onModifySchedule={(need) => setScheduleNeed(need)}
      />

      {/* Need Detail Dialog */}
      <NeedDetailDialog need={selectedNeed} onClose={() => setSelectedNeed(null)} />

      {/* Modify Schedule Dialog */}
      <ModifyScheduleDialog need={scheduleNeed} onClose={() => setScheduleNeed(null)} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
