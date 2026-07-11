import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useColorMode } from '@/theme/ColorModeProvider';

/** Toggles between light and dark, overriding the system preference. */
export function ColorModeToggle() {
  const { resolvedMode, setPreference } = useColorMode();
  const next = resolvedMode === 'dark' ? 'light' : 'dark';
  return (
    <Tooltip title={`Switch to ${next} theme`}>
      <IconButton
        onClick={() => setPreference(next)}
        aria-label={`Switch to ${next} theme`}
        color="inherit"
      >
        {resolvedMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
