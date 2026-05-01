import { Link } from 'react-router-dom';
import { Download, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui';
import { MangaDetail } from '@/features/manga';
import { ROUTES } from '@/lib/constants';

export function MangaPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.DOWNLOADS}>
            <Download className="h-4 w-4" />
            Ver downloads
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={ROUTES.LIBRARY}>
            <FolderKanban className="h-4 w-4" />
            Biblioteca
          </Link>
        </Button>
      </div>
      <MangaDetail />
    </div>
  );
}
