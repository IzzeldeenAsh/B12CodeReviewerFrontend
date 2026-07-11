import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/auth/auth-context';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Signed-in user menu with logout (§7). Keyboard accessible via MUI Menu. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  if (!user) return null;

  return (
    <>
      <Tooltip title="Account">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={anchorEl ? true : undefined}
        >
          <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: 'primary.main' }}>
            {initials(user.name)}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            logout();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
