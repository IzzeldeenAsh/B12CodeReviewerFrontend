import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface BrandMarkProps {
  size?: number;
  /** Show the "AI Code Reviewer" wordmark next to the badge. */
  withWordmark?: boolean;
}

/**
 * B12 logo + optional wordmark. The logo uses the official B12 brand SVG
 * (coral background, white letterforms). Used in the app bar and sign-in page.
 */
export function BrandMark({ size = 34, withWordmark = false }: BrandMarkProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        component="img"
        src="/b12-logo.svg"
        alt="B12"
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
        }}
      />
      {withWordmark && (
        <Typography variant="h3" component="span" sx={{ fontWeight: 700 }}>
          AI Code Reviewer
        </Typography>
      )}
    </Box>
  );
}
