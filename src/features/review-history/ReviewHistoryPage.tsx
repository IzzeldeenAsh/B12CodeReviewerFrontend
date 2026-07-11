import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ReviewStatusChip } from '@/components/data-display/ReviewStatusChip';
import { RECOMMENDATION_TOKENS } from '@/theme/tokens';
import { REVIEW_STATUSES } from '@/types/domain';
import { paths } from '@/app/paths';
import { formatDateTime } from '@/utils/format';
import { useReviewHistory } from './hooks';

const PAGE_SIZE = 20;

/** Review history with server-side status filter + pagination (§17). */
export function ReviewHistoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useReviewHistory({
    page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
  });

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    const term = search.trim().toLowerCase();
    return term
      ? items.filter(
          (r) =>
            String(r.pullRequestId).includes(term) || r.repositoryId.toLowerCase().includes(term),
        )
      : items;
  }, [data, search]);

  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHeader
        title="Review history"
        description="Reviews you have started. Stale, failed, cancelled, and partial reviews are marked."
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search by PR ID or repository"
          type="search"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240, flex: 1 }}
        />
        <TextField
          label="Status"
          select
          size="small"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {REVIEW_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isPending ? (
        <LoadingSkeleton aria-label="Loading review history" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Start a review from a pull request to see it here."
        />
      ) : (
        <>
          <TableContainer sx={{ overflowX: 'auto', opacity: isPlaceholderData ? 0.6 : 1 }}>
            <Table aria-label="Review history">
              <TableHead>
                <TableRow>
                  <TableCell component="th" scope="col">
                    PR
                  </TableCell>
                  <TableCell component="th" scope="col">
                    Repository
                  </TableCell>
                  <TableCell component="th" scope="col">
                    Recommendation
                  </TableCell>
                  <TableCell component="th" scope="col">
                    Status
                  </TableCell>
                  <TableCell component="th" scope="col">
                    Started
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(paths.review(r.id))}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(paths.review(r.id));
                    }}
                  >
                    <TableCell>!{r.pullRequestId}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {r.repositoryId}
                    </TableCell>
                    <TableCell>
                      {r.finalRecommendation ? (
                        <Chip
                          size="small"
                          color={RECOMMENDATION_TOKENS[r.finalRecommendation].color}
                          label={RECOMMENDATION_TOKENS[r.finalRecommendation].label}
                        />
                      ) : (
                        '—'
                      )}
                      {r.partial && (
                        <Chip size="small" label="Partial" sx={{ ml: 1 }} variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <ReviewStatusChip status={r.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </>
  );
}
