import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  /** Confirm button label. Must be explicit and non-deceptive (§7). */
  confirmLabel: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'error' | 'warning';
  /** True while the confirm mutation is pending — disables actions. */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
}

/**
 * Reusable confirmation dialog (§7, §12). MUI Dialog provides focus trapping,
 * Escape-to-close, and focus restoration to the trigger. The confirm action is
 * disabled while pending to prevent duplicate submission.
 */
export function ConfirmationDialog({
  open,
  title,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  pending = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description" component="div">
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={pending} color="inherit">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={pending}
          variant="contained"
          color={confirmColor}
          startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
