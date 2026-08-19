import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  Skeleton,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import { useGetAgenciesQuery, Agency } from '@features/volunteers/api/volunteersApi';
import { getAuthHeaders, getAuthHeadersWithJson } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

type Visibility = 'all' | 'selected' | 'same-agency';

interface AgencyVisibilityConfig {
  needVisibility: Visibility;
  selectedNeedAgencies: string[];
  volunteerVisibility: Visibility;
  selectedVolunteerAgencies: string[];
}

const defaultConfig: AgencyVisibilityConfig = {
  needVisibility: 'all',
  selectedNeedAgencies: [],
  volunteerVisibility: 'all',
  selectedVolunteerAgencies: [],
};

export function AgencyScopePage() {
  const { data: agencies = [] } = useGetAgenciesQuery();

  const [config, setConfig] = useState<AgencyVisibilityConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch current visibility config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const headers = getAuthHeaders();
        const resp = await fetch(`${BASE_URL}/api/v1/serve-need/agency-visibility`, { headers });
        if (resp.ok) {
          const data = await resp.json();
          setConfig({
            needVisibility: data.needVisibility || 'all',
            selectedNeedAgencies: data.selectedNeedAgencies || [],
            volunteerVisibility: data.volunteerVisibility || 'all',
            selectedVolunteerAgencies: data.selectedVolunteerAgencies || [],
          });
        }
        // 404 = no config yet, use defaults
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // Separate agency lists by type
  const needAgencies = agencies.filter((a) => {
    const raw = a as unknown as Record<string, unknown>;
    const type = (raw.type as string) || (raw.agencyType as string) || '';
    return type.toLowerCase().includes('need');
  });

  const volunteerAgencies = agencies.filter((a) => {
    const raw = a as unknown as Record<string, unknown>;
    const type = (raw.type as string) || (raw.agencyType as string) || '';
    return type.toLowerCase().includes('volunteer');
  });

  // Get agency objects from IDs for the autocomplete value
  const getAgencyObjects = (ids: string[]) => {
    return agencies.filter((a) => ids.includes(a.osid));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/serve-need/agency-visibility`, {
        method: 'POST',
        headers: getAuthHeadersWithJson(),
        body: JSON.stringify(config),
      });
      if (resp.ok) {
        setSuccess('Visibility settings saved successfully.');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError('Failed to save settings.');
      }
    } catch {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>Agency Scope</Typography>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={200} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <VisibilityIcon color="primary" />
        <Typography variant="h4" fontWeight={600}>Agency Scope</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Configure which agencies can discover your needs and which needs your volunteers can see.
        These settings control cross-agency visibility.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Need Visibility */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Need Visibility
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Who can discover and nominate for your agency's needs?
        </Typography>

        <FormControl component="fieldset">
          <RadioGroup
            value={config.needVisibility}
            onChange={(e) => setConfig({ ...config, needVisibility: e.target.value as Visibility, selectedNeedAgencies: e.target.value === 'selected' ? config.selectedNeedAgencies : [] })}
          >
            <FormControlLabel value="all" control={<Radio />} label="All agencies — any volunteer from any agency can see our needs" />
            <FormControlLabel value="selected" control={<Radio />} label="Selected agencies only — only volunteers from specific agencies" />
            <FormControlLabel value="same-agency" control={<Radio />} label="Same agency only — needs are private to our own volunteers" />
          </RadioGroup>
        </FormControl>

        {config.needVisibility === 'selected' && (
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              options={volunteerAgencies}
              getOptionLabel={(option: Agency) => option.name}
              value={getAgencyObjects(config.selectedNeedAgencies)}
              onChange={(_, value) => setConfig({ ...config, selectedNeedAgencies: value.map((v) => v.osid) })}
              renderInput={(params) => (
                <TextField {...params} label="Select Volunteer Agencies" placeholder="Search agencies..." size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.osid} label={option.name} size="small" />
                ))
              }
            />
          </Box>
        )}
      </Paper>

      {/* Volunteer Visibility */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Volunteer Visibility
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Which agencies' needs can your volunteers browse and nominate for?
        </Typography>

        <FormControl component="fieldset">
          <RadioGroup
            value={config.volunteerVisibility}
            onChange={(e) => setConfig({ ...config, volunteerVisibility: e.target.value as Visibility, selectedVolunteerAgencies: e.target.value === 'selected' ? config.selectedVolunteerAgencies : [] })}
          >
            <FormControlLabel value="all" control={<Radio />} label="All agencies — our volunteers can see needs from any agency" />
            <FormControlLabel value="selected" control={<Radio />} label="Selected agencies only — our volunteers see needs from specific agencies" />
            <FormControlLabel value="same-agency" control={<Radio />} label="Same agency only — volunteers only see our own needs" />
          </RadioGroup>
        </FormControl>

        {config.volunteerVisibility === 'selected' && (
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              options={needAgencies}
              getOptionLabel={(option: Agency) => option.name}
              value={getAgencyObjects(config.selectedVolunteerAgencies)}
              onChange={(_, value) => setConfig({ ...config, selectedVolunteerAgencies: value.map((v) => v.osid) })}
              renderInput={(params) => (
                <TextField {...params} label="Select Need Agencies" placeholder="Search agencies..." size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.osid} label={option.name} size="small" />
                ))
              }
            />
          </Box>
        )}
      </Paper>

      {/* Save */}
      <Button
        variant="contained"
        size="large"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        disabled={saving}
        sx={{ px: 4 }}
      >
        {saving ? 'Saving...' : 'Save Visibility Settings'}
      </Button>
    </Box>
  );
}
