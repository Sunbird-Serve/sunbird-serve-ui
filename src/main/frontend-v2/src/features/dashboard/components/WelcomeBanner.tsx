import { Box, Typography, Button, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface WelcomeBannerProps {
  name: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
}

export function WelcomeBanner({ name, subtitle, actionLabel, actionIcon, onAction }: WelcomeBannerProps) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={600}>
          Welcome back, {name}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={actionIcon}
          onClick={onAction}
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
