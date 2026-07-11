import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { paths } from '@/app/paths';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
}

/** Shared presentation for 404 / unauthorized / generic error pages (§6). */
export function StatusPage({ code, title, description }: StatusPageProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Typography variant="h1" component="p" sx={{ fontSize: '3rem', color: 'text.disabled' }}>
        {code}
      </Typography>
      <Typography variant="h2" component="h1" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 480, mx: 'auto' }}>
        {description}
      </Typography>
      <Button variant="contained" component={RouterLink} to={paths.app}>
        Back to dashboard
      </Button>
    </Box>
  );
}

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="The page you were looking for doesn’t exist or may have moved."
    />
  );
}

export function UnauthorizedPage() {
  return (
    <StatusPage
      code="403"
      title="Access denied"
      description="You do not have permission to access this resource."
    />
  );
}
