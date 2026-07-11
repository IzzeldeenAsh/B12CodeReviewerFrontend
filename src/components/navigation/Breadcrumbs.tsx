import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

/** Accessible breadcrumb trail. The final crumb is the current page (no link). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <MuiBreadcrumbs aria-label="Breadcrumb" sx={{ fontSize: '0.875rem' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.to) {
          return (
            <Typography key={item.label} color="text.primary" aria-current="page">
              {item.label}
            </Typography>
          );
        }
        return (
          <Link key={item.label} component={RouterLink} to={item.to} color="inherit">
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
