import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { PageHeader } from '@/components/layout/PageHeader';
import { useColorMode, type ColorModePreference } from '@/theme/ColorModeProvider';
import { useAuth } from '@/auth/auth-context';
import { env } from '@/config/env';

/** Settings: theme preference and account/build info (§6). */
export function SettingsPage() {
  const { preference, setPreference } = useColorMode();
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Settings" />
      <Box sx={{ display: 'grid', gap: 3, maxWidth: 560 }}>
        <Card variant="outlined">
          <CardContent>
            <FormControl>
              <FormLabel id="theme-label">Appearance</FormLabel>
              <RadioGroup
                aria-labelledby="theme-label"
                value={preference}
                onChange={(e) => setPreference(e.target.value as ColorModePreference)}
              >
                <FormControlLabel value="system" control={<Radio />} label="Match system" />
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h3" component="h2" gutterBottom>
              Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.name} · {user?.email}
            </Typography>
            {env.authMode === 'test' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Development authentication is active. Production uses Microsoft Entra ID.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
