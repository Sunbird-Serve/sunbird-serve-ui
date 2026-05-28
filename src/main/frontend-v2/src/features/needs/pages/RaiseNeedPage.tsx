import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { useState } from 'react';
import { useAppSelector } from '@app/store';
import {
  useGetNeedTypesQuery,
  useGetCoordinatorEntitiesQuery,
  useRaiseNeedMutation,
  RaiseNeedPayload,
} from '../api/needsApi';
import { RaiseNeedWizard } from '../components/RaiseNeedWizard';

export function RaiseNeedPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.data);
  const userId = user?.osid || '';

  const { data: needTypes = [] } = useGetNeedTypesQuery();
  const { data: entities = [] } = useGetCoordinatorEntitiesQuery(userId, { skip: !userId });
  const [raiseNeed, { isLoading }] = useRaiseNeedMutation();
  const [error, setError] = useState('');

  const handleSubmit = async (payload: RaiseNeedPayload) => {
    setError('');
    try {
      await raiseNeed(payload).unwrap();
      navigate('/app/needs');
    } catch (err) {
      setError('Failed to raise need. Please try again.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Raise a Need
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 720 }}>
        <RaiseNeedWizard
          needTypes={needTypes}
          entities={entities}
          userId={userId}
          loading={isLoading}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/app/needs')}
        />
      </Paper>
    </Box>
  );
}
