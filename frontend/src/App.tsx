import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layout';
import { ErrorBoundary } from '@/components/shared';
import { ROUTES } from '@/lib/constants';
import {
  DashboardPage,
  SearchPage,
  MangaPage,
  DownloadsPage,
  ConnectorsPage,
  LibraryPage,
} from '@/app/routes';

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path={ROUTES.HOME} element={<DashboardPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path={ROUTES.MANGA} element={<MangaPage />} />
          <Route path={ROUTES.DOWNLOADS} element={<DownloadsPage />} />
          <Route path={ROUTES.CONNECTORS} element={<ConnectorsPage />} />
          <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
