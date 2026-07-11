import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import LoginIcon from '@mui/icons-material/Login';
import { BrandMark } from '@/components/layout/BrandMark';
import { useAuth } from '@/auth/auth-context';
import { consumeReturnTo } from '@/auth/return-to';
import { env } from '@/config/env';
import { paths } from '@/app/paths';
import { safeReturnTo } from '@/utils/safe-redirect';
import { trackEvent } from '@/observability/analytics';

/**
 * Sign-in page (§7). The intended post-login destination is validated with
 * `safeReturnTo` before use so a crafted `returnTo` cannot open-redirect.
 */
export function LoginPage() {
  const { status, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = (location.state as { returnTo?: string } | null)?.returnTo;
  const returnTo = safeReturnTo(fromState ?? consumeReturnTo(), paths.app);

  useEffect(() => {
    if (status === 'authenticated') {
      trackEvent('login_succeeded');
      navigate(returnTo, { replace: true });
    }
  }, [status, returnTo, navigate]);

  if (status === 'authenticated') {
    return <Navigate to={returnTo} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <BrandMark size={56} />
          </Box>
          <Typography variant="h1" component="h1" gutterBottom>
            AI Code Reviewer
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to review Azure DevOps pull requests. The AI recommends; you decide what to
            publish.
          </Typography>

          {status === 'loading' ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }} role="status">
              <CircularProgress />
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => login(returnTo)}
              fullWidth
            >
              {env.authMode === 'test' ? 'Sign in (development)' : 'Sign in with Microsoft'}
            </Button>
          )}

          {env.authMode === 'test' && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 2 }}>
              Development sign-in is active. Production uses Microsoft Entra ID.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
