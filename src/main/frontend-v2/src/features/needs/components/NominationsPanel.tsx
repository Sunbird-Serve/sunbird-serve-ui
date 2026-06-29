import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import {
  useGetNominationsQuery,
  useConfirmNominationMutation,
  NominationItem,
} from '../api/needsApi';
import { useGetAllUsersQuery } from '@features/dashboard/api/dashboardApi';

interface NominationsPanelProps {
  needId: string;
}

export function NominationsPanel({ needId }: NominationsPanelProps) {
  const [tab, setTab] = useState(0); // 0=Nominated, 1=Accepted, 2=Rejected
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<NominationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: nominations = [], isLoading, refetch } = useGetNominationsQuery(needId);
  const { data: allUsers = [] } = useGetAllUsersQuery();
  const [confirmNomination, { isLoading: confirming }] = useConfirmNominationMutation();

  // Enrich nominations with user info
  const enrichedNominations = useMemo(() => {
    return nominations.map((nom) => {
      const user = allUsers.find((u) => u.osid === nom.nominatedUserId);
      return {
        ...nom,
        userInfo: user
          ? {
              osid: user.osid,
              identityDetails: user.identityDetails,
              contactDetails: user.contactDetails,
              status: user.status,
            }
          : undefined,
      };
    });
  }, [nominations, allUsers]);

  // Filter by tab
  const filteredNominations = useMemo(() => {
    switch (tab) {
      case 0:
        return enrichedNominations.filter((n) => n.nominationStatus === 'Nominated');
      case 1:
        return enrichedNominations.filter(
          (n) => n.nominationStatus === 'Approved' || n.nominationStatus === 'Backfill',
        );
      case 2:
        return enrichedNominations.filter((n) => n.nominationStatus === 'Rejected');
      default:
        return enrichedNominations;
    }
  }, [enrichedNominations, tab]);

  const handleAccept = async (nom: NominationItem) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

    try {
      // Step 1: Check for existing backfilled volunteers for this need
      const backfilledNoms = enrichedNominations.filter(
        (n) => n.needId === nom.needId && n.nominationStatus === 'Backfill',
      );

      if (backfilledNoms.length > 0) {
        const { getAuthHeaders, getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
        const authHeaders = getAuthHeaders();
        const authJsonHeaders = getAuthHeadersWithJson();
        // Step 2: For each backfilled volunteer, pause their deliverables and inactivate plan
        for (const bNom of backfilledNoms) {
          try {
            // Get fulfillments for the backfilled volunteer
            const fulfResp = await fetch(
              `${BASE_URL}/api/v1/serve-fulfill/fulfillment/volunteer-read/${bNom.nominatedUserId}?page=0&size=100`,
              { headers: authHeaders },
            );
            if (fulfResp.ok) {
              const fulfData = await fulfResp.json();
              const fulfillments = Array.isArray(fulfData) ? fulfData : (fulfData.content || []);
              const relevantFulfillments = fulfillments.filter(
                (f: { needId: string }) => f.needId === nom.needId,
              );

              for (const fulfillment of relevantFulfillments) {
                const planId = fulfillment.needPlanId;

                // Get deliverables for this plan
                const delivResp = await fetch(
                  `${BASE_URL}/api/v1/serve-need/need-deliverable/${planId}`,
                  { headers: authHeaders },
                );
                if (delivResp.ok) {
                  const delivData = await delivResp.json();
                  const deliverables = delivData.needDeliverable || [];

                  // Update all "Planned" deliverables to "PlannedPause"
                  for (const deliverable of deliverables) {
                    if (deliverable.status === 'Planned') {
                      await fetch(
                        `${BASE_URL}/api/v1/serve-need/need-deliverable/update/${deliverable.id}`,
                        {
                          method: 'PUT',
                          headers: authJsonHeaders,
                          body: JSON.stringify({
                            needPlanId: planId,
                            status: 'PlannedPause',
                            deliverableDate: deliverable.deliverableDate,
                            comments: deliverable.comments || '',
                          }),
                        },
                      );
                    }
                  }
                }

                // Inactivate the need plan
                await fetch(
                  `${BASE_URL}/api/v1/serve-need/need-plan/status/${planId}?status=Inactive`,
                  { method: 'PUT', headers: authHeaders },
                );
              }
            }
          } catch {
            // Continue even if one backfill processing fails
          }

          // Mark the backfilled nomination status (re-confirm as Backfill)
          await confirmNomination({
            needId: nom.needId,
            userId: bNom.nominatedUserId,
            nominationId: bNom.id,
            status: 'Backfill',
          }).unwrap();
        }
      }

      // Step 3: Approve the new volunteer
      await confirmNomination({
        needId: nom.needId,
        userId: nom.nominatedUserId,
        nominationId: nom.id,
        status: 'Approved',
      }).unwrap();

      setSuccessMsg('Nomination accepted successfully.');
      refetch();
    } catch {
      setSuccessMsg('Failed to process acceptance. Please try again.');
    }
  };

  const handleRejectClick = (nom: NominationItem) => {
    setRejectTarget(nom);
    setRejectReason('');
    setRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) return; // Reason is mandatory
    const status = tab === 1 ? 'Backfill' : 'Rejected';
    try {
      await confirmNomination({
        needId: rejectTarget.needId,
        userId: rejectTarget.nominatedUserId,
        nominationId: rejectTarget.id,
        status,
        comments: rejectReason.trim(),
      }).unwrap();
      setSuccessMsg(tab === 1 ? 'Volunteer dropped.' : 'Nomination rejected.');
      setRejectDialog(false);
      refetch();
    } catch {
      setSuccessMsg('');
    }
  };

  // Clear success message after 3s
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const nominatedCount = enrichedNominations.filter((n) => n.nominationStatus === 'Nominated').length;
  const acceptedCount = enrichedNominations.filter(
    (n) => n.nominationStatus === 'Approved' || n.nominationStatus === 'Backfill',
  ).length;
  const rejectedCount = enrichedNominations.filter((n) => n.nominationStatus === 'Rejected').length;

  return (
    <Box>
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Nominated (${nominatedCount})`} />
        <Tab label={`Accepted (${acceptedCount})`} />
        <Tab label={`Rejected (${rejectedCount})`} />
      </Tabs>

      {isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={48} />
          ))}
        </Stack>
      ) : filteredNominations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No nominations in this category
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Volunteer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNominations.map((nom) => (
                <TableRow key={nom.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2">
                        {nom.userInfo?.identityDetails?.fullname || '—'}
                      </Typography>
                      {nom.nominationStatus === 'Backfill' && (
                        <Chip label="Dropped" size="small" color="error" variant="outlined" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {nom.userInfo?.contactDetails?.email || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {nom.userInfo?.contactDetails?.address?.city || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={nom.nominationStatus} />
                  </TableCell>
                  <TableCell align="right">
                    {tab === 0 && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleAccept(nom)}
                          disabled={confirming}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => handleRejectClick(nom)}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                    {tab === 1 && nom.nominationStatus !== 'Backfill' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleRejectClick(nom)}
                      >
                        Drop Volunteer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reject/Drop Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{tab === 1 ? 'Drop Volunteer' : 'Reject Nomination'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {rejectTarget?.userInfo?.identityDetails?.fullname || 'Volunteer'}
          </Typography>
          <TextField
            label="Reason *"
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            placeholder={`Reason for ${tab === 1 ? 'dropping' : 'rejecting'}...`}
            InputLabelProps={{ shrink: true }}
            required
            error={rejectReason.trim() === ''}
            helperText="Reason is mandatory"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm} disabled={confirming || !rejectReason.trim()}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
