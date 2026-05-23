import { Paper, Typography, Stack, Box, LinearProgress } from '@mui/material';

interface StatusCount {
  label: string;
  count: number;
  color: string;
}

interface StatusBreakdownProps {
  title: string;
  items: StatusCount[];
  loading?: boolean;
}

export function StatusBreakdown({ title, items, loading = false }: StatusBreakdownProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {loading ? (
        <Stack spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i}>
              <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack spacing={2}>
          {items.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <Box key={item.label}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {item.count}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: item.color,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
