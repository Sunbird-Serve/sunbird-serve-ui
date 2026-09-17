import { useState, useMemo, Fragment } from 'react';
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
  Stack,
  Card,
  CardContent,
  CardActionArea,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { NeedListItem } from '../api/needsApi';

const STATUS_TABS = ['All', 'New', 'Approved', 'Nominated', 'Assigned', 'Fulfilled'];

interface NeedsTableProps {
  needs: NeedListItem[];
  loading?: boolean;
  isAdmin?: boolean;
  /** When true, rows are grouped into sections by academic year (current year
   *  first) instead of a single paginated list. */
  groupByYear?: boolean;
  onRowClick?: (need: NeedListItem) => void;
  onApprove?: (needId: string) => void;
  onReject?: (needId: string) => void;
  onModifySchedule?: (need: NeedListItem) => void;
}

// Indian academic year (Apr–Mar): starting calendar year for a given ISO date.
function academicYearOf(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr.substring(0, 10) + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

function academicYearLabel(startYear: number): string {
  return `AY ${startYear}–${startYear + 1}`;
}

export function NeedsTable({
  needs,
  loading = false,
  isAdmin = false,
  groupByYear = false,
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

  // Paginate (flat mode)
  const paginatedNeeds = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredNeeds.slice(start, start + rowsPerPage);
  }, [filteredNeeds, page, rowsPerPage]);

  // Group by academic year (grouped mode), current year first then descending.
  const now = new Date();
  const curAY = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const yearGroups = useMemo(() => {
    const groups = new Map<number, NeedListItem[]>();
    const undated: NeedListItem[] = [];
    if (groupByYear) {
      for (const n of filteredNeeds) {
        const year = academicYearOf(n.occurrence?.startDate || n.occurrence?.endDate);
        if (year == null) { undated.push(n); continue; }
        const list = groups.get(year) || [];
        list.push(n);
        groups.set(year, list);
      }
    }
    const sorted = Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === curAY) return -1;
      if (b[0] === curAY) return 1;
      return b[0] - a[0];
    });
    return { sorted, undated };
  }, [filteredNeeds, groupByYear, curAY]);

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colCount = 7;

  // Single desktop row (shared by flat + grouped modes)
  const renderRow = (item: NeedListItem) => (
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
            onClick={(e) => { e.stopPropagation(); onModifySchedule?.(item); }}
            title="Modify Schedule"
          >
            <ScheduleIcon fontSize="small" />
          </IconButton>
        </TableCell>
      )}
      {isAdmin && (
        <TableCell align="right">
          {item.need?.status === 'New' && (
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, item.need!.id)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </TableCell>
      )}
    </TableRow>
  );

  // Year section header row (grouped mode)
  const renderYearHeader = (label: string, count: number, isCurrent: boolean) => (
    <TableRow key={`hdr-${label}`}>
      <TableCell
        colSpan={colCount}
        sx={{
          bgcolor: isCurrent ? 'rgba(14, 116, 144, 0.08)' : 'action.hover',
          borderBottom: '2px solid',
          borderColor: isCurrent ? 'primary.main' : 'divider',
          py: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight={700} color={isCurrent ? 'primary.main' : 'text.secondary'}>
            {label}
          </Typography>
          {isCurrent && (
            <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
              Current
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">· {count} {count === 1 ? 'need' : 'needs'}</Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );

  // Single mobile card (shared by flat + grouped modes)
  const renderCard = (item: NeedListItem) => (
    <Card key={item.need?.id || Math.random()} variant="outlined">
      <CardActionArea onClick={() => item.need && onRowClick?.(item)}>
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1, mr: 1 }}>
              {item.need?.name || '—'}
            </Typography>
            <StatusChip status={item.need?.status || 'Unknown'} />
          </Stack>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {item.entity?.name && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{item.entity.name}</Typography>
              </Stack>
            )}
            {item.entity?.district && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{item.entity.district}</Typography>
              </Stack>
            )}
            {item.occurrence?.startDate && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{formatTimeline(item.occurrence)}</Typography>
              </Stack>
            )}
            {item.needType?.name && (
              <Typography variant="caption" color="text.secondary">Type: {item.needType.name}</Typography>
            )}
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
            {!isAdmin && (
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onModifySchedule?.(item); }}>
                <ScheduleIcon fontSize="small" />
              </IconButton>
            )}
            {isAdmin && item.need?.status === 'New' && (
              <>
                <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); onApprove?.(item.need!.id); }}>
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onReject?.(item.need!.id); }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );

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
          sx={{ maxWidth: { xs: '100%', sm: 320 }, width: '100%' }}
          fullWidth
        />
      </Box>

      {/* Mobile Card View */}
      {isMobile ? (
        <Box sx={{ p: 2, pt: 1 }}>
          {loading ? (
            <Stack spacing={1.5}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={100} />
              ))}
            </Stack>
          ) : filteredNeeds.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No needs found</Typography>
            </Box>
          ) : groupByYear ? (
            <Stack spacing={3}>
              {yearGroups.sorted.map(([year, list]) => (
                <Box key={year}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} color={year === curAY ? 'primary.main' : 'text.secondary'}>
                      {academicYearLabel(year)}
                    </Typography>
                    {year === curAY && (
                      <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>Current</Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">· {list.length}</Typography>
                  </Stack>
                  <Stack spacing={1.5} sx={{ opacity: year === curAY ? 1 : 0.85 }}>
                    {list.map(renderCard)}
                  </Stack>
                </Box>
              ))}
              {yearGroups.undated.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>Undated</Typography>
                  <Stack spacing={1.5}>{yearGroups.undated.map(renderCard)}</Stack>
                </Box>
              )}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {paginatedNeeds.map(renderCard)}
            </Stack>
          )}
        </Box>
      ) : (
      /* Desktop Table View */
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
            ) : filteredNeeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No needs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : groupByYear ? (
              <>
                {yearGroups.sorted.map(([year, list]) => (
                  <Fragment key={year}>
                    {renderYearHeader(academicYearLabel(year), list.length, year === curAY)}
                    {list.map(renderRow)}
                  </Fragment>
                ))}
                {yearGroups.undated.length > 0 && (
                  <Fragment key="undated">
                    {renderYearHeader('Undated', yearGroups.undated.length, false)}
                    {yearGroups.undated.map(renderRow)}
                  </Fragment>
                )}
              </>
            ) : (
              paginatedNeeds.map(renderRow)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Pagination (flat mode only) */}
      {!groupByYear && (
        <TablePagination
          component="div"
          count={filteredNeeds.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 15, 25]}
        />
      )}

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
