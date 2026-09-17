import { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  /** Main title shown in the hero. */
  title: string;
  /** Optional supporting line under the title. */
  subtitle?: string;
  /** Optional icon rendered next to the title. */
  icon?: ReactNode;
  /** Optional actions (buttons, filters) shown on the right / below the title. */
  actions?: ReactNode;
  /** Optional content rendered below the title inside the hero (e.g. a search field). */
  children?: ReactNode;
}

/**
 * Shared gradient hero header used across pages to give a consistent
 * "Explore" look and feel. Keeps the gradient/spacing in one place so the
 * whole app can be re-themed from here.
 */
export function PageHeader({ title, subtitle, icon, actions, children }: PageHeaderProps) {
  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        mb: 3,
        borderRadius: 3,
        color: 'white',
        background: 'linear-gradient(135deg, #0C4A6E 0%, #0E7490 55%, #155E75 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 85% 15%, rgba(252, 211, 77, 0.18) 0%, transparent 45%)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: subtitle ? 0.5 : 0 }}>
              {icon}
              <Typography variant="h5" fontWeight={700}>
                {title}
              </Typography>
            </Stack>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 620 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
        </Stack>
        {children && <Box sx={{ mt: 2.5 }}>{children}</Box>}
      </Box>
    </Paper>
  );
}
