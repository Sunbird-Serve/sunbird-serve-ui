import { Box, Typography, Paper } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

// Temporary placeholder for pages not yet implemented
// Will be replaced with real implementations in Phases 3-5
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <ConstructionIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          {description || `The ${title} page will be implemented in an upcoming phase.`}
        </Typography>
      </Paper>
    </Box>
  );
}
