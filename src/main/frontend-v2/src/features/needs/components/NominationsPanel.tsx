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
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import {
  useGetNominationsQuery,
  useConfirmNominationMutation,
  useDropVolunteerMutation,
  getApiErrorMessage,
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
  const [dialogError, setDialogError] = useState('');

  const { data: nominations = [], isLoading, refetch } = useGetNominationsQuery(needId);
  const { data: allUsers = [] } = useGetAllUsersQuery();
  const [confirmNomination, { isLoading: confirming }] = useConfirmNominationMutation();
  const [dropVolunteer, { isLoading: dropping }] = useDropVolunteerMutation();
  const submitting = confirming || dropping;

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
    try {
      await confirmNomination({
        needId: nom.needId,
        userId: nom.nominatedUserId,
        nominationId: nom.id,
        status: 'Approved',
      }).unwrap();
      setSuccessMsg('Nomination accepted successfully.');
    } catch {
      setSuccessMsg('Failed to process acceptance. Please try again.');
    }
  };

  const handleRejectClick = (nom: NominationItem) => {
    setRejectTarget(nom);
    setRejectReason('');
    setDialogError('');
    setRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || submitting) return;
    const comments = rejectReason.trim();
    if (!comments) return; // Reason is mandatory
    setDialogError('');
    try {
      if (tab === 1) {
        await dropVolunteer({ nominationId: rejectTarget.id, comments }).unwrap();
        setSuccessMsg('Volunteer dropped.');
      } else {
        await confirmNomination({
          needId: rejectTarget.needId,
          userId: rejectTarget.nominatedUserId,
          nominationId: rejectTarget.id,
          status: 'Rejected',
          comments,
        }).unwrap();
        setSuccessMsg('Nomination rejected.');
      }
      setRejectDialog(false);
    } catch (err) {
      const { status, message } = getApiErrorMessage(err);
      setDialogError(message);
      // Stale data: reload so the list matches the server
      if (status === 404 || status === 409) refetch();
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
  // Dropped volunteers stay in the list but are not counted as accepted
  const acceptedCount = enrichedNominations.filter((n) => n.nominationStatus === 'Approved').length;
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
                    {tab === 1 && (
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
      <Dialog open={rejectDialog} onClose={() => !submitting && setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{tab === 1 ? 'Drop Volunteer' : 'Reject Nomination'}</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Typography variant="body2" sx={{ mb: 2 }}>
            {rejectTarget?.userInfo?.identityDetails?.fullname || 'Volunteer'}
          </Typography>
          <TextField
            label="Reason"
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
          <Button onClick={() => setRejectDialog(false)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={submitting || !rejectReason.trim()}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
