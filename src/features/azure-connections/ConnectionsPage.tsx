import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import HubIcon from '@mui/icons-material/Hub';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { useToast } from '@/components/feedback/ToastProvider';
import { paths } from '@/app/paths';
import { formatDateTime } from '@/utils/format';
import { messageForError } from '@/api/errors/messages';
import { trackEvent } from '@/observability/analytics';
import type { ConnectionVM } from '@/types/view-models';
import {
  useConnections,
  useCreateConnection,
  useDeleteConnection,
  useTestConnection,
} from './hooks';
import { ConnectionForm } from './ConnectionForm';

/** Step 1 of the workflow: choose an Azure DevOps connection (§9). */
export function ConnectionsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isPending, isError, error, refetch } = useConnections();

  const create = useCreateConnection();
  const test = useTestConnection();
  const remove = useDeleteConnection();

  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ConnectionVM | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const open = (c: ConnectionVM) => {
    trackEvent('connection_opened');
    navigate(paths.projects(c.id));
  };

  const runTest = (c: ConnectionVM) => {
    setTestingId(c.id);
    test.mutate(c.id, {
      onSuccess: (result) =>
        showToast(
          result.ok ? `${c.name} connected successfully.` : `${c.name} could not be reached.`,
          result.ok ? 'success' : 'warning',
        ),
      onError: (e) => showToast(messageForError(e), 'error'),
      onSettled: () => setTestingId(null),
    });
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const name = toDelete.name;
    remove.mutate(toDelete.id, {
      onSuccess: () => showToast(`Removed ${name}.`, 'success'),
      onError: (e) => showToast(messageForError(e), 'error'),
      onSettled: () => setToDelete(null),
    });
  };

  return (
    <>
      <PageHeader
        title="Connections"
        description="Azure DevOps organizations configured for review. Credentials are never shown."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Add connection
          </Button>
        }
      />

      {isPending ? (
        <LoadingSkeleton variant="cards" aria-label="Loading connections" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<HubIcon fontSize="inherit" />}
          title="No connections yet"
          description="Add an Azure DevOps connection to start browsing projects and pull requests."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
              Add connection
            </Button>
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {data.map((c) => (
            <Card key={c.id} variant="outlined" component="section" aria-label={c.name}>
              <CardContent>
                <Typography variant="h3" component="h2" gutterBottom noWrap>
                  {c.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organization: {c.organization}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {c.baseUrl}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Added {formatDateTime(c.createdAt)}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="contained" onClick={() => open(c)}>
                  Open
                </Button>
                <Button
                  size="small"
                  onClick={() => runTest(c)}
                  disabled={test.isPending && testingId === c.id}
                >
                  {test.isPending && testingId === c.id ? 'Testing…' : 'Test'}
                </Button>
                <Button size="small" color="error" onClick={() => setToDelete(c)}>
                  Remove
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <ConnectionForm
        open={formOpen}
        pending={create.isPending}
        error={create.error}
        onClose={() => setFormOpen(false)}
        onSubmit={(input) =>
          create.mutate(input, {
            onSuccess: (c) => {
              showToast(`Added ${c.name}.`, 'success');
              setFormOpen(false);
            },
          })
        }
      />

      <ConfirmationDialog
        open={Boolean(toDelete)}
        title="Remove connection?"
        confirmLabel="Remove connection"
        confirmColor="error"
        pending={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        This removes <strong>{toDelete?.name}</strong> and its stored credential reference. Existing
        reviews are unaffected. This cannot be undone.
      </ConfirmationDialog>
    </>
  );
}
