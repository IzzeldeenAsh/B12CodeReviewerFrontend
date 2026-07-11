import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { paths } from '@/app/paths';
import { useConnections } from '@/features/azure-connections/hooks';
import { useProjects } from './hooks';

/** Step 2: browse projects for the selected connection (§9). */
export function ProjectsPage() {
  const { connectionId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useProjects(connectionId);
  const connections = useConnections();
  const connectionName = connections.data?.find((c) => c.id === connectionId)?.name ?? 'Connection';
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((p) => p.name.toLowerCase().includes(term));
  }, [data, search]);

  return (
    <>
      <PageHeader
        title="Projects"
        breadcrumbs={
          <Breadcrumbs
            items={[{ label: 'Connections', to: paths.connections }, { label: connectionName }]}
          />
        }
      />

      {isPending ? (
        <LoadingSkeleton variant="cards" aria-label="Loading projects" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<FolderIcon fontSize="inherit" />}
          title="No projects found"
          description="This connection has no projects you can access."
        />
      ) : (
        <>
          <TextField
            label="Search projects"
            type="search"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 3, maxWidth: 360 }}
            fullWidth
          />
          {filtered.length === 0 ? (
            <EmptyState title="No matching projects" description="Try a different search term." />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              }}
            >
              {filtered.map((project) => (
                <Card key={project.id} variant="outlined">
                  <CardActionArea
                    onClick={() => navigate(paths.repositories(connectionId, project.id))}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h3" component="h2" noWrap>
                        {project.name}
                      </Typography>
                      {project.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.description}
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
