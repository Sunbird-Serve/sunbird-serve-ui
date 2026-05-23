import { Chip } from '@mui/material';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  // Need statuses
  New: { bg: '#E0F2FE', color: '#0369A1' },
  Nominated: { bg: '#FEF3C7', color: '#92400E' },
  Approved: { bg: '#D1FAE5', color: '#065F46' },
  Rejected: { bg: '#FEE2E2', color: '#991B1B' },
  Assigned: { bg: '#E0E7FF', color: '#3730A3' },
  Fulfilled: { bg: '#D1FAE5', color: '#065F46' },
  // Volunteer statuses
  Registered: { bg: '#E0F2FE', color: '#0369A1' },
  Recommended: { bg: '#FEF3C7', color: '#92400E' },
  OnHold: { bg: '#FEE2E2', color: '#991B1B' },
  Active: { bg: '#D1FAE5', color: '#065F46' },
  OnBoarded: { bg: '#E0E7FF', color: '#3730A3' },
};

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const colors = STATUS_COLORS[status] || { bg: '#F1F5F9', color: '#475569' };

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  );
}
