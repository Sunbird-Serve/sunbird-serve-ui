import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Tabs,
  Tab,
  Chip,
  Button,
  Alert,
  Skeleton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Pagination,
  Collapse,
  Divider,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import WifiIcon from '@mui/icons-material/Wifi';
import ComputerIcon from '@mui/icons-material/Computer';
import TvIcon from '@mui/icons-material/Tv';
import MeetingRoomIcon from '@mui/icons-material/VolumeUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  useListOnboardingRequestsQuery,
  useReviewOnboardingRequestMutation,
} from '../api/onboardingReviewApi';
import { useBrowseEntitiesQuery } from '../api/onboardingApi';
import type { OnboardingRequestResponse } from '../api/onboardingApi';
import { useAppSelector } from '@app/store';
import { getAuthHeaders } from '@shared/utils/authHeaders';

type StatusFilter = '' | 'Pending' | 'Clarification' | 'Authorised' | 'Rejected';

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Clarification', value: 'Clarification' },
  { label: 'Authorised', value: 'Authorised' },
  { label: 'Rejected', value: 'Rejected' },
];

function getStatusColor(status: string): 'warning' | 'info' | 'success' | 'error' | 'default' {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Clarification': return 'info';
    case 'Authorised': return 'success';
    case 'Rejected': return 'error';
    default: return 'default';
  }
}

interface AdminEntity {
  id: string;
  name: string;
  block?: string;
  district?: string;
}

export function OnboardingRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'Authorise' | 'Clarification' | 'Reject'>('Authorise');
  const [reviewTarget, setReviewTarget] = useState<OnboardingRequestResponse | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Get nAdmin's user info to derive their entity scope
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  // Fetch nAdmin's mapped entities to scope onboarding requests
  const [adminEntityIds, setAdminEntityIds] = useState<string[]>([]);
  const [adminEntitiesLoading, setAdminEntitiesLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminEntities() {
      if (!userId) return;
      try {
        const headers = getAuthHeaders();
        const baseUrl = import.meta.env.VITE_API_BASE_URL_NEED;
        const resp = await fetch(
          `${baseUrl}/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`,
          { headers },
        );
        if (resp.ok) {
          const data = await resp.json();
          const entities: AdminEntity[] = Array.isArray(data) ? data : (data.content || []);
          setAdminEntityIds(entities.map((e) => e.id));
        }
      } catch {
        // If fetch fails, show all requests (no filtering)
        setAdminEntityIds([]);
      } finally {
        setAdminEntitiesLoading(false);
      }
    }
    fetchAdminEntities();
  }, [userId]);

  // Fetch onboarding requests
  const { data, isLoading, isFetching } = useListOnboardingRequestsQuery({
    status: statusFilter || undefined,
    page: 0,
    size: 1000, // Fetch all, filter client-side
  });

  // Fetch all entities to cross-reference entityId → block
  const { data: allEntitiesData } = useBrowseEntitiesQuery({ size: 5000 });

  const [reviewRequest, { isLoading: reviewing }] = useReviewOnboardingRequestMutation();

  // Build entityId → block lookup
  const entityBlockMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allEntitiesData?.content) {
      for (const entity of allEntitiesData.content) {
        if (entity.block) map.set(entity.id, entity.block);
      }
    }
    return map;
  }, [allEntitiesData]);

  // Filter requests: only show those where entityId is in nAdmin's mapped entities
  const blockFilteredRequests = useMemo(() => {
    const allRequests = data?.content ?? [];
    // If we couldn't determine admin entities, show all (graceful fallback)
    if (adminEntityIds.length === 0 && !adminEntitiesLoading) return allRequests;
    if (adminEntityIds.length === 0) return [];

    return allRequests.filter((req) => adminEntityIds.includes(req.entityId));
  }, [data, adminEntityIds, adminEntitiesLoading]);

  // Pagination (client-side since we fetched all)
  const PAGE_SIZE = 10;
  const totalFiltered = blockFilteredRequests.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
  const paginatedRequests = blockFilteredRequests.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Search filter
  const filteredRequests = search.trim()
    ? paginatedRequests.filter(
        (r) =>
          r.coordinatorName.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.mobile.includes(search),
      )
    : paginatedRequests;

  // Actions
  const openReviewDialog = (request: OnboardingRequestResponse, action: 'Authorise' | 'Clarification' | 'Reject') => {
    setReviewTarget(request);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialog(true);
  };

  const handleReviewConfirm = async () => {
    if (!reviewTarget) return;
    if ((reviewAction === 'Clarification' || reviewAction === 'Reject') && !reviewNotes.trim()) {
      setError('Notes are required for this action.');
      return;
    }
    setError('');
    try {
      await reviewRequest({
        requestId: reviewTarget.id,
        action: reviewAction,
        notes: reviewNotes.trim() || undefined,
        userId: reviewAction === 'Authorise' ? reviewTarget.id : undefined,
      }).unwrap();
      setSuccess(
        reviewAction === 'Authorise'
          ? `${reviewTarget.coordinatorName} has been authorised as coordinator.`
          : reviewAction === 'Clarification'
            ? `Clarification requested from ${reviewTarget.coordinatorName}.`
            : `Request from ${reviewTarget.coordinatorName} has been rejected.`,
      );
      setReviewDialog(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch {
      setError('Failed to process review. Please try again.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Helper: get entity name from entityId
  const getEntityName = (entityId: string) => {
    const entity = allEntitiesData?.content?.find((e) => e.id === entityId);
    return entity?.name || entityId;
  };

  const getEntityBlock = (entityId: string) => {
    return entityBlockMap.get(entityId) || '—';
  };

  const isPageLoading = isLoading || adminEntitiesLoading;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={600}>
          Onboarding Requests
        </Typography>
        <Chip
          label={`${totalFiltered} total`}
          size="small"
          variant="outlined"
        />
      </Stack>

      {adminEntityIds.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing requests for your {adminEntityIds.length} mapped institution{adminEntityIds.length > 1 ? 's' : ''}.
        </Alert>
      )}

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Status tabs */}
      <Tabs
        value={STATUS_TABS.findIndex((t) => t.value === statusFilter)}
        onChange={(_, v) => { setStatusFilter(STATUS_TABS[v].value); setPage(0); }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {STATUS_TABS.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by name, email, or mobile..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2, maxWidth: 400 }}
      />

      {/* Loading */}
      {isPageLoading && (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={100} />)}
        </Stack>
      )}

      {/* Empty state */}
      {!isPageLoading && filteredRequests.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" fontWeight={600}>No requests</Typography>
          <Typography variant="body2" color="text.secondary">
            No {statusFilter.toLowerCase() || ''} onboarding requests found for your block.
          </Typography>
        </Paper>
      )}

      {/* Request cards */}
      <Stack spacing={1.5} sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {filteredRequests.map((req) => (
          <Paper key={req.id} variant="outlined" sx={{ overflow: 'hidden' }}>
            {/* Summary row */}
            <Box
              sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => toggleExpand(req.id)}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {req.coordinatorName}
                    </Typography>
                    <Chip label={req.designation} size="small" variant="outlined" />
                    <Chip label={req.status} size="small" color={getStatusColor(req.status)} />
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {getEntityName(req.entityId)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {req.email} · {req.mobile} · Block: {getEntityBlock(req.entityId)} · {new Date(req.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  {req.status === 'Pending' && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={(e) => { e.stopPropagation(); openReviewDialog(req, 'Authorise'); }}
                        disabled={reviewing}
                      >
                        Authorise
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        startIcon={<HelpOutlineIcon />}
                        onClick={(e) => { e.stopPropagation(); openReviewDialog(req, 'Clarification'); }}
                        disabled={reviewing}
                      >
                        Clarify
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={(e) => { e.stopPropagation(); openReviewDialog(req, 'Reject'); }}
                        disabled={reviewing}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {req.status === 'Clarification' && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={(e) => { e.stopPropagation(); openReviewDialog(req, 'Authorise'); }}
                        disabled={reviewing}
                      >
                        Authorise
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={(e) => { e.stopPropagation(); openReviewDialog(req, 'Reject'); }}
                        disabled={reviewing}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {expandedId === req.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Stack>
              </Stack>
            </Box>

            {/* Expanded detail */}
            <Collapse in={expandedId === req.id}>
              <Divider />
              <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  {/* Entity info */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Institution
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>{getEntityName(req.entityId)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Block: {getEntityBlock(req.entityId)}
                    </Typography>
                  </Grid>

                  {/* Infra details */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Infrastructure
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <TvIcon fontSize="small" color={req.infraDetails.hasSmartTvOrProjector ? 'success' : 'disabled'} />
                        <Typography variant="caption">
                          Smart TV/Projector: {req.infraDetails.hasSmartTvOrProjector ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <ComputerIcon fontSize="small" color={req.infraDetails.hasComputerOrLaptop ? 'success' : 'disabled'} />
                        <Typography variant="caption">
                          Computer: {req.infraDetails.hasComputerOrLaptop ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MeetingRoomIcon fontSize="small" color={req.infraDetails.hasSpeakers ? 'success' : 'disabled'} />
                        <Typography variant="caption">
                          Speakers: {req.infraDetails.hasSpeakers ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <WifiIcon fontSize="small" color={req.infraDetails.hasReliableInternet ? 'success' : 'disabled'} />
                        <Typography variant="caption">
                          Internet: {req.infraDetails.hasReliableInternet ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                    </Stack>
                    {req.infraDetails.hasUsedForOnlineClass && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Online class experience: {req.infraDetails.hasUsedForOnlineClass}
                      </Typography>
                    )}
                    {req.infraDetails.canIndependentlyConnect && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Can connect independently: {req.infraDetails.canIndependentlyConnect}
                      </Typography>
                    )}
                  </Grid>

                  {/* Reviewer notes (if any) */}
                  {req.reviewerNotes && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Reviewer Notes
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: 'background.paper' }}>
                        <Typography variant="body2">{req.reviewerNotes}</Typography>
                      </Paper>
                      {req.reviewedBy && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Reviewed by: {req.reviewedBy} · {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : ''}
                        </Typography>
                      )}
                    </Grid>
                  )}

                  {/* Timestamps */}
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(req.createdAt).toLocaleString()} · Updated: {new Date(req.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, p) => setPage(p - 1)}
            color="primary"
          />
        </Box>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'Authorise' && '✅ Authorise Coordinator'}
          {reviewAction === 'Clarification' && '❓ Request Clarification'}
          {reviewAction === 'Reject' && '❌ Reject Request'}
        </DialogTitle>
        <DialogContent>
          {reviewTarget && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {reviewTarget.coordinatorName}
                </Typography>
                <Typography variant="body2">
                  {getEntityName(reviewTarget.entityId)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {reviewTarget.designation} · {reviewTarget.email} · {reviewTarget.mobile}
                </Typography>
              </Paper>

              {reviewAction === 'Authorise' && (
                <Alert severity="info">
                  This will create the coordinator account, map them to the selected entity, and mark the entity as active.
                  They'll receive an activation message.
                </Alert>
              )}

              <TextField
                label={reviewAction === 'Authorise' ? 'Notes (optional)' : 'Notes *'}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder={
                  reviewAction === 'Authorise'
                    ? 'e.g., Verified via school records'
                    : reviewAction === 'Clarification'
                      ? 'e.g., Please confirm your UDISE code and provide school ID proof.'
                      : 'e.g., Could not verify association with this institution.'
                }
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={reviewAction === 'Authorise' ? 'success' : reviewAction === 'Reject' ? 'error' : 'info'}
            onClick={handleReviewConfirm}
            disabled={
              reviewing ||
              ((reviewAction === 'Clarification' || reviewAction === 'Reject') && !reviewNotes.trim())
            }
          >
            {reviewing ? 'Processing...' : reviewAction}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
