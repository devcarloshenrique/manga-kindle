import { PageHeader } from '@/components/shared';
import { DownloadList, StartDownloadForm } from '@/features/downloads';

export function DownloadsPage() {
  return (
    <div>
      <PageHeader title="Downloads" description="Gerencie seus downloads de mangas" />
      <div className="space-y-6">
        <StartDownloadForm />
        <DownloadList />
      </div>
    </div>
  );
}
