import { useState, useMemo } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { StatusChip } from '@features/dashboard/components/StatusChip';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

interface Entity {
  id: string;
  name: string;
  registrationId?: string;
  website?: string;
  mobile?: string;
  addressLine1?: string;
  district?: string;
  state?: string;
  pincode?: string;
  category?: string;
  status?: string;
}

const STATUS_TABS = ['All', 'New', 'Verified', 'Active', 'Inactive'];
const CATEGORIES = ['School', 'College', 'NGO', 'Government', 'Other'];

export function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '', registrationId: '', website: '', mobile: '',
    addressLine1: '', district: '', state: '', pincode: '',
    category: 'School', status: 'New',
  });

  // Fetch entities
  useState(() => {
    async function fetchEntities() {
      try {
        const resp = await fetch(`${BASE_URL}/api/v1/serve-need/entity/all?page=0&size=1000`);
        if (resp.ok) {
          const data = await resp.json();
          const content = Array.isArray(data) ? data : (data.content || []);
          setEntities(content);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchEntities();
  });

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
        (e.registrationId || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [entities, statusTab, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Open create dialog
  const handleCreate = () => {
    setEditEntity(null);
    setForm({ name: '', registrationId: '', website: '', mobile: '', addressLine1: '', district: '', state: '', pincode: '', category: 'School', status: 'New' });
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleRowClick = (entity: Entity) => {
    setEditEntity(entity);
    setForm({
      name: entity.name || '', registrationId: entity.registrationId || '',
      website: entity.website || '', mobile: entity.mobile || '',
      addressLine1: entity.addressLine1 || '', district: entity.district || '',
      state: entity.state || '', pincode: entity.pincode || '',
      category: entity.category || 'School', status: entity.status || 'New',
    });
    setDialogOpen(true);
  };

  // Save
  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const url = editEntity
        ? `${BASE_URL}/api/v1/serve-need/entity/edit/${editEntity.id}`
        : `${BASE_URL}/api/v1/serve-need/entity/create`;
      const method = editEntity ? 'PUT' : 'POST';

      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (resp.ok) {
        const newEntity = await resp.json();
        if (editEntity) {
          setEntities((prev) => prev.map((e) => e.id === editEntity.id ? { ...e, ...form } : e));
        } else {
          setEntities((prev) => [...prev, { id: newEntity.id || Date.now().toString(), ...form }]);
        }
        setSuccess(editEntity ? 'Entity updated.' : 'Entity created.');
        setDialogOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save.');
      }
    } catch { setError('Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>Entities</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>Create Entity</Button>
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Status Tabs */}
      <Tabs value={statusTab} onChange={(_, v) => { setStatusTab(v); setPage(0); }} sx={{ mb: 2 }}>
        {STATUS_TABS.map((tab) => {
          const count = tab === 'All' ? entities.length : entities.filter((e) => e.status === tab).length;
          return <Tab key={tab} label={`${tab} (${count})`} />;
        })}
      </Tabs>

      {/* Search */}
      <TextField
        size="small" placeholder="Search by name, district, registration ID..."
        value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
                <TableCell sx={{ fontWeight: 600 }}>Registration ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography variant="body2" color="text.secondary">No entities found</Typography></TableCell></TableRow>
              ) : (
                paginated.map((entity) => (
                  <TableRow key={entity.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(entity)}>
                    <TableCell><Typography variant="body2" fontWeight={500}>{entity.name}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{entity.registrationId || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{entity.district || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{entity.state || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{entity.category || '—'}</Typography></TableCell>
                    <TableCell><StatusChip status={entity.status || 'New'} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 15, 25]} />
      </Paper>

      {/* Create/Edit Dialog */}
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
              <TextField label="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
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
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editEntity ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
