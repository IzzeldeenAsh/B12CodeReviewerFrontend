import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import { messageForError, titleForError } from '@/api/errors/messages';

interface ErrorStateProps {
  error: unknown;
  /** When provided, renders a retry button (only for recoverable errors). */
  onRetry?: () => void;
  /** Optional extra action (e.g. "Back to pull request" for stale reviews). */
  action?: React.ReactNode;
}

/**
 * Recoverable error surface (§15). Renders only safe, centrally-mapped copy —
 * never raw backend detail, tokens, or stack traces. Uses a semantic alert so
 * assistive tech announces it.
 */
export function ErrorState({ error, onRetry, action }: ErrorStateProps) {
  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', my: 4 }}>
      <Alert severity="error" role="alert" variant="outlined">
        <AlertTitle>{titleForError(error)}</AlertTitle>
        {messageForError(error)}
        {(onRetry || action) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {onRetry && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
              >
                Try again
              </Button>
            )}
            {action}
          </Box>
        )}
      </Alert>
    </Box>
  );
}
