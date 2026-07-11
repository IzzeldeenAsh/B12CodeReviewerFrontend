import Box from '@mui/material/Box';

interface SafeCodeBlockProps {
  /** Untrusted source/evidence text. Rendered as plain text — never as HTML. */
  code: string;
  /** Optional 1-based starting line for the gutter. */
  startLine?: number;
  showLineNumbers?: boolean;
  'aria-label'?: string;
}

/**
 * Safe code/evidence viewer (§11). All content is rendered as escaped text via
 * React children — NEVER dangerouslySetInnerHTML — so nothing in a PR diff or
 * AI evidence can execute, load a remote resource, or inject markup. Long lines
 * scroll horizontally; a screen-reader label describes the region.
 */
export function SafeCodeBlock({
  code,
  startLine,
  showLineNumbers = false,
  'aria-label': ariaLabel = 'Code evidence',
}: SafeCodeBlockProps) {
  const lines = code.replace(/\n$/, '').split('\n');
  return (
    <Box
      component="figure"
      aria-label={ariaLabel}
      sx={{
        m: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0b0f14' : '#f5f7fa'),
        overflowX: 'auto',
      }}
    >
      <Box
        component="pre"
        tabIndex={0}
        sx={{
          m: 0,
          p: 1.5,
          fontFamily: (theme) => theme.typography.fontFamily?.replace('Inter', 'JetBrains Mono'),
          fontSize: '0.8125rem',
          lineHeight: 1.6,
        }}
      >
        <Box component="code">
          {lines.map((line, index) => (
            <Box component="span" key={index} sx={{ display: 'block', whiteSpace: 'pre' }}>
              {showLineNumbers && (
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    display: 'inline-block',
                    minWidth: 40,
                    mr: 2,
                    color: 'text.disabled',
                    userSelect: 'none',
                  }}
                >
                  {(startLine ?? 1) + index}
                </Box>
              )}
              {line || ' '}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
