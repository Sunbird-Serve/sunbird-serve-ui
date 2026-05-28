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
import { NeedItem } from '../api/dashboardApi';

interface RecentNeedsTableProps {
  needs: NeedItem[];
  loading?: boolean;
  title?: string;
  maxRows?: number;
}

export function RecentNeedsTable({
  needs,
  loading = false,
  title = 'Recent Needs',
  maxRows = 5,
}: RecentNeedsTableProps) {
  const displayNeeds = needs.slice(0, maxRows);

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
      ) : displayNeeds.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No needs to display
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayNeeds.map((need) => (
                <TableRow key={need.id} hover>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {need.name || `Need #${need.id?.slice(-6)}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={need.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {need.needTypeId?.slice(-6) || '—'}
                    </Typography>
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
