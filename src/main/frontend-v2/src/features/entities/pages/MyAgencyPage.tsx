import { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '@features/auth';
import { useGetAgenciesQuery } from '@features/volunteers/api/volunteersApi';
import { useState } from 'react';

export function MyAgencyPage() {
  const { agencyId } = useAuth();
  const { data: agencies = [], isLoading } = useGetAgenciesQuery();
  const [copied, setCopied] = useState(false);

  // Find the current user's agency
  const myAgency = useMemo(() => {
    if (!agencyId || agencies.length === 0) return null;
    // agencyId might have '1-' prefix
    const cleanId = agencyId.startsWith('1-') ? agencyId.substring(2) : agencyId;
    return agencies.find((a) => a.osid === agencyId || a.osid === cleanId) || null;
  }, [agencies, agencyId]);

  // Build registration link
  const registrationLink = useMemo(() => {
    if (!myAgency) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/register/${myAgency.osid}`;
  }, [myAgency]);

  const handleCopy = () => {
    if (registrationLink) {
      navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>My Agency</Typography>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={80} />
        </Stack>
      </Box>
    );
  }

  if (!myAgency) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>My Agency</Typography>
        <Alert severity="info">
          No agency information found. Please contact the system administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>My Agency</Typography>

      {/* Agency Details Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>{myAgency.name}</Typography>
            {myAgency.status && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Status: {myAgency.status}
              </Typography>
            )}

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">Agency ID</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {myAgency.osid}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Paper>

      {/* Registration Link */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <LinkIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Registration Link</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Share this link with people you want to onboard into your agency.
          Anyone who registers through this link will automatically be associated with your agency.
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            size="small"
            value={registrationLink}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <PeopleIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                    <IconButton onClick={handleCopy} size="small" color={copied ? 'success' : 'default'}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
            }}
          />
        </Stack>

        {copied && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Link copied to clipboard!
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
