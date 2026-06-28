import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layout';
import { ErrorBoundary } from '@/components/shared';
import { ROUTES } from '@/lib/constants';
import {
  HomePage,
  SearchPage,
  MangaPage,
  ReaderPage,
  DownloadsPage,
  ConvertPage,
  SettingsPage,
  StubPage,
} from '@/app/routes';
import { BarChart3, Clock, FolderOpen, HelpCircle } from 'lucide-react';

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path="/manga/:slug" element={<MangaPage />} />
          <Route path="/manga/:slug/read/:chapter" element={<ReaderPage />} />
          <Route path={ROUTES.DOWNLOADS} element={<DownloadsPage />} />
          <Route path={ROUTES.CONVERT} element={<ConvertPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path="/history" element={<StubPage title="Histórico" description="Seu histórico de leitura será exibido aqui em breve." icon={Clock} />} />
          <Route path="/folders" element={<StubPage title="Pastas" description="Organize seus mangás em pastas em breve." icon={FolderOpen} />} />
          <Route path="/stats" element={<StubPage title="Estatísticas" description="Estatísticas do seu acervo serão exibidas aqui." icon={BarChart3} />} />
          <Route path="/help" element={<StubPage title="Ajuda" description="Central de ajuda e suporte em construção." icon={HelpCircle} />} />
          {/* Legacy redirects */}
          <Route path={ROUTES.LIBRARY} element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path={ROUTES.CONNECTORS} element={<Navigate to={ROUTES.SETTINGS} replace />} />
          <Route path={ROUTES.MANGA} element={<Navigate to={ROUTES.SEARCH} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
