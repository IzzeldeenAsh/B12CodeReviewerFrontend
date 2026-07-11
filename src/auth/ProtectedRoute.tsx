import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { paths } from '@/app/paths';
import { useAuth } from './auth-context';

/**
 * Guards the authenticated area (§6). While the session is resolving it shows a
 * clear loading state; unauthenticated users are redirected to /login with
 * their intended destination preserved in router state (validated on the login
 * side to avoid open redirects).
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Checking your session…</Typography>
      </Box>
    );
  }

  if (status !== 'authenticated') {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={paths.login} state={{ returnTo }} replace />;
  }

  return <Outlet />;
}
