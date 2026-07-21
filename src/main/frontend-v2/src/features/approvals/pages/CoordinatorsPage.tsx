import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAppSelector } from '@app/store';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { getAuthHeaders, getAuthHeadersWithJson } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

// --- Types ---
interface Coordinator {
  osid: string;
  identityDetails?: { fullname?: string; name?: string; gender?: string };
  contactDetails?: { email?: string; mobile?: string; address?: { city?: string; state?: string } };
  status?: string;
  role?: string[];
  agencyId?: string;
}

interface EntityItem {
  id: string;
  name: string;
  status?: string;
  district?: string;
}

// --- Component ---
export function CoordinatorsPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [myEntities, setMyEntities] = useState<EntityItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Assign entity dialog
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Coordinator | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityItem | null>(null);

  // Detail dialog
  const [detailCoord, setDetailCoord] = useState<Coordinator | null>(null);
  const [coordEntities, setCoordEntities] = useState<EntityItem[]>([]);
  const [coordNeeds, setCoordNeeds] = useState<{ id: string; name: string; status: string }[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch coordinators and entities
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      setLoading(true);
      try {
        const headers = getAuthHeaders();

        // Get my entities
        const entityResp = await fetch(
          `${BASE_URL}/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`,
          { headers },
        );
        let entities: EntityItem[] = [];
        if (entityResp.ok) {
          const data = await entityResp.json();
          entities = Array.isArray(data) ? data : (data.content || []);
        }
        setMyEntities(entities.filter((e) => e.status === 'Active'));

        // Get all users → filter nCoordinators
        const usersResp = await fetch(
          `${BASE_URL}/api/v1/serve-volunteering/user/all-users`,
          { headers },
        );
        let allUsers: Coordinator[] = [];
        if (usersResp.ok) {
          allUsers = await usersResp.json();
          if (!Array.isArray(allUsers)) allUsers = [];
        }

        const coords = allUsers.filter((u) => u.role?.includes('nCoordinator'));
        setCoordinators(coords);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  // Fetch coordinator detail
  const handleRowClick = async (coord: Coordinator) => {
    setDetailCoord(coord);
    setDetailLoading(true);
    setCoordEntities([]);
    setCoordNeeds([]);
    try {
      const headers = getAuthHeaders();

      // Get entities assigned to this coordinator
      const entResp = await fetch(
        `${BASE_URL}/api/v1/serve-need/entityDetails/${coord.osid}?page=0&size=100`,
        { headers },
      );
      if (entResp.ok) {
        const data = await entResp.json();
        const ents = Array.isArray(data) ? data : (data.content || []);
        setCoordEntities(ents.filter((e: EntityItem) => e.status !== 'Inactive'));
      }

      // Get needs raised by this coordinator
      const needsResp = await fetch(
        `${BASE_URL}/api/v1/serve-need/need/user/${coord.osid}?page=0&size=100&status=Assigned`,
        { headers },
      );
      if (needsResp.ok) {
        const data = await needsResp.json();
        const content = Array.isArray(data) ? data : (data.content || []);
        const needs = content.map((n: Record<string, unknown>) => ({
          id: (n.id as string) || ((n.need as Record<string, unknown>)?.id as string) || '',
          name: (n.name as string) || ((n.need as Record<string, unknown>)?.name as string) || '',
          status: (n.status as string) || ((n.need as Record<string, unknown>)?.status as string) || '',
        }));
        setCoordNeeds(needs);
      }
    } catch { /* silent */ }
    finally { setDetailLoading(false); }
  };

  // Stats
  const stats = useMemo(() => {
    const total = coordinators.length;
    const active = coordinators.filter((c) => c.status === 'Active').length;
    const pending = coordinators.filter((c) => c.status === 'Registered').length;
    const inactive = coordinators.filter((c) => c.status === 'Inactive' || c.status === 'Rejected').length;
    return { total, active, pending, inactive };
  }, [coordinators]);

  // Filter
  const filtered = useMemo(() => {
    let result = coordinators;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') result = result.filter((c) => c.status === 'Registered');
      else if (statusFilter === 'active') result = result.filter((c) => c.status === 'Active');
      else if (statusFilter === 'inactive') result = result.filter((c) => c.status === 'Inactive' || c.status === 'Rejected');
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        (c.identityDetails?.fullname || '').toLowerCase().includes(q) ||
        (c.identityDetails?.name || '').toLowerCase().includes(q) ||
        (c.contactDetails?.email || '').toLowerCase().includes(q) ||
        (c.contactDetails?.mobile || '').includes(q),
      );
    }
    return result;
  }, [coordinators, statusFilter, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Actions
  const handleApprove = async (coord: Coordinator) => {
    setActionLoading(true);
    try {
      await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/${coord.osid}`, {
        method: 'PUT',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify({ status: 'Active' }),
      });
      setCoordinators((prev) => prev.map((c) => c.osid === coord.osid ? { ...c, status: 'Active' } : c));
      setSuccess(`${coord.identityDetails?.fullname || ''} approved.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to approve.'); }
    finally { setActionLoading(false); }
  };

  const handleDeactivate = async (coord: Coordinator) => {
    setActionLoading(true);
    try {
      await fetch(`${BASE_URL}/api/v1/serve-volunteering/user/${coord.osid}`, {
        method: 'PUT',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify({ status: 'Inactive' }),
      });
      setCoordinators((prev) => prev.map((c) => c.osid === coord.osid ? { ...c, status: 'Inactive' } : c));
      setSuccess(`Coordinator deactivated.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to deactivate.'); }
    finally { setActionLoading(false); }
  };

  const handleAssignEntity = async () => {
    if (!assignTarget || !selectedEntity) return;
    setActionLoading(true);
    try {
      await fetch(`${BASE_URL}/api/v1/serve-need/entity/assign`, {
        method: 'POST',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify({
          entityId: selectedEntity.id,
          userId: assignTarget.osid,
        }),
      });
      setSuccess(`Entity "${selectedEntity.name}" assigned to ${assignTarget.identityDetails?.fullname || ''}.`);
      setAssignDialog(false);
      setSelectedEntity(null);
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to assign entity.'); }
    finally { setActionLoading(false); }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>Coordinators</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{ p: 2, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'all' ? '2px solid' : '1px solid', borderColor: statusFilter === 'all' ? 'primary.main' : 'divider' }}
            onClick={() => { setStatusFilter('all'); setPage(0); }}
          >
            <Typography variant="h5" fontWeight={700} color="primary.main">{stats.total}</Typography>
            <Typography variant="caption" color="text.secondary">Total</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{ p: 2, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'pending' ? '2px solid' : '1px solid', borderColor: statusFilter === 'pending' ? 'warning.main' : 'divider' }}
            onClick={() => { setStatusFilter('pending'); setPage(0); }}
          >
            <Typography variant="h5" fontWeight={700} color="warning.main">{stats.pending}</Typography>
            <Typography variant="caption" color="text.secondary">Pending</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{ p: 2, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'active' ? '2px solid' : '1px solid', borderColor: statusFilter === 'active' ? 'success.main' : 'divider' }}
            onClick={() => { setStatusFilter('active'); setPage(0); }}
          >
            <Typography variant="h5" fontWeight={700} color="success.main">{stats.active}</Typography>
            <Typography variant="caption" color="text.secondary">Active</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{ p: 2, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'inactive' ? '2px solid' : '1px solid', borderColor: statusFilter === 'inactive' ? 'error.main' : 'divider' }}
            onClick={() => { setStatusFilter('inactive'); setPage(0); }}
          >
            <Typography variant="h5" fontWeight={700} color="error.main">{stats.inactive}</Typography>
            <Typography variant="caption" color="text.secondary">Inactive</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by name, email, phone..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2, maxWidth: 400 }}
      />

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No coordinators found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((coord) => (
                  <TableRow key={coord.osid} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(coord)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {coord.identityDetails?.fullname || coord.identityDetails?.name || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption">{coord.contactDetails?.email || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{coord.contactDetails?.mobile || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{coord.contactDetails?.address?.city || '—'}</Typography></TableCell>
                    <TableCell><StatusChip status={coord.status || 'Registered'} /></TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {coord.status === 'Registered' && (
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApprove(coord)} disabled={actionLoading}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Assign Entity">
                          <IconButton size="small" color="primary" onClick={() => { setAssignTarget(coord); setAssignDialog(true); }}>
                            <BusinessIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {coord.status === 'Active' && (
                          <Tooltip title="Deactivate">
                            <IconButton size="small" color="error" onClick={() => handleDeactivate(coord)} disabled={actionLoading}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 15, 25]}
        />
      </Paper>

      {/* Assign Entity Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Entity to {assignTarget?.identityDetails?.fullname || ''}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Select an entity to assign to this coordinator:
            </Typography>
            <Autocomplete
              options={myEntities}
              getOptionLabel={(option) => `${option.name}${option.district ? ` · ${option.district}` : ''}`}
              value={selectedEntity}
              onChange={(_, val) => setSelectedEntity(val)}
              renderInput={(params) => (
                <TextField {...params} label="Select Entity" placeholder="Search entities..." size="small" />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAssignEntity}
            disabled={actionLoading || !selectedEntity}
          >
            {actionLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coordinator Detail Dialog */}
      <Dialog open={Boolean(detailCoord)} onClose={() => setDetailCoord(null)} maxWidth="sm" fullWidth>
        {detailCoord && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  {detailCoord.identityDetails?.fullname || detailCoord.identityDetails?.name || '—'}
                </Typography>
                <StatusChip status={detailCoord.status || 'Registered'} />
              </Stack>
            </DialogTitle>
            <DialogContent>
              {detailLoading ? (
                <Stack spacing={2}><Skeleton height={60} /><Skeleton height={60} /></Stack>
              ) : (
                <Stack spacing={3}>
                  {/* Profile */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Contact</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2">{detailCoord.contactDetails?.email || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="body2">{detailCoord.contactDetails?.mobile || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">City</Typography>
                        <Typography variant="body2">{detailCoord.contactDetails?.address?.city || '—'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Assigned Entities */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Assigned Entities ({coordEntities.length})
                    </Typography>
                    {coordEntities.length > 0 ? (
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {coordEntities.map((e) => (
                          <Chip key={e.id} icon={<BusinessIcon />} label={e.name} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No entities assigned yet.</Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* Needs raised */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Needs Raised ({coordNeeds.length})
                    </Typography>
                    {coordNeeds.length > 0 ? (
                      <Stack spacing={0.5}>
                        {coordNeeds.slice(0, 10).map((n) => (
                          <Stack key={n.id} direction="row" spacing={1} alignItems="center">
                            <AssignmentIcon fontSize="small" color="action" />
                            <Typography variant="body2">{n.name}</Typography>
                            <StatusChip status={n.status} />
                          </Stack>
                        ))}
                        {coordNeeds.length > 10 && (
                          <Typography variant="caption" color="text.secondary">+{coordNeeds.length - 10} more</Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No needs raised yet.</Typography>
                    )}
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              {detailCoord.status === 'Registered' && (
                <Button variant="contained" color="success" onClick={() => { handleApprove(detailCoord); setDetailCoord(null); }}>
                  Approve
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<BusinessIcon />}
                onClick={() => { setAssignTarget(detailCoord); setAssignDialog(true); setDetailCoord(null); }}
              >
                Assign Entity
              </Button>
              <Button onClick={() => setDetailCoord(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
