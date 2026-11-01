import { useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface SmartImageProps {
  src: string;
  alt: string;
  /** Intrinsic aspect ratio used to reserve space and avoid layout shift. */
  ratio?: string; // e.g. '4 / 3', '16 / 9', '1 / 1'
  /** Eager-load above-the-fold images; lazy-load the rest (default). */
  eager?: boolean;
  radius?: number;
  sx?: SxProps<Theme>;
  /** Optional element shown while the real image is unavailable/missing. */
  fallback?: React.ReactNode;
}

// Image wrapper that:
//  - reserves space via aspect-ratio (no layout shift / CLS),
//  - lazy-loads below-the-fold images and decodes async,
//  - gracefully hides (or shows a fallback) if the file is missing, so a
//    not-yet-added asset never renders a broken-image icon.
export function SmartImage({
  src,
  alt,
  ratio = '4 / 3',
  eager = false,
  radius = 12,
  sx,
  fallback,
}: SmartImageProps) {
  const [errored, setErrored] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        borderRadius: `${radius}px`,
        overflow: 'hidden',
        bgcolor: 'rgba(14,116,144,0.08)',
        ...sx,
      }}
    >
      {errored
        ? fallback ?? null
        : (
          <Box
            component="img"
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setErrored(true)}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
    </Box>
  );
}
