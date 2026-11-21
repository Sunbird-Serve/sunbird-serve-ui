import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Chip,
  Skeleton,
  Button,
  Grid,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import { useAppSelector } from '@app/store';
import { PageHeader } from '@shared/components';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import {
  useGetAllVolunteersQuery,
  useGetAgenciesQuery,
  VolunteerUser,
} from '../api/volunteersApi';
import { VolunteerDetailDialog } from '../components/VolunteerDetailDialog';
import { DeleteUserDialog } from '../components/DeleteDialogs';
import { useAuth } from '@features/auth/hooks/useAuth';

const STATUS_CARDS = [
  { key: 'all', label: 'All', icon: null, color: 'primary.main' },
  { key: 'Registered', label: 'Registered', icon: <PersonAddIcon />, color: 'info.main' },
  { key: 'Recommended', label: 'Recommended', icon: <HowToRegIcon />, color: 'warning.main' },
  { key: 'OnHold', label: 'On Hold', icon: <PauseCircleIcon />, color: 'error.main' },
  { key: 'Active', label: 'Active', icon: <CheckCircleIcon />, color: 'success.main' },
];

export function VolunteersPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const role = Array.isArray(user?.role) ? user?.role[0] : user?.role;
  const isAdmin = role === 'vAdmin' || role === 'sAdmin';
  const userAgencyId = user?.agencyId;
  // Only super admins may delete users
  const { roles: authRoles } = useAuth();
  const isSuperAdmin = authRoles.includes('sAdmin');
  const columnCount = 5 + (isAdmin ? 1 : 0) + (isSuperAdmin ? 1 : 0);
  const [deleteTarget, setDeleteTarget] = useState<VolunteerUser | null>(null);
  // A message passed from the detail page after it deleted a user
  const location = useLocation();
  const [notice, setNotice] = useState(
    (location.state as { notice?: string } | null)?.notice || '',
  );

  const { data: allUsers = [], isLoading } = useGetAllVolunteersQuery();
  const { data: agencies = [] } = useGetAgenciesQuery();

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerUser | null>(null);

  // Filter to volunteers only
  const allVolunteers = useMemo(() => {
    let vols = allUsers.filter((u) => u.role?.includes('Volunteer'));
    // Only sAdmin sees all volunteers; vAdmin and vCoordinator see only their agency's
    const isSAdmin = role === 'sAdmin';
    if (!isSAdmin && userAgencyId) {
      vols = vols.filter((v) => v.agencyId === userAgencyId);
    }
    return vols;
  }, [allUsers, role, userAgencyId]);

  // Status counts
  const counts = useMemo(() => ({
    all: allVolunteers.length,
    Registered: allVolunteers.filter((v) => v.status === 'Registered').length,
    Recommended: allVolunteers.filter((v) => v.status === 'Recommended').length,
    OnHold: allVolunteers.filter((v) => v.status === 'OnHold').length,
    Active: allVolunteers.filter((v) => v.status === 'Active').length,
  }), [allVolunteers]);

  // Apply filters
  const filteredVolunteers = useMemo(() => {
    let result = allVolunteers;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((v) => v.status === statusFilter);
    }

    // Agency filter (admin only)
    if (agencyFilter) {
      result = result.filter((v) => v.agencyId === agencyFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((v) =>
        (v.identityDetails?.fullname || '').toLowerCase().includes(q) ||
        (v.contactDetails?.email || '').toLowerCase().includes(q) ||
        (v.contactDetails?.mobile || '').includes(q) ||
        (v.contactDetails?.address?.city || '').toLowerCase().includes(q),
      );
    }

    return result;
  }, [allVolunteers, statusFilter, agencyFilter, search]);

  // Paginate
  const paginatedVolunteers = filteredVolunteers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <PageHeader
        title="Volunteers"
        subtitle="View and manage volunteers registered across your agency."
        icon={<PeopleIcon />}
      />

      {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')}>{notice}</Alert>}

      {/* Status Cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {STATUS_CARDS.map((card) => (
          <Grid item xs={6} sm={4} md key={card.key}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                border: statusFilter === card.key ? '2px solid' : '1px solid',
                borderColor: statusFilter === card.key ? card.color : 'divider',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: card.color },
              }}
              onClick={() => { setStatusFilter(card.key); setPage(0); }}
            >
              <Typography variant="h5" fontWeight={700} color={statusFilter === card.key ? card.color : 'text.primary'}>
                {counts[card.key as keyof typeof counts]}
              </Typography>
              <Typography variant="caption" color="text.secondary">{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search + Agency Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, email, phone, city..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        {isAdmin && agencies.length > 0 && (
          <TextField
            select
            size="small"
            label="Agency"
            value={agencyFilter}
            onChange={(e) => { setAgencyFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 200 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">All Agencies</MenuItem>
            {agencies.map((a) => (
              <MenuItem key={a.osid} value={a.osid}>{a.name}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Agency</TableCell>}
                {isSuperAdmin && <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: columnCount }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedVolunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnCount} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No volunteers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVolunteers.map((vol) => {
                  const agency = agencies.find((a) => a.osid === vol.agencyId);
                  return (
                    <TableRow
                      key={vol.osid}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/app/volunteers/${vol.osid}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {vol.identityDetails?.fullname || vol.identityDetails?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{vol.contactDetails?.mobile || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{vol.contactDetails?.email || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{vol.contactDetails?.address?.city || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={vol.status || 'Registered'} />
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {agency ? (
                            <Chip label={agency.name} size="small" variant="outlined" />
                          ) : (
                            <Button size="small" variant="outlined" color="success" sx={{ textTransform: 'none', fontSize: '0.7rem' }}>
                              Assign
                            </Button>
                          )}
                        </TableCell>
                      )}
                      {isSuperAdmin && (
                        <TableCell align="right">
                          <Tooltip title="Delete user">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Delete user"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(vol); }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredVolunteers.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 15, 25]}
        />
      </Paper>

      <DeleteUserDialog
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDone={(message) => { setDeleteTarget(null); setNotice(message); setPage(0); }}
      />

      {/* Detail Dialog (kept for quick view) */}
      <VolunteerDetailDialog
        volunteer={selectedVolunteer}
        agencies={agencies}
        isAdmin={isAdmin}
        onClose={() => setSelectedVolunteer(null)}
      />
    </Box>
  );
}
