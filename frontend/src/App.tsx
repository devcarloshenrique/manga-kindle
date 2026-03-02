import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/app/layout';
import { ErrorBoundary } from '@/components/shared';
import { ROUTES } from '@/lib/constants';
import {
  DashboardPage,
  SearchPage,
  MangaPage,
  DownloadsPage,
  ConnectorsPage,
} from '@/app/routes';

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.HOME} element={<DashboardPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path={ROUTES.MANGA} element={<MangaPage />} />
          <Route path={ROUTES.DOWNLOADS} element={<DownloadsPage />} />
          <Route path={ROUTES.CONNECTORS} element={<ConnectorsPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
