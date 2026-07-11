import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import Alert, { type AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface ToastState {
  message: string;
  severity: AlertColor;
}

interface ToastContextValue {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * App-wide transient notifications. Uses an aria-live alert so success/failure
 * messages are announced (§19). Never used to display sensitive detail.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    setToast({ message, severity });
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setOpen(false)}
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider.');
  return ctx;
}
