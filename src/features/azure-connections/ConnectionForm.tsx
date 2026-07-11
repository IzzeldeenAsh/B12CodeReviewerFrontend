import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { CREDENTIAL_TYPES } from '@/types/domain';
import type { CreateConnectionRequest } from '@/api/contracts/requests';
import { messageForError } from '@/api/errors/messages';

/**
 * Connection creation form (§14). NOTE: this backend stores only a credential
 * REFERENCE (an env var / Key Vault secret name), never the secret value — so
 * no secret is ever entered, transmitted, or persisted by the browser (§7/§18).
 */
const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  organization: z.string().min(1, 'Organization is required').max(100),
  baseUrl: z
    .string()
    .url('Must be a valid https URL')
    .startsWith('https://', 'Must use https')
    .or(z.literal('')),
  credentialType: z.enum(CREDENTIAL_TYPES),
  credentialRef: z
    .string()
    .min(1, 'A credential reference is required')
    .max(60)
    .describe('Env var or Key Vault secret name — never the secret value.'),
});

type FormValues = z.infer<typeof schema>;

interface ConnectionFormProps {
  open: boolean;
  pending: boolean;
  error?: unknown;
  onSubmit: (input: CreateConnectionRequest) => void;
  onClose: () => void;
}

export function ConnectionForm({ open, pending, error, onSubmit, onClose }: ConnectionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      organization: '',
      baseUrl: 'https://dev.azure.com',
      credentialType: 'PAT_ENV',
      credentialRef: '',
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      organization: values.organization,
      credentialType: values.credentialType,
      credentialRef: values.credentialRef,
      ...(values.baseUrl ? { baseUrl: values.baseUrl } : {}),
    });
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={pending ? undefined : close} fullWidth maxWidth="sm">
      <form
        onSubmit={(e) => {
          void submit(e);
        }}
        noValidate
      >
        <DialogTitle>Add Azure DevOps connection</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            {error != null && <Alert severity="error">{messageForError(error)}</Alert>}
            <TextField
              label="Connection name"
              required
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Organization"
              required
              error={Boolean(errors.organization)}
              helperText={errors.organization?.message ?? 'The Azure DevOps organization name.'}
              {...register('organization')}
            />
            <TextField
              label="Base URL"
              error={Boolean(errors.baseUrl)}
              helperText={errors.baseUrl?.message ?? 'Defaults to https://dev.azure.com'}
              {...register('baseUrl')}
            />
            <TextField
              label="Credential type"
              select
              defaultValue="PAT_ENV"
              error={Boolean(errors.credentialType)}
              helperText={errors.credentialType?.message}
              {...register('credentialType')}
            >
              <MenuItem value="PAT_ENV">Environment variable (local dev)</MenuItem>
              <MenuItem value="PAT_KEY_VAULT">Azure Key Vault secret</MenuItem>
              <MenuItem value="ENTRA_CLIENT_CREDENTIALS">Entra client credentials</MenuItem>
            </TextField>
            <TextField
              label="Credential reference"
              required
              error={Boolean(errors.credentialRef)}
              helperText={
                errors.credentialRef?.message ??
                'A reference only (env var or secret name). Never enter the secret value here.'
              }
              {...register('credentialRef')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close} disabled={pending} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? 'Adding…' : 'Add connection'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
