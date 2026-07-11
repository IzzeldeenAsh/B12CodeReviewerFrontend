import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { buildTheme } from './theme';

/** User preference: an explicit mode, or follow the operating system. */
export type ColorModePreference = 'light' | 'dark' | 'system';

interface ColorModeContextValue {
  preference: ColorModePreference;
  resolvedMode: 'light' | 'dark';
  setPreference: (preference: ColorModePreference) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

const STORAGE_KEY = 'b12.colorMode';

function readStoredPreference(): ColorModePreference {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

/**
 * Provides the MUI theme and a small color-mode preference API (§12). Only the
 * non-sensitive UI preference is persisted to localStorage — never any token or
 * credential (§18).
 */
export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ColorModePreference>(readStoredPreference);
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const resolvedMode: 'light' | 'dark' =
    preference === 'system' ? (systemPrefersDark ? 'dark' : 'light') : preference;

  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      preference,
      resolvedMode,
      setPreference: (next) => {
        setPreferenceState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* storage may be unavailable; preference is non-critical */
        }
      },
    }),
    [preference, resolvedMode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used within a ColorModeProvider.');
  return ctx;
}
