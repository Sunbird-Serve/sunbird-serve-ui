import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Skeleton,
  Chip,
  Button,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useGetAgenciesQuery, useGetAllVolunteersQuery } from '@features/volunteers/api/volunteersApi';
import { getAuthHeadersWithJson } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_VOLUNTEERING;

interface AgencyFormData {
  name: string;
  type: string;
  description: string;
  email: string;
  phone: string;
}

const AGENCY_TYPES = [
  { value: 'Need Agency', label: 'Need Agency' },
  { value: 'Volunteer Agency', label: 'Volunteer Agency' },
];

const emptyForm: AgencyFormData = {
  name: '',
  type: '',
  description: '',
  email: '',
  phone: '',
};

export function AgenciesPage() {
  const { data: agencies = [], isLoading, refetch } = useGetAgenciesQuery();
  const { data: allUsers = [] } = useGetAllVolunteersQuery();
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgencyFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  // Counts per agency
  const volunteerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of allUsers) {
      if (u.role?.includes('Volunteer') && u.agencyId) {
        counts[u.agencyId] = (counts[u.agencyId] || 0) + 1;
      }
    }
    return counts;
  }, [allUsers]);

  const coordinatorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of allUsers) {
      if ((u.role?.includes('vCoordinator') || u.role?.includes('nCoordinator')) && u.agencyId) {
        counts[u.agencyId] = (counts[u.agencyId] || 0) + 1;
      }
    }
    return counts;
  }, [allUsers]);

  const adminCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of allUsers) {
      if ((u.role?.includes('nAdmin') || u.role?.includes('vAdmin')) && u.agencyId) {
        counts[u.agencyId] = (counts[u.agencyId] || 0) + 1;
      }
    }
    return counts;
  }, [allUsers]);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return agencies;
    const q = search.toLowerCase();
    return agencies.filter((a) => (a.name || '').toLowerCase().includes(q));
  }, [agencies, search]);

  // Stats
  const totalAgencies = agencies.length;
  const totalUsers = allUsers.length;

  // Open create dialog
  const handleCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialog(true);
  };

  // Open edit dialog
  const handleEdit = (agency: Record<string, unknown>) => {
    setForm({
      name: (agency.name as string) || '',
      type: (agency.type as string) || (agency.agencyType as string) || '',
      description: (agency.description as string) || '',
      email: (agency.email as string) || '',
      phone: (agency.phone as string) || '',
    });
    setEditingId(agency.osid as string);
    setDialog(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name.trim()) { setError('Agency name is required.'); return; }
    if (!form.type) { setError('Agency type is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const headers = getAuthHeadersWithJson();
      if (editingId) {
        // Update
        await fetch(`${BASE_URL}/api/v1/serve-volunteering/agency/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            description: form.description,
            email: form.email,
            phone: form.phone,
          }),
        });
        setSuccess(`Agency "${form.name}" updated.`);
      } else {
        // Create
        await fetch(`${BASE_URL}/api/v1/serve-volunteering/agency/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            description: form.description,
            email: form.email,
            phone: form.phone,
            status: 'Active',
          }),
        });
        setSuccess(`Agency "${form.name}" created.`);
      }
      setDialog(false);
      refetch();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to save agency.');
    } finally {
      setSaving(false);
    }
  };

  // Copy registration link
  const handleCopyLink = (agencyId: string) => {
    const link = `${window.location.origin}/register/${agencyId}`;
    navigator.clipboard.writeText(link);
    setCopied(agencyId);
    setTimeout(() => setCopied(''), 3000);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>Agencies</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Create Agency
        </Button>
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && !dialog && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <BusinessIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">{totalAgencies}</Typography>
            <Typography variant="caption" color="text.secondary">Total Agencies</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700} color="success.main">{totalUsers}</Typography>
            <Typography variant="caption" color="text.secondary">Total Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 28, color: 'info.main', mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700} color="info.main">
              {Object.values(volunteerCounts).reduce((a, b) => a + b, 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">Total Volunteers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700} color="warning.main">
              {Object.values(coordinatorCounts).reduce((a, b) => a + b, 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">Total Coordinators</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        size="small" placeholder="Search agencies..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2, maxWidth: 400 }}
      />

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Agency Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Admins</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Coordinators</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Volunteers</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography variant="body2" color="text.secondary">No agencies found</Typography></TableCell></TableRow>
              ) : (
                filtered.map((agency) => {
                  const raw = agency as unknown as Record<string, unknown>;
                  return (
                    <TableRow key={agency.osid} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{agency.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(raw.type as string) || (raw.agencyType as string) || '—'}
                          size="small"
                          variant="outlined"
                          color={(raw.type as string)?.includes('Need') ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={agency.status || 'Active'} size="small" color={agency.status === 'Active' ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell>{adminCounts[agency.osid] || 0}</TableCell>
                      <TableCell>{coordinatorCounts[agency.osid] || 0}</TableCell>
                      <TableCell>{volunteerCounts[agency.osid] || 0}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(raw)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={copied === agency.osid ? 'Copied!' : 'Copy registration link'}>
                            <IconButton size="small" color={copied === agency.osid ? 'success' : 'default'} onClick={() => handleCopyLink(agency.osid)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Agency' : 'Create Agency'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && dialog && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Agency Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Agency Type *"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              select
              fullWidth
              size="small"
            >
              {AGENCY_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              size="small"
            />
            <TextField
              label="Contact Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              size="small"
              type="email"
            />
            <TextField
              label="Contact Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
