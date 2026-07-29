import { useState } from 'react';
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
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  useListOnboardingRequestsQuery,
  useReviewOnboardingRequestMutation,
} from '../api/onboardingReviewApi';
import type { OnboardingRequestResponse } from '../api/onboardingApi';

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

  // Fetch requests
  const { data, isLoading, isFetching } = useListOnboardingRequestsQuery({
    status: statusFilter || undefined,
    page,
    size: 10,
  });

  const [reviewRequest, { isLoading: reviewing }] = useReviewOnboardingRequestMutation();

  const requests = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Filter by search (client-side on coordinator name or entity)
  const filteredRequests = search.trim()
    ? requests.filter(
        (r) =>
          r.coordinatorName.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.mobile.includes(search),
      )
    : requests;

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

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={600}>
          Onboarding Requests
        </Typography>
        {data?.totalElements !== undefined && (
          <Chip label={`${data.totalElements} total`} size="small" variant="outlined" />
        )}
      </Stack>

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
      {isLoading && (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={100} />)}
        </Stack>
      )}

      {/* Empty state */}
      {!isLoading && filteredRequests.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" fontWeight={600}>No requests</Typography>
          <Typography variant="body2" color="text.secondary">
            No {statusFilter.toLowerCase() || ''} onboarding requests found.
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
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {req.coordinatorName}
                    </Typography>
                    <Chip label={req.designation} size="small" variant="outlined" />
                    <Chip label={req.status} size="small" color={getStatusColor(req.status)} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {req.email} · {req.mobile} · Submitted {new Date(req.createdAt).toLocaleDateString()}
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
                    <Typography variant="body2">Entity ID: {req.entityId}</Typography>
                    <Typography variant="body2">Agency ID: {req.agencyId}</Typography>
                  </Grid>

                  {/* Infra details */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Infrastructure
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <WifiIcon fontSize="small" color={req.infraDetails.hasInternet ? 'success' : 'disabled'} />
                        <Typography variant="caption">
                          Internet: {req.infraDetails.hasInternet ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <ComputerIcon fontSize="small" color={req.infraDetails.hasComputer ? 'success' : 'disabled'} />
                        <Typography variant="caption">
                          Computer: {req.infraDetails.hasComputer ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <TvIcon fontSize="small" color={req.infraDetails.hasProjector ? 'success' : 'disabled'} />
                        <Typography variant="caption">
                          Projector: {req.infraDetails.hasProjector ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MeetingRoomIcon fontSize="small" color="primary" />
                        <Typography variant="caption">
                          Rooms: {req.infraDetails.roomsAvailable}
                        </Typography>
                      </Stack>
                    </Stack>
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
