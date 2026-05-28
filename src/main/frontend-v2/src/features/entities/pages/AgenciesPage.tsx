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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useGetAgenciesQuery, useGetAllVolunteersQuery } from '@features/volunteers/api/volunteersApi';

export function AgenciesPage() {
  const { data: agencies = [], isLoading } = useGetAgenciesQuery();
  const { data: allUsers = [] } = useGetAllVolunteersQuery();
  const [search, setSearch] = useState('');

  // Count volunteers and coordinators per agency
  const volunteerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const volunteers = allUsers.filter((u) => u.role?.includes('Volunteer'));
    for (const vol of volunteers) {
      if (vol.agencyId) {
        counts[vol.agencyId] = (counts[vol.agencyId] || 0) + 1;
      }
    }
    return counts;
  }, [allUsers]);

  const coordinatorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const coordinators = allUsers.filter((u) => u.role?.includes('vCoordinator') || u.role?.includes('nCoordinator'));
    for (const coord of coordinators) {
      if (coord.agencyId) {
        counts[coord.agencyId] = (counts[coord.agencyId] || 0) + 1;
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

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>Agencies</Typography>

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
                <TableCell sx={{ fontWeight: 600 }}>Volunteers</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Coordinators</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography variant="body2" color="text.secondary">No agencies found</Typography></TableCell></TableRow>
              ) : (
                filtered.map((agency) => (
                  <TableRow key={agency.osid} hover>
                    <TableCell><Typography variant="body2" fontWeight={500}>{agency.name}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{(agency as unknown as Record<string, unknown>).type as string || (agency as unknown as Record<string, unknown>).agencyType as string || '—'}</Typography></TableCell>
                    <TableCell><Chip label={agency.status || 'Active'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2">{volunteerCounts[agency.osid] || 0}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{coordinatorCounts[agency.osid] || 0}</Typography></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
