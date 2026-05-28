import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { StatusChip } from '@features/dashboard/components/StatusChip';
import { NeedListItem } from '../api/needsApi';
import { NominationsPanel } from './NominationsPanel';
import { SessionsPanel } from './SessionsPanel';
import { NeedInfoPanel } from './NeedInfoPanel';

interface NeedDetailDialogProps {
  need: NeedListItem | null;
  onClose: () => void;
}

export function NeedDetailDialog({ need, onClose }: NeedDetailDialogProps) {
  const [tab, setTab] = useState(0);

  if (!need) return null;

  return (
    <Dialog open={Boolean(need)} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ px: 3, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {need.need.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {need.entity?.name || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">·</Typography>
              <Typography variant="body2" color="text.secondary">
                {need.needType?.name || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">·</Typography>
              <StatusChip status={need.need.status} />
            </Stack>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 1 }}>
          <Tab label="Nominations" />
          <Tab label="Sessions" />
          <Tab label="Need Info" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 400 }}>
        {tab === 0 && <NominationsPanel needId={need.need.id} />}
        {tab === 1 && <SessionsPanel needId={need.need.id} />}
        {tab === 2 && <NeedInfoPanel need={need} />}
      </DialogContent>
    </Dialog>
  );
}
