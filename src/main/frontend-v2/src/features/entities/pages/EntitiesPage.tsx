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
  MenuItem,
  Button,
  Tabs,
  Tab,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { useAppSelector } from '@app/store';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;
const VOLUNTEERING_URL = import.meta.env.VITE_API_BASE_URL_VOLUNTEERING;

interface Entity {
  id: string;
  name: string;
  registrationId?: string;
  website?: string;
  mobile?: string;
  addressLine1?: string;
  address_line1?: string;
  district?: string;
  state?: string;
  pincode?: string;
  category?: string;
  status?: string;
}

interface NCoordinator {
  osid: string;
  identityDetails?: { fullname?: string; name?: string };
  contactDetails?: { email?: string; mobile?: string };
  role?: string[];
}

const STATUS_TABS = ['All', 'New', 'Verified', 'Active', 'Inactive'];
const CATEGORIES = ['School', 'College', 'NGO', 'Government', 'Other'];

export function EntitiesPage() {
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';
  const isSAdmin = user?.role?.includes('sAdmin');

  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Create/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Assign nCoordinator Dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignEntityId, setAssignEntityId] = useState('');
  const [assignEntityName, setAssignEntityName] = useState('');
  const [nCoordinators, setNCoordinators] = useState<NCoordinator[]>([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState<NCoordinator | null>(null);
  const [loadingCoordinators, setLoadingCoordinators] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '', registrationId: '', website: '', mobile: '',
    addressLine1: '', district: '', state: '', pincode: '',
    category: 'School', status: 'New',
  });

  // Fetch entities
  useEffect(() => {
    async function fetchEntities() {
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const headers = getAuthHeaders();

        let url = `${BASE_URL}/api/v1/serve-need/entity/all?page=0&size=1000`;
        if (!isSAdmin && userId) {
          url = `${BASE_URL}/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`;
        }

        const resp = await fetch(url, { headers });
        if (resp.ok) {
          const data = await resp.json();
          const content = Array.isArray(data) ? data : (data.content || []);
          setEntities(content);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchEntities();
  }, [userId, isSAdmin]);

  // Fetch nCoordinators when assign dialog opens
  useEffect(() => {
    if (!assignDialogOpen) return;
    async function fetchCoordinators() {
      setLoadingCoordinators(true);
      try {
        const { getAuthHeaders } = await import('@shared/utils/authHeaders');
        const headers = getAuthHeaders();

        const resp = await fetch(
          `${VOLUNTEERING_URL}/api/v1/serve-volunteering/user/all-users`,
          { headers },
        );
        if (resp.ok) {
          const users = await resp.json();
          const coordinators = (Array.isArray(users) ? users : []).filter(
            (u: NCoordinator) => u.role?.includes('nCoordinator'),
          );
          setNCoordinators(coordinators);
        }
      } catch { /* silent */ }
      finally { setLoadingCoordinators(false); }
    }
    fetchCoordinators();
  }, [assignDialogOpen]);

  // Filter
  const filtered = useMemo(() => {
    let result = entities;
    const statusFilter = STATUS_TABS[statusTab];
    if (statusFilter !== 'All') {
      result = result.filter((e) => e.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.district || '').toLowerCase().includes(q) ||
        (e.addressLine1 || e.address_line1 || '').toLowerCase().includes(q) ||
        (e.registrationId || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [entities, statusTab, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handlers
  const handleCreate = () => {
    setEditEntity(null);
    setForm({ name: '', registrationId: '', website: '', mobile: '', addressLine1: '', district: '', state: '', pincode: '', category: 'School', status: 'New' });
    setDialogOpen(true);
    setError('');
  };

  const handleRowClick = (entity: Entity) => {
    setEditEntity(entity);
    setForm({
      name: entity.name || '',
      registrationId: entity.registrationId || '',
      website: entity.website || '',
      mobile: entity.mobile || '',
      addressLine1: entity.addressLine1 || entity.address_line1 || '',
      district: entity.district || '',
      state: entity.state || '',
      pincode: entity.pincode || '',
      category: entity.category || 'School',
      status: entity.status || 'New',
    });
    setDialogOpen(true);
    setError('');
  };

  const handleAssignOpen = (entity: Entity) => {
    setAssignEntityId(entity.id);
    setAssignEntityName(entity.name);
    setSelectedCoordinator(null);
    setAssignDialogOpen(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();

      const url = editEntity
        ? `${BASE_URL}/api/v1/serve-need/entity/edit/${editEntity.id}`
        : `${BASE_URL}/api/v1/serve-need/entity/create`;
      const method = editEntity ? 'PUT' : 'POST';

      const resp = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (resp.ok) {
        const newEntity = await resp.json();
        if (editEntity) {
          setEntities((prev) => prev.map((e) => e.id === editEntity.id ? { ...e, ...form } : e));
        } else {
          setEntities((prev) => [...prev, { id: newEntity.id || Date.now().toString(), ...form }]);
        }
        setSuccess(editEntity ? 'Entity updated successfully.' : 'Entity created successfully.');
        setDialogOpen(false);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError('Failed to save entity.');
      }
    } catch { setError('Failed to save entity.'); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!selectedCoordinator) { setError('Please select a coordinator.'); return; }
    setAssigning(true); setError('');
    try {
      const { getAuthHeadersWithJson } = await import('@shared/utils/authHeaders');
      const headers = getAuthHeadersWithJson();

      const resp = await fetch(`${BASE_URL}/api/v1/serve-need/entity/assign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entityId: assignEntityId,
          userId: selectedCoordinator.osid,
        }),
      });
      if (resp.ok) {
        setSuccess(`nCoordinator assigned to ${assignEntityName} successfully.`);
        setAssignDialogOpen(false);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError('Failed to assign coordinator.');
      }
    } catch { setError('Failed to assign coordinator.'); }
    finally { setAssigning(false); }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>Entities</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Entity
          </Button>
        </Stack>
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Status Tabs */}
      <Tabs value={statusTab} onChange={(_, v) => { setStatusTab(v); setPage(0); }} sx={{ mb: 2 }}>
        {STATUS_TABS.map((tab) => {
          const count = tab === 'All' ? entities.length : entities.filter((e) => e.status === tab).length;
          return <Tab key={tab} label={`${tab} (${count})`} />;
        })}
      </Tabs>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by name, district, block, registration ID..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2, maxWidth: 450 }}
      />

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Block / Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No entities found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((entity) => (
                  <TableRow key={entity.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{entity.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{entity.mobile || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{entity.addressLine1 || entity.address_line1 || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{entity.district || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{entity.category || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={entity.status || 'New'} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit Entity">
                          <IconButton size="small" onClick={() => handleRowClick(entity)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign nCoordinator">
                          <IconButton size="small" color="primary" onClick={() => handleAssignOpen(entity)}>
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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

      {/* Create/Edit Entity Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editEntity ? 'Edit Entity' : 'Create Entity'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Registration ID" value={form.registrationId} onChange={(e) => setForm({ ...form, registrationId: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address / Block" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }}>
                {STATUS_TABS.filter((s) => s !== 'All').map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editEntity ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign nCoordinator Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign nCoordinator
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">Entity</Typography>
              <Typography variant="subtitle1" fontWeight={600}>{assignEntityName}</Typography>
            </Paper>
            <Divider />
            <Typography variant="body2" color="text.secondary">
              Select an nCoordinator to assign to this entity:
            </Typography>
            <Autocomplete
              options={nCoordinators}
              loading={loadingCoordinators}
              getOptionLabel={(option) =>
                option.identityDetails?.fullname || option.identityDetails?.name || option.osid
              }
              value={selectedCoordinator}
              onChange={(_, value) => setSelectedCoordinator(value)}
              renderOption={(props, option) => (
                <li {...props} key={option.osid}>
                  <Stack>
                    <Typography variant="body2">
                      {option.identityDetails?.fullname || option.identityDetails?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.contactDetails?.email || option.contactDetails?.mobile || ''}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search nCoordinator"
                  placeholder="Type to search..."
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAssign}
            disabled={assigning || !selectedCoordinator}
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
