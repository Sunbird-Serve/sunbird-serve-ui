import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

// Accessible visual of the volunteering "rails":
// Needs → Discovery → Participation → Commitments → Delivery → Contributions
//
// Each stage carries a short plain-language description so the sequence is
// meaningful to a first-time visitor (terms like "Commitments" and
// "Contributions" are otherwise abstract). Rendered as an ordered list; the
// connectors are decorative (aria-hidden). Respects prefers-reduced-motion by
// avoiding animation.

const STAGES = [
  { label: 'Needs', desc: 'Share where support is required.' },
  { label: 'Discovery', desc: 'Volunteers find opportunities that fit.' },
  { label: 'Participation', desc: 'Interested volunteers step forward.' },
  { label: 'Commitments', desc: 'Participation is confirmed by the organisation.' },
  { label: 'Delivery', desc: 'The activity happens and is recorded.' },
  { label: 'Contributions', desc: 'Completed work is tracked over time.' },
];

export function RailsDiagram() {
  const theme = useTheme();
  const isStacked = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="ol"
      aria-label="The volunteering rails: Needs, Discovery, Participation, Commitments, Delivery, Contributions"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'flex',
        flexDirection: isStacked ? 'column' : 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: isStacked ? 1.5 : 0,
      }}
    >
      {STAGES.map((stage, i) => {
        const isLast = i === STAGES.length - 1;
        return (
          <Box
            key={stage.label}
            component="li"
            sx={{
              display: 'flex',
              flexDirection: isStacked ? 'column' : 'row',
              alignItems: isStacked ? 'stretch' : 'stretch',
              flex: isStacked ? '0 0 auto' : 1,
            }}
          >
            <Box
              sx={{
                flex: 1,
                width: '100%',
                px: 2,
                py: 1.75,
                borderRadius: 2,
                color: 'white',
                background:
                  'linear-gradient(135deg, rgba(14,116,144,0.95) 0%, rgba(12,74,110,0.95) 100%)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 2px 8px rgba(12,74,110,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                minHeight: { md: 112 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 700 }}
                >
                  {i + 1}
                </Box>
                <Typography variant="body2" fontWeight={700}>
                  {stage.label}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>
                {stage.desc}
              </Typography>
            </Box>

            {!isLast && (
              <Box
                aria-hidden="true"
                sx={{
                  flexShrink: 0,
                  color: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(isStacked
                    ? { py: 0.5, fontSize: '1.2rem', lineHeight: 1 }
                    : { px: 0.5, fontSize: '1.4rem' }),
                }}
              >
                {isStacked ? '↓' : '→'}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
