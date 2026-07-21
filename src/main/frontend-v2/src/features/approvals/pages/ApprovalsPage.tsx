import { useState, useEffect } from 'react';
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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import { useAppSelector } from '@app/store';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { getAuthHeaders, getAuthHeadersWithJson } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

// --- Types ---
interface PendingCoordinator {
  osid: string;
  identityDetails?: { fullname?: string; name?: string; gender?: string };
  contactDetails?: { email?: string; mobile?: string; address?: { city?: string; state?: string } };
  status?: string;
  role?: string[];
  agencyId?: string;
}

interface PendingEntity {
  id: string;
  name: string;
  registrationId?: string;
  mobile?: string;
  addressLine1?: string;
  address_line1?: string;
  district?: string;
  state?: string;
  category?: string;
  status?: string;
}

interface PendingNeed {
  id: string;
  name: string;
  status: string;
  entityId?: string;
  needTypeId?: string;
  userId?: string;
  description?: string;
  needPurpose?: string;
  entity?: { name?: string; district?: string };
  needType?: { name?: string };
  createdAt?: string;
}

type TabValue = 0 | 1 | 2 | 3 | 4;

// --- Component ---
export function ApprovalsPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabValue>(0);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Data
  const [pendingCoordinators, setPendingCoordinators] = useState<PendingCoordinator[]>([]);
  const [pendingEntities, setPendingEntities] = useState<PendingEntity[]>([]);
  const [pendingNeeds, setPendingNeeds] = useState<PendingNeed[]>([]);
  const [rejectedItems, setRejectedItems] = useState<{ type: string; item: PendingCoordinator | PendingEntity | PendingNeed }[]>([]);

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      setLoading(true);
      try {
        const headers = getAuthHeaders();

        // 1. Get my entities
        const entityResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`,
          { headers },
        );
        let myEntities: PendingEntity[] = [];
        if (entityResp.ok) {
          const entityData = await entityResp.json();
          myEntities = Array.isArray(entityData) ? entityData : (entityData.content || []);
        }
        const entityIds = myEntities.map((e) => e.id);

        // Pending entities (status = New or Verified, not yet Active)
        const pendingEnts = myEntities.filter((e) => e.status === 'New' || e.status === 'Verified');
        setPendingEntities(pendingEnts);

        // Rejected entities
        const rejectedEnts = myEntities
          .filter((e) => e.status === 'Inactive' || e.status === 'Rejected')
          .map((e) => ({ type: 'entity', item: e }));

        // 2. Get all users → filter coordinators assigned to my entities
        const usersResp = await fetch(
          `${BASE_URL}/api/v1/serve-volunteering/user/all-users`,
          { headers },
        );
        let allUsers: PendingCoordinator[] = [];
        if (usersResp.ok) {
          allUsers = await usersResp.json();
          if (!Array.isArray(allUsers)) allUsers = [];
        }

        // Filter nCoordinators — those with status Registered (pending approval)
        // To scope to my entities: we'd need to know which coordinators are assigned to my entities
        // For now, filter by agency (same agency) + status Registered
        const pendingCoords = allUsers.filter(
          (u) => u.role?.includes('nCoordinator') && u.status === 'Registered',
        );
        setPendingCoordinators(pendingCoords);

        // Rejected coordinators
        const rejectedCoords = allUsers
          .filter((u) => u.role?.includes('nCoordinator') && (u.status === 'Rejected' || u.status === 'Inactive'))
          .map((u) => ({ type: 'coordinator', item: u }));

        // 3. Get pending needs (status = New) for my entities
        const needsResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/need/?status=New&page=0&size=200`,
          { headers },
        );
        let allNewNeeds: PendingNeed[] = [];
        if (needsResp.ok) {
          const needsData = await needsResp.json();
          const content = Array.isArray(needsData) ? needsData : (needsData.content || []);
          // Normalize: handle both flat and nested need format
          allNewNeeds = content.map((n: Record<string, unknown>) => {
            if (n.need && typeof n.need === 'object') {
              const need = n.need as Record<string, unknown>;
              return {
                id: need.id as string,
                name: need.name as string,
                status: need.status as string,
                entityId: need.entityId as string,
                needTypeId: need.needTypeId as string,
                userId: need.userId as string,
                description: need.description as string,
                needPurpose: need.needPurpose as string,
                entity: n.entity as PendingNeed['entity'],
                needType: n.needType as PendingNeed['needType'],
                createdAt: need.createdAt as string,
              };
            }
            return n as unknown as PendingNeed;
          });
        }

        // Filter needs to only my entities
        const myPendingNeeds = allNewNeeds.filter((n) => entityIds.includes(n.entityId || ''));
        setPendingNeeds(myPendingNeeds);

        // Rejected needs
        const rejectedNeedsResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/need/?status=Rejected&page=0&size=200`,
          { headers },
        );
        let rejectedNeedsList: { type: string; item: PendingNeed }[] = [];
        if (rejectedNeedsResp.ok) {
          const rejData = await rejectedNeedsResp.json();
          const rejContent = Array.isArray(rejData) ? rejData : (rejData.content || []);
          const normalized = rejContent.map((n: Record<string, unknown>) => {
            if (n.need && typeof n.need === 'object') {
              const need = n.need as Record<string, unknown>;
              return { id: need.id, name: need.name, status: need.status, entityId: need.entityId, entity: n.entity, needType: n.needType } as unknown as PendingNeed;
            }
            return n as unknown as PendingNeed;
          });
          rejectedNeedsList = normalized
            .filter((n: PendingNeed) => entityIds.includes(n.entityId || ''))
            .map((n: PendingNeed) => ({ type: 'need', item: n }));
        }

        setRejectedItems([...rejectedCoords, ...rejectedEnts, ...rejectedNeedsList]);
      } catch {
        setError('Failed to load approvals data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  // Actions
  const handleApproveCoordinator = async (coord: PendingCoordinator) => {
    setActionLoading(true);
    setError('');
    try {
      await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/${coord.osid}`, {
        method: 'PUT',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify({ status: 'Active' }),
      });
      setPendingCoordinators((prev) => prev.filter((c) => c.osid !== coord.osid));
      setSuccess(`Coordinator ${coord.identityDetails?.fullname || ''} approved.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to approve coordinator.'); }
    finally { setActionLoading(false); }
  };

  const handleActivateEntity = async (entity: PendingEntity) => {
    setActionLoading(true);
    setError('');
    try {
      await fetch(`${BASE_URL}/api/v1/serve-need/entity/edit/${entity.id}`, {
        method: 'PUT',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify({ ...entity, status: 'Active' }),
      });
      setPendingEntities((prev) => prev.filter((e) => e.id !== entity.id));
      setSuccess(`Entity "${entity.name}" activated.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to activate entity.'); }
    finally { setActionLoading(false); }
  };

  const handleApproveNeed = async (need: PendingNeed) => {
    setActionLoading(true);
    setError('');
    try {
      await fetch(`${BASE_URL}/api/v1/serve-need/need/status/${need.id}?status=Approved`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      setPendingNeeds((prev) => prev.filter((n) => n.id !== need.id));
      setSuccess(`Need "${need.name}" approved.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to approve need.'); }
    finally { setActionLoading(false); }
  };

  const openRejectDialog = (type: string, id: string, name: string) => {
    setRejectTarget({ type, id, name });
    setRejectReason('');
    setRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || !rejectReason.trim()) { setError('Reason is required.'); return; }
    setActionLoading(true);
    setError('');
    try {
      if (rejectTarget.type === 'coordinator') {
        await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/${rejectTarget.id}`, {
          method: 'PUT',
          headers: getAuthHeadersWithJson(),
          body: JSON.stringify({ status: 'Rejected' }),
        });
        setPendingCoordinators((prev) => prev.filter((c) => c.osid !== rejectTarget.id));
      } else if (rejectTarget.type === 'entity') {
        await fetch(`${BASE_URL}/api/v1/serve-need/entity/edit/${rejectTarget.id}`, {
          method: 'PUT',
          headers: getAuthHeadersWithJson(),
          body: JSON.stringify({ status: 'Inactive' }),
        });
        setPendingEntities((prev) => prev.filter((e) => e.id !== rejectTarget.id));
      } else if (rejectTarget.type === 'need') {
        await fetch(`${BASE_URL}/api/v1/serve-need/need/status/${rejectTarget.id}?status=Rejected`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        });
        setPendingNeeds((prev) => prev.filter((n) => n.id !== rejectTarget.id));
      }
      setSuccess(`"${rejectTarget.name}" rejected.`);
      setRejectDialog(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to reject.'); }
    finally { setActionLoading(false); }
  };

  // Counts
  const counts = {
    all: pendingCoordinators.length + pendingEntities.length + pendingNeeds.length,
    coordinators: pendingCoordinators.length,
    entities: pendingEntities.length,
    needs: pendingNeeds.length,
    rejected: rejectedItems.length,
  };

  // Search filter
  const filterBySearch = (name: string) => {
    if (!search.trim()) return true;
    return name.toLowerCase().includes(search.toLowerCase());
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>Approvals</Typography>
        <Stack spacing={2}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={80} />)}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={600}>Approvals</Typography>
        {counts.all > 0 && (
          <Chip label={`${counts.all} pending`} color="warning" size="small" />
        )}
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`All (${counts.all})`} />
        <Tab label={`Coordinators (${counts.coordinators})`} icon={<PersonIcon />} iconPosition="start" />
        <Tab label={`Entities (${counts.entities})`} icon={<BusinessIcon />} iconPosition="start" />
        <Tab label={`Needs (${counts.needs})`} icon={<AssignmentIcon />} iconPosition="start" />
        <Tab label={`Rejected (${counts.rejected})`} />
      </Tabs>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2, maxWidth: 350 }}
      />

      {/* Empty state */}
      {counts.all === 0 && tab !== 4 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
          <Typography variant="h6" fontWeight={600}>All caught up!</Typography>
          <Typography variant="body2" color="text.secondary">No pending approvals right now.</Typography>
        </Paper>
      )}

      {/* Pending Coordinators */}
      {(tab === 0 || tab === 1) && pendingCoordinators.filter((c) => filterBySearch(c.identityDetails?.fullname || c.identityDetails?.name || '')).map((coord) => (
        <Paper key={coord.osid} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  {coord.identityDetails?.fullname || coord.identityDetails?.name || '—'}
                </Typography>
                <Chip label="nCoordinator" size="small" variant="outlined" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {coord.contactDetails?.email || ''} · {coord.contactDetails?.mobile || ''} · {coord.contactDetails?.address?.city || ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApproveCoordinator(coord)}
                disabled={actionLoading}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => openRejectDialog('coordinator', coord.osid, coord.identityDetails?.fullname || '')}
                disabled={actionLoading}
              >
                Reject
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}

      {/* Pending Entities */}
      {(tab === 0 || tab === 2) && pendingEntities.filter((e) => filterBySearch(e.name)).map((entity) => (
        <Paper key={entity.id} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <BusinessIcon fontSize="small" color="secondary" />
                <Typography variant="subtitle2" fontWeight={600}>{entity.name}</Typography>
                <StatusChip status={entity.status || 'New'} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {entity.addressLine1 || entity.address_line1 || ''} · {entity.district || ''} · {entity.category || ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleActivateEntity(entity)}
                disabled={actionLoading}
              >
                Activate
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => openRejectDialog('entity', entity.id, entity.name)}
                disabled={actionLoading}
              >
                Reject
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}

      {/* Pending Needs */}
      {(tab === 0 || tab === 3) && pendingNeeds.filter((n) => filterBySearch(n.name)).map((need) => (
        <Paper key={need.id} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <AssignmentIcon fontSize="small" color="info" />
                <Typography variant="subtitle2" fontWeight={600}>{need.name}</Typography>
                <Chip label="New" size="small" color="info" variant="outlined" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {need.entity?.name || ''} · {need.needType?.name || ''} · {need.description || need.needPurpose || ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApproveNeed(need)}
                disabled={actionLoading}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => openRejectDialog('need', need.id, need.name)}
                disabled={actionLoading}
              >
                Reject
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}

      {/* Rejected Tab */}
      {tab === 4 && (
        rejectedItems.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No rejected items.</Typography>
          </Paper>
        ) : (
          rejectedItems.filter((r) => {
            const name = r.type === 'coordinator'
              ? (r.item as PendingCoordinator).identityDetails?.fullname || ''
              : r.type === 'entity'
                ? (r.item as PendingEntity).name
                : (r.item as PendingNeed).name;
            return filterBySearch(name);
          }).map((r, i) => {
            const name = r.type === 'coordinator'
              ? (r.item as PendingCoordinator).identityDetails?.fullname || (r.item as PendingCoordinator).identityDetails?.name || '—'
              : r.type === 'entity'
                ? (r.item as PendingEntity).name
                : (r.item as PendingNeed).name;
            const icon = r.type === 'coordinator' ? <PersonIcon fontSize="small" /> : r.type === 'entity' ? <BusinessIcon fontSize="small" /> : <AssignmentIcon fontSize="small" />;
            return (
              <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1, opacity: 0.7 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {icon}
                  <Typography variant="body2">{name}</Typography>
                  <Chip label={r.type} size="small" variant="outlined" />
                  <Chip label="Rejected" size="small" color="error" variant="outlined" />
                </Stack>
              </Paper>
            );
          })
        )
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject — {rejectTarget?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
            placeholder="Explain why this is being rejected..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
