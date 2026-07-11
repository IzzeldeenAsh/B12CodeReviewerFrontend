import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SourceIcon from '@mui/icons-material/Source';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { paths } from '@/app/paths';
import { useConnections } from '@/features/azure-connections/hooks';
import { useRepositories } from './hooks';

/** Step 3: browse repositories for the selected project (§9). */
export function RepositoriesPage() {
  const { connectionId = '', projectId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useRepositories(connectionId, projectId);
  const connections = useConnections();
  const connectionName = connections.data?.find((c) => c.id === connectionId)?.name ?? 'Connection';
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return term ? data.filter((r) => r.name.toLowerCase().includes(term)) : data;
  }, [data, search]);

  return (
    <>
      <PageHeader
        title="Repositories"
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Connections', to: paths.connections },
              { label: connectionName, to: paths.projects(connectionId) },
              { label: 'Repositories' },
            ]}
          />
        }
      />

      {isPending ? (
        <LoadingSkeleton variant="cards" aria-label="Loading repositories" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<SourceIcon fontSize="inherit" />}
          title="No repositories found"
          description="This project has no repositories you can access."
        />
      ) : (
        <>
          <TextField
            label="Search repositories"
            type="search"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 3, maxWidth: 360 }}
            fullWidth
          />
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching repositories"
              description="Try a different search term."
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              }}
            >
              {filtered.map((repo) => (
                <Card key={repo.id} variant="outlined">
                  <CardActionArea
                    onClick={() => navigate(paths.pullRequests(connectionId, projectId, repo.id))}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h3" component="h2" noWrap>
                          {repo.name}
                        </Typography>
                        {repo.isDisabled && <Chip label="Disabled" size="small" color="default" />}
                      </Box>
                      {repo.defaultBranch && (
                        <Typography variant="body2" color="text.secondary">
                          Default branch: {repo.defaultBranch}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </>
  );
}
