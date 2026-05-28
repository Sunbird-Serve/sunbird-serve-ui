import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Skeleton,
} from '@mui/material';
import { StatusChip } from './StatusChip';
import { UserItem } from '../api/dashboardApi';

interface RecentVolunteersTableProps {
  volunteers: UserItem[];
  loading?: boolean;
  title?: string;
  maxRows?: number;
}

export function RecentVolunteersTable({
  volunteers,
  loading = false,
  title = 'Recent Volunteers',
  maxRows = 5,
}: RecentVolunteersTableProps) {
  const displayVolunteers = volunteers.slice(0, maxRows);

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {loading ? (
        <Box>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : displayVolunteers.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No volunteers to display
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayVolunteers.map((vol) => (
                <TableRow key={vol.osid} hover>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                      {vol.identityDetails?.fullname || vol.identityDetails?.name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                      {vol.contactDetails?.email || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {vol.contactDetails?.address?.city || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={vol.status || 'Registered'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
