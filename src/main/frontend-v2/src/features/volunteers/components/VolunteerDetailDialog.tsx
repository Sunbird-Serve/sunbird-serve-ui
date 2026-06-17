import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Alert,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Paper,
  Skeleton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import {
  VolunteerUser,
  Agency,
  useUpdateVolunteerStatusMutation,
  useAssignAgencyMutation,
} from '../api/volunteersApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;
const STATUS_OPTIONS = ['Registered', 'Recommended', 'OnHold', 'Active'];

interface NominationInfo {
  id: string;
  needId: string;
  nominationStatus: string;
  needName?: string;
  entityName?: string;
  entityDistrict?: string;
  startDate?: string;
  endDate?: string;
}

interface VolunteerDetailDialogProps {
  volunteer: VolunteerUser | null;
  agencies: Agency[];
  isAdmin: boolean;
  onClose: () => void;
}

export function VolunteerDetailDialog({ volunteer, agencies, isAdmin, onClose }: VolunteerDetailDialogProps) {
  const [updateStatus, { isLoading: statusSaving }] = useUpdateVolunteerStatusMutation();
  const [assignAgency, { isLoading: agencySaving }] = useAssignAgencyMutation();

  const [tab, setTab] = useState(0);
  const [newStatus, setNewStatus] = useState(volunteer?.status || '');
  const [newAgencyId, setNewAgencyId] = useState(volunteer?.agencyId || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Nominations state
  const [nominations, setNominations] = useState<NominationInfo[]>([]);
  const [nomLoading, setNomLoading] = useState(false);

  // Reset state when volunteer changes
  useEffect(() => {
    if (volunteer) {
      setNewStatus(volunteer.status || '');
      setNewAgencyId(volunteer.agencyId || '');
      setTab(0);
      setNominations([]);
    }
  }, [volunteer]);

  // Fetch nominations AND fulfillments when tab 1 is selected
  useEffect(() => {
    async function fetchNominations() {
      if (!volunteer || tab !== 1) return;
      setNomLoading(true);
      try {
        // Fetch nominations
        const nomResp = await fetch(`${BASE_URL}/api/v1/serve-fulfill/nomination/${volunteer.osid}?page=0&size=50`);
        let noms: { id: string; needId: string; nominationStatus: string }[] = [];
        if (nomResp.ok) {
          const nomData = await nomResp.json();
          noms = Array.isArray(nomData) ? nomData : (nomData.content || []);
        }

        // Also fetch fulfillments (assigned needs)
        const fulfResp = await fetch(`${BASE_URL}/api/v1/serve-fulfill/fulfillment/volunteer-read/${volunteer.osid}?page=0&size=50`);
        let fulfs: { needId: string }[] = [];
        if (fulfResp.ok) {
          const fulfData = await fulfResp.json();
          fulfs = Array.isArray(fulfData) ? fulfData : (fulfData.content || []);
        }

        // Merge: fulfillments as "Assigned", nominations as their status
        // Avoid duplicates (same needId)
        const needIdSet = new Set<string>();
        const allItems: { id: string; needId: string; nominationStatus: string }[] = [];

        // Fulfillments first (these are actively assigned)
        for (const fulf of fulfs) {
          if (!needIdSet.has(fulf.needId)) {
            needIdSet.add(fulf.needId);
            allItems.push({ id: `fulf-${fulf.needId}`, needId: fulf.needId, nominationStatus: 'Approved' });
          }
        }

        // Then nominations (skip if already covered by fulfillment)
        for (const nom of noms) {
          if (!needIdSet.has(nom.needId)) {
            needIdSet.add(nom.needId);
            allItems.push(nom);
          }
        }

        // Fetch need details for each
        const enriched: NominationInfo[] = [];
        for (const item of allItems) {
          let needName = '';
          let entityName = '';
          let entityDistrict = '';
          let startDate = '';
          let endDate = '';
          try {
            // Get need info
            const needResp = await fetch(`${BASE_URL}/api/v1/serve-need/need/${item.needId}`);
            if (needResp.ok) {
              const needData = await needResp.json();
              const need = Array.isArray(needData) ? needData[0] : needData;
              needName = need?.name || need?.need?.name || '';
              const entityId = need?.entityId || need?.need?.entityId || '';

              // Fetch entity separately
              if (entityId) {
                try {
                  const entityResp = await fetch(`${BASE_URL}/api/v1/serve-need/entity/${entityId}`);
                  if (entityResp.ok) {
                    const entityData = await entityResp.json();
                    const entity = Array.isArray(entityData) ? entityData[0] : entityData;
                    entityName = entity?.name || '';
                    entityDistrict = entity?.district || '';
                  }
                } catch { /* skip */ }
              }
            }

            // Get dates from need-plan
            try {
              const planResp = await fetch(`${BASE_URL}/api/v1/serve-need/need-plan/${item.needId}`);
              if (planResp.ok) {
                const planData = await planResp.json();
                const plans = Array.isArray(planData) ? planData : (planData.content || []);
                if (plans.length > 0) {
                  startDate = plans[0]?.occurrence?.startDate?.substring(0, 10) || '';
                  endDate = plans[0]?.occurrence?.endDate?.substring(0, 10) || '';
                }
              }
            } catch { /* skip */ }
          } catch { /* skip */ }
          enriched.push({
            id: item.id,
            needId: item.needId,
            nominationStatus: item.nominationStatus,
            needName: needName || `Need ${item.needId.slice(-6)}`,
            entityName,
            entityDistrict,
            startDate,
            endDate,
          });
        }
        setNominations(enriched);
      } catch { /* silent */ }
      finally { setNomLoading(false); }
    }
    fetchNominations();
  }, [volunteer, tab]);

  if (!volunteer) return null;

  const name = volunteer.identityDetails?.fullname || volunteer.identityDetails?.name || '—';
  const email = volunteer.contactDetails?.email || '—';
  const phone = volunteer.contactDetails?.mobile || '—';
  const city = volunteer.contactDetails?.address?.city || '—';
  const gender = volunteer.identityDetails?.gender || '—';
  const dob = volunteer.identityDetails?.dob || '—';
  const currentAgency = agencies.find((a) => a.osid === volunteer.agencyId);

  const handleStatusSave = async () => {
    if (!newStatus || newStatus === volunteer.status) return;
    setError('');
    try {
      await updateStatus({ userId: volunteer.osid, status: newStatus }).unwrap();
      setSuccess('Status updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleAgencySave = async () => {
    if (!newAgencyId) return;
    setError('');
    try {
      await assignAgency({ userId: volunteer.osid, agencyId: newAgencyId }).unwrap();
      setSuccess('Agency assigned.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to assign agency.');
    }
  };

  // Group nominations by status
  const approvedNoms = nominations.filter((n) => n.nominationStatus === 'Approved');
  const nominatedNoms = nominations.filter((n) => n.nominationStatus === 'Nominated');
  const otherNoms = nominations.filter((n) => n.nominationStatus !== 'Approved' && n.nominationStatus !== 'Nominated');

  return (
    <Dialog open={Boolean(volunteer)} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ px: 3, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>{name}</Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, mb: 1 }}>
          <StatusChip status={volunteer.status || 'Registered'} />
          {currentAgency && <Chip label={currentAgency.name} size="small" variant="outlined" />}
        </Stack>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Profile" />
          <Tab label="Nominations" />
        </Tabs>
      </Box>

      <DialogContent>
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Tab 0: Profile */}
        {tab === 0 && (
          <Stack spacing={3}>
            {/* Profile Info */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Profile</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2">{phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">City</Typography>
                  <Typography variant="body2">{city}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Gender</Typography>
                  <Typography variant="body2">{gender}</Typography>
                </Grid>
                {dob && dob !== '—' && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body2">{dob}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Change Status */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Change Status</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  size="small" sx={{ minWidth: 180 }} InputLabelProps={{ shrink: true }}
                >
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <Button variant="contained" size="small" onClick={handleStatusSave} disabled={statusSaving || newStatus === volunteer.status}>
                  {statusSaving ? 'Saving...' : 'Update'}
                </Button>
              </Stack>
            </Box>

            {/* Assign Agency (admin only) */}
            {isAdmin && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assign Agency</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      select value={newAgencyId} onChange={(e) => setNewAgencyId(e.target.value)}
                      size="small" sx={{ minWidth: 220 }} InputLabelProps={{ shrink: true }} label="Agency"
                    >
                      <MenuItem value="">Select Agency</MenuItem>
                      {agencies.map((a) => <MenuItem key={a.osid} value={a.osid}>{a.name}</MenuItem>)}
                    </TextField>
                    <Button variant="contained" size="small" onClick={handleAgencySave} disabled={agencySaving || !newAgencyId}>
                      {agencySaving ? 'Saving...' : 'Assign'}
                    </Button>
                  </Stack>
                </Box>
              </>
            )}
          </Stack>
        )}

        {/* Tab 1: Nominations */}
        {tab === 1 && (
          <Box>
            {nomLoading ? (
              <Stack spacing={1.5}>
                <Skeleton height={60} variant="rounded" />
                <Skeleton height={60} variant="rounded" />
                <Skeleton height={60} variant="rounded" />
              </Stack>
            ) : nominations.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No nominations found for this volunteer.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {/* Assigned/Approved */}
                {approvedNoms.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      Assigned ({approvedNoms.length})
                    </Typography>
                    <Stack spacing={1}>
                      {approvedNoms.map((nom) => (
                        <Paper key={nom.id} variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" fontWeight={500}>{nom.needName}</Typography>
                              {nom.entityName && (
                                <Typography variant="caption" color="text.secondary">
                                  🏫 {nom.entityName}{nom.entityDistrict ? ` · ${nom.entityDistrict}` : ''}
                                </Typography>
                              )}
                              {nom.startDate && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  📅 {nom.startDate} to {nom.endDate}
                                </Typography>
                              )}
                            </Box>
                            <StatusChip status="Approved" />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Nominated (waiting) */}
                {nominatedNoms.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      Waiting for Approval ({nominatedNoms.length})
                    </Typography>
                    <Stack spacing={1}>
                      {nominatedNoms.map((nom) => (
                        <Paper key={nom.id} variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" fontWeight={500}>{nom.needName}</Typography>
                              {nom.entityName && (
                                <Typography variant="caption" color="text.secondary">
                                  🏫 {nom.entityName}{nom.entityDistrict ? ` · ${nom.entityDistrict}` : ''}
                                </Typography>
                              )}
                              {nom.startDate && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  📅 {nom.startDate} to {nom.endDate}
                                </Typography>
                              )}
                            </Box>
                            <StatusChip status="Nominated" />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Rejected/Backfill */}
                {otherNoms.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Other ({otherNoms.length})
                    </Typography>
                    <Stack spacing={1}>
                      {otherNoms.map((nom) => (
                        <Paper key={nom.id} variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2">{nom.needName}</Typography>
                              {nom.entityName && (
                                <Typography variant="caption" color="text.secondary">
                                  🏫 {nom.entityName}{nom.entityDistrict ? ` · ${nom.entityDistrict}` : ''}
                                </Typography>
                              )}
                              {nom.startDate && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  📅 {nom.startDate} to {nom.endDate}
                                </Typography>
                              )}
                            </Box>
                            <StatusChip status={nom.nominationStatus} />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
