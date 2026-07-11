import { useState, type ReactElement } from 'react';
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HubIcon from '@mui/icons-material/Hub';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SettingsIcon from '@mui/icons-material/Settings';
import { paths } from '@/app/paths';
import { BrandMark } from './BrandMark';
import { ColorModeToggle } from './ColorModeToggle';
import { UserMenu } from './UserMenu';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  to: string;
  icon: ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Connections', to: paths.connections, icon: <HubIcon /> },
  { label: 'Review history', to: paths.reviews, icon: <RateReviewIcon /> },
  { label: 'Settings', to: paths.settings, icon: <SettingsIcon /> },
];

/**
 * Authenticated app shell (§13, §19). Provides a skip link, semantic landmarks
 * (banner, navigation, main), a responsive drawer (permanent on desktop,
 * temporary on mobile), the user menu, and a theme toggle.
 */
export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <List component="nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <ListItemButton
          key={item.to}
          component={NavLink}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          sx={{
            '&.active': {
              bgcolor: 'action.selected',
              fontWeight: 700,
              borderRight: 3,
              borderColor: 'primary.main',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip + 1,
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          transition: 'top 0.15s',
          '&:focus': { top: 8 },
        }}
      >
        Skip to main content
      </Box>

      <AppBar
        position="fixed"
        elevation={0}
        color="default"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component={RouterLink}
            to={paths.app}
            sx={{ color: 'text.primary', textDecoration: 'none', flexGrow: 1 }}
          >
            <BrandMark withWordmark />
          </Box>
          <ColorModeToggle />
          <UserMenu />
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          <Toolbar />
          {nav}
        </Drawer>
      ) : (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <Toolbar />
          {nav}
        </Drawer>
      )}

      <Box component="main" id="main-content" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
