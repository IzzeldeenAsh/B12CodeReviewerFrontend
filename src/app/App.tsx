import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { NotFoundPage, UnauthorizedPage } from '@/features/errors/StatusPage';
import { paths } from './paths';

// Route-level code splitting (§20): feature pages load on demand.
const ConnectionsPage = lazy(() =>
  import('@/features/azure-connections/ConnectionsPage').then((m) => ({
    default: m.ConnectionsPage,
  })),
);
const ProjectsPage = lazy(() =>
  import('@/features/browse/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const RepositoriesPage = lazy(() =>
  import('@/features/browse/RepositoriesPage').then((m) => ({ default: m.RepositoriesPage })),
);
const PullRequestsPage = lazy(() =>
  import('@/features/browse/PullRequestsPage').then((m) => ({ default: m.PullRequestsPage })),
);
const PullRequestDetailPage = lazy(() =>
  import('@/features/pull-requests/PullRequestDetailPage').then((m) => ({
    default: m.PullRequestDetailPage,
  })),
);
const ReviewPage = lazy(() =>
  import('@/features/reviews/ReviewPage').then((m) => ({ default: m.ReviewPage })),
);
const ReviewHistoryPage = lazy(() =>
  import('@/features/review-history/ReviewHistoryPage').then((m) => ({
    default: m.ReviewHistoryPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function RouteFallback() {
  return (
    <Box role="status" aria-live="polite" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path={paths.login} element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to={paths.connections} replace />} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route path="connections/:connectionId/projects" element={<ProjectsPage />} />
              <Route
                path="connections/:connectionId/projects/:projectId/repositories"
                element={<RepositoriesPage />}
              />
              <Route
                path="connections/:connectionId/projects/:projectId/repositories/:repositoryId/pull-requests"
                element={<PullRequestsPage />}
              />
              <Route
                path="connections/:connectionId/projects/:projectId/repositories/:repositoryId/pull-requests/:pullRequestId"
                element={<PullRequestDetailPage />}
              />
              <Route path="reviews" element={<ReviewHistoryPage />} />
              <Route path="reviews/:reviewId" element={<ReviewPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to={paths.app} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
