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
  Chip,
  Skeleton,
  Button,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppSelector } from '@app/store';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import {
  useGetAllVolunteersQuery,
  useGetAgenciesQuery,
  VolunteerUser,
} from '../api/volunteersApi';
import { VolunteerDetailDialog } from '../components/VolunteerDetailDialog';

const STATUS_CARDS = [
  { key: 'all', label: 'All', icon: null, color: 'primary.main' },
  { key: 'Registered', label: 'Registered', icon: <PersonAddIcon />, color: 'info.main' },
  { key: 'Recommended', label: 'Recommended', icon: <HowToRegIcon />, color: 'warning.main' },
  { key: 'OnHold', label: 'On Hold', icon: <PauseCircleIcon />, color: 'error.main' },
  { key: 'Active', label: 'Active', icon: <CheckCircleIcon />, color: 'success.main' },
];

export function VolunteersPage() {
  const user = useAppSelector((state) => state.user.data);
  const role = Array.isArray(user?.role) ? user?.role[0] : user?.role;
  const isAdmin = role === 'vAdmin' || role === 'sAdmin';
  const userAgencyId = user?.agencyId;

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
    // vCoordinator sees only their agency's volunteers
    if (!isAdmin && userAgencyId) {
      vols = vols.filter((v) => v.agencyId === userAgencyId);
    }
    return vols;
  }, [allUsers, isAdmin, userAgencyId]);

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
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>Volunteers</Typography>

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
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: isAdmin ? 6 : 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedVolunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 6 }}>
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
                      onClick={() => setSelectedVolunteer(vol)}
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

      {/* Detail Dialog */}
      <VolunteerDetailDialog
        volunteer={selectedVolunteer}
        agencies={agencies}
        isAdmin={isAdmin}
        onClose={() => setSelectedVolunteer(null)}
      />
    </Box>
  );
}
