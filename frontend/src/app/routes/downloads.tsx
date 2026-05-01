import { Link } from 'react-router-dom';
import { FolderKanban, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { DownloadList, StartDownloadForm } from '@/features/downloads';
import { ROUTES } from '@/lib/constants';

export function DownloadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Downloads" description="Gerencie seus downloads de mangas">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.SEARCH}>
            <Search className="h-4 w-4" />
            Novo download
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={ROUTES.LIBRARY}>
            <FolderKanban className="h-4 w-4" />
            Abrir biblioteca
          </Link>
        </Button>
      </PageHeader>
      <div className="space-y-6">
        <StartDownloadForm />
        <DownloadList />
      </div>
    </div>
  );
}
