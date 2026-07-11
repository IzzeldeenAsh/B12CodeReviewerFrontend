import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { paths } from '@/app/paths';
import { formatDate } from '@/utils/format';
import { useConnections } from '@/features/azure-connections/hooks';
import type { PullRequestVM } from '@/types/view-models';
import { usePullRequests } from './hooks';

/** Step 4: browse active pull requests. Selecting one NEVER starts a review (§9). */
export function PullRequestsPage() {
  const { connectionId = '', projectId = '', repositoryId = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { data, isPending, isError, error, refetch, isFetching } = usePullRequests(
    connectionId,
    projectId,
    repositoryId,
  );
  const connections = useConnections();
  const connectionName = connections.data?.find((c) => c.id === connectionId)?.name ?? 'Connection';

  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');

  const authors = useMemo(
    () => Array.from(new Set((data ?? []).map((p) => p.author).filter(Boolean))) as string[],
    [data],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.filter((pr) => {
      const matchesTerm =
        !term || pr.title.toLowerCase().includes(term) || String(pr.pullRequestId).includes(term);
      const matchesAuthor = !author || pr.author === author;
      return matchesTerm && matchesAuthor;
    });
  }, [data, search, author]);

  const openPr = (pr: PullRequestVM) =>
    navigate(paths.pullRequest(connectionId, projectId, repositoryId, pr.pullRequestId));

  return (
    <>
      <PageHeader
        title="Pull requests"
        description="Active pull requests. Opening one shows its details — it does not start a review."
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Connections', to: paths.connections },
              { label: connectionName, to: paths.projects(connectionId) },
              { label: 'Repositories', to: paths.repositories(connectionId, projectId) },
              { label: 'Pull requests' },
            ]}
          />
        }
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>
        }
      />

      {isPending ? (
        <LoadingSkeleton aria-label="Loading pull requests" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<CallSplitIcon fontSize="inherit" />}
          title="No active pull requests"
          description="This repository has no active pull requests to review."
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Search by title or ID"
              type="search"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 220, flex: 1 }}
            />
            <TextField
              label="Author"
              select
              size="small"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All authors</MenuItem>
              {authors.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {filtered.length === 0 ? (
            <EmptyState
              title="No matching pull requests"
              description="Adjust your search or filter."
            />
          ) : isDesktop ? (
            <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
              <Table aria-label="Active pull requests">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="col">
                      ID
                    </TableCell>
                    <TableCell component="th" scope="col">
                      Title
                    </TableCell>
                    <TableCell component="th" scope="col">
                      Author
                    </TableCell>
                    <TableCell component="th" scope="col">
                      Branches
                    </TableCell>
                    <TableCell component="th" scope="col">
                      Created
                    </TableCell>
                    <TableCell component="th" scope="col">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((pr) => (
                    <TableRow
                      key={pr.pullRequestId}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => openPr(pr)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') openPr(pr);
                      }}
                    >
                      <TableCell>!{pr.pullRequestId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {pr.title}
                        {pr.isDraft && <Chip label="Draft" size="small" sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell>{pr.author ?? '—'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {pr.sourceBranch} → {pr.targetBranch}
                      </TableCell>
                      <TableCell>{formatDate(pr.createdAt)}</TableCell>
                      <TableCell>
                        <Chip label={pr.status} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {filtered.map((pr) => (
                <Card key={pr.pullRequestId} variant="outlined">
                  <CardActionArea onClick={() => openPr(pr)}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        !{pr.pullRequestId} · {pr.status}
                        {pr.isDraft ? ' · Draft' : ''}
                      </Typography>
                      <Typography variant="h3" component="h2" sx={{ my: 0.5 }}>
                        {pr.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pr.author ?? 'Unknown author'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', mt: 0.5 }}
                      >
                        {pr.sourceBranch} → {pr.targetBranch}
                      </Typography>
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
