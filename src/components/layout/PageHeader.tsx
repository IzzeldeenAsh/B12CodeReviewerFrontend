import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Primary/secondary actions rendered on the right. */
  actions?: ReactNode;
  /** Optional breadcrumbs slot rendered above the title. */
  breadcrumbs?: ReactNode;
}

/** Consistent page heading with an h1 for correct document outline (§19). */
export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mt: breadcrumbs ? 1 : 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
      </Box>
    </Box>
  );
}
