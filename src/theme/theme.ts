import { createTheme, type Theme } from '@mui/material/styles';

/**
 * MUI theme factory for light and dark modes (§12). Tokens for spacing,
 * typography, shape, and focus visibility live here so components stay free of
 * ad-hoc colors. Focus rings are made clearly visible for keyboard users (§19),
 * and motion is toned down where the OS requests reduced motion.
 *
 * Visual language: warm, rounded, friendly (Poppins, coral primary, soft
 * shadows) rather than a cold enterprise look — while keeping severity/status
 * colors (error/warning/success/info) visually distinct from the coral primary
 * so meaning never depends on brand color.
 */
export function buildTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#f4966f' : '#e8734a' },
      secondary: { main: isDark ? '#ffcf6b' : '#f2a93c' },
      success: { main: isDark ? '#4caf7d' : '#2e7d52' },
      warning: { main: isDark ? '#e0a742' : '#a86a1a' },
      error: { main: isDark ? '#ef6d6d' : '#c62828' },
      info: { main: isDark ? '#6fb3c9' : '#3a7a91' },
      background: isDark
        ? { default: '#181410', paper: '#221c17' }
        : { default: '#faf7f4', paper: '#ffffff' },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily:
        '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: { fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.01em' },
      h2: { fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontSize: '1.15rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Respect reduced-motion preference globally (§19).
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.001ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.001ms !important',
              scrollBehavior: 'auto !important',
            },
          },
          code: {
            fontFamily:
              '"JetBrains Mono", "SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          // Pill-shaped primary/secondary actions; icon-only buttons keep MUI's default shape.
          root: { borderRadius: 999, paddingInline: 20 },
          sizeSmall: { paddingInline: 14 },
          outlined: { borderWidth: 1.5 },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius,
            borderColor: theme.palette.divider,
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.4)'
              : '0 1px 2px rgba(60,40,20,0.04), 0 4px 16px rgba(60,40,20,0.05)',
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 14 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 600 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20 },
        },
      },
      MuiLink: { defaultProps: { underline: 'hover' } },
    },
  });
}
