import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { NeedListItem } from '../api/needsApi';

const STATUS_TABS = ['All', 'New', 'Approved', 'Nominated', 'Assigned', 'Fulfilled'];

interface NeedsTableProps {
  needs: NeedListItem[];
  loading?: boolean;
  isAdmin?: boolean;
  onRowClick?: (need: NeedListItem) => void;
  onApprove?: (needId: string) => void;
  onReject?: (needId: string) => void;
  onModifySchedule?: (need: NeedListItem) => void;
}

export function NeedsTable({
  needs,
  loading = false,
  isAdmin = false,
  onRowClick,
  onApprove,
  onReject,
  onModifySchedule,
}: NeedsTableProps) {
  const [statusTab, setStatusTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuNeedId, setMenuNeedId] = useState<string | null>(null);

  // Filter by status tab
  const filteredByStatus = useMemo(() => {
    const statusFilter = STATUS_TABS[statusTab];
    if (statusFilter === 'All') return needs.filter((n) => n?.need);
    return needs.filter((n) => n?.need?.status === statusFilter);
  }, [needs, statusTab]);

  // Filter by search
  const filteredNeeds = useMemo(() => {
    if (!search.trim()) return filteredByStatus;
    const q = search.toLowerCase();
    return filteredByStatus.filter(
      (n) =>
        n.need?.name?.toLowerCase().includes(q) ||
        n.entity?.name?.toLowerCase().includes(q) ||
        n.needType?.name?.toLowerCase().includes(q),
    );
  }, [filteredByStatus, search]);

  // Paginate
  const paginatedNeeds = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredNeeds.slice(start, start + rowsPerPage);
  }, [filteredNeeds, page, rowsPerPage]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, needId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuNeedId(needId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuNeedId(null);
  };

  const formatTimeline = (occurrence?: NeedListItem['occurrence']) => {
    if (!occurrence?.startDate || !occurrence?.endDate) return '—';
    const start = occurrence.startDate.substring(0, 10);
    const end = occurrence.endDate.substring(0, 10);
    return `${start} → ${end}`;
  };

  return (
    <Paper sx={{ width: '100%' }}>
      {/* Status Tabs */}
      <Tabs
        value={statusTab}
        onChange={(_, v) => { setStatusTab(v); setPage(0); }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        {STATUS_TABS.map((tab) => {
          const count = tab === 'All'
            ? needs.length
            : needs.filter((n) => n?.need?.status === tab).length;
          return <Tab key={tab} label={`${tab} (${count})`} />;
        })}
      </Tabs>

      {/* Search */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          size="small"
          placeholder="Search needs..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 320 }}
        />
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Need Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Need Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Entity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Timeline</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              {!isAdmin && <TableCell sx={{ fontWeight: 600 }} align="center">Schedule</TableCell>}
              {isAdmin && <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: isAdmin ? 7 : 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedNeeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No needs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedNeeds.map((item) => (
                <TableRow
                  key={item.need?.id || Math.random()}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => item.need && onRowClick?.(item)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 220 }}>
                      {item.need?.name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {item.needType?.name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                      {item.entity?.name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {item.entity?.district || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeline(item.occurrence)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={item.need?.status || 'Unknown'} />
                  </TableCell>
                  {!isAdmin && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onModifySchedule?.(item);
                        }}
                        title="Modify Schedule"
                      >
                        <ScheduleIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell align="right">
                      {item.need?.status === 'New' && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, item.need!.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredNeeds.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 15, 25]}
      />

      {/* Admin action menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (menuNeedId) onApprove?.(menuNeedId);
            handleMenuClose();
          }}
        >
          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuNeedId) onReject?.(menuNeedId);
            handleMenuClose();
          }}
        >
          <ListItemIcon><CloseIcon color="error" fontSize="small" /></ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
